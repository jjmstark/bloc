var blockapps = require("blockapps-js");
var Promise = require("bluebird");
var contract = blockapps.Solidity.attach({"code":"contract SimpleStorage {\n    uint storedData;\n    function set(uint x) {\n        storedData = x;\n    }\n    function get() returns (uint retVal) {\n        return storedData;\n    }\n}\n","name":"SimpleStorage","vmCode":"606060405260908060116000396000f30060606040526000357c01000000000000000000000000000000000000000000000000000000009004806360fe47b11460415780636d4ce63c14605257603f565b005b60506004803590602001506071565b005b605b600450607f565b6040518082815260200191505060405180910390f35b806000600050819055505b50565b60006000600050549050608d565b9056","symTab":{"set":{"functionDomain":[{"atStorageKey":"0","bytesUsed":"20","jsType":"Int","solidityType":"uint256"}],"functionArgs":["x"],"functionHash":"60fe47b1","bytesUsed":"0","jsType":"Function","solidityType":"function(uint256) returns ()"},"get":{"functionDomain":[],"functionArgs":[],"functionHash":"6d4ce63c","bytesUsed":"0","jsType":"Function","functionReturns":{"atStorageKey":"0","bytesUsed":"20","jsType":"Int","solidityType":"uint256"},"solidityType":"function() returns (uint256)"},"storedData":{"atStorageKey":"0","bytesUsed":"20","jsType":"Int","solidityType":"uint256"}},"address":"e70ce2bf647748adf6c0eeb35e0e621ffd175574"});
blockapps.query.serverURI = 'http://hacknet.blockapps.net';

var Units = blockapps.ethbase.Units;
var globalKeystore;
var developerKeystore = '{"encSeed":{"encStr":"U2FsdGVkX1+sznUjNrrlzDPKoujZ7R0UUxKM5m9yDIk2qAagOP6fk0pL6/1loL9qwPQNbVHEnFSbR9DXVNqcrDNFqUJUbS+dv+CDEUTH3PqsjpWwMqRAw0y7841MD2i2","iv":"00c506a95a75fb15583c423f32c07b38","salt":"acce752336bae5cc"},"encMasterPriv":{"encStr":"U2FsdGVkX1/E+5OCytfNGf+7bWQOh3iKwsmF0dA1AgFQ7M+U+uTEVLd3ve55a5cD+xMKbnL9KcdoAaJyf2GCLGBEOsMyEmrgulG2/KYw3AdttwZBPJ+CGGrl+LGByg9FZni40T0Gh788Mno6XZkC73fCNhlgCPYSCV12jrDj//I=","iv":"b0094bf2b9cf7bb4aeb07a80ffde4e56","salt":"c4fb9382cad7cd19"},"keyHash":"158b93def799b986c854fc743775942a63d8d3ef09d6eb24d3892f4350f1c0e33bdd3df5c32990c3df2ad8fd5eb64f4a360d8ca4d5dd1d922fbe365f8909541f","salt":{"words":[-1279323104,1828825707,869551778,-1702759965],"sigBytes":16},"hdIndex":1,"encPrivKeys":{"1c3c59701ec2f64e3e18027c50f93dc570c5ee1a":{"key":"U2FsdGVkX19g+jHPS20+89VHjkQ+GZyMQnj8vrHzZZS9QGOVRez25FBSS+4BWRuJ5ssylspyQijF9MeCzyaoeg==","iv":"75b14845c1e904cc1ef4b1a03ea5b537","salt":"60fa31cf4b6d3ef3"}},"addresses":["1c3c59701ec2f64e3e18027c50f93dc570c5ee1a"]}';

function submit() {
    var userObj = {
        app: appCreateUser.value,
        email: emailCreateUser.value,
        loginpass: loginpassCreateUser.value,
        address: addressCreateUser.value,
        enckey: enckeyCreateUser.value
     };
    /*global function from registerUser.js */
    submitUser(userObj, function (res) {
        var data = JSON.parse(res);
        createUserDiv.style.display = "none";
        var para = document.createElement("P");
        para.setAttribute("id","walletCreateMessage");
        var t = document.createTextNode("Confirm in your email. This is your new wallet file: \n\n" + res);
        para.appendChild(t);
        document.body.appendChild(para);
        console.log("wallet: " + data.encryptedWallet);
        console.log("addresses: " + JSON.parse(data.encryptedWallet).addresses);
        
        var faucetAddr = JSON.parse(data.encryptedWallet).addresses[0];
        console.log("sending faucet request");
        blockapps.routes.faucet(faucetAddr).then(function() {
            console.log("faucet should have worked");
        });
    });
};

