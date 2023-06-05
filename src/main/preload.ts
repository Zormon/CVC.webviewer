const { contextBridge, ipcRenderer } = require("electron")

import {TAppConf} from '../types'

contextBridge.exposeInMainWorld (
    "ipc", {
        get: {
            appConf: () => ipcRenderer.sendSync('getGlobal', 'appConf')
        },
        save: {
            appConf: (data:TAppConf) => ipcRenderer.send('saveAppConf', data )
        },
        dialog: {
            saveDir: (opts:Object) => ipcRenderer.sendSync('saveDirDialog', opts),
        },
        logger: {
            std: (data:Object) => ipcRenderer.send('log', data),
            error: (data:Object) => ipcRenderer.send('logError', data),
        }
    }
)