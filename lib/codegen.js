
var abi = require('./abi.js');
var fs = require('fs');

// makes an HTML file with submit buttons for each function name,
// and tables of text inputs labeled with the types of the arguments to the functions.
// It allows you to call functions and loads the result (return value) and change to storage in json
// also scaffolds a login demo and a register new user demo

// note: returns a string - we're doing code generation.
// wish I were using Haskell / Purescript - could be much more 'combinator focused', 'nested'
// composable widgets FTW!

var funcTypesToTable = function(funcName,typeList) {
  var tableString = '<table id='+funcName+'Table>';
  tableString += '<tr>';
  tableString += '<td><button type="submit">'+funcName+'</button></td>';

  tableString = typeList.reduce(function (x,y) {
      x += '<td><input type="text"></td>'; 
      return x; 
     }, 
     tableString
  );

  tableString += '</tr>';  
  tableString += '</table><br>\n\n';
  return tableString;
}

var writeHTML = function(contractJSON) {
  var htmlString = '<!DOCTYPE html>\n<html>\n<body>\n\n';
  var abiJson = contractJSON.abis[0];
  var contractName = contractJSON.abis[0].name;
  var renderObj = abi.abiToFuncTypeObj(abiJson);    
  var keys = Object.keys(renderObj);

  htmlString += keys.reduce(function(x,y) { tmpStr = funcTypesToTable(y, renderObj[y]); return x+tmpStr;  }, '');
  htmlString += '</body>\n</html>';

  console.log('writing: html/'+contractName+'.html');
  fs.writeFileSync('html/'+contractName+'.html', htmlString);
}

module.exports = {
  writeHTML : writeHTML
};
