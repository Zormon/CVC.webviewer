export type TAppConf = {
    url: string
    logsDir: string
    touch: boolean
    window: {
        type: number
        posX: number
        posY: number
        width: number
        height: number
        alwaysOnTop: boolean
    }
}

export type TwindowOptions = {
    width?: number
    height?: number
    icon?: string
    autoHideMenuBar: boolean
    resizable: boolean
    show: boolean
    fullscreen: boolean
    frame: boolean
    alwaysOnTop: boolean
    webPreferences: {
        contextIsolation: boolean
        preload: string
        parent?: BrowserWindow
    }
}

export type TipcRenderer = {
    sendSync: Function
}

    

declare global {
    interface Window {
        ipc: {
            get: {
                appConf: Function
            },
            save: {
                appConf: Function
            },
            dialog: {
                saveDirDialog: Function
            },
            logger: {
                std: Function
                error: Function
            }
        }

    }
}
