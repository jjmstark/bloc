var path = require('path');
var blocRootDir = path.normalize(path.join(__dirname, '..'));
var yamlConfig = require(path.join(blocRootDir, 'lib', 'yaml-config.js'));
var abi = require('./abi.js');
var fs = require('fs');
var Mustache = require('mustache');

// makes an HTML file with submit buttons for each function name,
// and text inputs labeled with the types of the arguments to the functions.
// It allows you to call functions and loads the result (return value) and change to storage in json
// also scaffolds a login demo and a register new user demo
// login or register!

// note: returns a string - we're doing code generation.
// wish I were using Haskell / Purescript - could be much more 'combinator focused', 'nested'
// composable widgets FTW!

var funcToCall = function(contractName, funcName,args) {
    var confURL = yamlConfig.readYaml('config.yaml').apiURL;

    var jsString = 'function call' + funcName + '() {\n';
    jsString +=
        '  var args = ' + JSON.stringify(args) + ';\n' +
        '  var fArgs = {};\n' +
        '  console.log("globalKeystore: " + JSON.stringify(globalKeystore));\n'+
        '  console.log("privkey: " + globalKeystore.exportPrivateKey(walletaddress.value, walletDecrypt.value));\n'+
        '  var fromAccount = Contract({"privkey": globalKeystore.exportPrivateKey(walletaddress.value,walletDecrypt.value) });\n' +
        '  console.log("fromAccount: " + JSON.stringify(fromAccount));\n'+
        '  args.forEach(function(arg) {\n' +
        '    fArgs[arg] = document.getElementById("' + funcName + '" + arg).value;\n' +
        '  });\n';
    jsString +=
        '  toAccount.call("' +
        confURL + '", afterTX, {\n' +
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
    var contractName = Object.keys(xABI)[0];
    var symtab = xABI[contractName];
    var funcs = Object.keys(symtab).filter(function(name) {
        return symtab[name]["jsType"] === "Function";
    });
    var templateString = fs.readFileSync(path.join(blocRootDir, 'templates', 'html', 'contract.html.template')).toString();
    var inflatedHTML = Mustache.render(templateString, {
        appName: appName,
        staticServer: 'hacknet.blockapps.net',
        contractName: contractName,
        funcs: funcs.map(function(funcName){
            // mustache style. (should replace with one the better template engines)
            return {
                name: funcName,
                args: symtab[funcName].functionArgs.map(function(arg){
                    return {argName: arg};
                })
            };
        }),
    });
    console.log('writing html/' + contractName + '.html');
    fs.writeFileSync('html/' + contractName + '.html', inflatedHTML);
};

var writeJS = function(confURL, contractName, address, xABI, appName, privkey) {
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
        '    toAccount = Contract({"address":"' + address + '", "symtab":' + JSON.stringify(xABI) + '});\n' +
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

    jsString +=
        'function afterTX(result) {\n' +
        '  var afterTXstring =\n' +
        '    "TX returned: " + ((result === undefined) ? "(nothing)":result) +\n' +
        '    "\\n\\n" + \n' +
        '    "Contract storage state:\\n"\n' +
        '    "\\n";\n\n' +
        '  function f() {\n' +
        '    for (var svar in toAccount.get) {\n' +
        '      afterTXstring += "  " + svar + " = " + toAccount.get[svar] + "\\n";\n' +
        '    }\n' +
        '    document.getElementById("afterTXarea").textContent = afterTXstring;\n'+
        '  }\n'+
        '  toAccount.sync("' + confURL + '", f);\n'+
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
