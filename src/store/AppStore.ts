import type { InvoiceRecord } from '../models/Invoice';
import {
  createInitialStats,
  DEFAULT_PREFERENCES,
  type AppPreferences,
  type LogEntry,
  type ProcessingStats,
  type ResultFilters,
  type SortableColumn,
  type ThemePreference,
} from '../models/Summary';
import { createId } from '../utils/formatters';
import { isSameFile } from '../utils/fileDisplay';
import { matchesDateFilter } from '../utils/dateFilter';
import { sortRecords } from '../utils/recordSort';

const STORAGE_KEY = 'xpdf-preferences';
const LEGACY_STORAGE_KEY = 'pdf-extract-radicaciones-preferences';

type Listener = () => void;

/**
 * Store central de estado de la aplicación con persistencia en localStorage.
 */
export class AppStore {
  private listeners = new Set<Listener>();
  private snapshot!: ReturnType<AppStore['buildSnapshot']>;
  private readonly colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private onSystemThemeChange: (() => void) | null = null;

  records: InvoiceRecord[] = [];
  filteredRecords: InvoiceRecord[] = [];
  stats: ProcessingStats = createInitialStats();
  logs: LogEntry[] = [];
  preferences: AppPreferences = { ...DEFAULT_PREFERENCES };
  selectedFiles: File[] = [];
  processedPdfNames = new Set<string>();

  constructor() {
    this.loadPreferences();
    this.applyTheme(this.preferences.theme);
    this.snapshot = this.buildSnapshot();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(): void {
    this.snapshot = this.buildSnapshot();
    for (const listener of this.listeners) {
      listener();
    }
  }

  setFiles(files: File[]): void {
    const pdfFiles = files.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    this.selectedFiles = pdfFiles;
    this.notify();
  }

  addFiles(files: File[]): { added: number; skipped: number } {
    const pdfFiles = files.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    let added = 0;
    let skipped = 0;

    for (const file of pdfFiles) {
      if (this.selectedFiles.some((existing) => isSameFile(existing, file))) {
        skipped += 1;
        continue;
      }
      this.selectedFiles.push(file);
      added += 1;
    }

    if (added > 0 || skipped > 0) {
      this.notify();
    }

    return { added, skipped };
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter((f) => !isSameFile(f, file));
    this.notify();
  }

  clearResults(): void {
    this.records = [];
    this.filteredRecords = [];
    this.processedPdfNames.clear();
    this.stats = createInitialStats();
    this.notify();
  }

  startProcessing(totalPdfs: number): void {
    this.records = [];
    this.filteredRecords = [];
    this.processedPdfNames.clear();
    this.stats = {
      ...createInitialStats(totalPdfs),
      isProcessing: true,
    };
    this.notify();
  }

  appendRecords(newRecords: InvoiceRecord[], fileName: string): void {
    this.records.push(...newRecords);
    this.processedPdfNames.add(fileName);
    this.applyFilters();
    this.notify();
  }

  updateProgress(partial: Partial<ProcessingStats>): void {
    this.stats = { ...this.stats, ...partial };
    this.notify();
  }

  finishProcessing(): void {
    this.stats = { ...this.stats, isProcessing: false };
    this.applyFilters();
    this.notify();
  }

  setExporting(isExporting: boolean): void {
    this.stats = { ...this.stats, isExporting };
    this.notify();
  }

  addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
    const logEntry: LogEntry = {
      id: createId('log'),
      timestamp: new Date(),
      ...entry,
    };
    this.logs.unshift(logEntry);
    if (this.logs.length > 500) {
      this.logs.length = 500;
    }
    this.notify();
  }

  clearLogs(): void {
    this.logs = [];
    this.notify();
  }

  setFilters(filters: Partial<ResultFilters>): void {
    this.preferences.filters = { ...this.preferences.filters, ...filters };
    this.savePreferences();
    this.applyFilters();
    this.notify();
  }

