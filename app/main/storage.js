const storage = require('electron-json-storage');
const {app} = require('electron');
storage.setDataPath(app.getPath('userData'));

let APP_STORAGE = [];
exports.APP_STORAGE = APP_STORAGE;

const STORAGE_DEFAULT_NAME = 'fit2gpx-storage';
const STORAGE_DEFAULT_VALUE = {
    targetDir: null,
    sameDir: true,
};

const getStorage = async () => {
    return new Promise((resolve) => {
        storage.get(STORAGE_DEFAULT_NAME, function(error, data) {
            if (error) {
                resolve(null);
            }

            resolve(data);
        });
    });
};

exports.getStorage = getStorage;

const setStorage = async (value) => {
    return new Promise((resolve) => {
        storage.get(STORAGE_DEFAULT_NAME, function(error, data) {
            if (error) {
                resolve(null);
            }

            storage.set(STORAGE_DEFAULT_NAME, {...data, ...value}, function(error) {
                resolve(!error);
            });
        });
    });
};

exports.setStorage = setStorage;

exports.initStorage = async () => {
    const storage = await getStorage();

    if (Object.keys(storage).length === 0) {
        await setStorage(STORAGE_DEFAULT_VALUE);
    }
};
