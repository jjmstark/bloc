
var abi = require('./abi.js');
var fs = require('fs');

// makes an HTML file with submit buttons for each function name,
// and text inputs labeled with the types of the arguments to the functions.
// It allows you to call functions and loads the result (return value) and change to storage in json
// also scaffolds a login demo and a register new user demo
// login or register!

// note: returns a string - we're doing code generation.
// wish I were using Haskell / Purescript - could be much more 'combinator focused', 'nested'
// composable widgets FTW!

var funcTypesToDiv = function(funcName,typeList) {
  var divString = '<div id='+funcName+'Div>';
  divString += '<button onclick="call'+funcName+'()">'+funcName+'</button>';
  divString = typeList.reduce(function (x,y,z) {
      x += '<input type="text" name='+y+z+' id='+funcName+z+'>\n'; 
      return x; 
     }, 
     divString
  );

  divString += '</div>\n';  
  return divString;
}

var writeHTML = function(contractJSON) {
  var htmlString = '<!DOCTYPE html>\n<html>\n<body>\n\n';
  var abiJson = contractJSON.abis[0];
  var contractName = contractJSON.abis[0].name;
  var renderObj = abi.abiToFuncTypeObj(abiJson);    
  var keys = Object.keys(renderObj);

  htmlString += '<div id=authButtonsDiv>\n<button onclick="doRegister()">Register</button>\n';    
  htmlString += '<button onclick="doLogin">Login</button>\n</div>';
  htmlString += keys.reduce(function(x,y) { tmpStr = funcTypesToDiv(y, renderObj[y]); return x+tmpStr;  }, '');
  htmlString += '</body>\n</html>';

  console.log('writing: html/'+contractName+'.html');
  fs.writeFileSync('html/'+contractName+'.html', htmlString);
}

var writeJS = function(contractJSON) {

}

var writeCSS = function(contractJSON)  {

}

module.exports = {
  writeHTML : writeHTML, 
  writeJS : writeJS,
  writeCSS : writeCSS
};
