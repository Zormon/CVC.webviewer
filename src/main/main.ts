import {TAppConf, TwindowOptions} from '../types'


const appName = 'webviewer'
import { app, BrowserWindow, Menu, ipcMain, dialog, screen } from 'electron'
const fs = require("fs")
const path = require('path')
const logger = require('./log.js')
import {sleep, DEFAULT_CONFIG} from './exports.js'

const isLinux = process.platform === "linux"
const restartCommandShell =  `~/system/scripts/appsCvc restart ${appName} &`

var appWin:Electron.BrowserWindow
var configWin:Electron.BrowserWindow | null
var APPCONF:TAppConf

/*=============================================
=            Preferencias            =
=============================================*/

  const CONFIG_FILE = `${app.getPath('userData')}/APPCONF.json`

  APPCONF = loadConfigFile(CONFIG_FILE)
  if (APPCONF.touch)   { app.commandLine.appendSwitch('touch-events', 'enabled') }

/*=====  End of Preferencias  ======*/



/*=============================================
=            Menu            =
=============================================*/

  const menu:Electron.MenuItemConstructorOptions[] = [
    {
        role: 'appMenu',
        label: 'Archivo',
        submenu: [
            {label:'Reiniciar', accelerator: 'CmdOrCtrl+R', click() { restart() } },
            {label:'Refrescar', role: 'forceReload' },
            {label:'Salir', role: 'quit'}
        ]
    },
    {
        label: 'Editar',
        submenu: [
            {label:'Ajustes', accelerator: 'CmdOrCtrl+E',  click() {
              if (configWin == null)  { config() } 
              else                    { configWin.focus() } 
            }},
            {type: 'separator'},
            {label:'Restaurar parámetros',     click() { restoreDialog() } }
        ]
    },
    {
      role: 'help',
      label: 'Ayuda',
      submenu: [
          {label:'Información',     click() { about() } },
          {label:'Consola Web', role: 'toggleDevTools'}
      ]
    }
  ]

/*=====  End of Menu  ======*/



/*=============================================
=            Funciones            =
=============================================*/

  function restart() {
    if (isLinux) {
      let exec = require('child_process').exec
      exec(restartCommandShell)
    } else {
      app.relaunch()
      app.quit()
    }
  }

  function saveConfFile(prefs:TAppConf, file:string) {
    fs.mkdirSync( path.dirname(file), { recursive: true } )
    fs.writeFileSync(file, JSON.stringify(prefs), 'utf8')
  }

  function loadConfigFile(file:string):TAppConf {
    if (fs.existsSync(file)) {
      try {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'))
        return data
      } catch (error) { return DEFAULT_CONFIG }
    } else { return DEFAULT_CONFIG}
  }

  function restore() {
    saveConfFile(DEFAULT_CONFIG, CONFIG_FILE)
    restart() 
  }

  function restoreDialog() {
    const options  = {
      type: 'warning',
      buttons: ['Cancelar','Aceptar'],
      message: '¿Restaurar los valores por defecto de la configuración de la aplicación?'
    }
    dialog.showMessageBox(appWin, options).then( resp => { 
      if (resp.response) { // Ha pulsado aceptar
        restore()
        restart() 
      }
    })
  }

/*=====  End of Funciones  ======*/



