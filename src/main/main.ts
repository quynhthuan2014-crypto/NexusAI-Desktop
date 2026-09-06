import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';

const __dirname = process.cwd();
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#090c14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (!app.isPackaged) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5173');
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.handle('system:info', () => ({
  hostname: os.hostname(),
  platform: process.platform,
  arch: process.arch,
  release: os.release(),
  cpus: os.cpus().length,
  memoryGB: Number((os.totalmem() / 1024 ** 3).toFixed(1))
}));

ipcMain.handle('files:open-text', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Text', extensions: ['txt', 'md', 'json', 'csv', 'log'] }]
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const filePath = result.filePaths[0];
  const content = await fs.readFile(filePath, 'utf8');
  return { name: path.basename(filePath), path: filePath, content };
});

ipcMain.handle('shell:open-external', async (_event, url: unknown) => {
  if (typeof url !== 'string') return false;
  if (!/^https?:\/\//i.test(url)) return false;
  await shell.openExternal(url);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
