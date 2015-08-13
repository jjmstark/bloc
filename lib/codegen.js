
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

var writeHTML = function(contractJSON,appName) {
  var htmlString = '<!DOCTYPE html>\n<html>\n<body>\n\n';
  var abiJson = contractJSON.abis[0];
  var contractName = contractJSON.abis[0].name;
  var renderObj = abi.abiToFuncTypeObj(abiJson);    
  var keys = Object.keys(renderObj);

  htmlString += '<div id=authButtonsDiv>\n<button onclick="showRegister'+contractName+'()">Register</button>\n';    
  htmlString += '<button onclick="showLogin'+contractName+'()">Login</button>\n</div>\n\n';

  htmlString += '<script src="http://hacknet.blockapps.net/static/js/createUser.js"></script>\n';
  htmlString += '<script src="http://hacknet.blockapps.net/static/js/userLogin.js"></script>\n';
	htmlString += '<script src="../js/'+contractName+'.js"></script>\n\n';
  htmlString += '<script src="http://hacknet.blockapps.net/static/ethlightjs.min.js"></script>\n\n';
  htmlString += '<script src="https://code.jquery.com/jquery-1.10.2.js"></script>\n\n';
	
  htmlString += '<div id="createUser'+contractName+'Div">\n'+
                '<p id="user-intro"> Now, please register your wallet with us!</p>\n'+
                '<input type="text" name="email" id="emailCreateUser" required>\n'+
                '<label for="email">Email</label>\n'+
                '<input type="password" name="loginpass" id="loginpassCreateUser" required>\n'+
                '<label for="loginpass">Password</label>\n'+
                '<input type="hidden" name="enckey" id="enckeyCreateUser" required>\n'+
                '<input type="text" name="address" id="addressCreateUser" readonly required>\n'+
                '<label for="address">Address</label>\n'+
                '<input type="hidden" name="app" id="appCreateUser" value="'+appName+'" required>\n'+
                '<button id="user-button" onclick="submit'+contractName+'()">Register</button>\n'+
                '</div>\n\n';

  htmlString += '<div id="login'+contractName+'Div">\n'+
                '<p id="login-intro"> If you are a user who has registered, please login now.</p>\n'+
                '<input type="text" name="email" id="emailLogin" required>\n'+
                '<label for="email">Email</label>\n'+
                '<input type="password" name="loginpass" id="loginpassLogin" required>\n'+
                '<label for="loginpass">Password</label>\n'+
                '<input type="text" name="address" id="addressLogin" required>\n'+
                '<label for="address">Address</label>\n'+
                '<input type="hidden" name="app" id="appLogin" value="'+appName+'" required>\n'+ // fix theapp
                '<button id="user-button" onclick="retrieve'+contractName+'()">Login!</button>\n'+
                '</div>\n\n';

  htmlString += '<div id="keygen'+contractName+'Div">\n'+
                '<p id="key-intro"> First we will generate a key. Protect it with a high entropy password. The key will be sent to you in email, encrypted, after you verify your login.</p>\n'+
                '<input type="password" name="keypass" id="keypass">\n'+
                '<label for="keypass">Enter a high entropy password</label>\n'+
                '<button id="keygen-button" onclick="genKeyUser()">Generate Key</button>\n'+
                '</div>\n';

  htmlString +=  '<div id="wallet'+contractName+'Div">\n'+
                 '<input name="walletaddress" id="walletaddress" readonly>\n'+
                 '<label for="walletaddress">Your Address</label>\n'+
                 '</div>\n\n';

  htmlString += '<div id=functions'+contractName+'Div>\n';
  htmlString += keys.reduce(function(x,y) { tmpStr = funcTypesToDiv(y, renderObj[y]); return x+tmpStr;  }, '');
  htmlString +='</div>\n'  

  htmlString += '</body>\n</html>\n';

  htmlString +='<body onload="hideOnLoad'+contractName+'()">'


  console.log('writing: html/'+contractName+'.html');
  fs.writeFileSync('html/'+contractName+'.html', htmlString);
}

