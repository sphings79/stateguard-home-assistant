"""Incident history in its own SQLite file.

Deliberately not the Home Assistant recorder: this data has a different
lifetime, and a monitoring integration should not grow the database everyone
else depends on. All access runs in an executor thread.
"""

from __future__ import annotations

from dataclasses import dataclass
import logging
from pathlib import Path
import sqlite3
import time
from typing import Any

from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

DB_NAME = f"{DOMAIN}_history.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    watch_id TEXT NOT NULL,
    watch_name TEXT NOT NULL,
    severity_id TEXT,
    severity_name TEXT,
    entity_id TEXT NOT NULL,
    friendly_name TEXT,
    condition_type TEXT,
    reason_key TEXT,
    reason_params TEXT,
    reason_text TEXT,
    started_at REAL NOT NULL,
    alerted_at REAL,
    escalated_at REAL,
    resolved_at REAL
);
CREATE INDEX IF NOT EXISTS idx_incidents_started ON incidents (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_open
    ON incidents (entity_id, watch_id, resolved_at);
"""


@dataclass(slots=True)
class IncidentRecord:
    """One announced problem, from first alert to resolution."""

    watch_id: str
    watch_name: str
    severity_id: str | None
    severity_name: str | None
    entity_id: str
    friendly_name: str | None
    condition_type: str
    reason_key: str
    reason_params: str
    reason_text: str
    started_at: float
    alerted_at: float | None = None
    escalated_at: float | None = None


class History:
    """Reads and writes the incident log."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Point the store at a file next to the Home Assistant configuration."""
        self.hass = hass
        self.path = Path(hass.config.path(DB_NAME))

    def _connect(self) -> sqlite3.Connection:
        """Open a connection. Runs in an executor thread."""
        connection = sqlite3.connect(self.path, timeout=10)
        connection.row_factory = sqlite3.Row
        return connection

    async def async_setup(self) -> None:
        """Create the schema if this is the first run."""
        await self.hass.async_add_executor_job(self._setup)

    def _setup(self) -> None:
        """Apply the schema. Runs in an executor thread."""
        try:
            with self._connect() as connection:
                connection.executescript(SCHEMA)
        except sqlite3.Error:
            _LOGGER.exception("Could not prepare the history database")

    async def async_record_alert(self, record: IncidentRecord) -> None:
        """Write a new incident, unless one is already open for this pair."""
        await self.hass.async_add_executor_job(self._record_alert, record)

    def _record_alert(self, record: IncidentRecord) -> None:
        """Insert the incident. Runs in an executor thread."""
        try:
            with self._connect() as connection:
                open_row = connection.execute(
                    "SELECT id FROM incidents "
                    "WHERE watch_id = ? AND entity_id = ? AND resolved_at IS NULL "
                    "LIMIT 1",
                    (record.watch_id, record.entity_id),
                ).fetchone()
                if open_row is not None:
                    return  # A repeat of something already logged.
                connection.execute(
                    "INSERT INTO incidents ("
                    "watch_id, watch_name, severity_id, severity_name, entity_id, "
                    "friendly_name, condition_type, reason_key, reason_params, "
                    "reason_text, started_at, alerted_at"
                    ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        record.watch_id,
                        record.watch_name,
                        record.severity_id,
                        record.severity_name,
                        record.entity_id,
                        record.friendly_name,
                        record.condition_type,
                        record.reason_key,
                        record.reason_params,
                        record.reason_text,
                        record.started_at,
                        record.alerted_at or time.time(),
                    ),
                )
        except sqlite3.Error:
            _LOGGER.exception("Could not write an incident")

    async def async_record_escalation(self, watch_id: str, entity_id: str) -> None:
        """Stamp the open incident as escalated."""
        await self.hass.async_add_executor_job(
            self._update_open,
            watch_id,
            entity_id,
            "escalated_at",
            time.time(),
        )

    async def async_record_clear(self, watch_id: str, entity_id: str) -> None:
        """Close the open incident for this pair."""
        await self.hass.async_add_executor_job(
            self._update_open, watch_id, entity_id, "resolved_at", time.time()
        )

    def _update_open(
        self, watch_id: str, entity_id: str, column: str, value: float
    ) -> None:
        """Set one column on the open incident. Runs in an executor thread."""
        if column not in ("escalated_at", "resolved_at"):
            raise ValueError(f"Refusing to update column '{column}'")
        try:
            with self._connect() as connection:
                connection.execute(
                    f"UPDATE incidents SET {column} = ? "
                    "WHERE watch_id = ? AND entity_id = ? AND resolved_at IS NULL",
                    (value, watch_id, entity_id),
                )
        except sqlite3.Error:
            _LOGGER.exception("Could not update an incident")

    async def async_list(
        self,
        *,
        limit: int = 200,
        offset: int = 0,
        watch_id: str | None = None,
        severity_id: str | None = None,
        entity_id: str | None = None,
        since: float | None = None,
        open_only: bool = False,
    ) -> dict[str, Any]:
        """Return incidents newest first, with the total for paging."""
        return await self.hass.async_add_executor_job(
            self._list,
            limit,
            offset,
            watch_id,
            severity_id,
            entity_id,
            since,
            open_only,
        )

    def _list(
        self,
        limit: int,
        offset: int,
        watch_id: str | None,
        severity_id: str | None,
        entity_id: str | None,
        since: float | None,
        open_only: bool,
    ) -> dict[str, Any]:
        """Query the log. Runs in an executor thread."""
        clauses: list[str] = []
        params: list[Any] = []
        if watch_id:
            clauses.append("watch_id = ?")
            params.append(watch_id)
        if severity_id:
            clauses.append("severity_id = ?")
            params.append(severity_id)
        if entity_id:
            clauses.append("entity_id = ?")
            params.append(entity_id)
        if since is not None:
            clauses.append("started_at >= ?")
            params.append(since)
        if open_only:
            clauses.append("resolved_at IS NULL")
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""

        try:
            with self._connect() as connection:
                total = connection.execute(
                    f"SELECT COUNT(*) FROM incidents {where}",
                    params,
                ).fetchone()[0]
                rows = connection.execute(
                    f"SELECT * FROM incidents {where} "
                    "ORDER BY started_at DESC LIMIT ? OFFSET ?",
                    [*params, limit, offset],
                ).fetchall()
        except sqlite3.Error:
            _LOGGER.exception("Could not read the history")
            return {"total": 0, "incidents": []}

        return {"total": total, "incidents": [dict(row) for row in rows]}

    async def async_purge(self, retention_days: int) -> int:
        """Delete resolved incidents older than the retention period."""
        return await self.hass.async_add_executor_job(self._purge, retention_days)

    def _purge(self, retention_days: int) -> int:
        """Delete old rows. Runs in an executor thread."""
        cutoff = time.time() - retention_days * 86400
        try:
            with self._connect() as connection:
                cursor = connection.execute(
                    "DELETE FROM incidents "
                    "WHERE resolved_at IS NOT NULL AND resolved_at < ?",
                    (cutoff,),
                )
                return cursor.rowcount
        except sqlite3.Error:
            _LOGGER.exception("Could not purge the history")
            return 0

    async def async_statistics(self, since: float) -> dict[str, Any]:
        """Return counts per watch and per severity for the overview."""
        return await self.hass.async_add_executor_job(self._statistics, since)

    def _statistics(self, since: float) -> dict[str, Any]:
        """Aggregate the log. Runs in an executor thread."""
        try:
            with self._connect() as connection:
                by_watch = connection.execute(
                    "SELECT watch_name, COUNT(*) AS count FROM incidents "
                    "WHERE started_at >= ? GROUP BY watch_name ORDER BY count DESC",
                    (since,),
                ).fetchall()
                by_entity = connection.execute(
                    "SELECT entity_id, friendly_name, COUNT(*) AS count "
                    "FROM incidents WHERE started_at >= ? "
                    "GROUP BY entity_id ORDER BY count DESC LIMIT 10",
                    (since,),
                ).fetchall()
        except sqlite3.Error:
            _LOGGER.exception("Could not aggregate the history")
            return {"by_watch": [], "by_entity": []}

        return {
            "by_watch": [dict(row) for row in by_watch],
            "by_entity": [dict(row) for row in by_entity],
        }
