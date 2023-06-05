import { $ } from '../exports.web';
var CONF = window.ipc.get.appConf();
function savePreferences() {
    CONF.url = $('url').value;
    CONF.logsDir = $('logsDir').value;
    CONF.touch = $('touch').checked;
    CONF.window.type = parseInt($('windowType').value);
    // Window size X
    if ($('windowSizeX').value != '') {
        CONF.window.width = parseInt($('windowSizeX').value);
    }
    else {
        CONF.window.width = parseInt($('windowSizeX').placeholder);
    }
    // Window size Y
    if ($('windowSizeY').value != '') {
        CONF.window.height = parseInt($('windowSizeY').value);
    }
    else {
        CONF.window.height = parseInt($('windowSizeY').placeholder);
    }
    // Window position X
    if ($('windowPosX').value != '') {
        CONF.window.posX = parseInt($('windowPosX').value);
    }
    else {
        CONF.window.posX = parseInt($('windowPosX').placeholder);
    }
    // Window position Y
    if ($('windowPosY').value != '') {
        CONF.window.posY = parseInt($('windowPosY').value);
    }
    else {
        CONF.window.posY = parseInt($('windowPosY').placeholder);
    }
    CONF.window.alwaysOnTop = $('alwaysOnTop').checked;
    window.ipc.save.appConf(CONF);
}
let el;
if (el = $('save')) {
    el.onclick = (e) => {
        e.preventDefault();
        const form = $('config');
        if (form) {
            if (form.checkValidity()) {
                savePreferences();
            }
            else {
                form.reportValidity();
            }
        }
    };
}
if (el = $('logsdir')) {
    el.onclick = () => {
        let dir = ipcRenderer.sendSync('saveDirDialog', { dir: el.value, file: false });
        el.value = dir;
    };
}
if (el = $('windowType')) {
    el.onchange = (e) => {
        let evEl = e.currentTarget;
        let pEl;
        if (evEl) {
            switch (parseInt(evEl.value)) {
                case 0:
                case 3: //Fullscreen & fullborderless
                    if (pEl = $('windowSize')) {
                        pEl.parentElement.style.display = 'none';
                    }
                    if (pEl = $('windowPos')) {
                        pEl.parentElement.style.display = 'none';
                    }
                    if (pEl = $('alwaysOnTop')) {
                        pEl.parentElement.style.display = 'none';
                    }
                    break;
                case 1: // Sin bordes
                    if (pEl = $('windowSize')) {
                        pEl.parentElement.style.display = '';
                    }
                    if (pEl = $('windowPos')) {
                        pEl.parentElement.style.display = '';
                    }
                    if (pEl = $('alwaysOnTop')) {
                        pEl.parentElement.style.display = '';
                    }
                    break;
                case 2: // Normal
                    if (pEl = $('windowSize')) {
                        pEl.parentElement.style.display = '';
                    }
                    if (pEl = $('windowPos')) {
                        pEl.parentElement.style.display = '';
                    }
                    if (pEl = $('alwaysOnTop')) {
                        pEl.parentElement.style.display = '';
                    }
                    break;
            }
        }
    };
}
// Initialization
if (el = $('url')) {
    el.value = CONF.url;
}
if (el = $('logsDir')) {
    el.value = CONF.logsDir;
}
if (el = $('touch')) {
    el.checked = CONF.touch;
}
if (el = $('windowType')) {
    el.value = CONF.window.type.toString();
}
if (el = $('windowSizeX')) {
    el.value = CONF.window.width.toString();
}
if (el = $('windowSizeY')) {
    el.value = CONF.window.height.toString();
}
if (el = $('windowPosX')) {
    el.value = CONF.window.posX.toString();
}
if (el = $('windowPosY')) {
    el.value = CONF.window.posY.toString();
}
if (el = $('alwaysOnTop')) {
    el.checked = CONF.window.alwaysOnTop;
}
const ev = new Event('change');
if (el = $('windowType')) {
    el.dispatchEvent(ev);
}
