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

/**
 * 
 * @param {HTMLButtonElement} button 
 */
function alternativeCloseModal(button) {
  toggleModal(button)
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

    // Obtener el objeto ETL actual
    let ETLObject = JSON.parse(window.localStorage.getItem("currentETL")); //obtiene el objeto del ETL actual
    ETLObject["source"] = result.testQueryResult.source; // le acopla la informacion de la tabla
    ETLObject["connectionParams"] = formData; // le acopla la informacion de la conexion

    // Obtener el objeto controlFlow
    let controlFlowInfo = JSON.parse(window.localStorage.getItem("controlBlocks"));
    let currentControlBlockId = window.localStorage.getItem("controlBlockId");

    // Buscar el bloque actual en controlFlowInfo, solo para gestinoar culquier eror 
    let blockFound = false;

    for (let object of controlFlowInfo) {
      if (object.id === currentControlBlockId) {
        // Verificar si ya existe un ETL con el mismo ID
        let existingETL = object.etls.find(etl => etl.id === ETLObject.id);
        
        if (existingETL) {
          // Si existe, actualiza sus campos
          existingETL.source = ETLObject.source;
          existingETL.connectionParams = ETLObject.connectionParams;
        } else {
          // Si no existe, añade el nuevo ETL
          object.etls.push(ETLObject);
        }
        
        blockFound = true;
        break;
      }
    }

    if (!blockFound) {
      alert("Error: No se encontró el bloque de control actual.");
      return;
    }

    // Guardar la información actualizada en localStorage
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
  console.log('clicked!!----------------------------------------------------')
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
                      <button type="button" class="btn btn-primary" onclick="alternativeCloseModal(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">OK</button>
                    </div>`;

      // TODO: iterate through every column from source oledb
      const tableBody = document.getElementById("tbody");
       //iterar los campos de las tablas seleccionados para que se muestrn en la modal 
        // Selección del cuerpo de la tabla
        
        function getCurrentControlBlock() {
          const controlFlowInfo = JSON.parse(window.localStorage.getItem("controlBlocks"));
          const currentControlBlockId = window.localStorage.getItem("controlBlockId");
          
          if (controlFlowInfo && currentControlBlockId) {      
            const currentControlBlock = controlFlowInfo.find(block => block.id === currentControlBlockId);         // Buscar el bloque con el ID correspondiente
            if (currentControlBlock) {
              //console.log("Bloque actual encontrado:", currentControlBlock);
              return currentControlBlock;                                                                          // Retorna el objeto del bloque actual
            } else {
              console.error("No se encontró el bloque de control con ID:", currentControlBlockId);
              return null;
            }
          } else {
            console.error("Datos de `controlBlocks` o `currentControlBlockId` no disponibles.");
            return null;
          }
        }
        
        
        const currentETLObject1 = JSON.parse(localStorage.getItem('currentETL'));                         // Recuperar el objeto del ETL actual en el que estamos, desde `localStorage`
        console.log('CURRENT ETL----------------------------------------------------------------------------------------------: ', currentETLObject1)
        const divETLPadreId1 = currentETLObject1 ? currentETLObject1.etlID : null;                        // Acceder solo a la propiedad `etlID`
        if (divETLPadreId1) {                                                                             // Verificar y usar el valor de `etlID`
          console.log("ID del div padre:", divETLPadreId1);
        } else {
          console.log("No se encontró el etlID en localStorage.");
        }

        const controlBlocks1 = JSON.parse(localStorage.getItem('controlBlocks'));
        const currentBlocks = getCurrentControlBlock();
        if (currentBlocks) {
           console.log("ID del bloque actual:", currentBlocks.id);

           const filteredETL = currentBlocks.etls.filter(etl => etl.etlID === divETLPadreId1);     // Filtra el ETL cuyo etlID coincide con divETLPAdreId, qeu es el id actual sobre el et en que se esta interactuaando
           if(filteredETL.length <= 0 ){                                                           // Verifica si filteredETL tiene al menos un elemento
              console.error(`No se encontró ningún ETL con el etlID: ${divETLPadreId1}`);
           } else {
              const sourceData  = filteredETL[0].source; 
              const tableBody = document.getElementById('tbody');
              console.log('este es el source de la tabla actual', sourceData);
              tableBody.innerHTML = "";

           
           Object.keys(sourceData).forEach((columnName, index) => {                    // Agregamos 'index' para numerar las filas
              const columnData = sourceData[columnName];
              const operationOptions = getOperationOptions(columnData.dataType);
            
              const divETLPadreId = localStorage.getItem('currentETL');                // Recupera el objeto desde localStorage
              if (!divETLPadreId) {
                console.error('No se encontró el ETL en localStorage.');
                return;                                                                // Sale de la función si no se encuentra
              }
              const etlObject = JSON.parse(divETLPadreId);                             // Convierte la cadena JSON en objeto
             // Verifica si la columna ya tiene una conversión
             const currentControlBlock = getCurrentControlBlock();                     // Bloque actual
             const etlActual = currentControlBlock.etls.find(etl => etl.etlID === etlObject.etlID);
             const conversionFields = etlActual.conversion?.conversion || {}
             if (!conversionFields.hasOwnProperty(columnName)) {                       // Si la columna no está en conversionFields, agregarla con operación 'null'
             updateETLConversion(columnName, 'null', 'null');                                  // Agrega conversión por defecto
             }

              if (operationOptions) {
                const row = document.createElement('tr');
                const rowId = `row-${index}-${divETLPadreId1}-${columnName}`;                       // Genera un ID único usando el índice, id del etl al que pertences y el nombre de la coulman actual
                row.id = rowId;                                                                     // Asigna el ID único a la fila
                
                row.innerHTML = `
                  <td>${columnName}</td>
                  <td>copy of ${columnName}</td>
                  <td>${columnData.dataType}</td>
                  <td>${columnData.length !== null ? columnData.length : ''}</td>
                  <td>
                  <select class="operation-select">
                      ${operationOptions}
                    </select>

                     <div id="modal">
                      <div id="modal-content">
                        <h3>Selecciona las columnas a concatenar</h3>
                        <div id="column-checkboxes">
                          <!-- Los checkboxes de las columnas se agregarán dinámicamente aquí -->
                        </div>
                        <button id="close-modal">Cerrar</button>
                      </div>
                    </div>
                  </td>
                  </td>
                `;
                
                
                tableBody.appendChild(row);                                          // Agregar la fila a la tabla
            
                
                row.addEventListener('click', function() {                           // Evento de clic en la fila para guardar el campo actual en localStorage
                  localStorage.setItem('currentCampo', columnName);                  // Guarda el nombre del campo seleccionado
                  console.log('Campo seleccionado:', columnName);
                });

                row.addEventListener('click', function(event) {
                  const clickedRow = event.currentTarget;                            // event.currentTarget hace referencia a la fila (`tr`) que disparó el evento
                  const rowId = clickedRow.id;                                       // Extrae el ID de la fila
                  const columnName = clickedRow.querySelector('td').textContent;     // Captura el nombre de la columna (en la primera columna)
                 // console.log('ID de la fila seleccionada:', rowId, columnName);     // Imprime el ID en la consola
                  
                  localStorage.setItem('currentIdCampo', rowId);                     // Guarda el nombre del campo seleccionado
                  //console.log('Campo seleccionado:', columnName);
                });

                const selectElement = row.querySelector('.operation-select');         // Agregar el evento 'change' al select dentro de la fila actual
                selectElement.addEventListener('change', function() {
                  const selectedOperation = this.value;                               // Captura el valor seleccionado en el select
                  console.log('Operación seleccionada:', selectedOperation);
                  if (this.value === 'concat') { 
                     
                    generateModalConcat( sourceData, columnName, selectedOperation);    // Mostrar el modal si se selecciona la opción "conca t" 
                   
                  } else {
                    let selectedCampo2 = localStorage.getItem('selectedCampo2') 
                   updateETLConversion(columnName,  selectedOperation, selectedCampo2);
                   
                 }                
                }); 
              }  
            });  
          }            
        } else {
          console.log('No hay datos para mostrar para este etl ');
        }  

       
    }if (typeOfBlockDraggedId == "draggable-destination") {
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
      
    

    //funcion para obtenr la acccion a realizar segun lo seleccinado para camda campo de una tabla propie de u etl 
    function generateSQLQuery(columnName,selectedCampo2  , selectedOperation) {
    let query = '';
    campoName = columnName;

    // Construcción de la consulta SQL según la acción
    switch (selectedOperation) {
        case 'null':
            query = `${columnName}`;              // Selecciona la columna tal cual
            break;
        case 'uppercase':
            query = `UPPER(${columnName})`;      // Convierte el valor de la columna a mayúsculas
            break;
        case 'lowercase':
            query = `LOWER(${columnName})`;       // Convierte el valor de la columna a minúsculas
            break;
        case 'getMonth':
            query = `MONTH(${columnName})`;      // Obtiene solo el mes de una columna de fecha
            break;
        case 'getYear':
            query = `YEAR(${columnName})`;       // Obtiene solo el año de una columna de fecha
            break;
        case 'getDay':
            query = `DAY(${columnName})`;        // Obtiene solo el día de una columna de fecha
            break;
        case 'getTime':
            query = `HOUR(${columnName})`;       // Obtiene solo la hora de una columna de fecha
            break;
        case 'concat':
            if (selectedCampo2) {
                query = `CONCAT(${columnName}, ' ', ${selectedCampo2})`;    // Concatena dos columnas
            } else {
                query = 'Error: secondColumnName is required for CONCAT action.';
            }
            break;
        default:
            query = 'Error: Acción no reconocida.';
            break;
    }
    return query;
    }



    // Función para actualizar el ETL con el atributo de conversión
    function updateETLConversion(columnName,   selectedOperation,  selectedCampo2) {
        const currentControlBlock = getCurrentControlBlock();                        // Recupera el bloque actual
      
        if (currentControlBlock && currentControlBlock.etls) {
          const divETLPadreId = localStorage.getItem('currentETL'); 
          const etlObject = JSON.parse(divETLPadreId);                               // Convierte la cadena JSON a objeto
          const etlID = etlObject.etlID;                                             // Accede al valor de la propiedad etlID

          //console.log(etlID);                                                        // Muestra el resultado del id del etl
          
                                                                                      
          currentControlBlock.etls = currentControlBlock.etls.map(etl => {            // Actualizar el ETL específico
            if (etl.etlID === etlID) {
              const tableName = etl.connectionParams?.table || 'undefined_table';     // Nombre de la tabla directo del ET            
              const query = generateSQLQuery(columnName, selectedCampo2, selectedOperation); // Generar la consulta SQL usando la operación seleccionada
      
              const updatedConversion = {                                              // Crear o actualizar la estructura 'conversion'
                nombre_tabla: tableName,
                conversion: {
                  ...etl.conversion?.conversion || {},                                 // Mantener conversiones anteriores
                  [columnName]: { accion: query }                                      // Agregar o actualizar la nueva conversión
                }

                
              };
              console.log('localy  ' , updatedConversion);
              return {                                                                 // Devolver el ETL actualizado con la nueva conversión
                ...etl,
                conversion: updatedConversion
              };
            }
            return etl;                                                                // Si no coincide, devolver sin cambios
          });
         // console.log('Antes de actualizar:', currentControlBlock);
          let controlBlocks = JSON.parse(localStorage.getItem('controlBlocks')) || [];
          controlBlocks = controlBlocks.map(block => 
            block.id === currentControlBlock.id ? currentControlBlock : block
          );

          localStorage.setItem('controlBlocks', JSON.stringify(controlBlocks));         // Guardar el controlBlock actualizado en localStorage
          //console.log('ETL actualizado con la conversión:', currentControlBlock);
        } else {
          console.error('No se encontró el bloque actual o no tiene ETLs.');
        }
    }
/*
    function processMissingConversions() {
        const currentControlBlock = getCurrentControlBlock();                        // Recupera el bloque actual
        if (!currentControlBlock || !currentControlBlock.etls) {
          console.error('No se encontró el bloque actual o no tiene ETLs.');
          return;
        }
      
        const divETLPadreId = localStorage.getItem('currentETL');
        const etlObject = JSON.parse(divETLPadreId);                                 // Convierte la cadena JSON a objeto
        const etlID = etlObject.etlID;                                               // Accede al valor de la propiedad etlID
        const etlActual = currentControlBlock.etls.find(etl => etl.etlID === etlID); // Encuentra el ETL actual basado en el ID
        if (!etlActual) {
          console.error('ETL no encontrado.');
          return;
        }
      
        //                                                                            // Obtenemos los campos de origen desde 'source'
        const sourceFields = etlActual.source || [];  
        const sourceFieldsArray = Array.isArray(sourceFields)
        ? sourceFields
        : (sourceFields && typeof sourceFields === 'object')
        ? Object.values(sourceFields)
        : [sourceFields];                                                            // Lista de campos del ETL de origen, el etl actual 
        if (!Array.isArray(sourceFieldsArray)) {
          console.error('sourceFields no es un array:', sourceFields);
          return;                                                                    // Sale del proceso si no es un array
        }
      
        const conversionFields = etlActual.conversion?.conversion || {};              // Campos ya en conversión                                                                                         
        const missingFields = sourceFieldsArray.filter(field => !conversionFields.hasOwnProperty(field));// Identifica campos que no están en la conversión
        missingFields.forEach(field => {                                              // Procesa los campos faltantes con selectedOperation = null
          console.log(`Procesando campo faltante: ${field}`);
          updateETLConversion(field, 'null');                                         // Llama a la función con el nombre del campo y la operación 'null'
        });
      
      

      
    }*/
  }

  



//modal para selecciona el otro campo con el que se va ha concatenar 
function generateModalConcat( sourceData, columnName, selectedOperation) {
  let existingModal = document.getElementById('myModal');
  if (existingModal) {
    existingModal.remove();
  }

  const modalContainer = document.createElement('div');
  modalContainer.id = 'myModal';
  modalContainer.className = 'modal2';
  modalContainer.innerHTML = `
    <div class="modal-concat">
      <span class="close">&times;</span>
      <h5>Selecciona campos a concatenar</h5>
      <select id="mainSelect" class= "second-campo-concat"></select>
      <div id="checkboxContainer"></div>
      <button id="confirmBtn">Confirmar</button>
    </div>
  `;

  document.body.appendChild(modalContainer);

  // Llenar el select con las claves de 'sourceData'
  const selectElement = modalContainer.querySelector('#mainSelect');
  selectElement.innerHTML = `<option value="">Selecciona un campo</option>`;
  Object.keys(sourceData).forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    selectElement.appendChild(option);
  });

 
 const selectElement2ToConcat = modalContainer.querySelector('.second-campo-concat');        // Aquí verifica de que el modal ya está en el DOM antes de agregar el evento
 if (selectElement2ToConcat) {                                                               // Verificamos si el select existe antes de agregar el event listener      
   selectElement2ToConcat.addEventListener('change', function() {
      let selectedCampo2 = this.value;                                                       // Captura el valor seleccionado en el select
      localStorage.setItem('selectedCampo2', selectedCampo2);                                // se Guarda en localStorage
     console.log('Segundo campo seleccionado:', selectedCampo2);
     updateETLConversion(columnName,   selectedOperation,  selectedCampo2);
   });
 } else {
   console.error('El select no está disponible para agregar el evento.');
 }
  

  // Evento de cierre del modal
  const closeBtn = modalContainer.querySelector('.close');
  closeBtn.onclick = () => { modalContainer.style.display = 'none'; }

  // Mostrar el modal
  modalContainer.style.display = 'block';


  
    // Manejar el clic en el botón "Confirmar"
    const confirmBtn = modalContainer.querySelector('#confirmBtn');
    confirmBtn.onclick = function() {
    // Obtener los campos seleccionados
    const selectedFields = [];
    const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
      selectedFields.push(checkbox.value);
    });
  
   
      // Cerrar el modal
      modalContainer.style.display = 'none';
      console.log('Datos de concatenación guardados:');
    
  };
}

}

// Función  para obtener opciones según el tipo de dato
function getOperationOptions(dataType) {
  if (dataType.includes('char') || dataType.includes('varchar')) {      // Operaciones para cadenas
    
    return `
      <option value="null"> -------- </option>
      <option value="uppercase">Uppercase</option>
      <option value="lowercase">Lowercase</option>
      <option value="concat">Concatenate</option>
    `;
  } else if (dataType.includes('date') || dataType.includes('time')) {    // Operaciones para fechas
    
    return `
      <option value="null"> -------- </option>
      <option value="getDay">Get Day</option>
      <option value="getMonth">Get Month</option>
      <option value="getYear">Get Year</option>
      <option value="getTime">Get Time</option>
      <option value="concat">Concatenate</option>
    `;
  } else if (dataType.includes('int') || dataType.includes('float')|| dataType.includes('decimal')) {
    
    return `
      <option value="null"> -------- </option>
      <option value="concat">Concatenate</option>
      
    `;
  }
  return '';  // Devolver vacío si no hay operaciones válidas
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function toggleModal(target, typeOfBlockDraggedId) {

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

  setModalHtmlContent(typeOfBlockDraggedId);
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

//Sammy
// Modal de configuración del destino
function openDestinationModal(destinationBlock) {
  const modalContentDiv = formModal.querySelector(".modal-content");

  // Configuración de conexión al destino
  modalContentDiv.innerHTML = `
    <div class="modal-header">
      <h5 class="modal-title">Configurar Destino</h5>
      <button type="button" class="btn-close" onclick="toggleModal()" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <h6>Configuración de Conexión</h6>
      <div class="mb-3">
        <label for="destServerName" class="form-label">Nombre del Servidor</label>
        <input type="text" class="form-control" id="destServerName" placeholder="Servidor de destino">
      </div>
      <div class="mb-3">
        <label for="destDbName" class="form-label">Nombre de la Base de Datos</label>
        <input type="text" class="form-control" id="destDbName" placeholder="Base de datos de destino">
      </div>
      <div class="mb-3">
        <label for="destUserName" class="form-label">Usuario</label>
        <input type="text" class="form-control" id="destUserName" placeholder="Usuario de conexión">
      </div>
      <div class="mb-3">
        <label for="destPassword" class="form-label">Contraseña</label>
        <input type="password" class="form-control" id="destPassword" placeholder="Contraseña de conexión">
      </div>
      <div class="mb-3">
        <button type="button" class="btn btn-primary" onclick="connectToDestination()">Conectar</button>
      </div>
      <div class="mb-3">
        <label for="destTableName" class="form-label">Tabla de Destino</label>
        <select class="form-select" id="destTableName">
          <option value="">Selecciona una tabla</option>
        </select>
      </div>
      <h6>Mapeo de Columnas</h6>
      <table class="table">
        <thead>
          <tr>
            <th>Columna Origen</th>
            <th>Columna Destino</th>
          </tr>
        </thead>
        <tbody id="destinationColumnMapping">
          <!-- Las filas dinámicas se llenarán aquí -->
        </tbody>
      </table>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" onclick="toggleModal()">Cancelar</button>
      <button type="button" class="btn btn-primary" onclick="saveDestinationConfig()">Guardar</button>
    </div>
  `;

  // Mostrar la modal
  formModal.classList.add("show");
  formModal.style.display = "block";
}

// Función para conectar al destino y traer tablas
async function connectToDestination() {
  const serverName = document.getElementById("destServerName").value;
  const dbName = document.getElementById("destDbName").value;
  const userName = document.getElementById("destUserName").value;
  const password = document.getElementById("destPassword").value;

  if (!serverName || !dbName || !userName || !password) {
    alert("Por favor, completa todos los campos de conexión.");
    return;
  }

  try {
    const response = await fetch("/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ server: serverName, dataBase: dbName, user: userName, password }),
    });

    const result = await response.json();
    const tableSelect = document.getElementById("destTableName");

    if (result.testQueryResult && result.testQueryResult.tables) {
      tableSelect.innerHTML = `<option value="">Selecciona una tabla</option>`;
      result.testQueryResult.tables.forEach((table) => {
        const option = document.createElement("option");
        option.value = table.name;
        option.textContent = table.name;
        tableSelect.appendChild(option);
      });
    } else {
      alert("No se encontraron tablas disponibles.");
    }
  } catch (error) {
    console.error("Error al conectar al destino:", error);
    alert("Error al conectar al destino.");
  }
}

// Guardar configuración del destino
function saveDestinationConfig() {
  const destTableName = document.getElementById("destTableName").value;
  const serverName = document.getElementById("destServerName").value;
  const dbName = document.getElementById("destDbName").value;
  const userName = document.getElementById("destUserName").value;
  const password = document.getElementById("destPassword").value;

  if (!destTableName) {
    alert("Por favor, selecciona una tabla de destino.");
    return;
  }

  const columnMappings = Array.from(
    document.querySelectorAll("#destinationColumnMapping tr")
  ).map((row) => {
    const sourceColumn = row.querySelector(".source-column").textContent;
    const destinationColumn = row.querySelector(".destination-column").value;

    return { sourceColumn, destinationColumn };
  });

  const currentControlBlockId = localStorage.getItem("controlBlockId");
  const controlBlocks = JSON.parse(localStorage.getItem("controlBlocks"));
  const currentControlBlock = controlBlocks.find(
    (block) => block.id === currentControlBlockId
  );

  const currentETL = JSON.parse(localStorage.getItem("currentETL"));
  const queries = columnMappings.map((mapping) => {
    return `LOWER(${mapping.sourceColumn}) AS ${mapping.destinationColumn}`;
  });

  const query = `SELECT ${queries.join(", ")} FROM ${localStorage.getItem("sourceTable")}`;

  const destinationConfig = {
    etlID: currentETL.etlID,
    tabla: localStorage.getItem("sourceTable"),
    query,
    destinoTable: destTableName,
    connection: { serverName, dbName, userName, password },
  };

  currentETL.destination = destinationConfig;

  currentControlBlock.etls = currentControlBlock.etls.map((etl) =>
    etl.etlID === currentETL.etlID ? currentETL : etl
  );

  localStorage.setItem("controlBlocks", JSON.stringify(controlBlocks));

  toggleModal();
  alert("Configuración de destino guardada correctamente.");
}
