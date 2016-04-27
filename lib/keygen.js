try {
    var lw = require('eth-lightwallet');
}
catch(e) {
    console.log("Warning: eth-lightwallet not found.  Private keys will not be stored.");
}

var Promise = require('bluebird');
//var fs = require("fs");
var fs = Promise.promisifyAll(require("fs"));    
var faucet = require("blockapps-js").routes.faucet;

var path = require('path');
var mkdirp = Promise.promisifyAll(require('mkdirp'));

module.exports = {
    generateKey : generateKey,
    writeKeyToDisk: writeKeyToDisk,
    generateKeyPreWrite: generateKeyPreWrite
}

function generateKeyPreWrite(password,userName){

    var seed = lw.keystore.generateRandomSeed();
    var store = new lw.keystore(seed, password);
    store.generateNewAddress(password);

    return store;
}

function generateKey (password,userName) { 

    var store = generateKeyPreWrite(password, userName)

    writeKeyToDisk(userName, store);

    return store;
} 

function writeKeyToDisk (userName, store) {

    var keyPath = path.join('app', 'users', userName);
    var fileName = path.join(keyPath, store.addresses[0]+'.json');

    setTimeout(function () { console.log("    ...waiting for transaction to be mined"); }, 2000);

    return mkdirp.mkdirPAsync(keyPath)
        .then(fs.writeFile(fileName, store.serialize()))
        .then(function(err, data){console.log("wrote " + fileName)})
        .then(function(){ var f = faucet(store.addresses[0]); return store})

}
