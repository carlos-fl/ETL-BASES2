
const formModal = document.getElementById('form-modal');
const closeModalButton = document.getElementById('close-form-modal-btn');
const notificationModal = document.getElementById('staticBackdrop');

function extractData (){
    const data = {
        server: formModal.querySelector('#serverName').value,
        dataBase: formModal.querySelector('#dbName').value,
        user: formModal.querySelector('#userName').value,
        password: formModal.querySelector('#userPassword').value,
        sqlCommand: formModal.querySelector('#sqlCommandInput').value
    }
    return data;
}

function getModalInfo(target){
    // insertar el contenido en la modal de formularios
    // aplicar event listeners de ser necesario
    if (target.id.includes('draggable-conversion')) {
        target.innerHTML = '';// insertar contenido de modal de data conversion
        
    }else{
        target.innerHTML = '';// insertar contenido de modal de OLE DB destination 
    }

}

function toggleModal(target){
    if (formModal.classList.contains('show')){

        formModal.classList.remove('show')
        formModal.style.display = 'none';
    }else{

        // obtiene la informacion de la modal solo si es draggable-destination o draggable-conversion;
        // TODO: una vez bien definida la función getModalInfo descomentar este bloque if
        // if (target.id.includes('draggable-conversion') || target.id.includes('draggable-destination')){
        //     console.log(target.id);
        //     getModalInfo(target);
        // }
        formModal.classList.add('show');
        formModal.style.display = 'block';
    }
}

function toggleNotificationModal (){
    if (notificationModal.classList.contains('show')){

        notificationModal.classList.remove('show')
        notificationModal.style.display = 'none';
    }else{
        
        notificationModal.classList.add('show');
        notificationModal.style.display = 'block';
    }
} 

closeModalButton.addEventListener("click", toggleModal);
notificationModal.querySelector('.modal-footer button').addEventListener('click', toggleNotificationModal);
notificationModal.querySelector('.modal-header button').addEventListener('click', toggleNotificationModal);

function getNotificationModalInfo(result){
    notificationModal.querySelector('.modal-title').innerText = result.message;
    notificationModal.querySelector('.modal-body').innerHTML = ``;
}

async function dbConnection () {

    const formData = extractData();

    try {
        const response = await fetch('/connect', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        });
        const result = await response.json();
        toggleModal(this); //cierra la modal de formulario de conexion
        notificationModal.querySelector('.modal-title').innerText = result.message; // escribe el mensaje de respuesta en el titulo de la modal
        toggleNotificationModal(); // abre la modal de notificaciones y muestra mensaje
        console.log(result.testQueryResult);
    } catch (error) {
        console.log(error)
    }
    
}


