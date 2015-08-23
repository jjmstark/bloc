
var lw = require('ethlightjs');
var fs = require('fs');
var request = require('request');

var generateKey = function(password,apiURL) {
  var seed = lw.keystore.generateRandomSeed();
  var store = new lw.keystore(seed, password);
  store.generateNewAddress(password);
  fs.writeFileSync('key.json', store.serialize());

  var options = {
       method: 'POST',
       uri: apiURL,
       port: 80, // change later                                                                                   
       headers: {
        'Content-type': 'application/x-www-form-urlencoded'
       },
       body: 'address='+store.addresses[0]
  };
 
  request.post(options, function (err, res, body) { console.log (body); } );
}

var readKeystore = function() {
  return new lw.keystore.deserialize(fs.readFileSync('key.json'));
}

module.exports = (function () {
  return {
    generateKey : generateKey,
    readKeystore : readKeystore
  };
})();
