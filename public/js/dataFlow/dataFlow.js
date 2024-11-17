const formModal = document.getElementById("form-modal");
const notificationModal = document.getElementById("staticBackdrop");

/**
 *
 * @param {string} modalId
 * @returns {Object}
 */
function extractData() {
  const data = {
    server: formModal.querySelector("#serverName").value,
    dataBase: formModal.querySelector("#dbName").value,
    user: formModal.querySelector("#userName").value,
    password: formModal.querySelector("#userPassword").value,
    sqlCommand: formModal.querySelector("#sqlCommandInput").value,
  };
  return data;
}

function getModalInfo(target) {
  // insertar el contenido en la modal de formularios
  // aplicar event listeners de ser necesario
  if (target.id.includes("draggable-conversion")) {
    target.innerHTML = ""; // insertar contenido de modal de data conversion
  } else {
    target.innerHTML = ""; // insertar contenido de modal de OLE DB destination
  }
}

/**
 *
 * @param {string} typeOfBlockDraggedId
 * set html content for modals
 */
function setModalHtmlContent(typeOfBlockDraggedId) {
  const modalContentDiv = formModal.childNodes[1].childNodes[1];
  if (typeOfBlockDraggedId == "draggable-source") {
    modalContentDiv.innerHTML = `<div class="modal-header">
                  <h5 class="modal-title">Conexión</h5>
                  <button id="close-form-modal-btn" type="button" class="btn-close"  data-bs-dismiss="modal" aria-label="Close" onclick="toggleModal()"></button>
                </div>
                <div class="modal-body">
                  <label for="serverName" >Nombre del servidor</label>
                  <input class="form-control" type="text" name="serverName" id="serverName">

                  <label for="dbName" >Nombre de la Base de Datos</label>
                  <input class="form-control" type="text" name="dbName" id="dbName">

                  <label for="dbName" >Usuario</label>
                  <input class="form-control" type="text" name="user" id="userName">

                  <label for="dbName" >Contraseña</label>
                  <input class="form-control" type="password" name="password" id="userPassword">
                  
                  <label for="sqlCommandInput" >Comando SQL</label>
                  <textarea name="sqlCommand" id="sqlCommandInput" placeholder="SELECT * FROM users;" rows="10" cols="45"></textarea>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" onclick="dbConnection(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                </div>`;
  }
  if (typeOfBlockDraggedId == "draggable-conversion") {
    const dataFromSourceOLEDB = LocalStorage.getItem('source')
    
    if (!dataFromSourceOLEDB) {
        modalContentDiv.innerHTML = `<div class="modal-header">
                  <h5 class="modal-title">Conexión</h5>
                  <button id="close-form-modal-btn" type="button" class="btn-close"  data-bs-dismiss="modal" aria-label="Close" onclick="toggleModal()"></button>
                </div>
                <div class="modal-body">
                    <h3>Datos de source OLEDB no encontrados!</h3>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" onclick="dbConnection(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                </div>`;
 
    } else {
        modalContentDiv.innerHTML = `<div class="modal-header">
                      <h5 class="modal-title">Data conversion</h5>
                      <button id="close-form-modal-btn" type="button" class="btn-close"  data-bs-dismiss="modal" aria-label="Close" onclick="toggleModal()"></button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <table class="table">
                                <thead>
                                <tr>
                                    <th>Column</th>
                                    <th>Output alias</th>
                                    <th>Data type</th>
                                    <th>Length</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody id="tbody">
                                <tr>
                                    <td>name</td>
                                    <td>copy of name</td>
                                    <td>varchar</td>
                                    <td>32</td>
                                    <td>
                                    <select>
                                        <option value="">Capitalize</option>
                                    </select>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-primary" onclick="dbConnection(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                    </div>`;

        // TODO: iterate through every column from source oledb
        const tableBody = document.getElementById('tbody')
    }
  }
  if (typeOfBlockDraggedId == "draggable-destination") {
    modalContentDiv.innerHTML = `<div class="modal-header">
                  <h5 class="modal-title">Data conversion</h5>
                  <button id="close-form-modal-btn" type="button" class="btn-close"  data-bs-dismiss="modal" aria-label="Close" onclick="toggleModal()"></button>
                </div>
                <div class="modal-body">
                  <h2>DATA CONVERSION</h2>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" onclick="dbConnection(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                </div>`;
  }
}

function toggleModal(target, typeOfBlockDraggedId) {
  setModalHtmlContent(typeOfBlockDraggedId);

  if (formModal.classList.contains("show")) {
    formModal.classList.remove("show");
    formModal.style.display = "none";
  } else {
    // obtiene la informacion de la modal solo si es draggable-destination o draggable-conversion;
    // TODO: una vez bien definida la función getModalInfo descomentar este bloque if
    // if (target.id.includes('draggable-conversion') || target.id.includes('draggable-destination')){
    //     console.log(target.id);
    //     getModalInfo(target);
    // }
    formModal.classList.add("show");
    formModal.style.display = "block";
  }
}

function toggleNotificationModal() {
  if (notificationModal.classList.contains("show")) {
    notificationModal.classList.remove("show");
    notificationModal.style.display = "none";
  } else {
    notificationModal.classList.add("show");
    notificationModal.style.display = "block";
  }
}

notificationModal
  .querySelector(".modal-footer button")
  .addEventListener("click", toggleNotificationModal);
notificationModal
  .querySelector(".modal-header button")
  .addEventListener("click", toggleNotificationModal);

function getNotificationModalInfo(result) {
  notificationModal.querySelector(".modal-title").innerText = result.message;
  notificationModal.querySelector(".modal-body").innerHTML = ``;
}

async function dbConnection() {
  const formData = extractData();

  try {
    const response = await fetch("/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    toggleModal(this); //cierra la modal de formulario de conexion
    notificationModal.querySelector(".modal-title").innerText = result.message; // escribe el mensaje de respuesta en el titulo de la modal
    toggleNotificationModal(); // abre la modal de notificaciones y muestra mensaje
    console.log(result.testQueryResult);
  } catch (error) {
    console.log(error);
  }
}
