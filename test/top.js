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
        //var profile = ["ethereum-frontier", "http://rynet4.centralus.cloudapp.azure.com"]
        var profile = ["ethereum-frontier", "http://23.96.12.110"]
        //var profile = ["strato-dev", "http://23.96.12.110"]

        common.blockapps.setProfile(profile[0], profile[1]);
        console.log("using: " + profile)
        done();
    });
    importTest("config", './config/config.test.js');
    importTest("keygen", './keygen/keygen.test.js');
    importTest("contract", './contract/contract.test.js');
    importTest("multi", './multi/multi.test.js');

    after(function () {
        console.log("after all tests");
    });
});