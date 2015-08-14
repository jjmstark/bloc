var yamlConfig = require('../lib/yaml-config.js');
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

var funcToDiv = function(funcName,args) {
    var divString = '<div id='+funcName+'Div>\n';
    divString += '<button onclick="call'+funcName+'()">'+funcName+'</button>\n';
    divString = args.reduce(function (x,y) {
        x += '<input type="text" name=' + y + ' id=' + funcName + y + '>\n'; 
        return x; 
    }, divString);

    divString += '</div>\n';  
    return divString;
}

var funcToCall = function(contractName, funcName,args) {
    var confURL = yamlConfig.readYaml('config.yaml').apiURL;

    var jsString = 'function call' + funcName + '() {\n';
    jsString +=
        '  var args = ' + JSON.stringify(args) + ';\n' +
        '  var fArgs = {};\n' +
        '  fromAccount = Contract({"privkey": globalKeystore.exportPrivateKey(walletaddress.value,walletDecrypt.value) });\n' +
        '  console.log("fromAccount: " + JSON.stringify(fromAccount));\n'+
        '  args.forEach(function(arg) {\n' +
        '    fArgs[arg] = document.getElementById("' + funcName + '" + arg).value;\n' +
        '  });\n';
    jsString +=
        '  toAccount.call("' +
        confURL + '", function(){}, {\n' +
        '    "funcName" : "' + funcName +'",\n' +
        '    "fromAccount" : fromAccount,\n'+
        '    "value" : 0,\n' +
        '    "gasPrice" : 1,\n' +
        '    "gasLimit" : 3141592\n' +
        '  }, fArgs);\n' +
        '}\n';
    
    return jsString;    
}

var writeHTML = function(xABI,appName) {
    var htmlString = '<!DOCTYPE html>\n<html>\n<body>\n\n';
    var contractName = Object.keys(xABI)[0];
    var symtab = xABI[contractName];
    var funcs = Object.keys(symtab).filter(function(name) {
        return symtab[name]["jsType"] === "Function";
    });

    htmlString += '<div id=authButtonsDiv>\n<button onclick="showRegister'+contractName+'()">Register</button>\n';    
    htmlString += '<button onclick="showLogin'+contractName+'()">Login</button>\n</div>\n\n';

    htmlString += '<script src="http://hacknet.blockapps.net/static/js/createUser.js"></script>\n';
    htmlString += '<script src="http://hacknet.blockapps.net/static/js/userLogin.js"></script>\n';
    htmlString += '<script src="http://hacknet.blockapps.net/static/ethlightjs.min.js"></script>\n\n';
    htmlString += '<script src="https://code.jquery.com/jquery-1.10.2.js"></script>\n\n';
  //  htmlString += '<script src="file:///home/ryanr/blockapps/blockapps-js/api.js"></script>\n\n';
    htmlString += '<script src="http://hacknet.blockapps.net/static/js/api.js"></script>\n\n';
    htmlString += '<script src="../js/'+contractName+'.js"></script>\n\n';
    
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
    htmlString += funcs.reduce(function(x,y) {
        return x + funcToDiv(y, symtab[y]["functionArgs"]);
    }, '');
    htmlString +='</div>\n'  

    htmlString += '</body>\n</html>\n';

    htmlString +='<body onload="hideOnLoad'+contractName+'()">'


    console.log('writing: html/'+contractName+'.html');
    fs.writeFileSync('html/'+contractName+'.html', htmlString);
}

