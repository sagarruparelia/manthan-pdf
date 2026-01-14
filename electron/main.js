const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Initialize store for window state (dynamic import for ESM compatibility)
let store = null;
async function getStore() {
  if (!store) {
    const Store = (await import('electron-store')).default;
    store = new Store({
      defaults: {
        windowBounds: { width: 1000, height: 800 },
      },
    });
  }
  return store;
}

// Configure auto-updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function getIconPath() {
  if (isDev) {
    return path.join(__dirname, '../src/assets/icon.png');
  }
  // In production, use the app's resource path
  return path.join(process.resourcesPath, 'src/assets/icon.png');
}

async function createWindow() {
  const storeInstance = await getStore();
  const { width, height, x, y } = storeInstance.get('windowBounds');

  const win = new BrowserWindow({
    width,
    height,
    x,
    y,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: getIconPath(),
  });

  // Save window bounds on resize and move
  const saveBounds = () => {
    storeInstance.set('windowBounds', win.getBounds());
  };

  win.on('resize', saveBounds);
  win.on('move', saveBounds);

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.setMenuBarVisibility(false);
}

// IPC handler for native file dialog
ipcMain.handle('dialog:openFiles', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return [];
  }

  // Read files and return as array buffers with metadata
  const files = await Promise.all(
    result.filePaths.map(async (filePath) => {
      const buffer = await fs.promises.readFile(filePath);
      return {
        name: path.basename(filePath),
        path: filePath,
        data: buffer.toString('base64'),
      };
    })
  );

  return files;
});

// IPC handler for context menu
ipcMain.handle('context-menu:show', (event, fileId) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const menu = Menu.buildFromTemplate([
    {
      label: 'Remove',
      click: () => {
        win.webContents.send('context-menu:action', 'remove', fileId);
      },
    },
  ]);
  menu.popup({ window: win });
});

// Auto-updater events
autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `Version ${info.version} is available. It will be downloaded in the background.`,
  });
});

autoUpdater.on('update-downloaded', (info) => {
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded. Restart now to install?`,
      buttons: ['Restart', 'Later'],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});

autoUpdater.on('error', (err) => {
  console.error('Auto-updater error:', err);
});

app.whenReady().then(async () => {
  await createWindow();

  // Check for updates in production
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
