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
  const blockNode = getBlockNode(node)
  blockNode.remove()
}

/**
 * 
 * @param {htmlElement} node 
 */
function goToDataFlowSection(node) {
  const localStorageBlockKey = 'controlBlockId'
  // save id of block selected
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
