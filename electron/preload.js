const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFiles'),
  showContextMenu: (fileId) => ipcRenderer.invoke('context-menu:show', fileId),
  onContextMenuAction: (callback) => {
    ipcRenderer.on('context-menu:action', (event, action, fileId) => callback(action, fileId));
  },
});
