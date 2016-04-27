var Promise = require('bluebird');

var fs = Promise.promisifyAll(require('fs'));
var Solidity = require('blockapps-js').Solidity;
var codegen = require('./codegen.js');
var path = require('path');

module.exports = upload;
function upload(contractName, privkey) { 
  var compiledFile = path.join('app', 'meta', contractName, "temp.json");

  var toRet = fs.readFileAsync(compiledFile, {encoding:"utf8"}).
    then(Solidity.attach).
    call("construct").
    call("callFrom", privkey).
    then(function(contrObj){
      var addr = contrObj.account.address.toString();
      var uploadedFile = path.join('app', 'meta', contractName, addr + ".json");
      console.log("writing: " + uploadedFile);
      return [uploadedFile, contrObj.detach()];
    })

  toRet.spread(fs.writeFileAsync);

  setTimeout(function () { console.log("    ...waiting for transaction to be mined"); }, 2000);

  return toRet;
    
}
