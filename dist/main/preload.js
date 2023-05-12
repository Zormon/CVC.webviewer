const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld (
    "ipc", {
        get: {
            appConf: () => ipcRenderer.sendSync('getGlobal', 'appConf')
        },
        save: {
            appConf: (data) => ipcRenderer.send('saveAppConf', data )
        },
        dialog: {
            saveDir: (opts) => ipcRenderer.sendSync('saveDirDialog', opts),
        },
        logger: {
            std: (data) => ipcRenderer.send('log', data),
            error: (data) => ipcRenderer.send('logError', data),
        }
    }
)