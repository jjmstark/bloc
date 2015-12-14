var mocha = require('mocha');
var chai = require('chai');
var rewire = require('rewire');
var expect = chai.expect;
var promise = require('bluebird');

var es = require('event-stream');
var through = require('through2');

var contractHelpers = rewire("../templates/lib/contract-helpers.js");

// hideous 
var mockedFileSystem = {
  'key.json' : '{"encSeed":{"encStr":"U2FsdGVkX1+1TwrINP2YOSlLYUTm6mVJaQh4bISBbrpX9V4bDudmJ0SNVHggcqwuyO59hXLcJT+KLTpKee9XHd0iNwGCNypDQW9JZsrRVqGQojd+CJ7HqD8ZxgrNDSax","iv":"155942c11ff1d460605f993d51db86b5","salt":"b54f0ac834fd9839"},"encHdRootPriv":{"encStr":"U2FsdGVkX19GxVnNsLEUlySryh1ykxGN8C/rZ/DCbGU63ASDmTBzPzaSpbEjPkDRBo6F3+h7mg9toxDgpNsrgwfgNAJ9AnTZMIUDfYWqFl9UXxQSs6Y4lMbN2i7uFwFvxlGByXeSsVUNwT630M15SpbL/gumBCEQxgeurZyKNBQ=","iv":"ec83912d456855bb94548a2d1e3718e3","salt":"46c559cdb0b11497"},"hdIndex":1,"encPrivKeys":{"9cd92d61d37f958add81f5b23b757b453cc193ba":{"key":"U2FsdGVkX19Lw95tqtaFRua+NLMzLw6ACBLfTjaqaaP0CDu1zilxjh2QH5ZQNqatJA3BkQiqR3tWhkjH9AAd6Q==","iv":"2a48ff7549355f21e966e7095860c15d","salt":"4bc3de6daad68546"}},"addresses":["9cd92d61d37f958add81f5b23b757b453cc193ba"],"keyHash":"f2b139ed626f917eefe9780d86bfe572c2c2519d1e51d9050779ffbb604cff3bac984c9bd7aabfec8020b16f36a89c6dbcbdbccf8fe08d06f72724f08054c45e","salt":{"words":[833737010,1433566309,1298687598,1724895043],"sigBytes":16}}', 


  'key0.json' : '{"encSeed":{"encStr":"U2FsdGVkX181UtzNPJSTNbVLZl0fcIKsKnDfbcq5TpgXNoTWDY7UAGA3/GaRzQZlCk8JEwFeevsp2pUBZY+ISvF4WoIzlg1W/Mm49cRnuoofBvAjZFYyc1RJ99iQxNobAsvdoiDpasDFZEARBVNodA==","iv":"8bda32be89aec332f13d255d71db2e01","salt":"3552dccd3c949335"},"encHdRootPriv":{"encStr":"U2FsdGVkX1/LOgE3R/AwNZzPm8zDhoqxWqKO+pPpfmz/4RzNgns8gGrhV4IsG0Q2RMNjbG3N5NWCL3ub58x0KUgAiJjpVpCKI3yaNTQfYkDmw8BY+qEOfuSngWsvCEihISY8wDT6ONUElSHDicDIeKawMgxMgNY0BXFv0lM3zXI=","iv":"bae61b06bb7b8a92594dcbac0cd49b2e","salt":"cb3a013747f03035"},"hdIndex":1,"encPrivKeys":{"0bc1f6c982a396102504ace75f8b56357bdcbcb4":{"key":"U2FsdGVkX19Ss6M4obYOkY8MipPPS/l8bd4OoUdPURz+0yRTZ1spTGmfh7jQ54zA3a0xB/GReNVdgQrg/LS96g==","iv":"d8946401d8a1d8d9ceca0e73f35ea55a","salt":"52b3a338a1b60e91"}},"addresses":["0bc1f6c982a396102504ace75f8b56357bdcbcb4"],"keyHash":"a80157fafa59359234c441167e017e9b10b7473425ca97e9e489cc639fc57fa0402c4b546325a45eba0040faa5c0bdf97cd0ff1e8e6029844b2db622ebd6601d","salt":{"words":[-1690155199,721953466,1896524410,1030926911],"sigBytes":16}}',


  'meta' : {
       'Payout.json': '{"code":"contract Payout {\n     address Victor;\n     address Jim;\n     address Kieren;\n\n     mapping (address => uint) ownershipDistribution; \n\n     function Setup() {\n       Victor = 0xaabb;\n       Jim    = 0xccdd;\n       Kieren = 0xeeff;\n\n       ownershipDistribution[Victor] = 35;\n       ownershipDistribution[Jim]  = 35;\n       ownershipDistribution[Kieren] = 30;\n     }\n\n     function Dividend() {\n       uint bal= this.balance;\n       Victor.send(bal * ownershipDistribution[Victor] / 100); \n       Jim.send(bal * ownershipDistribution[Jim] / 100);\n       Kieren.send(bal * ownershipDistribution[Kieren] / 100);\n     }\n}\n","name":"Payout","vmCode":"606060405261040e806100136000396000f30060606040526000357c01000000000000000000000000000000000000000000000000000000009004806358793050146100445780638df554b31461005157610042565b005b61004f60045061005e565b005b61005c6004506101ed565b005b61aabb600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff0219169083021790555061ccdd600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff0219169083021790555061eeff600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550602360036000506000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005081905550602360036000506000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005081905550601e60036000506000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050819055505b565b60003073ffffffffffffffffffffffffffffffffffffffff16319050600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166000606460036000506000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005054840204604051809050600060405180830381858888f1935050505050600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166000606460036000506000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005054840204604051809050600060405180830381858888f1935050505050600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166000606460036000506000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005054840204604051809050600060405180830381858888f19350505050505b5056","symTab":{"Setup":{"functionDomain":[],"functionArgs":[],"functionHash":"58793050","bytesUsed":"0","jsType":"Function","solidityType":"function() returns ()"},"Victor":{"atStorageKey":"0","bytesUsed":"14","jsType":"Address","solidityType":"address"},"Jim":{"atStorageKey":"1","bytesUsed":"14","jsType":"Address","solidityType":"address"},"Kieren":{"atStorageKey":"2","bytesUsed":"14","jsType":"Address","solidityType":"address"},"Dividend":{"functionDomain":[],"functionArgs":[],"functionHash":"8df554b3","bytesUsed":"0","jsType":"Function","solidityType":"function() returns ()"},"ownershipDistribution":{"atStorageKey":"3","mappingKey":{"bytesUsed":"14","jsType":"Address","solidityType":"address"},"bytesUsed":"20","jsType":"Mapping","mappingValue":{"bytesUsed":"20","jsType":"Int","solidityType":"uint256"},"solidityType":"mapping (address => uint256)"}},"address":"00b4bded567aa1be940bfe8a454efd4b6219248c"}',


       'SimpleStorage.json': '{"code": "contract SimpleStorage {\n uint storedData;\n function set(uint x) {\n storedData = x;\n }\n function get() returns (uint retVal) {\n return storedData;\n }\n}\n","name": "SimpleStorage","vmCode": "606060405260908060116000396000f30060606040526000357c01000000000000000000000000000000000000000000000000000000009004806360fe47b11460415780636d4ce63c14605257603f565b005b60506004803590602001506071565b005b605b600450607f565b6040518082815260200191505060405180910390f35b806000600050819055505b50565b60006000600050549050608d565b9056","symTab": {"set": {"functionDomain": [{"atStorageKey": "0","bytesUsed": "20","jsType": "Int","solidityType": "uint256"}],"functionArgs": ["x"],"functionHash": "60fe47b1","bytesUsed": "0","jsType": "Function","solidityType": "function(uint256) returns ()"},"get": {"functionDomain": [],"functionArgs": [],"functionHash": "6d4ce63c","bytesUsed": "0","jsType": "Function","functionReturns": {"atStorageKey": "0","bytesUsed": "20","jsType": "Int","solidityType": "uint256"},"solidityType": "function() returns (uint256)"},"storedData": {"atStorageKey": "0","bytesUsed": "20","jsType": "Int","solidityType": "uint256"}}}' 
   },
   'contracts' : {

   },
   'views' : {

   },
   'css' : {

   }, 
   'js' : {

   },
   'html' : {

   },
   'lib' : {

   },
   'node_modules' : {

   },
   'app.js' : { 

   },
   'gulpfile.js' : { 

   },
   'routes' : {

    }
}

