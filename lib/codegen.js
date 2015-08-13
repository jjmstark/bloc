
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
  var divString = '<div id='+funcName+'Div>\n';
  divString += '<button onclick="call'+funcName+'()">'+funcName+'</button>\n';
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

  htmlString += '<div id=authButtonsDiv>\n<button onclick="showRegister'+contractName+'()">Register</button>\n';    
  htmlString += '<button onclick="showLogin'+contractName+'()">Login</button>\n</div>\n\n';

  htmlString += '<script src="http://hacknet.blockapps.net/static/js/createUser.js"></script>\n';
  htmlString += '<script src="http://hacknet.blockapps.net/static/js/userLogin.js"></script>\n';
	htmlString += '<script src="http://hacknet.blockapps.net/static/ethlightjs.min.js"></script>\n\n';
	
  htmlString += '<div id="createUser'+contractName+'Div">\n'+
                '<input type="text" name="email" id="email" required>\n'+
                '<label for="email">Email</label>\n'+
                '<input type="password" name="loginpass" id="loginpass" required>\n'+
                '<label for="loginpass">Password</label>\n'+
                '<input type="hidden" name="enckey" id="enckey" required>\n'+
                '<input type="text" name="address" id="address" readonly required>\n'+
                '<label for="address">Address</label>\n'+
                '<input type="hidden" name="app" id="app" value="theapp" required>\n'+
                '<button id="user-button" onclick="submit'+contractName+'()">Sign Up!</button>\n'+
                '</div>\n\n';

  htmlString += '<div id="login'+contractName+'Div">\n'+
                '<p id="login-intro"> If you are a user who has registered, please login now.</p>\n'+
                '<input type="text" name="email" id="email" required>\n'+
                '<label for="email">Email</label>\n'+
                '<input type="password" name="loginpass" id="loginpass" required>\n'+
                '<label for="loginpass">Password</label>\n'+
                '<input type="text" name="address" id="address" required>\n'+
                '<label for="address">Address</label>\n'+
                '<input type="hidden" name="app" id="app" value="theapp" required>\n'+
                '<button id="user-button" onclick="retrieve()">Sign Up!</button>\n'+
                '</div>\n\n';

  htmlString +=  '<div id="wallet'+contractName+'Div">\n'+
                 '<input name="walletaddress" id="walletaddress" readonly>\n'+
                 '<label for="walletaddress">Your Address</label>\n'+
                 '</div>\n\n';

  htmlString += '<div id=functionsDiv>\n';
  htmlString += keys.reduce(function(x,y) { tmpStr = funcTypesToDiv(y, renderObj[y]); return x+tmpStr;  }, '');
  htmlString +='</div>\n'  
  htmlString += '</body>\n</html>\n';

  console.log('writing: html/'+contractName+'.html');
  fs.writeFileSync('html/'+contractName+'.html', htmlString);
}

var writeJS = function(contractJSON) {
  var contractName = contractJSON.abis[0].name;
  var jsString = 'function submit'+contractName+'() {\n';
      jsString += '  var userObj = {\n'+
                  '    app: app.value,\n'+
                  '    email: email.value,\n'+
                  '    loginpass: loginpass.value,\n'+
                  '    address: address.value,\n'+
                  '    enckey: enckey.value\n'+
                  ' };\n' +
                  '\n' +
                  '  submitUser(userObj, function (res) {\n'+
                  '    data = JSON.parse(res);\n'+
                  '    createUser'+contractName+'.style.display = "none";\n'+
                  '    var para = document.createElement("P");\n'+
                  '    var t = document.createTextNode("Confirm in your email. This is your new wallet file: \\n\\n" + res);\n'+
                  '    para.appendChild(t);\n'+
                  '    document.body.appendChild(para);\n'+
                  '  });\n'+
                  '};\n\n\n';    

      jsString += 'function showRegister'+contractName+'() {\n';
      jsString += '  createUser'+contractName+'Div.style.display = "table";\n'+
                  '  login'+contractName+'Div.style.display = "none";\n'+
                  '}\n\n\n';


      jsString += 'function showLogin'+contractName+'() {\n';
      jsString += '  createUser'+contractName+'Div.style.display = "none";\n'+
                  '  login'+contractName+'Div.style.display = "table";\n'+
                  '}\n\n\n';            

  console.log('writing: js/'+contractName+'.js');
  fs.writeFileSync('js/'+contractName+'.js',jsString);
}

var writeCSS = function(contractJSON)  {
    
}

var writeAll = function(contractJSON)  {
  writeHTML(contractJSON);
  writeJS(contractJSON);
//  writeCSS(contractJSON);  
}

module.exports = {
  writeHTML : writeHTML, 
  writeJS : writeJS,
  writeCSS : writeCSS,
  writeAll : writeAll
};
