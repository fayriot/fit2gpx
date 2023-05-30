const dragDrop = require('drag-drop');
const {ipcRenderer} = require('electron');

const dom = require('./dom');

ipcRenderer.invoke('app:get-files').then((files = []) => {
    dom.displayFiles(files);
});

ipcRenderer.on( 'app:update-files', (event, files) => {
    dom.displayFiles(files);
});

ipcRenderer.on( 'app:loader-on', () => {
    dom.showLoader();
});

ipcRenderer.on( 'app:loader-off', () => {
    dom.hideLoader();
});

dragDrop('#uploader', (files) => {
    const _files = files.map(file => {
        if (file.name.slice((Math.max(0, file.name.lastIndexOf('.')) || Infinity) + 1) !== 'fit') {
            return null;
        } else {
            return {
                name: file.name,
                path: file.path,
            };
        }
    });

    ipcRenderer.invoke('app:on-file-add', _files).then(() => {
        ipcRenderer.invoke('app:get-files').then((files = []) => {
            dom.displayFiles(files);
        });
    });
});

window.openDialog = () => {
    ipcRenderer.invoke('app:on-fs-dialog-open').then(() => {
        ipcRenderer.invoke('app:get-files').then((files = []) => {
            dom.displayFiles(files);
        });
    });
};

window.chooseDir = async () => {
    ipcRenderer.invoke('app:on-choose-dir').then(() => {
        ipcRenderer.invoke('app:show-settings').then((settings) => {
            dom.showSettings(settings);
        });
    });
};

window.chooseSameDir = async () => {
    ipcRenderer.invoke('app:on-choose-same-dir', document.getElementById('sameDir').checked).then(() => {
        ipcRenderer.invoke('app:show-settings').then((settings) => {
            dom.showSettings(settings);
        });
    });
};

ipcRenderer.invoke('app:show-settings').then((settings) => {
    console.log('invoke', 'app:show-settings', settings);
    dom.showSettings(settings);
});

window.toggleSettings = () => {
    dom.toggleSettingsWindow();
};
