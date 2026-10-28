// electron/preload.cjs - Secure context bridge for Electron desktop app
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sigmaDesktop', {
  isDesktopApp: true,
  platform: process.platform,
  version: '1.0.0'
});
