import { TAppConf } from "../types"

function sleep(ms:number) {return new Promise(r=>setTimeout(r,ms))}

const DEFAULT_CONFIG:TAppConf = { 
    url: 'http://www.google.es',
    logsDir: '/home/cvc/telemetry/apps/',
    touch: true,
    debug: {
      autoOpenDevTools: false
    },
    window: {
      type: 0,
      posX: 0,
      posY: 0,
      width: 1280,
      height: 720,
      alwaysOnTop: true
    }
  }

export {
    sleep,
    DEFAULT_CONFIG
}