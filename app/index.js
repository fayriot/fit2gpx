const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');

try {
    require('electron-reloader')(module);
} catch (_) { /* empty */ }

const io = require('./main/io');
const appStorage = require('./main/storage');

const openWindow = async () => {
    const win = new BrowserWindow({
        width: 800,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: !app.isPackaged,
        },
        show: false,
    });

    win.setMenuBarVisibility(false);
    // win.removeMenu();

    await appStorage.initStorage();

    win.on('ready-to-show', function() {
        win.show();
        win.focus();
    });

    await win.loadFile(path.resolve( __dirname, 'render/html/index.html' ));

    return win;
};


app.on( 'ready', async () => {
    // eslint-disable-next-line no-unused-vars
    const win = await openWindow();

    io.passWindow(win);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        openWindow();
    }
});

ipcMain.handle('app:get-files', () => {
    return io.getFiles();
});

ipcMain.handle('app:on-file-add', (event, files = []) => {
    io.addFiles(files);
});

ipcMain.handle('app:on-fs-dialog-open', () => {
    const files = dialog.showOpenDialogSync({
        properties: ['openFile', 'multiSelections'],
        filters: [
            {name: 'FIT', extensions: ['fit']},
        ],
    });

    if (!files || !files?.length) {
        return;
    }

    io.addFiles(files.map(filepath => {
        return {
            name: path.parse(filepath).base,
            path: filepath,
        };
    }));
});

ipcMain.on('app:on-file-delete', (event, file) => {
    io.deleteFile(file.filepath);
});

ipcMain.on('app:on-file-open', (event, file) => {
    io.openFile(file.filepath);
});

ipcMain.on('app:on-file-convert', async (event, file) => {
    await io.convertFile(file.filepath);
});

ipcMain.handle('app:on-choose-dir', async () => {
    const files = dialog.showOpenDialogSync({
        properties: ['openDirectory'],
    });

    if (files && files.length) {
        await appStorage.setStorage({targetDir: files[0]});
    }
});

ipcMain.handle('app:on-choose-same-dir', async (event, args) => {
    await appStorage.setStorage({sameDir: args});
});

ipcMain.handle('app:show-settings', async () => {
    return await appStorage.getStorage();
});

