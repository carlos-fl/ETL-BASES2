//TODO: create modal for data flow
// implementing drag and drop listeners
function dragOverHandler(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "copy";
}

function dropHandler(ev) {
  ev.preventDefault();

  // Obtener el id del elemento arrastrado
  const data = ev.dataTransfer.getData("application/my-app");
  const dragElement = document.getElementById(data);

  // Verificar que el elemento arrastrado exista antes de clonar
  if (dragElement) {
    const clone = dragElement.cloneNode(true); // Clonar el elemento arrastrado
    clone.id = `${data}-clone-${new Date().getTime()}`; // Asignar un nuevo ID al clon
    ev.target.appendChild(clone); // Añadir el clon a la zona de destino
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
