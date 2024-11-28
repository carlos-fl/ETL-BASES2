//TODO: create modal for data flow
// Implementing drag and drop listeners

// Handler para arrastrar sobre un contenedor
function dragOverHandler(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "copy";
}

/**
 * @param {Event} ev
 * @param {VoidFunction} cb - Callback para acciones personalizadas (como abrir un modal)
 */
function dropHandler(ev, cb) {
  ev.preventDefault();

  // Obtener el id del elemento arrastrado
  const data = ev.dataTransfer.getData("application/my-app");
  const dragElement = document.getElementById(data);

  if (dragElement) {
    const clone = dragElement.cloneNode(true); // Clonar el elemento arrastrado
    clone.id = `${data}-clone-${new Date().getTime()}`; // Asignar un nuevo ID al clon

    // Mostrar botones y ajustar estilo según tipo de elemento arrastrado
    const iconContainer = clone.querySelector(".d-none");

    if (dragElement.id !== "ETL") {
      // Agregar evento de doble clic para abrir el modal si no es un bloque ETL
      clone.addEventListener("dblclick", function () {
        cb(clone, dragElement.id); // Callback para acciones personalizadas
      });

      // Ajustar clases de estilo
      iconContainer.classList.remove("d-none");
      iconContainer.classList.add("d-block");
      clone.classList.remove("h-10", "w-75", "justify-content-center", "btn-primary");
      clone.classList.add("h-25", "w-100", "btn-secondary", "justify-content-between", "shadow");

      // Evitar que se vuelva a añadir eventos de arrastre
      clone.removeEventListener("dragstart", dragStartHandler);

      // Verificar que el contenedor sea válido antes de añadir el clon
      if (ev.target.id.includes("ETL") || dragElement.id === "draggable") {
        ev.target.appendChild(clone); // Añadir el clon al contenedor destino
      }
    } else {
      // Configuración especial para bloques ETL
      iconContainer.classList.remove("d-none");
      iconContainer.classList.add("d-block");
      clone.classList.remove("h-10", "w-75");
      clone.classList.add("h-40", "p-4", "w-40", "d-flex", "flex-column", "justify-content-between");

      // Verificar contenedor antes de añadir
      if (ev.target.id === "data-flow-blocks-container") {
        ev.target.appendChild(clone);
      }
    }
    //sammy
    // Configuración específica para destination
    if (dragElement.id === "destination") {
      // Agregar evento de doble clic para abrir el modal
      clone.addEventListener("dblclick", function () {
        openDestinationModal(clone); // Llama a la función para abrir el modal
      });
    }
  }
}

// Handler para el inicio del arrastre
function dragStartHandler(ev) {
  // Añadir el ID del elemento al objeto de transferencia de datos
  ev.dataTransfer.setData("application/my-app", ev.target.id);
  ev.dataTransfer.effectAllowed = "copy";
}
