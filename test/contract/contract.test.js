var common = require("../common");
var options = common.options;
var assert = common.assert;

var BigNumber = require('bignumber.js');
var lw = require('eth-lightwallet');

var blockapps = common.blockapps;
var Account = common.blockapps.ethbase.Account;

var helper = require('../../lib/contract-helpers.js');
var upload = require("../../lib/upload.js")

describe('compiling contracts', function(){

    beforeEach(function(done){
        console.log("before contracts")
        done();
    });

    describe('payoutTest', function(){

        var contractName = "Payout";
        var keyStream;
        var keyStream = helper.userKeysStream(options.username);

        keyStream
          .pipe(helper.collect())
          .on('data', function (data) { 
              var d = JSON.stringify(data[0]);
              console.log("d: " + d)
              var store = lw.keystore.deserialize(d);
              var address = store.addresses[0];

              prompt.start();
              prompt.getAsync(requestPassword).then(function(result) {
                  var privkey = store.exportPrivateKey(address, options.password);
                  return [contractName, privkey];
               })
               .spread(upload)
               .then(function (solObjWAddr) {

                it("Payout is uploaded", function(){
                    assert(solObjWAddr != null);
                });
              });      
          })
    })
});

