/** Mirrors the Python data model in custom_components/stateguard/models.py. */

export interface Target {
  labels: string[];
  label_mode: "any" | "all";
  areas: string[];
  floors: string[];
  domains: string[];
  integrations: string[];
  entities: string[];
  include_device_entities: boolean;
  include_diagnostic: boolean;
  exclude_labels: string[];
  exclude_entities: string[];
}

export type ConditionType =
  | "unavailable_state"
  | "stale"
  | "numeric_threshold"
  | "state_match"
  | "state_duration"
  | "entity_missing";

export interface Condition {
  type: ConditionType;
  states: string[];
  negate: boolean;
  time_basis: "last_reported" | "last_updated" | "last_changed";
  duration: number;
  target_state: string | null;
  source: string;
  operator: "lt" | "le" | "gt" | "ge" | "outside" | "inside";
  value: number | null;
  value2: number | null;
  recovery_value: number | null;
}

export interface Severity {
  id: string;
  name: string;
  priority: number;
  color: string;
  icon: string;
  channels: string[];
  ignore_quiet_hours: boolean;
  persistent_notification: boolean;
  bundle_window: number;
  repeat_interval: number;
  escalation_after: number;
  escalation_channels: string[];
}

export interface Watch {
  id: string;
  name: string;
  enabled: boolean;
  severity_id: string;
  order: number;
  target: Target;
  conditions: Condition[];
  grace_period: number;
  restart_grace: number | null;
  overlap_mode: "all" | "highest_severity";
  notify_on_clear: boolean;
  suppress_by_parent: boolean;
  group_alerts: boolean;
  channels: string[];
}

export interface QuietWindow {
  start: string;
  end: string;
  weekdays: number[];
}

export interface QuietHours {
  enabled: boolean;
  windows: QuietWindow[];
}

export interface Settings {
  monitoring_enabled: boolean;
  restart_grace_period: number;
  internet_entity: string | null;
  report_failed_integrations: boolean;
  failed_integrations_scope: "watched" | "all";
  quiet_hours: QuietHours;
  history_retention_days: number;
  ui_language: string;
  panel_access: "admin" | "all";
}

export interface Channel {
  id: string;
  name: string;
  kind: ChannelKind;
  enabled: boolean;
  config: Record<string, unknown>;
  title_template: string;
  template: string;
}

export type ChannelKind =
  | "ha_service"
  | "smtp"
  | "telegram"
  | "pushover"
  | "ntfy";

export interface ChannelField {
  key: string;
  type: "text" | "number" | "secret" | "select" | "object";
  required?: boolean;
  example?: string;
  default?: string | number;
  options?: string[];
}

export interface Config {
  watches: Watch[];
  severities: Severity[];
  channels: Channel[];
  settings: Settings;
}

export interface LabelMeta {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
}

export interface Template {
  template_id: string;
  icon: string;
  watch: Partial<Watch>;
}

export interface Meta {
  channel_fields: Record<string, ChannelField[]>;
  labels: LabelMeta[];
  areas: { id: string; name: string; floor_id: string | null }[];
  floors: { id: string; name: string }[];
  domains: string[];
  integrations: { id: string; domain: string; title: string }[];
  templates: Template[];
}

export interface Problem {
  watch_id: string;
  entity_id: string;
  status: "ok" | "pending" | "alerted" | "escalated";
  condition_type: string;
  reason: string;
  reason_key: string;
  reason_params: Record<string, string>;
  since: number;
  alerted_at: number;
  escalated_at: number;
  last_notified_at: number;
  snoozed_until: number;
  acknowledged: boolean;
  suppression: string;
  watch_name: string;
  severity_id: string | null;
  severity_name: string | null;
  severity_priority: number;
  friendly_name: string;
  current_state: string | null;
  device_id: string | null;
  device_name: string | null;
  integration_domain: string | null;
  integration_title: string | null;
}

/** What the card and the read-only overview get. No credentials in here. */
export interface CardData {
  problems: Problem[];
  severities: Pick<Severity, "id" | "name" | "color" | "icon" | "priority">[];
  watches: { id: string; name: string }[];
  watch_count: number;
  watched_entity_count: number;
  monitoring_enabled: boolean;
  restart_grace_until: number | null;
  internet_down: boolean;
}

export interface Status {
  problems: Problem[];
  watched_entity_count: number;
  resolved: Record<string, number>;
  monitoring_enabled: boolean;
  restart_grace_until: number | null;
  internet_down: boolean;
}

export interface Incident {
  id: number;
  watch_id: string;
  watch_name: string;
  severity_id: string | null;
  severity_name: string | null;
  entity_id: string;
  friendly_name: string | null;
  condition_type: string;
  reason_key: string;
  reason_params: string;
  reason_text: string;
  started_at: number;
  alerted_at: number | null;
  escalated_at: number | null;
  resolved_at: number | null;
}

export interface HistoryPage {
  total: number;
  incidents: Incident[];
}

export interface PreviewEntity {
  entity_id: string;
  friendly_name: string;
  state: string | null;
  device_id?: string | null;
  device_name?: string | null;
  integration_domain?: string | null;
  integration_title?: string | null;
}

/** The slice of the Home Assistant frontend object this panel relies on. */
export interface HomeAssistant {
  language: string;
  user?: { is_admin: boolean; name: string };
  states: Record<string, { state: string; attributes: Record<string, unknown> }>;
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<unknown>;
}
