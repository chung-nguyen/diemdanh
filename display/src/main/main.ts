/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath, getLocalIp } from './util';
import { AppInfoModel } from '../models/AppInfo';
import { SettingsProvider } from './controllers/settings';
import { ProxyServer } from './proxy';
import { IPCEvents } from '../shared/ipcEvents';
import { MongodController } from './controllers/databaseServer';
import { MongoConnection } from './controllers/databaseConnection';

const proxyServer = new ProxyServer();
const settingsProvider = new SettingsProvider();

let mongoConnection = new MongoConnection();
let mongodController: MongodController | null = null;

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on(IPCEvents.INITIALIZE, async (event) => {
  settingsProvider.appInfo.localIpAddress = getLocalIp();
  event.reply(IPCEvents.INITIALIZE, settingsProvider.appInfo);
});

ipcMain.on(IPCEvents.SAVE_SETTINGS, async (event, appInfo) => {
  settingsProvider.appInfo = new AppInfoModel(appInfo);
  settingsProvider.save();

  if (mainWindow) {
    proxyServer.run(settingsProvider.appInfo.localPort, mainWindow);
  }
});

ipcMain.on(IPCEvents.DATABASE_SERVER, async (event, command, dbPath, port) => {
  switch (command) {
    case 'start':
      if (mongodController) {
        mongodController.stop();
      }
      if (dbPath && port) {
        mongodController = new MongodController({
          dbPath,
          port,
        });
        mongodController.start();
        event.reply(
          IPCEvents.DATABASE_SERVER,
          'status',
          mongodController?.isRunning() || false,
        );
      }
      break;

    case 'stop':
      if (mongodController) {
        mongodController.stop();
        mongodController = null;
      }
      break;

    case 'status':
      event.reply(
        IPCEvents.DATABASE_SERVER,
        'status',
        mongodController?.isRunning() || false,
        mongoConnection?.isConnected() || false
      );
      break;
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default({ showDevTools: false });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  proxyServer.run(settingsProvider.appInfo.localPort, mainWindow);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  if (mongodController) {
    mongodController.stop();
    mongodController = null;
  }

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    await settingsProvider.load();
    await mongoConnection.connect();

    createWindow();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        createWindow();
      }
    });
  })
  .catch(console.log);
