var fs = require('fs');
var codegen = require('./codegen.js');
var Solidity = require('blockapps-js').Solidity;
var path = require('path');
var mkdirp = require('mkdirp');
var chalk = require('chalk');


module.exports = compileSol;
function compileSol(solSrc) {
  return Solidity(solSrc).then(function(solObj) {
    var name;
    var multi = false;
      
    if (typeof solObj.name === 'undefined' || solObj.name === '') {
        name = Object.keys(solObj.src).join("");
	multi = true;
    } else {
        name = solObj.name;
    }
	
    var abiPath = path.join('app', 'meta', name);
    var abiFile = path.join('app', 'meta', name, 'temp.json');

//    console.log(JSON.stringify(solObj));
    console.log(chalk.yellow("Compile successful: "));

    mkdirp(abiPath, function () { 
	if (!multi) {
	    fs.writeFile(abiFile, solObj.detach(), function () { 
		console.log(chalk.green("wrote: ") + abiFile);
            });

	} else {
            Object.keys(solObj.src).map(function (contract) {
		var multiPath = path.join('app', 'meta', name, contract, 'temp.json');
		var src = solObj.src;
                fs.writeFile(multiPath, src[contract].detach(), function () {
                    console.log(chalk.green("wrote: ") + multiPath);
		});
            });
	}
		
    });

  }).
  catch(function(e) {
    console.log("compile failed with error message: " + e);
  });
}
