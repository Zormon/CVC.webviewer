const appName = 'webviewer'
const { app, BrowserWindow, Menu, ipcMain, dialog, screen, remote } = require('electron')
const fs = require("fs")
const path = require('path')
const logger = require('./log.js')
const isLinux = process.platform === "linux"
const restartCommandShell =  `~/system/scripts/appsCvc restart ${appName} &`

var appWin; var configWin;
function sleep(ms) {return new Promise(r=>setTimeout(r,ms))}

const appPath = app.getAppPath()

/*=============================================
=            Preferencias            =
=============================================*/

  const CONFIG_FILE = `${app.getPath('userData')}/APPCONF.json`

  // Defaults
  const DEFAULT_CONFIG = { 
    url: 'http://www.google.es',
    logsDir: '/home/cvc/telemetry/apps/',
    touch: true,
    window: {
      type: 0,
      posX: 0,
      posY: 0,
      width: 1280,
      height: 720,
      alwaysOnTop: true
    }
  }

  if ( !(global.APPCONF = loadConfigFile(CONFIG_FILE)) )      { global.APPCONF = DEFAULT_CONFIG }

  if (global.APPCONF.touch)   { app.commandLine.appendSwitch('touch-events', 'enabled') }

/*=====  End of Preferencias  ======*/



/*=============================================
=            Menu            =
=============================================*/

  const menu = [
    {
        role: 'appMenu',
        label: 'Archivo',
        submenu: [
            {label:'Reiniciar', accelerator: 'CmdOrCtrl+R', click() { restart() } },
            {role:'forcereload', label:'Refrescar' },
            {role: 'quit', label:'Salir'}
        ]
    },{
        label: 'Editar',
        submenu: [
            {label:'Ajustes', accelerator: 'CmdOrCtrl+E',  click() {
              if (configWin == null)  { config() } 
              else                    { configWin.focus() } 
            }},
            {type: 'separator'},
            {label:'Restaurar parámetros',     click() { restoreDialog() } }
        ]
    }
    ,{
      role: 'help',
      label: 'Ayuda',
      submenu: [
          {label:'Información',     click() { about() } },
          {role: 'toggledevtools', label:'Consola Web'}
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

  function saveConfFile(prefs, file) {
    fs.writeFileSync(file, JSON.stringify(prefs), 'utf8')
  }

  function loadConfigFile(file) {
    if (fs.existsSync(file)) {
      try {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'))
        return data
      } catch (error) { return false }
    } else { return false}
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
    dialog.showMessageBox(options, (resp) => { if (resp) { restore(); restart() } }) // Ha pulsado aceptar
  }

/*=====  End of Funciones  ======*/



/*=============================================
=            Ventanas            =
=============================================*/

  function initApp() {
    let windowOptions = {autoHideMenuBar: true, resizable:true, show: false, webPreferences: { contextIsolation: true, preload: path.join(appPath, "/main/preload.js") }, icon: `${app.getAppPath()}/icon64.png`}
    if      (APPCONF.window.type == 0)   { windowOptions.fullscreen = true }
    else if (APPCONF.window.type == 1 || APPCONF.window.type == 3)   { windowOptions.frame = false } // Borderless
    if (APPCONF.window.type != 0) { windowOptions.alwaysOnTop = APPCONF.window.alwaysOnTop }
    appWin = new BrowserWindow(windowOptions)

    switch (APPCONF.window.type) {
      case 0: // Fullscreen
        screen.on('display-metrics-changed', restart )
      break
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

    logs.log('MAIN','START','')

    appWin.webContents.on('did-fail-load', async (e, code, desc)=> {
      logs.error('MAIN', 'FAIL_LOAD', `{Code: ${code}, Error: ${desc}}`)
      await sleep(8000)
      appWin.reload()
    })
    //appWin.webContents.openDevTools()
  }

  function config() {
    configWin = new BrowserWindow({width: 400, height: 520, show:false, alwaysOnTop: true, webPreferences: { contextIsolation: true, preload: path.join(appPath, "/main/preload.js"), parent: appWin }})
    configWin.loadFile(`${appPath}/UI/_config/config.html`)
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

ipcMain.on('saveAppConf', (e, arg) => { 
  global.APPCONF = arg
  saveConfFile(arg, CONFIG_FILE)
  logs.log('MAIN', 'SAVE_PREFS', JSON.stringify(arg))
  restart()
})

ipcMain.on('getGlobal', (e, type) => {
  switch(type) {
    case 'appConf':
      e.returnValue = global.APPCONF
    break
    case 'interface':
      e.returnValue = global.UI
    break
  }
})

ipcMain.on('saveDirDialog', (e, arg) => {
  let options
  if (arg.file) { // Abre archivo
    options = {
      title : 'Abrir archivo lista.xml', 
      defaultPath : arg.dir,
      buttonLabel : "Abrir lista",
      filters : [{name: 'lista', extensions: ['xml']}],
      properties: ['openFile']
    }
  } else { // Abre directorio
    options = {
      title : 'Abrir directorio', 
      defaultPath : arg.dir,
      buttonLabel : "Abrir directorio",
      properties: ['openDirectory']
    }
  }
  

  let dir = dialog.showOpenDialogSync(options)
  if (typeof dir != 'undefined')  { e.returnValue = arg.file? path.dirname( dir.toString() ) : dir.toString() }
  else                            { e.returnValue = arg.dir }
})

// Logs
var logs = new logger(`${global.APPCONF.logsDir}/`, appName)
ipcMain.on('log', (e, arg) =>       { logs.log(arg.origin, arg.event, arg.message) })
ipcMain.on('logError', (e, arg) =>  { logs.error(arg.origin, arg.error, arg.message) })


/*=====  End of IPC signals  ======*/