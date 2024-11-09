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
 * @returns {htmlElement}
 */
function findChildNodeInBlockNode(nodeName) {
  let node = null
  blockNode.childNodes.forEach(childNode => {
    if (childNode.nodeName == nodeName)
      node = childNode
  })
  return node
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

  const node = findChildNodeInBlockNode('H6')

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