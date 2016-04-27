'use strict';

var common = require("../common");
var options = common.options;
var assert = common.assert;

var BigNumber = require('bignumber.js');
var lw = require('eth-lightwallet');
var fs = require('fs')

var blockapps = common.blockapps;
var Account = common.blockapps.ethbase.Account;

var transaction = blockapps.ethbase.Transaction;
var ethValue = blockapps.ethbase.Units.ethValue;

var helper = require('../../lib/contract-helpers.js');
var upload = require("../../lib/upload.js")
var compile = require("../../lib/compile.js")

var privKey;
var address;

var myUpload = function(name, cb){

  var solSrcFiles = "templates/app/contracts/" + name + ".sol"
  var src = fs.readFileSync(solSrcFiles).toString();

  compile(src).then(function(){

    var contractName = name;
    var keyStream = helper.userKeysStream(options.username);

    return keyStream
        .pipe(helper.collect())
        .on('data', function (data) { 
            var d = JSON.stringify(data[0]);
            var store = lw.keystore.deserialize(d);
            address = store.addresses[0];

            privKey = store.exportPrivateKey(address, options.password);

            upload(contractName, privKey)
             .then(function (solObjWAddr) {
                cb(solObjWAddr);
            });      
        })
    })
};

describe('compiling Payout', function(){

  var payOutSolWAddr = null;

  before(function(done){
    myUpload("Payout", function(c){payOutSolWAddr = c; done()});
  });

  describe('#payoutTest()', function(){

    it("Payout is uploaded", function(){
       var contractAddress = JSON.parse(payOutSolWAddr[1]).address;
       console.log("Contract address: " + contractAddress)
       assert(contractAddress != null)
    });

    it("Send some ether to Payout", function(done){
      var addressTo = JSON.parse(payOutSolWAddr[1]).address;
      var valueTX = transaction({"value" : ethValue(1).in("wei")}); 

      valueTX.send(privKey, addressTo).then(function(txResult) {
          console.log("tx " + address + " -> " + addressTo)
          done();
      });
    })

    it("Can call Payout", function(done){
      var payout = blockapps.Solidity.attach(payOutSolWAddr[1]);
      payout.state.Dividend().callFrom(privKey).then(function(res){
        done();
      })
    });
  });
});


describe('compiling SimpleMultiSig', function(){

  var smsSolWAddr = null;

  before(function(done){
    myUpload("SimpleMultiSig", function(c){smsSolWAddr = c; done()});
  });

  describe('#SimpleMultiSigTest()', function(){

    it("SimpleMultiSig is uploaded", function(){
       var contractAddress = JSON.parse(smsSolWAddr[1]).address;
       console.log("Contract address: " + contractAddress)
       assert(contractAddress != null)
    });

    it("Send some ether to SimpleMultiSig", function(done){
      var addressTo = JSON.parse(smsSolWAddr[1]).address;
      var valueTX = transaction({"value" : ethValue(1).in("wei")}); 

      valueTX.send(privKey, addressTo).then(function(txResult) {
          console.log("tx " + address + " -> " + addressTo)
          done();
      });
    })

    it("Can call SimpleMultiSig", function(done){
      var sms = blockapps.Solidity.attach(smsSolWAddr[1]);
      sms.state.withdraw(address).callFrom(privKey).then(function(res){
        done();
      })
    });
  });

});


