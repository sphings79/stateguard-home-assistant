"""Resolves a watch target into a concrete set of entity ids."""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
)

from .const import LabelMode
from .models import Target

_LOGGER = logging.getLogger(__name__)

# Entity categories that are hidden unless the watch opts into them.
SECONDARY_CATEGORIES = ("config", "diagnostic")


class TargetResolver:
    """Turns label, area, domain and integration selectors into entity ids.

    Categories that are filled in combine with AND: labels *and* areas *and*
    domains. Entities listed explicitly are added on top with OR. Exclusions
    are applied last.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        """Remember the hass instance the registries belong to."""
        self.hass = hass

    @callback
    def resolve(self, target: Target) -> set[str]:
        """Return the entity ids the target currently selects."""
        entity_registry = er.async_get(self.hass)
        device_registry = dr.async_get(self.hass)
        area_registry = ar.async_get(self.hass)

        candidate_sets: list[set[str]] = []

        if target.labels:
            candidate_sets.append(
                self._by_labels(entity_registry, device_registry, target)
            )
        areas = self._expand_areas(area_registry, target)
        if areas:
            candidate_sets.append(
                self._by_areas(entity_registry, device_registry, areas)
            )
        if target.domains:
            candidate_sets.append(self._by_domains(entity_registry, target.domains))
        if target.integrations:
            candidate_sets.append(
                self._by_integrations(entity_registry, target.integrations)
            )

        resolved = set.intersection(*candidate_sets) if candidate_sets else set()
        resolved |= set(target.entities)

        resolved = self._apply_filters(entity_registry, target, resolved)
        return resolved - set(target.exclude_entities)

    @callback
    def _effective_labels(
        self,
        entry: er.RegistryEntry,
        device_registry: dr.DeviceRegistry,
        include_device_labels: bool,
    ) -> set[str]:
        """Return an entity's own labels plus those inherited from its device."""
        labels = set(entry.labels)
        if include_device_labels and entry.device_id:
            device = device_registry.async_get(entry.device_id)
            if device:
                labels |= set(device.labels)
        return labels

    @callback
    def _by_labels(
        self,
        entity_registry: er.EntityRegistry,
        device_registry: dr.DeviceRegistry,
        target: Target,
    ) -> set[str]:
        """Return entities matching the target's labels."""
        wanted = set(target.labels)
        matched: set[str] = set()

        for entry in entity_registry.entities.values():
            labels = self._effective_labels(
                entry, device_registry, target.include_device_entities
            )
            if not labels:
                continue
            if target.label_mode == LabelMode.ALL:
                if wanted <= labels:
                    matched.add(entry.entity_id)
            elif wanted & labels:
                matched.add(entry.entity_id)
        return matched

    @callback
    def _expand_areas(self, area_registry: ar.AreaRegistry, target: Target) -> set[str]:
        """Return the area ids selected directly or through a floor."""
        areas = set(target.areas)
        if target.floors:
            floors = set(target.floors)
            areas |= {
                area.id
                for area in area_registry.async_list_areas()
                if area.floor_id in floors
            }
        return areas

    @callback
    def _by_areas(
        self,
        entity_registry: er.EntityRegistry,
        device_registry: dr.DeviceRegistry,
        areas: set[str],
    ) -> set[str]:
        """Return entities assigned to an area directly or through their device."""
        matched: set[str] = set()
        for area_id in areas:
            matched |= {
                entry.entity_id
                for entry in er.async_entries_for_area(entity_registry, area_id)
            }
            for device in dr.async_entries_for_area(device_registry, area_id):
                matched |= {
                    entry.entity_id
                    for entry in er.async_entries_for_device(entity_registry, device.id)
                    # An entity that overrides the area wins over its device.
                    if entry.area_id in (None, area_id)
                }
        return matched

    @callback
    def _by_domains(
        self, entity_registry: er.EntityRegistry, domains: list[str]
    ) -> set[str]:
        """Return entities of the given domains, registry and state machine alike."""
        wanted = set(domains)
        matched = {
            entry.entity_id
            for entry in entity_registry.entities.values()
            if entry.domain in wanted
        }
        matched |= {
            state.entity_id
            for state in self.hass.states.async_all()
            if state.domain in wanted
        }
        return matched

    @callback
    def _by_integrations(
        self, entity_registry: er.EntityRegistry, config_entry_ids: list[str]
    ) -> set[str]:
        """Return entities belonging to the given config entries."""
        matched: set[str] = set()
        for config_entry_id in config_entry_ids:
            matched |= {
                entry.entity_id
                for entry in er.async_entries_for_config_entry(
                    entity_registry, config_entry_id
                )
            }
        return matched

    @callback
    def _apply_filters(
        self,
        entity_registry: er.EntityRegistry,
        target: Target,
        entity_ids: set[str],
    ) -> set[str]:
        """Drop disabled entities, secondary categories and excluded labels."""
        device_registry = dr.async_get(self.hass)
        excluded_labels = set(target.exclude_labels)
        keep: set[str] = set()

        for entity_id in entity_ids:
            entry = entity_registry.async_get(entity_id)
            if entry is None:
                # Not in the registry (for example a YAML template entity).
                # Only explicit entity ids can reach this point.
                keep.add(entity_id)
                continue
            if entry.disabled_by is not None:
                continue
            if (
                not target.include_diagnostic
                and entry.entity_category in SECONDARY_CATEGORIES
            ):
                continue
            if excluded_labels and excluded_labels & self._effective_labels(
                entry, device_registry, True
            ):
                continue
            keep.add(entity_id)
        return keep
