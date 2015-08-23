var fs = require('fs');
var codegen = require('./codegen.js');
var api = require('blockapps-js');

var compileSol = function(soliditySrcArray,apiURL,scaffold,appName) {
   // add regex ignore

    soliditySrcArray.map(function (src) {
        api.Solidity(src).compile(apiURL, function(solC) {
            if (solC.vmCode === undefined) {
                console.log("compile unsuccessful, not writing."); // Error text?
            }
            else {
                var contractName = Object.keys(solC.symtab)[0];
                var abiFile = "meta/" + contractName + ".json";
                console.log('compile successful, writing ' + abiFile);
                if (scaffold) {
                    codegen.writeHTML(solC.symtab, appName);
                }
                fs.writeFileSync(abiFile, JSON.stringify({
                    "vmCode" : solC.vmCode,
                    "symtab" : solC.symtab
                }));
            }
        });
    });
}

module.exports = (function () {
  return {
    compileSol : compileSol
  };
})();
