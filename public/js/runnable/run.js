function getInfoArray() {
  const controlBlocks = window.localStorage.getItem('controlBlocks')
  if (!controlBlocks)
    return null

  return JSON.parse(controlBlocks)
}

async function run() {
  const data = getInfoArray()
  alertState(data)
  if (!data)
    return

  const info = {
    blocks: data,
    params: JSON.parse(window.localStorage.getItem('destinationParams'))
  }

  const response = await sendDataToServer(info)
  console.log('------------- response ------------------: ', response)
  if (response.status == 200)
    alert('Proyecto ejecutado exitosamente')
  else
    alert('El proyecto no se ejecutó exitosamente')
}


function alertState(data) {
  if (!data)
    alert('No hay datos actuales')
  else
    alert('Corriendo proyecto...')
}

/**
 * 
 * @param {Array} data 
 */
async function sendDataToServer(data) {
  const fetchData = await fetch('/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  const serverResponse = await fetchData.json()

  return serverResponse
}