var writeJS = function(contractJSON,appName) {
  var contractName = contractJSON.abis[0].name;
  var jsString = 'function submit'+contractName+'() {\n';
      jsString += '  var userObj = {\n'+
                  '    app: appCreateUser.value,\n'+
                  '    email: emailCreateUser.value,\n'+
                  '    loginpass: loginpassCreateUser.value,\n'+
                  '    address: addressCreateUser.value,\n'+
                  '    enckey: enckeyCreateUser.value\n'+
                  ' };\n' +
                  '\n' +
                  '  submitUser(userObj, function (res) {\n'+
                  '    data = JSON.parse(res);\n'+
                  '    createUser'+contractName+'Div.style.display = "none";\n'+
                  '    var para = document.createElement("P");\n'+
                  '    var t = document.createTextNode("Confirm in your email. This is your new wallet file: \\n\\n" + res);\n'+
                  '    para.appendChild(t);\n'+
                  '    document.body.appendChild(para);\n'+
                  '  });\n'+
                  '};\n\n\n';    

      jsString += 'function showRegister'+contractName+'() {\n';
      jsString += '  keygen'+contractName+'Div.style.display = "table";\n'+
                  '  login'+contractName+'Div.style.display = "none";\n'+
                  '}\n\n\n';


      jsString += 'function showLogin'+contractName+'() {\n';
      jsString += '  createUser'+contractName+'Div.style.display = "none";\n'+
                  '  keygen'+contractName+'Div.style.display = "none";\n'+
                  '  login'+contractName+'Div.style.display = "table";\n'+
                  '  wallet'+contractName+'Div.style.display="none";\n'+
                  '}\n\n\n';   

      jsString += 'function hideOnLoad'+contractName+'() {\n';
      jsString += '  createUser'+contractName+'Div.style.display = "none";\n'+
                  '  wallet'+contractName+'Div.style.display = "none";\n'+
                  '  login'+contractName+'Div.style.display = "none";\n'+
                  '  functions'+contractName+'Div.style.display = "none";\n'+
                  '  keygen'+contractName+'Div.style.display = "none";\n'+
                  '}\n\n\n'; 

      jsString += 'function retrieve'+contractName+'() {\n'+
                  '  var userObj = {\n'+
                  '    app : appLogin.value,\n'+
                  '    email : emailLogin.value,\n'+
                  '    loginpass : loginpassLogin.value,\n'+
                  '    address : addressLogin.value\n'+
                  '  };\n\n\n'+
                  'retrieveUser(userObj,function (keystore) {'+
                  '  login'+contractName+'Div.style.display = "none";\n'+
                  '  var para = document.createElement("P");\n'+
                  '  var t = document.createTextNode("Retrieved your wallet. You can now sign transactions.");\n'+
                  '  para.appendChild(t);\n'+
                  '  document.body.appendChild(para);\n'+             
                  '  walletaddress.value=keystore.addresses[0];\n'+
                  '  wallet'+contractName+'Div.style.display="table";\n'+
                  '  login'+contractName+'Div.style.display = "none";\n'+
                  '  $("walletaddress").data("wallet", keystore);\n'+
                  '  functions'+contractName+'Div.style.display = "table";\n'+
                  '  });\n'+
                  '}\n'; 

      jsString += 'function genKeyUser() {\n'+ 
                  '  console.log("moving from keygen to create user");\n'+
                  '  createUser'+contractName+'Div.style.display = "table";\n'+
                  '  keygen'+contractName+'Div.style.display = "none";\n'+
                  '  genKey(keypass.value, function (keystore) {\n'+
                  '    addressCreateUser.value = keystore.addresses[0];\n'+
                  '    enckeyCreateUser.value = keystore.serialize();\n'+
                  '  });\n'+
                  '}\n';


  console.log('writing: js/'+contractName+'.js');
  fs.writeFileSync('js/'+contractName+'.js',jsString);
}

var writeCSS = function(contractJSON)  {
    
}

var writeAll = function(contractJSON,appName)  {
  writeJS(contractJSON,appName);
  writeHTML(contractJSON,appName);
//  writeCSS(contractJSON);  
}

module.exports = {
  writeHTML : writeHTML, 
  writeJS : writeJS,
  writeCSS : writeCSS,
  writeAll : writeAll
};
