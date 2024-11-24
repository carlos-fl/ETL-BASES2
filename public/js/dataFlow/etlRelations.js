/*
{
  controlFlowBlock: [...etl's]
}

// etl structure
{
  etlID: [source, conversion, destination]
}
*/

function getCurrentView() {
  return window.location.pathname;
}

/**
 * 
 * 1- save control flow blocks
 * 2- get current control flow block used
 * 3- bind control flow block with all etls made
 * 
 */

