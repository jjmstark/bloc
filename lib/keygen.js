
var lw = require('LightWallet');
var fs = require('fs');
var request = require('request');

module.exports.generateKey = function(password,apiURL) {
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

module.exports.readKeystore = function() {
  return new lw.keystore.deserialize(fs.readFileSync('key.json'));
}
