//TODO: create modal for data flow
// implementing drag and drop listeners
function dragOverHandler(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "copy";
}

/**
 * 
 * @param {Event} ev 
 * @param {VoidFunction} cb 
 * cb is a callback function
 */
function dropHandler(ev, cb) {
  ev.preventDefault();

  // Obtener el id del elemento arrastrado
  const data = ev.dataTransfer.getData("application/my-app");
  const dragElement = document.getElementById(data);

  // Verificar que el elemento arrastrado exista antes de clonar
  if (dragElement) {
    const clone = dragElement.cloneNode(true); // Clonar el elemento arrastrado
    clone.id = `${data}-clone-${new Date().getTime()}`; // Asignar un nuevo ID al clon
    // add event listener to clone
    clone.addEventListener('dblclick', function() {
      cb(clone, dragElement.id)
    })
    // agrega clases para mostrar botones, sombra y layout
    const iconContainer = clone.querySelector('.d-none');
    iconContainer.classList.remove('d-none');
    iconContainer.classList.add('d-block');
    clone.classList.remove('justify-content-center');
    clone.classList.add('justify-content-between');
    clone.classList.add('shadow');
    // quita los handlers del elemento clonado
    clone.removeEventListener('dragStart', dragStartHandler);
    //evita que se clone encima dentro de elementos del mismo tipo
    if (ev.target.id === 'data-flow-blocks-container'){
      ev.target.appendChild(clone); // Añadir el clon a la zona de destino
    }
  } else {
    console.error(
      "No se pudo obtener el elemento arrastrado o el target no es la zona de destino."
    );
  }
}

function dragStartHandler(ev) {
  // Add the target element's id to the data transfer object
  ev.dataTransfer.setData("application/my-app", ev.target.id);
  ev.dataTransfer.effectAllowed = "copy";
}