var writeJS = function(xABI,appName) {
    var contractName = Object.keys(xABI)[0];
    var confURL = yamlConfig.readYaml('config.yaml').apiURL;

    var jsString = 'var Contract = require("Contract");\n\n';
    jsString += 'var globalKeystore;\n\n';
    jsString += 'var apiURL = "'+confURL+'";\n';
    jsString += 'function submit'+contractName+'() {\n' +
        '  var userObj = {\n'+
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
        '    para.setAttribute("id","walletCreateMessage");\n'+
        '    var t = document.createTextNode("Confirm in your email. This is your new wallet file: \\n\\n" + res);\n'+
        '    para.appendChild(t);\n'+
        '    document.body.appendChild(para);\n'+
        '    console.log("wallet: " + data.encryptedWallet);\n'+
	    '    console.log("addresses: " + JSON.parse(data.encryptedWallet).addresses);\n'+
        '    var faucetAddr = JSON.parse(data.encryptedWallet).addresses;\n'+
        '    var oReq = new XMLHttpRequest();\n'+
        '    oReq.open("POST", apiURL + "/eth/v1.0/faucet", true);\n'+
        '    var params = "address=" + encodeURIComponent(faucetAddr);\n'+
        '    oReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");\n'+
        '    oReq.onload = function () {\n' +
        '      if (oReq.readyState == 4 && oReq.status == 200) {\n'+
        '        console.log("faucet should have worked");\n'+
        '      } else { \n'+
        '        console.log("error");\n'+
        '      }\n'+
        '    }\n'+
        '    console.log("sending faucet request");\n'+
        '    oReq.send(params);\n'+
        '    console.log("faucet request sent");\n'+
        '  });\n'+
        '}\n\n\n';    

    jsString += 'function showRegister'+contractName+'() {\n';
    jsString += '  keygen'+contractName+'Div.style.display = "table";\n'+
        '  login'+contractName+'Div.style.display = "none";\n'+
        '}\n\n\n';


    jsString += 'function showLogin'+contractName+'() {\n';
    jsString += '  createUser'+contractName+'Div.style.display = "none";\n'+
        '  if (typeof walletCreateMessage !== "undefined") walletCreateMessage.style.display = "none";\n'+
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

    var abiFile = "contractmeta/" + contractName + ".json";
    var contractData = JSON.parse(fs.readFileSync(abiFile, {encoding:"utf8"}));
    
    jsString += 'function retrieve'+contractName+'() {\n'+
        '  var userObj = {\n'+
        '    app : appLogin.value,\n'+
        '    email : emailLogin.value,\n'+
        '    loginpass : loginpassLogin.value,\n'+
        '    address : addressLogin.value\n'+
        '  };\n\n'+
        '  retrieveUser(userObj,function (keystore) {\n'+
        '    login'+contractName+'Div.style.display = "none";\n'+
        '    var para = document.createElement("P");\n'+
        '    var t = document.createTextNode("Retrieved your wallet. Enter your password, and you can sign transactions: ");\n'+
        '    para.appendChild(t);\n'+
        '    var input = document.createElement("input");\n'+
        '    var itemLabel = document.createElement("Label");\n'+
        '    input.type = "password";\n'+
        '    input.setAttribute("id","walletDecrypt");\n'+
        '    itemLabel.setAttribute("for", "walletDecrypt");\n'+
        '    itemLabel.innerHTML = "Enter Password: ";\n'+
        '    para.appendChild(input);\n'+    
        '    document.body.appendChild(para);\n'+ 
        '    walletaddress.value=keystore.addresses[0];\n'+
        '    wallet'+contractName+'Div.style.display="table";\n'+
        '    login'+contractName+'Div.style.display = "none";\n'+
        '    globalKeystore = keystore;\n'+
        '    functions'+contractName+'Div.style.display = "table";\n'+
        '    toAccount = Contract({"address":"' + contractData.address + '", "symtab":' + JSON.stringify(contractData.symtab) + '});\n' +
        '  })\n'+
        '};\n\n'; 

    jsString += 'function genKeyUser() {\n'+ 
        '  console.log("moving from keygen to create user");\n'+
        '  createUser'+contractName+'Div.style.display = "table";\n'+
        '  keygen'+contractName+'Div.style.display = "none";\n'+
        '  genKey(keypass.value, function (keystore) {\n'+
        '    addressCreateUser.value = keystore.addresses[0];\n'+
        '    enckeyCreateUser.value = keystore.serialize();\n'+
        '  });\n'+
        '}\n';

    var symtab = xABI[contractName];
    var funcs = Object.keys(symtab).filter(function(name) {
        return symtab[name]["jsType"] === "Function";
    });

    jsString += funcs.reduce(function(x,y) {
        return x + funcToCall(contractName, y, symtab[y]["functionArgs"]);
    }, '');

    console.log('writing: js/'+contractName+'.js');
    fs.writeFileSync('js/'+contractName+'.js',jsString);
}

var writeCSS = function(contractJSON)  {
    
}

module.exports = {
  writeHTML : writeHTML, 
  writeJS : writeJS,
  writeCSS : writeCSS,
};