function showRegister() {
    keygenDiv.style.display = "table";
    loginDiv.style.display = "none";
    hideAuthButtons();
}

function showLogin() {
    createUserDiv.style.display = "none";
    if (typeof walletCreateMessage !== "undefined") walletCreateMessage.style.display = "none";
    keygenDiv.style.display = "none";
    loginDiv.style.display = "table";
    walletDiv.style.display="none";
    hideAuthButtons();
    hideFunctions();

};

function hideOnLoad() {
    createUserDiv.style.display = "none";
    walletDiv.style.display = "none";
    loginDiv.style.display = "none";
    functionsDiv.style.display = "none";
    keygenDiv.style.display = "none";
    walletPassword.style.display = "none";
}

function hideAuthButtons() {
    authButtonDiv.style.display = "none";
}

function hideFunctions() {
    functionsDiv.style.display = "none";
    walletPassword.style.display = "none";
}

function genKeyUser() {
    console.log("moving from keygen to create user");
    createUserDiv.style.display = "table";
    keygenDiv.style.display = "none";
    genKey(keypass.value, function (keystore) {
        addressCreateUser.value = keystore.addresses[0];
        enckeyCreateUser.value = keystore.serialize();
  
  });
};

function retrieve() {
    var userObj = {
        app : appLogin.value,
        email : emailLogin.value,
        loginpass : loginpassLogin.value,
        address : addressLogin.value
    };
    retrieveUser(userObj,function (keystore) {
        loginDiv.style.display = "none";
        walletaddress.value=keystore.addresses[0];
        walletDiv.style.display="block"
        loginDiv.style.display = "none";
        walletPassword.style.display = "block";
        globalKeystore = keystore;
        functionsDiv.style.display = "block";
        $('#passwordModal').modal('show');
        $('#passwordModal').on('shown.bs.modal', function () {
            $('#walletDecrypt').focus();
        });
    });
}

function developerRetrieve() {
    console.log("developer keystore: " + JSON.stringify(developerKeystore));
    loginDiv.style.display="none";
    walletaddress.value=JSON.parse(developerKeystore).addresses[0];
    walletDiv.style.display="block"
    loginDiv.style.display = "none";
    walletPassword.style.display = "block";
    globalKeystore = ethlightjs.keystore.deserialize(developerKeystore);
    functionsDiv.style.display = "block";
    hideAuthButtons();
    $('#passwordModal').modal('show')
    $('#passwordModal').on('shown.bs.modal', function () {
        $('#walletDecrypt').focus();
    });
}

function callFunc(funcName) {
    console.log("globalKeystore: " + JSON.stringify(globalKeystore));

    try {
        var privkey = globalKeystore.exportPrivateKey(
            walletaddress.value, document.getElementById("walletDecrypt").value);
        console.log("privkey: " + privkey);
    } catch (e) {
        $('#passwordModal').modal('show')
    }

    var args = [];
    var funcDivElts = document.getElementById(funcName + "Div").children;
    var len = funcDivElts.length;

    for (var i = 1; i < len-1; ++i) { // Skip the button and the value text input
        args.push(funcDivElts[i].value);
    }

    contract.state[funcName].apply(null,args).txParams({
        value : Units.ethValue(funcDivElts[len-1].value).in("ether")
    }).callFrom(privkey).then(afterTX);
}

function storageAfterTX(result) {
    var afterTXstring = "TX returned: " +
        ((result === undefined) ? "(nothing)":result);

    return Promise.props(contract.state).then(function(sVars) {
        afterTXstring += "\n\n Contract storage state:\n\n";
        for (name in sVars) {
            var svar = sVars[name]
            if (typeof svar === "function") {
                continue;
            }
            afterTXstring += "  " + name + " = " + svar + "\n";
        };
      return afterTXstring;  
    });
} 

function contractBalanceAfterTX(txString) {
    return contract.account.balance.then(function(bal) {
        return txString + "\n Contract balance =  " +
            Units.convertEth(bal).from("wei").to("ether") + " ether\n";
    });
}

function userBalanceAfterTX(txString) {
    return blockapps.ethbase.Account(globalKeystore.addresses[0]).balance.then(function(userBal) {
        return txString + "\n Your balance     =  " +
            Units.convertEth(userBal).from("wei").to("ether") + " ether\n";
    });
}

function resetTextArea(txString)  {
    document.getElementById("afterTXarea").textContent = txString;
}

function afterTX(result) {
    storageAfterTX(result)
      .then(function (txStr) { 
          return contractBalanceAfterTX(txStr);
        })
      .then(function (txStr) { 
          return userBalanceAfterTX(txStr);
        })
      .then(function (txStr) { 
          resetTextArea(txStr);
      });
} 
