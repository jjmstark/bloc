
var request = require('request');
var querystring = require('querystring');
var fs = require('fs');

module.exports.compileSol = function(soliditySrcArray,apiURL,callback) {
   // add regex ignore

    var optionPrototype = {
       method: 'POST',
       uri: apiURL,
       port: 80, // change later
       headers: {
        'Content-type': 'application/x-www-form-urlencoded'
       },
       body: 'src='
    };

    soliditySrcArray.map(function (src)  {
                          var options = optionPrototype;
                          options.body = 'src='+querystring.escape(src);
                       //   console.log("sending with options.body: " + options.body);
                          request(
                            options,
                            function(err, res, body) { 
                             callback(JSON.parse(body));
                            });
                          }
                        );
}

module.exports.writeContractJSON = function (jsonPayload) {
    if (jsonPayload.error !== undefined) { console.log("compile unsuccessful, not writing. Error: " 
                                           + jsonPayload.error); }
    else {
      var contractName = jsonPayload.abis[0].name;
      console.log('compile successful, writing contractmeta/'+contractName+'.json');
      fs.writeFileSync('contractmeta/'+contractName+'.json', JSON.stringify(jsonPayload));
    }
}
