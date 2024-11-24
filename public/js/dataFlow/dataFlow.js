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
    table: formModal.querySelector('#tableNameSelect').value,
    method: formModal.querySelector('#methodSelection').value,
  };
  return data;
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
    notificationModal.querySelector(".modal-body").innerText = result.message; // escribe el mensaje de respuesta en el cuerpo de la modal
    console.log(result.testQueryResult.source);
    window.localStorage.setItem("source", JSON.stringify(result.testQueryResult.source));
    toggleNotificationModal(); // abre la modal de notificaciones y muestra mensaje
  } catch (error) {
    console.log(error);
  }
}

async function extractTableNames(){
  const formData = extractData();
  try {
    const response = await fetch("/tableNames", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    return result.testQueryResult;
  } catch (error) {
    console.log(error);
  }
}




async function checkSelectValue() {
  if (this.value==='sqlCommand'){
        formModal.querySelector('#tableNameLabel').style.display='none'
    formModal.querySelector('#tableNameSelect').style.display='none'
    formModal.querySelector('#sqlCommandLabel').style.display="block";
    formModal.querySelector('#sqlCommandInput').style.display="block";
    console.log("sqlCommand value!")
  }
  
  if (this.value==='table'){

    const queryResult = await extractTableNames();

    console.log(queryResult);
    for (let table of queryResult.recordset){
      let tableOption = document.createElement('option');
      tableOption.value=table.table_name;
      tableOption.innerText=table.table_name;
      formModal.querySelector('#tableNameSelect').appendChild(tableOption);
    }
    formModal.querySelector('#sqlCommandLabel').style.display="none";
    formModal.querySelector('#sqlCommandInput').style.display="none";
    formModal.querySelector('#tableNameLabel').style.display='block'
    formModal.querySelector('#tableNameSelect').style.display='block'
    console.log("table value!")
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
                <div class="modal-body d-flex flex-column gap-1">
                  <label for="serverName" >Nombre del servidor</label>
                  <input class="form-control" type="text" name="serverName" id="serverName">

                  <label for="dbName" >Nombre de la Base de Datos</label>
                  <input class="form-control" type="text" name="dbName" id="dbName">

                  <label for="userName" >Usuario</label>
                  <input class="form-control" type="text" name="user" id="userName">

                  <label for="userPassword" >Contraseña</label>
                  <input class="form-control" type="password" name="password" id="userPassword">
                  
                  <label for="methodSelection"  >Escoge un método: </label>
                  <select id="methodSelection" name="method" >
                    <option value="table" selected >Tabla</option>
                    <option value="sqlCommand" >SQL Command</option>
                  </select>
                  <br>
                  
                  <label for="tableSelection" style="display:none" id="tableNameLabel" >Escoge una tabla: </label>
                  <select id="tableNameSelect" name="tableSelection" style="display:none" >
                    
                  </select>

                  <label id="sqlCommandLabel" for="sqlCommandInput" style="display:none" >Comando SQL</label>
                  <textarea name="sqlCommand" id="sqlCommandInput"   placeholder="SELECT * FROM users;" rows="10" cols="45" style="display:none; min-height: 80px"></textarea>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" onclick="dbConnection(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                </div>`;
                formModal.querySelector('#methodSelection')
                .addEventListener('change', checkSelectValue);
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





