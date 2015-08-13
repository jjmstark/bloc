
var request = require('request');
var querystring = require('querystring');
var fs = require('fs');
var abi = require('./abi.js');
var codegen = require('./codegen.js');
var api = require('blockapps-js');

module.exports.compileSol = function(soliditySrcArray,apiURL,scaffold,appName) {
   // add regex ignore

    soliditySrcArray.map(function (src) {
        api.Solidity(src).compile(apiURL, function(solC) {
            if (solC.vmCode === undefined) {
                console.log("compile unsuccessful, not writing."); // Error text?
            }
            else {
                var contractName = Object.keys(solC.symtab)[0];
                var abiFile = "contractmeta/" + contractName + ".json";
                console.log('compile successful, writing ' + abiFile);
                if (scaffold) {
                    codegen.writeAll(solC.symtab, appName);
                }
                fs.writeFileSync(abiFile, JSON.stringify(solC.symtab));
            }
        });
    });
}
