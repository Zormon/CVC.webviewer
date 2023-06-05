import {$} from '../exports.web'
import {TAppConf, TipcRenderer} from '../../types'

declare const ipcRenderer:TipcRenderer


var CONF:TAppConf = window.ipc.get.appConf()

function savePreferences() {
    CONF.url = (<HTMLInputElement>$('url')).value
    CONF.logsDir = (<HTMLInputElement>$('logsDir')).value
    CONF.touch = (<HTMLInputElement>$('touch')).checked

    CONF.window.type = parseInt((<HTMLInputElement>$('windowType')).value)

    // Window size X
    if ( (<HTMLInputElement>$('windowSizeX')).value != '') { 
        CONF.window.width = parseInt( (<HTMLInputElement>$('windowSizeX')).value )
    } else {
        CONF.window.width = parseInt( (<HTMLInputElement>$('windowSizeX')).placeholder )
    }

    // Window size Y
    if ( (<HTMLInputElement>$('windowSizeY')).value != '') {
        CONF.window.height = parseInt( (<HTMLInputElement>$('windowSizeY')).value )
    } else {
        CONF.window.height = parseInt( (<HTMLInputElement>$('windowSizeY')).placeholder )
    }

    // Window position X
    if ( (<HTMLInputElement>$('windowPosX')).value != '') {
        CONF.window.posX = parseInt( (<HTMLInputElement>$('windowPosX')).value )
    } else {
        CONF.window.posX = parseInt( (<HTMLInputElement>$('windowPosX')).placeholder )
    }

    // Window position Y
    if ( (<HTMLInputElement>$('windowPosY')).value != '') {
        CONF.window.posY = parseInt( (<HTMLInputElement>$('windowPosY')).value )
    } else {
        CONF.window.posY = parseInt( (<HTMLInputElement>$('windowPosY')).placeholder )
    }
    
    CONF.window.alwaysOnTop = (<HTMLInputElement>$('alwaysOnTop')).checked

    window.ipc.save.appConf( CONF )
}



let el:HTMLElement|null

if (el = $('save')) {
    el.onclick = (e)=> {
        e.preventDefault()
        const form = <HTMLFormElement|null>$('config')
        if (form) {
            if ( form.checkValidity() ) {
                savePreferences()
            } else { 
                form.reportValidity()
            }
            
        }
    }
}

if (el = $('logsdir')) {
    el.onclick = ()=> {
        let dir = ipcRenderer.sendSync('saveDirDialog', {dir: (<HTMLInputElement>el).value, file:false}) as string
        (<HTMLInputElement>el).value = dir
    }
}

if (el = $('windowType')) {
    el.onchange = (e) => { 
        let evEl = e.currentTarget
        let pEl:HTMLElement|null
        if (evEl) {
            switch ( parseInt((<HTMLInputElement>evEl).value) ) {
                case 0: case 3: //Fullscreen & fullborderless
                    if (pEl = $('windowSize'))  { pEl.parentElement!.style.display = 'none' }
                    if (pEl = $('windowPos'))   { pEl.parentElement!.style.display = 'none' }
                    if (pEl = $('alwaysOnTop')) { pEl.parentElement!.style.display = 'none' }
                break
        
                case 1: // Sin bordes
                    if (pEl = $('windowSize'))  { pEl.parentElement!.style.display = '' }
                    if (pEl = $('windowPos'))   { pEl.parentElement!.style.display = '' }
                    if (pEl = $('alwaysOnTop')) { pEl.parentElement!.style.display = '' }
                break
        
                case 2: // Normal
                    if (pEl = $('windowSize'))  { pEl.parentElement!.style.display = '' }
                    if (pEl = $('windowPos'))   { pEl.parentElement!.style.display = '' }
                    if (pEl = $('alwaysOnTop')) { pEl.parentElement!.style.display = '' }
                break
            }
        }
    }
}


// Initialization
if (el = $('url'))          { (<HTMLInputElement>el).value = CONF.url }
if (el = $('logsDir'))      { (<HTMLInputElement>el).value = CONF.logsDir }
if (el = $('touch'))        { (<HTMLInputElement>el).checked = CONF.touch }

if (el = $('windowType'))   { (<HTMLInputElement>el).value = CONF.window.type.toString() }
if (el = $('windowSizeX'))  { (<HTMLInputElement>el).value = CONF.window.width.toString() }
if (el = $('windowSizeY'))  { (<HTMLInputElement>el).value = CONF.window.height.toString() }
if (el = $('windowPosX'))   { (<HTMLInputElement>el).value = CONF.window.posX.toString() }
if (el = $('windowPosY'))   { (<HTMLInputElement>el).value = CONF.window.posY.toString() }
if (el = $('alwaysOnTop'))  { (<HTMLInputElement>el).checked = CONF.window.alwaysOnTop }

const ev = new Event('change')
if (el = $('windowType')) { el.dispatchEvent(ev)}