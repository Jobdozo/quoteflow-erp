import { app, BrowserWindow, ipcMain, Tray, Menu, Notification, shell } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    title: 'QuoteFlow Enterprise ERP - ZIPCON Services',
    icon: path.join(__dirname, '../public/zipcon_logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    autoHideMenuBar: true,
  });

  // Load URL depending on dev or prod
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle external links safely in system default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  // Create System Tray Icon
  try {
    const iconPath = path.join(__dirname, '../public/zipcon_logo.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open QuoteFlow ERP',
        click: () => {
          if (mainWindow) mainWindow.show();
        },
      },
      {
        label: 'New Quotation (Ctrl+N)',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.send('navigate-tab', 'new-quotation');
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Check GitHub Updates...',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.send('check-updates');
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Exit QuoteFlow ERP',
        click: () => {
          app.quit();
        },
      },
    ]);
    tray.setToolTip('QuoteFlow Enterprise ERP - ZIPCON');
    tray.setContextMenu(contextMenu);
  } catch (e) {
    console.log('Tray creation bypassed in non-desktop mode');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Native Features
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-native-notification', (_, title: string, body: string) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: path.join(__dirname, '../public/zipcon_logo.png') }).show();
  }
});

ipcMain.handle('print-document', async () => {
  if (mainWindow) {
    mainWindow.webContents.print({ silent: false, printBackground: true });
  }
});
