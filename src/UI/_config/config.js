import {$} from '../exports.web.js'

var CONF = window.ipc.get.appConf()

function savePreferences() {
    CONF.url = $('url').value
    CONF.logsDir = $('logsDir').value
    CONF.touch = $('touch').checked

    CONF.window.type = parseInt($('windowType').value)
    CONF.window.width = $('windowSizeX').value != ''? parseInt($('windowSizeX').value) : parseInt($('windowSizeX').placeholder)
    CONF.window.height = $('windowSizeY').value != ''? parseInt($('windowSizeY').value) : parseInt($('windowSizeY').placeholder)
    CONF.window.posX = $('windowPosX').value != ''? parseInt($('windowPosX').value) : parseInt($('windowPosX').placeholder)
    CONF.window.posY = $('windowPosY').value != ''? parseInt($('windowPosY').value) : parseInt($('windowPosY').placeholder)
    CONF.window.alwaysOnTop = $('alwaysOnTop').checked

    window.ipc.save.appConf( CONF )
}

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('config').checkValidity() ) {
        savePreferences()
    } else { 
        $('config').reportValidity()
    }
}

$('logsDir').onclick = ()=> {
    let dir = ipcRenderer.sendSync('saveDirDialog', {dir: $('logsDir').value, file:false})
    $('logsDir').value = dir
}

$('windowType').onchange = (e) => { 
    switch (parseInt(e.currentTarget.value)) {
        case 0: case 3: //Fullscreen & fullborderless
            $('windowSize').parentElement.style.display = 'none'
            $('windowPos').parentElement.style.display = 'none'
            $('alwaysOnTop').parentElement.style.display = 'none'
        break

        case 1: // Sin bordes
            $('windowSize').parentElement.style.display = ''
            $('windowPos').parentElement.style.display = ''
            $('alwaysOnTop').parentElement.style.display = ''
        break

        case 2: // Normal
            $('windowSize').parentElement.style.display = ''
            $('windowPos').parentElement.style.display = 'none'
            $('alwaysOnTop').parentElement.style.display = ''
    }
}

// Initialization
$('url').value = CONF.url
$('logsDir').value = CONF.logsDir
$('touch').checked = CONF.touch

$('windowType').value = CONF.window.type
$('windowSizeX').value = CONF.window.width
$('windowSizeY').value = CONF.window.height
$('windowPosX').value = CONF.window.posX
$('windowPosY').value = CONF.window.posY
$('alwaysOnTop').checked = CONF.window.alwaysOnTop

const ev = new Event('change')
$('windowType').dispatchEvent(ev)