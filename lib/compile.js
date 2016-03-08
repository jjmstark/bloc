var fs = require('fs');
var codegen = require('./codegen.js');
var Solidity = require('blockapps-js').Solidity;
var path = require('path');
var mkdirp = require('mkdirp');


module.exports = compileSol;
function compileSol(soliditySrcArray,appName) {
    return soliditySrcArray.map(function (src) {
        return Solidity(src).tap(function(solObj) {
            var abiPath = path.join('app', 'meta', solObj.name);
            var abiFile = path.join('app', 'meta', solObj.name, 'temp.json');

            console.log('compile successful, writing ' + abiFile);

            mkdirp(abiPath, function () { 
               fs.writeFile(abiFile, JSON.stringify(solObj,null,2), function () { 
                  console.log("wrote: " + abiFile);
               });
            }); 
        }).catch(function(e) {
            console.log("compile failed with error message: " + e);
        });
    });
}
