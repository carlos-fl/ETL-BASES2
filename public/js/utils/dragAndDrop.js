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

    // agrega clases para mostrar botones, sombra y layout
    const iconContainer = clone.querySelector(".d-none");
    if (dragElement.id != "ETL") {
      // add event listener to clone only if it is not ETL container block
      clone.addEventListener("dblclick", function () {
        cb(clone, dragElement.id);
      });

      iconContainer.classList.remove("d-none");
      iconContainer.classList.add("d-block");
      clone.classList.remove("h-10");
      clone.classList.remove("w-75");
      clone.classList.add('h-25')
      clone.classList.add('w-100')
      clone.classList.remove("justify-content-center");
      clone.classList.remove("btn-primary");
      clone.classList.add("btn-secondary");
      clone.classList.add("justify-content-between");
      clone.classList.add("shadow");
      // quita los handlers del elemento clonado
      clone.removeEventListener("dragStart", dragStartHandler);
      //evita que se clone encima dentro de elementos del mismo tipo
      // se clona solo en los divs
      if (ev.target.id.includes('ETL') || dragElement.id == 'draggable')
        ev.target.appendChild(clone); // Añadir el clon a la zona de destino
    } else {
      iconContainer.classList.remove("d-none");
      iconContainer.classList.add("d-block");
      clone.classList.remove('h-10') 
      clone.classList.remove('w-75') 
      clone.classList.add('h-40')
      clone.classList.add('p-4')
      clone.classList.add('w-40')
      clone.classList.add('d-flex')
      clone.classList.add('flex-column')
      clone.classList.add('justify-content-between')
      if (ev.target.id == 'data-flow-blocks-container') 
        ev.target.appendChild(clone)
    }

  }
}

function dragStartHandler(ev) {
  // Add the target element's id to the data transfer object
  ev.dataTransfer.setData("application/my-app", ev.target.id);
  ev.dataTransfer.effectAllowed = "copy";
}
