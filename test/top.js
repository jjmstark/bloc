'use strict';

function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}

function chainTest(name, path, name2, path2){
    describe(name, function () {
        require(path);
        describe(name2, function(){
            require(path2);
        });
    });   
}

var common = require("./common");

describe("top", function () {
    beforeEach(function(done){
        common.blockapps.setProfile("strato-dev", "http://strato-dev3.blockapps.net");
        done();
    });
    importTest("config", './config/config.test.js');
    importTest("keygen", './keygen/keygen.test.js');
    importTest("contract", './contract/contract.test.js');
    //importTest("multi", './multi/multi.test.js');

    after(function () {
        console.log("after all tests");
    });
});