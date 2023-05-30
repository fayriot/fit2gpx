const {ipcRenderer} = require('electron');

exports.showLoader = function () {
    const itemNode = document.getElementById('loader');
    itemNode.classList.add('loader--visible');
};

exports.hideLoader = function () {
    const itemNode = document.getElementById('loader');
    itemNode.classList.remove('loader--visible');
};


window.deleteFile = function (itemId) {
    const itemNode = document.getElementById(itemId);
    const filepath = itemNode.getAttribute('data-filepath');

    ipcRenderer.send('app:on-file-delete', {id: itemId, filepath});

    itemNode.remove();
};

window.openFile = function (itemId) {
    const itemNode = document.getElementById(itemId);
    const filepath = itemNode.getAttribute('data-resultFilepath');

    ipcRenderer.send('app:on-file-open', {id: itemId, filepath});
};

window.convertFile = function (itemId) {
    const itemNode = document.getElementById(itemId);
    const filepath = itemNode.getAttribute('data-filepath');

    ipcRenderer.send('app:on-file-convert', {id: itemId, filepath});
};

exports.displayFiles = (files = []) => {
    const fileListElem = document.getElementById('fileList');
    fileListElem.innerHTML = '';

    files.forEach(file => {
        if (file) {
            const itemDomElem = document.createElement('div');
            itemDomElem.setAttribute('id', file.name);
            itemDomElem.setAttribute('class', 'app__files__item');
            itemDomElem.setAttribute('data-filepath', file.path);
            itemDomElem.setAttribute('data-resultFilepath', file.resultFilepath);

            itemDomElem.innerHTML = `
            <div class='app__files__item__info'>
                <p class='app__files__item__info__name ${file.resultFilepath ? 'app__files__item__info__name--complete' : ''}'>${file.name}</p>
                <p class='app__files__item__info__size'>↳ ${file.path}</p>
            </div>
            `;

            if (file.resultFilepath) {
                itemDomElem.innerHTML += `<img onclick='openFile("${file.name}")' src='../assets/open.svg' class='app__files__item__open'/>`;
            } else {
                itemDomElem.innerHTML += `<img onclick='convertFile("${file.name}", "${file.path}")' src='../assets/convert.svg' class='app__files__item__convert'/>`;
            }

            itemDomElem.innerHTML += `<img onclick='deleteFile("${file.name}", "${file.path}")' src='../assets/delete.svg' class='app__files__item__delete'/>`;

            fileListElem.appendChild(itemDomElem);
        }
    });
};

exports.showSettings = (settings) => {
    const targetDir = document.getElementById('targetDir');
    const targetDirButton = document.getElementById('targetDirButton');
    const sameDir = document.getElementById('sameDir');
    const targetDirWrapper = document.getElementById('targetDirWrapper');

    targetDir.innerHTML = settings?.targetDir ?? '';
    sameDir.checked = !!settings?.sameDir;

    if (settings?.sameDir) {
        targetDirWrapper.classList.add('app__settings__center__item--disabled');
        targetDirButton.disabled = true;
    } else {
        targetDirWrapper.classList.remove('app__settings__center__item--disabled');
        targetDirButton.disabled = false;
    }
};

exports.toggleSettingsWindow = () => {
    const appSettings = document.getElementById('app__settings');

    if (appSettings.classList.contains('app__settings--active')) {
        appSettings.classList.remove('app__settings--active');
    } else {
        appSettings.classList.add('app__settings--active');
    }
};