  resetFilters(): void {
    this.preferences.filters = { ...DEFAULT_PREFERENCES.filters };
    this.savePreferences();
    this.applyFilters();
    this.notify();
  }

  setSort(column: SortableColumn): void {
    const current = this.preferences.sort;
    this.preferences.sort =
      current.column === column
        ? { column, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' };
    this.savePreferences();
    this.applyFilters();
    this.notify();
  }

  setTheme(theme: ThemePreference): void {
    this.preferences.theme = theme;
    this.applyTheme(theme);
    this.savePreferences();
    this.notify();
  }

  applyFilters(): void {
    const filters = this.preferences.filters;
    const global = filters.globalSearch.trim().toLowerCase();

    this.filteredRecords = this.records.filter((record) => {
      if (filters.lote && !record.lote.toLowerCase().includes(filters.lote.toLowerCase())) {
        return false;
      }
      if (
        filters.factura &&
        !record.numeroFactura.toLowerCase().includes(filters.factura.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.radicado &&
        !record.numeroRadicado.toLowerCase().includes(filters.radicado.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.razonSocial &&
        !record.razonSocial.toLowerCase().includes(filters.razonSocial.toLowerCase())
      ) {
        return false;
      }
      if (filters.fecha && !matchesDateFilter(record.fechaRadicacion, filters.fecha)) {
        return false;
      }
      if (global) {
        const haystack = [
          record.archivo,
          record.lote,
          record.codigoHabilitacion,
          record.fechaRadicacion,
          record.usuarioRadica,
          record.numeroRadicado,
          record.numeroFactura,
          record.razonSocial,
          String(record.valorRadicado),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(global)) return false;
      }
      return true;
    });

    this.applySort();
  }

  private applySort(): void {
    const { column, direction } = this.preferences.sort;
    if (!column) return;
    this.filteredRecords = sortRecords(this.filteredRecords, column, direction);
  }

  get uniquePdfCount(): number {
    return this.processedPdfNames.size;
  }

  get totalRadicado(): number {
    return this.records.reduce((sum, r) => sum + r.valorRadicado, 0);
  }

  /** Snapshot inmutable para useSyncExternalStore. */
  getState() {
    return this.snapshot;
  }

  private buildSnapshot() {
    return {
      records: this.records,
      filteredRecords: this.filteredRecords,
      stats: { ...this.stats },
      logs: this.logs,
      preferences: {
        theme: this.preferences.theme,
        filters: { ...this.preferences.filters },
        sort: { ...this.preferences.sort },
      },
      selectedFiles: this.selectedFiles,
      uniquePdfCount: this.uniquePdfCount,
      totalRadicado: this.totalRadicado,
    };
  }

  private applyTheme(theme: ThemePreference): void {
    if (this.onSystemThemeChange) {
      this.colorSchemeQuery.removeEventListener('change', this.onSystemThemeChange);
      this.onSystemThemeChange = null;
    }

    const resolved =
      theme === 'system'
        ? this.colorSchemeQuery.matches
          ? 'dark'
          : 'light'
        : theme;

    document.documentElement.classList.toggle('dark', resolved === 'dark');

    if (theme === 'system') {
      this.onSystemThemeChange = () => this.applyTheme('system');
      this.colorSchemeQuery.addEventListener('change', this.onSystemThemeChange);
    }
  }

  private parseTheme(value: unknown): ThemePreference {
    if (value === 'light' || value === 'dark' || value === 'system') return value;
    return 'system';
  }

  private loadPreferences(): void {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AppPreferences;
      this.preferences = {
        theme: this.parseTheme(parsed.theme),
        filters: { ...DEFAULT_PREFERENCES.filters, ...parsed.filters },
        sort: { ...DEFAULT_PREFERENCES.sort, ...parsed.sort },
      };
    } catch {
      this.preferences = { ...DEFAULT_PREFERENCES };
    }
  }

  private savePreferences(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
  }
}

export const appStore = new AppStore();