var readdirpMock = function ( readdirObj ) {
    var traverse = require('traverse');
    
    var dirFilt = readdirObj.directoryFilter;
    var fileFilt = readdirObj.fileFilter;
 
    var filtered = traverse(mockedFileSystem).reduce(function (acc,x) {
        if (!this.isLeaf) {
            if (typeof dirFilt !== 'undefined' && !dirFilt(this)) this.delete;
        } else if (typeof fileFilt !== 'undefined' && !fileFilt(this.key)) this.delete;
        else (acc[this.key] = x);

        return acc;
    }, {});

    var flattened = traverse(filtered).reduce(function (acc, x) {
        if (this.isLeaf) acc[this.key] = x;
        return acc;
    }, {});

    var fsArray = Object.keys(flattened);
    console.log('\n\n fsArray: ' + JSON.stringify(fsArray));
    return es.readArray(fsArray)
        .pipe(through.obj(function (chunk, enc, callback) {
            var obj = {};
            obj[chunk.toString('utf8')] = flattened[chunk.toString('utf8')];

            this.push(obj);
            callback();
        }));
}

contractHelpers.__set__("readdirp", readdirpMock);

describe('Contract Helpers', function() {
  describe('#lookupAllJsonStream()', function() { 
      it('throws an error if something other json is emitted', function() {
         contractHelpers.lookupAllJsonStream()
           .on('data', function(data, callback) { 
               expect(minimatch(Object.keys(data),'*.+(json)')).to.be.true;
               })
           .on('error', function (err) { 
                  throw err;
              }
           );

      });

      it('has something from the meta directory', function() {
          expect(true).to.be(false);
      });

      it('has a key', function () {
          expect(true).to.be(false);
      });
  });
});
