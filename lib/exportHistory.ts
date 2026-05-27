const HISTORY_KEY = 'expense-export-history';
const SCHEDULE_KEY = 'expense-export-schedule';
const INTEGRATIONS_KEY = 'expense-integrations';

export interface ExportRecord {
  id: string;
  timestamp: string;
  templateName: string;
  format: string;
  recordCount: number;
  fileSizeKB: number;
  destination: string;
}

export interface ScheduledJob {
  id: string;
  label: string;
  templateId: string;
  format: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  destination: string;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
}

export interface IntegrationState {
  connected: boolean;
  connectedAt?: string;
  config: Record<string, string>;
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadHistory(): ExportRecord[] {
  return load<ExportRecord[]>(HISTORY_KEY, []);
}

export function addHistoryEntry(entry: Omit<ExportRecord, 'id' | 'timestamp'>): void {
  const history = loadHistory();
  const record: ExportRecord = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  save(HISTORY_KEY, [record, ...history].slice(0, 50));
}

export function clearHistory(): void {
  save(HISTORY_KEY, []);
}

export function loadSchedule(): ScheduledJob[] {
  return load<ScheduledJob[]>(SCHEDULE_KEY, []);
}

export function saveSchedule(jobs: ScheduledJob[]): void {
  save(SCHEDULE_KEY, jobs);
}

export function loadIntegrations(): Record<string, IntegrationState> {
  return load<Record<string, IntegrationState>>(INTEGRATIONS_KEY, {});
}

export function saveIntegrations(state: Record<string, IntegrationState>): void {
  save(INTEGRATIONS_KEY, state);
}
