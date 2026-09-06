import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nexus', {
  systemInfo: () => ipcRenderer.invoke('system:info'),
  openTextFile: () => ipcRenderer.invoke('files:open-text'),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url)
});
