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
    table: formModal.querySelector("#tableNameSelect").value,
    method: formModal.querySelector("#methodSelection").value,
  };
  return data;
}

async function dbConnection() {
  var formData = extractData();

  try {
    const response = await fetch("/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    let ETLObject = JSON.parse(window.localStorage.getItem("currentETL")); //obtiene el objeto del ETL actual
    ETLObject["source"] = result.testQueryResult.source; // le acopla la informacion de la tabla
    ETLObject["connectionParams"] = formData; // le acopla la informacion de la conexion
    let controlFlowInfo = JSON.parse(
      window.localStorage.getItem("controlBlocks")
    ); // obtiene el objeto de controlFLow
    // iterar a traves de conFlowInfo y verificar si la propiedad id === a localStorage.getItem('controlBlockId')
    let currentControlBlockId = window.localStorage.getItem("controlBlockId");
    for (let object of controlFlowInfo) {
      if (object.id === currentControlBlockId) {
        object.etls.push(ETLObject);
      }
    }
    // controlFlowInfo.etls.push(ETLObject); // le acopla el objeto del ETL con la informacion nueva
    window.localStorage.setItem(
      "controlBlocks",
      JSON.stringify(controlFlowInfo)
    ); // vuelve a guardar el objeto de controlFlow con la nueva informacion

    toggleModal(this); //cierra la modal de formulario de conexion
    notificationModal.querySelector(".modal-body").innerText = result.message; // escribe el mensaje de respuesta en el cuerpo de la modal
    console.log(result.testQueryResult.source);
    window.localStorage.setItem(
      "source",
      JSON.stringify(result.testQueryResult.source)
    );
    toggleNotificationModal(); // abre la modal de notificaciones y muestra mensaje
  } catch (error) {
    console.log(error);
  }
}

async function extractTableNames() {
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
  if (this.value === "sqlCommand") {
    formModal.querySelector("#tableNameLabel").style.display = "none";
    formModal.querySelector("#tableNameSelect").style.display = "none";
    formModal.querySelector("#sqlCommandLabel").style.display = "block";
    formModal.querySelector("#sqlCommandInput").style.display = "block";
    console.log("sqlCommand value!");
  }

  if (this.value === "table") {
    const queryResult = await extractTableNames();

    console.log(queryResult);
    for (let table of queryResult.recordset) {
      let tableOption = document.createElement("option");
      tableOption.value = table.table_name;
      tableOption.innerText = table.table_name;
      formModal.querySelector("#tableNameSelect").appendChild(tableOption);
    }
    formModal.querySelector("#sqlCommandLabel").style.display = "none";
    formModal.querySelector("#sqlCommandInput").style.display = "none";
    formModal.querySelector("#tableNameLabel").style.display = "block";
    formModal.querySelector("#tableNameSelect").style.display = "block";
    console.log("table value!");
  }
}

/**
 *
 * @param {string} typeOfBlockDraggedId
 * set html content for modals
 */
function setModalHtmlContent(typeOfBlockDraggedId) {
  const modalContentDiv = formModal.childNodes[1].childNodes[1];
  if (typeOfBlockDraggedId == "source") {
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
                    <option value="">Elige una opcion</option>
                    <option value="table" >Tabla</option>
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
    formModal
      .querySelector("#methodSelection")
      .addEventListener("change", checkSelectValue);
  }
  if (typeOfBlockDraggedId == "conversion") {
    const dataFromSourceOLEDB = LocalStorage.getItem("source");

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
      const tableBody = document.getElementById("tbody");
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
    let ETLObject = {
      etlID: target.parentNode.id,
    };
    console.log(ETLObject);
    window.localStorage.setItem("currentETL", JSON.stringify(ETLObject)); //almacena un objeto de ETL solo con el id del Padre
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

// RENDER EXISTING ETLS

function renderEtls() {
  if (!window.location.pathname.includes("dataflow")) return;

  const currentControlFlowBlockId = window.localStorage.getItem("controlBlockId");
  if (!currentControlFlowBlockId) return;

  // get controlBlock elements(array)
  const controlBlocks = JSON.parse(window.localStorage.getItem("controlBlocks"));
  const currentControlBlock = controlBlocks.find(block => block.id == currentControlFlowBlockId);

  // get etls from current control flow
  const etls = currentControlBlock.etls;
  const etlsContainer = document.getElementById("data-flow-blocks-container");
  etlsContainer.innerHTML = "";

  // list to save each source/conversion/destination block
  const etlBlocks = [];
  etls.forEach((etl) => {
    etlsContainer.innerHTML += `<div class="d-flex flex-column justify-content-between align-items-center btn btn-primary h-40 w-40 m-0 p-4" draggable="true" ondragstart="dragStartHandler(event)" id=${etl.etlID}>
          <h6 class="m-0" id="ETL-title">ETL</h6>
          <div class="d-flex align-items-center d-block gap-3">
            <i class="fa-regular fa-pen-to-square" onclick="editDataFlowBlockName(this)"></i>
            <i class="fa-solid fa-trash c-danger" onclick="deleteDataFlowBlock(this)"></i>
          </div>
        </div>`;

    // append children
    const containerKeys = Object.keys(etl);
    const etlActions = [];
    for (const key of containerKeys) {
      if (key == "source" || key == "conversion" || key == "destination") etlActions.push(key);
    }

    const etlContainer = document.getElementById(etl.etlID);
    etlActions.forEach((action) => {
      // Create the HTML block without inline events
      const blockElement = document.createElement("div");
      blockElement.className = "d-flex justify-content-between shadow align-items-center btn btn-secondary h-25 w-100 m-0 p-3 gap-2";
      blockElement.id = `${action}-clone-${new Date().getTime()}`;

      // Add HTML content to the block
      blockElement.innerHTML = `
        <h6 class="m-0">${action}</h6>
        <div class="d-flex align-items-center gap-3">
          <i class="fa-regular fa-pen-to-square" onclick="editDataFlowBlockName(this)"></i>
          <i class="fa-solid fa-trash c-danger" onclick="deleteDataFlowBlock(this)"></i>
        </div>
      `;

      // Add the block to the container
      etlContainer.appendChild(blockElement);

      const obj = { block: blockElement, action };
      etlBlocks.push(obj);
    });
  });
  // brings etl children blocks to add the event listener
  etlBlocks.forEach((obj) => {
    const a = document.getElementById(obj.block.id);
    if (a) { 
      a.addEventListener('dblclick', () => {
        toggleModal(obj.block, obj.action);
      });
    }
  });
}


renderEtls();

//sammy
function openDestinationModal(destinationBlock) {
  const formModal = document.getElementById("form-modal");
  const modalContentDiv = formModal.querySelector(".modal-content");

  //columnas del origen desde localStorage
  const sourceData = JSON.parse(localStorage.getItem("source"));
  if (!sourceData) {
    alert("No se encontraron datos de origen. Conéctate primero a una tabla.");
    return;
  }

  // tabla dinámica con las columnas y acciones
  let tableRows = "";
for (const [columnName, columnInfo] of Object.entries(sourceData)) {
  tableRows += `
    <tr>
      <td>${columnName}</td>
      <td>${columnInfo.dataType || "N/A"}</td>
      <td>${columnInfo.length ?? "-"}</td> <!-- Usa "??" para manejar valores nulos o indefinidos -->
      <td>
        <select class="form-select" data-column="${columnName}">
          <option value="">Selecciona una acción</option>
          <option value="lower">Minúsculas</option>
          <option value="upper">Mayúsculas</option>
          <option value="concat">Concatenar</option>
        </select>
      </td>
    </tr>
  `;
}


  // insertar tabla en el contenido del modal
  modalContentDiv.innerHTML = `
    <div class="modal-header">
      <h5 class="modal-title">Configurar Destination</h5>
      <button type="button" class="btn-close" onclick="toggleModal()" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <table class="table">
        <thead>
          <tr>
            <th>Columna</th>
            <th>Tipo</th>
            <th>Longitud</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div class="mb-3">
        <label for="destinationTableName" class="form-label">Nombre de la Tabla Destino</label>
        <input type="text" class="form-control" id="destinationTableName" placeholder="Tabla de destino">
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" onclick="toggleModal()">Cancelar</button>
      <button type="button" class="btn btn-primary" onclick="saveDestinationConfig()">Guardar</button>
    </div>
  `;

  function saveDestinationConfig() {
    const formModal = document.getElementById("form-modal");
    const selects = formModal.querySelectorAll("select");
    const destinationTableName = document.getElementById("destinationTableName").value;
  
    // validar nombre de la tabla destino
    if (!destinationTableName) {
      alert("Por favor, ingresa el nombre de la tabla destino.");
      return;
    }
  
    //el objeto destination
    const destinationConfig = {
      etlID: localStorage.getItem("currentETL"),
      destinoTable: destinationTableName,
      columnas: {},
    };
  
    // recorrer las acciones seleccionadas para cada columna
    selects.forEach((select) => {
      const columnName = select.dataset.column;
      const action = select.value;
      if (action) {
        destinationConfig.columnas[columnName] = { action };
      }
    });
  
    // actualizar los datos en localStorage
    const controlBlocks = JSON.parse(localStorage.getItem("controlBlocks"));
    const currentControlBlockId = localStorage.getItem("controlBlockId");
  
    const currentControlBlock = controlBlocks.find(
      (block) => block.id === currentControlBlockId
    );
  
    currentControlBlock.destination = destinationConfig;
  
    localStorage.setItem("controlBlocks", JSON.stringify(controlBlocks));
  
    // Cerrar el modal
    toggleModal();
    console.log("Configuración de destination guardada:", destinationConfig);
  }
  
  

  // Mostrar el modal
  formModal.classList.add("show");
  formModal.classList.remove("hidden");
  
}

  // cerrar el modal
  formModal.classList.remove("show");
  formModal.classList.add("hidden");
  
