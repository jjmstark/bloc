var lw = require('eth-lightwallet');
var fs = require('fs');
var faucet = require("blockapps-js").routes.faucet;
var Promise = require('bluebird');

var path = require('path');
var mkdirp = require('mkdirp');

module.exports = {
    generateKey : generateKey,
}

function generateKey (password,userName) { 
    var seed = lw.keystore.generateRandomSeed();
    var store = new lw.keystore(seed, password);
    store.generateNewAddress(password);
    
    var keyPath = path.join('app', 'users', userName);
    
    mkdirp(keyPath, function () {     
        var fileName = path.join(keyPath, store.addresses[0]+'.json');
        fs.writeFile(fileName, store.serialize(), function (err, data) { 
            console.log("wrote " + fileName);
            return faucet(store.addresses[0]);
        });
    });
} 

