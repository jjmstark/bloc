

var api = require('../node_modules/js-lib/api-node');

module.exports.upload = function(soliditySrcArray,apiURL,privkey,callback) { 
   soliditySrcArray.map(function (src)  {
      api.Solidity(src).toContract({
        apiURL:apiURL,
        fromAccount:api.Contract({privkey: privkey}),
        value:0,
        gasPrice:1,
        gasLimit:3141592,
    }, function (res) { console.log(res); })});
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
