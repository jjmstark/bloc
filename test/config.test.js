var mocha = require('mocha');
var chai = require('chai');
var rewire = require('rewire');
var expect = chai.expect;
var Promise = require('bluebird');
var BigNumber = require('bignumber.js');

var blockapps = rewire("blockapps-js");

var Account = require('blockapps-js').ethbase.Account;

// The "0x" prefix is optional for addresses
var address = "e1fd0d4a52b75a694de8b55528ad48e2e2cf7859"

var assert = require('assert');

describe('setting up blockapps-js', function(){

    beforeEach(function(done){
        blockapps.setProfile("strato-dev", "http://23.96.12.110:3000");
        done();
    });

    it('blockapps-js is v1.1', function(){
        assert(blockapps.query.apiPrefix == "/eth/v1.1")
    });

    describe('balanceTest', function() {
        var bal = new BigNumber(0);
        beforeEach(function(done){
            Account(address).balance.then(function(balance) {
                bal = balance;
                done();
            });
        });

        it('balance is non-zero', function() {
            //console.log("balance of account (" + address + "): " + bal.toString())
            assert(bal.cmp(0) == 1);
        });
    });

});