/*=============================================
=            Ventanas            =
=============================================*/

  function initApp() {
    let windowOptions:TwindowOptions = {
      autoHideMenuBar: true,
      resizable:true,
      show: false,
      icon: `${app.getAppPath()}/icon64.png`,
      fullscreen: APPCONF.window.type==0? true : false,
      frame: (APPCONF.window.type == 1 || APPCONF.window.type == 3)? false : true,
      alwaysOnTop: APPCONF.window.alwaysOnTop,
      webPreferences: { 
        contextIsolation: true, 
        preload: path.join(__dirname, "preload.js") 
      }
    }
    appWin = new BrowserWindow(windowOptions)

    switch (APPCONF.window.type) {
      case 1: // Borderless
        appWin.setPosition( APPCONF.window.posX, APPCONF.window.posY)
      case 2: // Normal Window
        appWin.setSize(APPCONF.window.width, APPCONF.window.height)
      break
      case 3: // fullBorderless
        let width=0, height=0, displays = screen.getAllDisplays()
        displays.forEach(d => { 
          width += d.bounds.width
          height = (height<d.bounds.height)? d.bounds.height : height
        })

        appWin.setPosition(0,0)
        appWin.setSize(width,height)
      break
    }

    appWin.loadURL(APPCONF.url)
    appWin.setTitle(appName)
    appWin.on('page-title-updated', (e)=>{ e.preventDefault()})
    Menu.setApplicationMenu( Menu.buildFromTemplate(menu) )
    appWin.setResizable(false)
    appWin.show()
    appWin.on('closed', () => { logs.log('MAIN','QUIT',''); app.quit() })

    screen.on('display-metrics-changed', restart )

    logs.log('MAIN','START','')

    appWin.webContents.on('did-fail-load', async (e, code, desc)=> {
      logs.error('MAIN', 'FAIL_LOAD', `{Code: ${code}, Error: ${desc}}`)
      await sleep(8000)
      appWin.reload()
    })
    //appWin.webContents.openDevTools()
  }

  function config() {
    let windowOptions:TwindowOptions = {
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
    }
    configWin = new BrowserWindow(windowOptions)
    configWin.loadFile(`${__dirname}/../UI/_config/config.html`)
    configWin.setMenu( null )
    configWin.resizable = false
    configWin.show()
    
    configWin.on('closed', () => { configWin = null })
    //configWin.webContents.openDevTools()
  }

  function about() {
    const options  = {
      type: 'info',
      buttons: ['Aceptar'],
      message: 'Visor Web \nComunicacion Visual Canarias 2022\nContacto: 928 67 29 81'
     }
    dialog.showMessageBox(appWin, options)
  }

/*=====  End of Ventanas  ======*/


app.on('ready', ()=>{
  if (isLinux) { app.importCertificate({certificate:"cvc.p12", password:"cvc"}, ()=>{}) }
  initApp()
})


/*=============================================
=                 IPC signals                 =
=============================================*/

ipcMain.on('saveAppConf', (_e, arg) => { 
  APPCONF = arg
  saveConfFile(arg, CONFIG_FILE)
  logs.log('MAIN', 'SAVE_PREFS', JSON.stringify(arg))
  restart()
})

ipcMain.on('getGlobal', (e, type) => {
  switch(type) {
    case 'appConf':
      e.returnValue = APPCONF
    break
  }
})

ipcMain.on('saveDirDialog', (e, arg) => {
  let options:Electron.OpenDialogSyncOptions = {}
  options.defaultPath = arg.dir

  if (arg.file) { // Abre archivo
    options = {
      title : 'Abrir archivo lista.xml', 
      buttonLabel : "Abrir lista",
      filters : [{name: 'lista', extensions: ['xml']}],
      properties: ['openFile']
    }
  } else { // Abre directorio
    options = {
      title : 'Abrir directorio', 
      buttonLabel : "Abrir directorio",
      properties: ['openDirectory']
    }
  }

  let dir = dialog.showOpenDialogSync(appWin, options)
  if (typeof dir != 'undefined')  { e.returnValue = arg.file? path.dirname( dir.toString() ) : dir.toString() }
  else                            { e.returnValue = arg.dir }
})

// Logs
var logs = new logger(`${APPCONF.logsDir}/`, appName)
ipcMain.on('log', (e, arg) =>       { logs.log(arg.origin, arg.event, arg.message) })
ipcMain.on('logError', (e, arg) =>  { logs.error(arg.origin, arg.error, arg.message) })


/*=====  End of IPC signals  ======*/