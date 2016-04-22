'use strict';

var common = require("../common");
var options = common.options;
var assert = common.assert;

var BigNumber = require('bignumber.js');
var lw = require('eth-lightwallet');
var fs = require('fs')

var Promise = require('bluebird');

var blockapps = common.blockapps;
var Account = common.blockapps.ethbase.Account;

var helper = require('../../lib/contract-helpers.js');
var upload = require("../../lib/upload.js")
var compile = require("../../lib/compile.js")

describe('compiling contracts', function(){

  var payOutSolWAddr = null;
  var privKey = null;

  before(function(done){
      var solSrcFiles = "templates/app/contracts/Payout.sol"
      var src = fs.readFileSync(solSrcFiles).toString();

      compile(src).then(function(){

        var contractName = "Payout";
        var keyStream = helper.userKeysStream(options.username);

        keyStream
            .pipe(helper.collect())
            .on('data', function (data) { 
                var d = JSON.stringify(data[0]);
                var store = lw.keystore.deserialize(d);
                var address = store.addresses[0];

                privKey = store.exportPrivateKey(address, options.password);

                upload(contractName, privKey)
                 .then(function (solObjWAddr) {
                    payOutSolWAddr = solObjWAddr;
                    done();
                });      
            })
      })
  });

  describe('payoutTest', function(){

    it("Payout is uploaded", function(){
       var address = JSON.parse(payOutSolWAddr[1]).address;
       assert(address != null)
    });

    it("Can call Payout", function(done){
      var payout = blockapps.Solidity.attach(payOutSolWAddr[1]);
      payout.state.Dividend().callFrom(privKey).then(function(res){
        done()
      })
    });

  });


});

