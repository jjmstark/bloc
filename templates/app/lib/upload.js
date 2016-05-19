'use strict'

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var Solidity = require('blockapps-js').Solidity;

var path = require('path');

/**
 * Upload a contract by name.
 * @param {string} The name of the contract
 * @para {string} User's private key
 * @return {array}
 */
function upload(contractName, privkey) { 
  var compiledFile = path.join('app', 'meta', contractName, contractName + ".json");

  var id = setInterval(function () { console.log("    ...waiting for transaction to be mined"); }, 2000);

  var toRet = fs.readFileAsync(compiledFile, {encoding:"utf8"}).
    then(Solidity.attach).
    then(function(solObj) { return solObj.construct().txParams({"gasPrice":1,"gasLimit":31415920}).callFrom(privkey); }).
    then(function(contrObj){
      var addr = contrObj.account.address.toString();
      var uploadedFile = path.join('app', 'meta', contractName, addr + ".json");
      var latestPath = path.join('app', 'meta', contractName, "Latest.json");

      console.log("writing: " + uploadedFile);
      console.log("writing: " + latestPath);
      clearInterval(id);
      return [uploadedFile, latestPath, contrObj.detach(), addr];
    });

  toRet.then(function (arr) { 
    fs.writeFileAsync(arr[0], arr[2]);
    fs.writeFileAsync(arr[1], arr[2]);
  });

  return toRet;
    
}

module.exports = upload;
