const { app, BrowserWindow, Menu } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

const menuTmp = require('./src/temp/menuTemp');

Store.initRenderer();
let mainWindow = null;
console.log(app.getPath('userData'));

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 650,
    minWidth: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  const urlLocation = isDev ? 'http://localhost:3000' : '';

  mainWindow.loadURL(urlLocation);

  const menu = Menu.buildFromTemplate(menuTmp);
  Menu.setApplicationMenu(menu);
});
