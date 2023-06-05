
// Nombres de iconos de tipografia CVC Icons
const iconNames:string[] = [
    'ninguno',        // 0
    'carne',        // 1
    'pescado',      // 2
    'embutido',     // 3
    'fruta',        // 4
    'verdura',      // 5
    'pan',          // 6
    'comidas'       // 7
]

// Alias de selectores generales
var getById = document.getElementById.bind(document)
var querySel = document.querySelector.bind(document)
var querySelAll = document.querySelectorAll.bind(document)

// Otras funciones
function sleep(ms:number) { return new Promise(resolve => setTimeout(resolve, ms)) }
function isFunction(f:number) {return f && {}.toString.call(f)==='[object Function]'}

/**
 * Muestra un modal con multiples funciones
 * @param {String} id Identificador del modal
 * @param {String} template Id del template html para el contenido
 * @param {Array} tplvars Selectores para rellenar texto en plantillas
 * @param {String} type Tipo de modal, para estilos CSS
 * @param {Function} accion Accion a realizar al pulsar el boton de aceptaar
 * @param {Array} buttons Textos alternativos para botones del modal
 */
function modalBox(
    id:number,
    template:string,
    tplvars:[string,string][]=[],
    type='',
    accion:Function|boolean=false,
    buttons=['Cancelar','Aceptar']
  ) {
    if ( template ) { // Añadir
      const templateEl = getById(template) as HTMLTemplateElement
      if (!!!templateEl) { return }

      if (!document.contains( getById(id as unknown as string) )) {
        // Modal Fullscreen Wrapper
        let modal = document.createElement('div')
        modal.id = id as unknown as string
        modal.className = 'modalBox ' + type
  
        // Modal
        let modalBox = document.createElement('div')
        let content = templateEl.content.cloneNode(true) as DocumentFragment
  
        // Template vars
        tplvars.forEach(item => {
          const el = content.querySelector(`[data-tpl="${item[0]}"]`)
          if (el) { el.innerHTML = item[1] }
        })
  
        modalBox.appendChild(content)
  
        // Botones
        if (typeof accion == 'function') { 
          let btnCancel = document.createElement('button')
          btnCancel.appendChild( document.createTextNode(buttons[0]) )
          btnCancel.id = 'cancel'
          btnCancel.onclick = ()=> { modal.remove() }
      
          let btnOk = document.createElement('button')
          btnOk.appendChild( document.createTextNode(buttons[1]) )
          btnOk.id = 'ok'
          btnOk.onclick = ()=> { accion(); modal.remove() }
  
          modalBox.appendChild(btnOk)
          modalBox.appendChild(btnCancel)
        }
  
        modal.appendChild(modalBox)
        document.body.appendChild(modal)
      } else {
        tplvars.forEach(item => {
          const elId = getById(id as unknown as string)
          if (elId) { 
            const el = elId.querySelector(`[data-tpl="${item[0]}"]`)
            if (el) { el.innerHTML = item[1] }
          }
        })
    }
    } else { // Si template es falso, es que se quiere destruir el modal
      const modal = getById(id as unknown as string)
      if (modal) { modal.remove() }
    }
  }


export { 
    iconNames,
    sleep,
    modalBox,
    isFunction,
    getById as $,
    querySel as $$,
    querySelAll as $$$
}