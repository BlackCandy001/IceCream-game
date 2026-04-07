const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Thêm các API an toàn để kết nối Phaser với Node.js ở đây sau này (nếu cần)
});
