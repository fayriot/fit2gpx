const {shell} = require('electron');
const path = require('path');
const fs = require('fs-extra');

const sportsLibPkg = require('@sports-alliance/sports-lib');
const exporterPkg = require('@sports-alliance/sports-lib/lib/events/adapters/exporters/exporter.gpx');
const {SportsLib} = sportsLibPkg;
const {EventExporterGPX} = exporterPkg;

const notification = require('./notification');
const appStorage = require('./storage');

exports.getFiles = () => {
    return appStorage.APP_STORAGE;
};

let mainWindow;

exports.addFiles = (files = []) => {
    files.forEach(file => {
        if (file) {
            const fileStats = fs.statSync(file.path);

            const idx = appStorage.APP_STORAGE.findIndex(
                (e) => e.path === file.path,
            );

            if (idx === -1) {
                appStorage.APP_STORAGE.push({
                    name: file.name,
                    path: file.path,
                    size: Number(fileStats.size / 1000).toFixed(1), // kb
                });
            }
        }
    });
};

exports.deleteFile = (filePath) => {
    const idx = appStorage.APP_STORAGE.findIndex(
        (e) => e.path === filePath,
    );

    if (idx !== -1) {
        appStorage.APP_STORAGE.splice(idx, 1);
    }
};

exports.openFile = (filePath) => {
    shell.showItemInFolder(filePath);
};

exports.convertFile = async (filename) => {
    mainWindow.webContents.send( 'app:loader-on');

    const {targetDir, sameDir} = await appStorage.getStorage();

    const inputFile = fs.readFileSync(filename, null);
    const resultName = path.parse(filename).base.replace('.fit', '.gpx');

    if (!inputFile || !inputFile.buffer) {
        mainWindow.webContents.send( 'app:loader-off');
        notification.send('Error',
            'Could not read the inputFile or it does not exists');
        return;
    }

    const inputFileBuffer = inputFile.buffer;

    SportsLib.importFromFit(inputFileBuffer).then((event) => {
        const gpxPromise = new EventExporterGPX().getAsString(event);
        gpxPromise.then((gpxString) => {
            let resultFilepath;

            if (!sameDir && targetDir) {
                resultFilepath = path.join(targetDir, resultName);
            } else {
                resultFilepath = filename.replace('.fit', '.gpx');
            }


            fs.writeFileSync(resultFilepath, gpxString, (e) => {
                if (e) {
                    notification.send('Error',
                        'Something went wrong while saving the GPX file');
                }
            });


            const idx = appStorage.APP_STORAGE.findIndex(
                (e) => e.path === filename,
            );

            if (idx !== -1) {
                appStorage.APP_STORAGE[idx] = {
                    ...appStorage.APP_STORAGE[idx],
                    resultFilepath: resultFilepath
                };
            }

            mainWindow.webContents.send( 'app:update-files', appStorage.APP_STORAGE);

        }).catch(() => {
            notification.send('Error',
                'something went wrong while converting the FIT file');
        });
    });


    mainWindow.webContents.send( 'app:loader-off');
};

exports.passWindow = ( win ) => {
    mainWindow = win;
};
