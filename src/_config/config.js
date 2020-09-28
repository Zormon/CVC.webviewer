function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')
var prefs = remote.getGlobal('appConf')

function savePreferences() {
    prefs.url = $('url').value
    prefs.logsDir = $('logsDir').value

    prefs.window.type = parseInt($('windowType').value)
    prefs.window.sizeX = $('windowSizeX').value != ''? parseInt($('windowSizeX').value) : parseInt($('windowSizeX').placeholder)
    prefs.window.sizeY = $('windowSizeY').value != ''? parseInt($('windowSizeY').value) : parseInt($('windowSizeY').placeholder)
    prefs.window.posX = $('windowPosX').value != ''? parseInt($('windowPosX').value) : parseInt($('windowPosX').placeholder)
    prefs.window.posY = $('windowPosY').value != ''? parseInt($('windowPosY').value) : parseInt($('windowPosY').placeholder)

    ipcRenderer.send('savePrefs', prefs )
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
    switch (e.currentTarget.value) {
        case '0': //Fullscreen
            $('windowSizeX').disabled = true;  $('windowSizeY').disabled = true
            $('windowPosX').disabled = true;  $('windowPosY').disabled = true
        break

        case '1': // Sin bordes
            $('windowSizeX').disabled = false;  $('windowSizeY').disabled = false
            $('windowPosX').disabled = false;  $('windowPosY').disabled = false
        break

        case '2': // Normal
            $('windowSizeX').disabled = false;  $('windowSizeY').disabled = false
            $('windowPosX').disabled = true;  $('windowPosY').disabled = true
    }
}

// Initialization
$('url').value = prefs.url
$('logsDir').value = prefs.logsDir

$('windowType').value = prefs.window.type
$('windowSizeX').value = prefs.window.sizeX
$('windowSizeY').value = prefs.window.sizeY
$('windowPosX').value = prefs.window.posX
$('windowPosY').value = prefs.window.posY

const event = new Event('change')
$('windowType').dispatchEvent(event)