"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appName = 'webviewer';
const electron_1 = require("electron");
const fs = require("fs");
const path = require('path');
const logger = require('./log.js');
const exports_js_1 = require("./exports.js");
const isLinux = process.platform === "linux";
const restartCommandShell = `~/system/scripts/appsCvc restart ${appName} &`;
var appWin;
var configWin;
var APPCONF;
/*=============================================
=            Preferencias            =
=============================================*/
const CONFIG_FILE = `${electron_1.app.getPath('userData')}/APPCONF.json`;
APPCONF = loadConfigFile(CONFIG_FILE);
if (APPCONF.touch) {
    electron_1.app.commandLine.appendSwitch('touch-events', 'enabled');
}
/*=====  End of Preferencias  ======*/
/*=============================================
=            Menu            =
=============================================*/
const menu = [
    {
        role: 'appMenu',
        label: 'Archivo',
        submenu: [
            { label: 'Reiniciar', accelerator: 'CmdOrCtrl+R', click() { restart(); } },
            { label: 'Refrescar', role: 'forceReload' },
            { label: 'Salir', role: 'quit' }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            { label: 'Ajustes', accelerator: 'CmdOrCtrl+E', click() {
                    if (configWin == null) {
                        config();
                    }
                    else {
                        configWin.focus();
                    }
                } },
            { type: 'separator' },
            { label: 'Restaurar parámetros', click() { restoreDialog(); } }
        ]
    },
    {
        role: 'help',
        label: 'Ayuda',
        submenu: [
            { label: 'Información', click() { about(); } },
            { label: 'Consola Web', role: 'toggleDevTools' }
        ]
    }
];
/*=====  End of Menu  ======*/
/*=============================================
=            Funciones            =
=============================================*/
function restart() {
    if (isLinux) {
        let exec = require('child_process').exec;
        exec(restartCommandShell);
    }
    else {
        electron_1.app.relaunch();
        electron_1.app.quit();
    }
}
function saveConfFile(prefs, file) {
    fs.writeFileSync(file, JSON.stringify(prefs), 'utf8');
}
function loadConfigFile(file) {
    if (fs.existsSync(file)) {
        try {
            let data = JSON.parse(fs.readFileSync(file, 'utf8'));
            return data;
        }
        catch (error) {
            return exports_js_1.DEFAULT_CONFIG;
        }
    }
    else {
        return exports_js_1.DEFAULT_CONFIG;
    }
}
function restore() {
    saveConfFile(exports_js_1.DEFAULT_CONFIG, CONFIG_FILE);
    restart();
}
function restoreDialog() {
    const options = {
        type: 'warning',
        buttons: ['Cancelar', 'Aceptar'],
        message: '¿Restaurar los valores por defecto de la configuración de la aplicación?'
    };
    electron_1.dialog.showMessageBox(appWin, options).then(resp => {
        if (resp.response) { // Ha pulsado aceptar
            restore();
            restart();
        }
    });
}
/*=====  End of Funciones  ======*/
/*=============================================
=            Ventanas            =
=============================================*/
function initApp() {
    let windowOptions = {
        autoHideMenuBar: true,
        resizable: true,
        show: false,
        icon: `${electron_1.app.getAppPath()}/icon64.png`,
        fullscreen: APPCONF.window.type == 0 ? true : false,
        frame: (APPCONF.window.type == 1 || APPCONF.window.type == 3) ? false : true,
        alwaysOnTop: APPCONF.window.alwaysOnTop,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js")
        }
    };
    appWin = new electron_1.BrowserWindow(windowOptions);
    switch (APPCONF.window.type) {
        case 1: // Borderless
            appWin.setPosition(APPCONF.window.posX, APPCONF.window.posY);
        case 2: // Normal Window
            appWin.setSize(APPCONF.window.width, APPCONF.window.height);
            break;
        case 3: // fullBorderless
            let width = 0, height = 0, displays = electron_1.screen.getAllDisplays();
            displays.forEach(d => {
                width += d.bounds.width;
                height = (height < d.bounds.height) ? d.bounds.height : height;
            });
            appWin.setPosition(0, 0);
            appWin.setSize(width, height);
            break;
    }
    appWin.loadURL(APPCONF.url);
    appWin.setTitle(appName);
    appWin.on('page-title-updated', (e) => { e.preventDefault(); });
    electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(menu));
    appWin.setResizable(false);
    appWin.show();
    appWin.on('closed', () => { logs.log('MAIN', 'QUIT', ''); electron_1.app.quit(); });
    electron_1.screen.on('display-metrics-changed', restart);
    logs.log('MAIN', 'START', '');
    appWin.webContents.on('did-fail-load', async (e, code, desc) => {
        logs.error('MAIN', 'FAIL_LOAD', `{Code: ${code}, Error: ${desc}}`);
        await (0, exports_js_1.sleep)(8000);
        appWin.reload();
    });
    //appWin.webContents.openDevTools()
}
function config() {
    let windowOptions = {
        width: 400, height: 520,
        autoHideMenuBar: false,
        resizable: false,
        fullscreen: false,
        show: false,
        frame: true,
        alwaysOnTop: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
            parent: appWin
        }
    };
    configWin = new electron_1.BrowserWindow(windowOptions);
    configWin.loadFile(`${__dirname}/../UI/_config/config.html`);
    configWin.setMenu(null);
    configWin.resizable = false;
    configWin.show();
    configWin.on('closed', () => { configWin = null; });
    //configWin.webContents.openDevTools()
}
function about() {
    const options = {
        type: 'info',
        buttons: ['Aceptar'],
        message: 'Visor Web \nComunicacion Visual Canarias 2022\nContacto: 928 67 29 81'
    };
    electron_1.dialog.showMessageBox(appWin, options);
}
/*=====  End of Ventanas  ======*/
electron_1.app.on('ready', () => {
    if (isLinux) {
        electron_1.app.importCertificate({ certificate: "cvc.p12", password: "cvc" }, () => { });
    }
    initApp();
});
/*=============================================
=                 IPC signals                 =
=============================================*/
electron_1.ipcMain.on('saveAppConf', (_e, arg) => {
    APPCONF = arg;
    saveConfFile(arg, CONFIG_FILE);
    logs.log('MAIN', 'SAVE_PREFS', JSON.stringify(arg));
    restart();
});
electron_1.ipcMain.on('getGlobal', (e, type) => {
    switch (type) {
        case 'appConf':
            e.returnValue = APPCONF;
            break;
    }
});
electron_1.ipcMain.on('saveDirDialog', (e, arg) => {
    let options = {};
    options.defaultPath = arg.dir;
    if (arg.file) { // Abre archivo
        options = {
            title: 'Abrir archivo lista.xml',
            buttonLabel: "Abrir lista",
            filters: [{ name: 'lista', extensions: ['xml'] }],
            properties: ['openFile']
        };
    }
    else { // Abre directorio
        options = {
            title: 'Abrir directorio',
            buttonLabel: "Abrir directorio",
            properties: ['openDirectory']
        };
    }
    let dir = electron_1.dialog.showOpenDialogSync(appWin, options);
    if (typeof dir != 'undefined') {
        e.returnValue = arg.file ? path.dirname(dir.toString()) : dir.toString();
    }
    else {
        e.returnValue = arg.dir;
    }
});
// Logs
var logs = new logger(`${APPCONF.logsDir}/`, appName);
electron_1.ipcMain.on('log', (e, arg) => { logs.log(arg.origin, arg.event, arg.message); });
electron_1.ipcMain.on('logError', (e, arg) => { logs.error(arg.origin, arg.error, arg.message); });
/*=====  End of IPC signals  ======*/ 
