import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showNativeNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-native-notification', title, body),
  printDocument: () => ipcRenderer.invoke('print-document'),
  onNavigateTab: (callback: (tab: string) => void) =>
    ipcRenderer.on('navigate-tab', (_, tab) => callback(tab)),
  onCheckUpdates: (callback: () => void) =>
    ipcRenderer.on('check-updates', () => callback()),
});
