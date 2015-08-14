var fs = require('fs');
var api = require('blockapps-js');
var codegen = require('./codegen.js');

module.exports.upload = function(soliditySrcArray,apiURL,appName,privkey,scaffold) { 
   soliditySrcArray.map(function (src)  {
      api.Solidity(src).toContract({
          apiURL:apiURL,
          fromAccount:api.Contract({privkey: privkey}),
          value:0,
          gasPrice:1,
          gasLimit:3141592,
      }, function (contract) {
          console.log(contract);
          var abiFile = "contractmeta/" + contract.name + ".json";
          var symtab = JSON.parse(fs.readFileSync(abiFile, {encoding:"utf8"}))
          fs.writeFileSync(abiFile, JSON.stringify({
              "address":contract.address,
              "symtab":symtab
          }));
          if (scaffold) {
              codegen.writeJS(symtab, appName, privkey);
          }
      });
   });
}

/*
module.exports.writeContractJSON = function (jsonPayload) {
    if (jsonPayload.error !== undefined) { console.log("upload unsuccessful, not writing"); }
    else {
      var contractName = jsonPayload.abis[0].name;
      console.log('compile successful, writing contractmeta/'+contractName+'.json');
      fs.writeFileSync('contractmeta/'+contractName+'.json', JSON.stringify(jsonPayload));
    }
}
*/
