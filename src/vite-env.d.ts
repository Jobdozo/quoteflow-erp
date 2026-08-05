/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    getAppVersion: () => Promise<string>;
    showNativeNotification: (title: string, body: string) => Promise<void>;
    printDocument: () => Promise<void>;
    onNavigateTab: (callback: (tab: string) => void) => void;
    onCheckUpdates: (callback: () => void) => void;
  };
}
