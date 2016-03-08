var fs = require('fs');
var Solidity = require('blockapps-js').Solidity;
var codegen = require('./codegen.js');
var path = require('path');

// IIFE unnecessary here; no identifiers
module.exports = upload;
function upload(contractName, privkey) { 
    var compiledFile = path.join('app', 'meta', contractName, "temp.json");
   
    fs.readFile(compiledFile, {encoding:"utf8"}, function (err, data) { 
        var solObj0 = JSON.parse(data);
   
        if ("address" in solObj0) {
           delete solObj0.address;
        }
   
        var solObj = Solidity.attach(solObj0);

        return solObj.newContract(privkey)
            .get("account")
            .get("address")
            .then(function(addr){
                solObj.address = addr.toString();
                var uploadedFile = path.join('app', 'meta', contractName, addr.toString()+".json");
                console.log("writing: " + uploadedFile);
                fs.writeFile(uploadedFile, JSON.stringify(solObj), function (err, data) { 

                });
                return solObj;
            });
     });
}

