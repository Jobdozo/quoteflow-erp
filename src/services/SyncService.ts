import { StorageService } from '../utils/storage';

export interface SyncStatus {
  isOnline: boolean;
  pendingQueueCount: number;
  lastSyncedAt: string | null;
  isSyncing: boolean;
}

type SyncListener = (status: SyncStatus) => void;

class SyncServiceEngine {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private pendingQueueCount: number = 0;
  private lastSyncedAt: string | null = new Date().toLocaleTimeString();
  private isSyncing: boolean = false;
  private listeners: SyncListener[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleConnectionChange(true));
      window.addEventListener('offline', () => this.handleConnectionChange(false));
    }
  }

  public getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      pendingQueueCount: this.pendingQueueCount,
      lastSyncedAt: this.lastSyncedAt,
      isSyncing: this.isSyncing,
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((l) => l(status));
  }

  private handleConnectionChange(online: boolean) {
    this.isOnline = online;
    if (online) {
      this.triggerAutoSync();
    } else {
      this.notify();
    }
  }

  public triggerAutoSync(): Promise<boolean> {
    if (this.isSyncing) return Promise.resolve(true);

    this.isSyncing = true;
    this.notify();

    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate uploading offline local queue to PostgreSQL Cloud DB
        this.pendingQueueCount = 0;
        this.lastSyncedAt = new Date().toLocaleTimeString();
        this.isSyncing = false;

        // Log audit event
        StorageService.addAuditLog(
          'Automated Cloud Sync Complete (SQLite <-> PostgreSQL)',
          'SyncEngine'
        );

        this.notify();
        resolve(true);
      }, 1200);
    });
  }

  public enqueueOfflineAction(actionName: string) {
    if (!this.isOnline) {
      this.pendingQueueCount += 1;
      this.notify();
    } else {
      this.triggerAutoSync();
    }
  }
}

export const SyncService = new SyncServiceEngine();
