var fs = require('fs');
var codegen = require('./codegen.js');
var Solidity = require('blockapps-js').Solidity;
var path = require('path');
var mkdirp = require('mkdirp');
var chalk = require('chalk');


module.exports = compileSol;
function compileSol(solSrc) {
  return Solidity(solSrc).then(function(solObj) {
    var abiPath = path.join('app', 'meta', solObj.name);
    var abiFile = path.join('app', 'meta', solObj.name, 'temp.json');

//    console.log(JSON.stringify(solObj));
    console.log(chalk.yellow("Compile successful, writing ") + abiFile);

    mkdirp(abiPath, function () { 
      fs.writeFile(abiFile, solObj.detach(), function () { 
        console.log(chalk.green("wrote: ") + abiFile);
      });
    }); 
  }).
  catch(function(e) {
    console.log("compile failed with error message: " + e);
  });
}
