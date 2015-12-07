var mocha = require('mocha');
var chai = require('chai');
var rewire = require('rewire');
var expect = chai.expect;

var keygen = rewire("../lib/keygen.js");

var fsMock = {
    writeFileSync:
        function (path, data, cb) {
	    return {
		"path": path,
		"data": data
	    };
        }
};

keygen.__set__("fs", fsMock);

describe('Key Generation', function() {
    describe('#generateKeyPreFaucet()', function () {
	var mockedKey;
	var password;
        before(function() {
	    password = 'thepassword';
	    mockedKey = keygen.generateKeyPreFaucet(password);
        });

	it('should create a key file with an address and a privkey', function () {
            expect(mockedKey.addresses).not.to.be.empty;
	    expect(mockedKey.encMasterPriv).not.to.be.empty;
	    expect(mockedKey.encPrivKeys).not.to.be.empty;
	});

    	it('should successfully encrypt and decrypt with the right password', function () {
            var exported = mockedKey.exportPrivateKey(mockedKey.addresses[0], password);
	    
	    expect(exported).not.to.be.undefined;
	});

        it('should throw an exception if the password is incorrect', function () {
            expect(mockedKey.exportPrivateKey(mockedKey.addresses[0], 'not the password')).to.throw(Error);
	});
    });
    
    describe('#generateKey()', function () {
	var mockedKey;
	var mockedKeyFile;
	var password;
	
	before(function() {
            password = 'thepassword';
	    mockedKey = keygen.generateKeyPreFaucet(password);
	    mockedKeyFile = keygen.writeKeyToDisk(mockedKey);
	});
	it('should create a key file called key.json', function () {
            expect(mockedKeyFile.path).to.match(/key.json/);
	});

    	it('should POST to the faucet', function () {
	    return keygen.generateKey(password).then(function(result) {
	        console.log("result: " + JSON.stringify(result));
	    }, function (err) {
		console.log("err: " + JSON.stringify(err));
	    });
	});
   });
});

describe('Multi Key Generation', function() {
    describe('#generateKeysPreFaucet()', function () {
	var mockedKeyArray;
	var password;
	var numKeys;
	
        before(function() {
	    password = 'thepassword';
	    numKeys = 3;
	    mockedKeyArray = keygen.generateKeysPreFaucet(password,numKeys);
        });

	it('should create a key ' + numKeys + ' files, each with an address and a privkey', function () {
            expect(mockedKeyArray.addresses).not.to.be.empty;
	    expect(mockedKeyArray.encMasterPriv).not.to.be.empty;
	    expect(mockedKeyArray.encPrivKeys).not.to.be.empty;
	});

    	it('should successfully encrypt and decrypt each with the right password', function () {
            var exportedArray = undefined;
	    
	    expect(exported).not.to.be.undefined;
	});

        it('should throw an exception if the password is incorrect', function () {
            expect(false).to.be(true);
	});
    });
    
    describe('#generateKeys()', function () {
	var mockedKeyArray;
	var mockedKeyFileArray;
	var password;
	var numKeys;
	
	before(function() {
            password = 'thepassword';
	    numKeys = 3;
	    mockedKeyArray = keygen.generateKeyPreFaucet(password);
	    mockedKeyFile = keygen.writeKeysToDisk(mockedKeyArray);
	});
	it('should create a key files called key.json', function () {
            expect(mockedKeyFile.path).to.match(/key*.json/);
	});

    	it('should POST to the faucet', function () {
	    return keygen.generateKeys(password,numKeys).then(function(result) {
	        console.log("result: " + JSON.stringify(result));
	    }, function (err) {
		console.log("err: " + JSON.stringify(err));
	    });
	});
   });
});
