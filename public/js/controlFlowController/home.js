// general variables 
const LocalStorage = window.localStorage
let blockNode
/**
 * 
 * @param {htmlElement} lastNode 
 * @param {string} nodeToSearch 
 * @returns {htmlElement} 
 */
function getBlockNode(lastNode) {
  const mainDiv = lastNode?.parentNode?.parentNode
  return mainDiv
}

/**
 * 
 * @param {string} nodeName 
 * @param {htmlElement} parentNode
 * @returns {htmlElement}
 */
function findChildNodeInBlockNode(nodeName, parentNode) {
  let node = null;

  parentNode.childNodes.forEach(childNode => {
    if (childNode.nodeName == nodeName) {
      node = childNode;
    } else {
      // Capture the result of the recursive call
      const foundNode = findChildNodeInBlockNode(nodeName, childNode);
      if (foundNode) {
        node = foundNode;  // If a node is found, return it
      }
    }
  });

  return node;  // Return the node if found, otherwise null
}


// edit block name 
function editDataFlowBlockName(htmlElement) {
  const modal = document.getElementById("edit-modal")  
  modal.classList.contains('block') ? modal.classList.remove('block') : modal.classList.add('block')
  blockNode = getBlockNode(htmlElement)
}

function changeBlockNameOnSave() {
  const input = document.getElementById('edit-input')
  const newBlockName = input.value
  // if name is empty, dont change name
  if (newBlockName.trim() == '')
    editDataFlowBlockName()

  const node = findChildNodeInBlockNode('H6', blockNode)

  node.innerHTML = newBlockName
  editDataFlowBlockName()
}

/**
 * 
 * @param {htmlElement} node 
 */
function deleteDataFlowBlock(node) {
  // delete node from localstorage
  
  const controlFlowBlocks = JSON.parse(window.localStorage.getItem('controlBlocks'))
  const currentControlFlowBlock = window.localStorage.getItem('controlBlockId')
  const indexOfBlock = controlFlowBlocks.findIndex(block => block.id == currentControlFlowBlock)
  const blockNode = getBlockNode(node)
  console.log(blockNode.id)

  if (blockNode.id.includes('draggable')) {
    controlFlowBlocks.splice(indexOfBlock, 1)
    window.localStorage.setItem('controlBlocks', JSON.stringify(controlFlowBlocks))
  } else if (blockNode.id.includes('ETL')) {
    controlBlockEtls = controlFlowBlocks[indexOfBlock].etls
    indexOfEtlToDelete = controlBlockEtls.findIndex(block => block.etlID == blockNode.id)
    console.log(indexOfEtlToDelete, controlBlockEtls[indexOfEtlToDelete])
    controlBlockEtls.splice(indexOfEtlToDelete, 1)
    window.localStorage.setItem('controlBlocks', JSON.stringify(controlFlowBlocks))
  }
  blockNode.remove()
}

/**
 * 
 * @param {htmlElement} node 
 */
function goToDataFlowSection(node) {
  // save controlFlow block
  if (!LocalStorage.getItem('controlBlocks'))
    LocalStorage.setItem('controlBlocks', JSON.stringify([]))



  const inputNode = findChildNodeInBlockNode('INPUT', node)

  const controlFlowBlockInfo = {
    id: node.id,
    name: node.textContent.trim(),
    order: inputNode.value == '' ? -1 : parseInt(inputNode.value),
    etls: []
  }

  const controlBlocks = JSON.parse(LocalStorage.getItem('controlBlocks'))
  if (!controlBlocks.find(block => block.id == node.id)) {
    controlBlocks.push(controlFlowBlockInfo)
    LocalStorage.setItem('controlBlocks', JSON.stringify(controlBlocks))
  }
  


  // save id of current block selected
  const localStorageBlockKey = 'controlBlockId'
  LocalStorage.setItem(localStorageBlockKey, node.id)

  

  const dataFlowSectionURL = 'http://localhost:8080/dataflow'
  location.replace(dataFlowSectionURL)
}


// getting blocks with priority order 
function getBlocksInOrder() {
  const controlFlowBlockList = [] 
  const container = document.getElementById('data-flow-blocks-container')
  const childNodes = container.childNodes

  // save input values in array
  childNodes.forEach(controlFlowBlock => {
    const inputNode = findChildNodeInBlockNode('INPUT', controlFlowBlock)
    const blockNode = getBlockNode(inputNode)
    const data = { [inputNode.value]: blockNode.id }
    controlFlowBlockList.push(data)
  })
  LocalStorage.setItem('blocksOrder', JSON.stringify(controlFlowBlockList))
}

document.addEventListener('keyup', (event) => { 
  const editModal = document.querySelector('#edit-modal');
  (event.key === "Enter" && editModal.classList.contains('block')) ? changeBlockNameOnSave() : null; 
});


// renderizar componentes existentes

function renderControlFlowBlocks() {
  if (!window.location.pathname.includes('home'))
    return

  const controlFlowBlocks = JSON.parse(window.localStorage.getItem('controlBlocks'));
  const controlFlowBlocksContainer = document.getElementById('control-flow-blocks-container');

  controlFlowBlocksContainer.innerHTML = '';
  controlFlowBlocks.forEach(block => {
    // Crear el bloque HTML sin eventos inline
    const blockElement = document.createElement('div');
    blockElement.className = 'd-flex justify-content-between shadow align-items-center btn btn-secondary h-25 w-100 m-0 p-3 gap-2';
    blockElement.id = block.id;

    // Añadir contenido HTML al bloque
    blockElement.innerHTML = `
      <h6 class="m-0">${block.name}</h6>
      <div class="d-flex align-items-center gap-3">
        <i class="fa-regular fa-pen-to-square" onclick="editDataFlowBlockName(this)"></i>
        <i class="fa-solid fa-trash c-danger" onclick="deleteDataFlowBlock(this)"></i>
        <input type="number" min="0" value="${block.order}" class="form-control">
      </div>
    `;

    // Agregar el evento 'ondblclick' al bloque
    blockElement.addEventListener('dblclick', () => goToDataFlowSection(blockElement));

    // Añadir el bloque al contenedor
    controlFlowBlocksContainer.appendChild(blockElement);
  });
}


renderControlFlowBlocks()