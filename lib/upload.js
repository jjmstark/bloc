var fs = require('fs');
var api = require('blockapps-js');
var codegen = require('./codegen.js');

module.exports.upload = function(contractName,apiURL,appName,scaffold,privkey) { 
    var abiFile = "meta/" + contractName + ".json";
    var abiObj = JSON.parse(fs.readFileSync(abiFile, {encoding:"utf8"}));
    var solObj = api.Solidity("");
    solObj.vmCode = abiObj.vmCode;
    solObj.symtab = abiObj.symtab;
    solObj.submit({
        apiURL:apiURL,
        fromAccount:api.Contract({privkey: privkey}),
        value:0,
        gasPrice:1,
        gasLimit:3141592,
    }, function (contract) {
        console.log(contract);
        fs.writeFileSync(abiFile, JSON.stringify({
            "address":contract.address,
            "vmCode": solObj.vmCode,
            "symtab": solObj.symtab
        }));
        if (scaffold) {
            codegen.writeJS(apiURL,contractName,contract.address,solObj.symtab,appName,privkey);
        }
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
