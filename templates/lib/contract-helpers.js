var path = require('path');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));                                                                     
var yaml = require('js-yaml');

var projectDir = path.normalize(path.join(__dirname, '..'));
// var configFile = yaml.safeLoad(fs.readFileSync('config.yaml')); // <---- depracate this soon

/* for streaming functionality */
var readdirp = require('readdirp');
var minimatch = require("minimatch");
var through = require('through2');

function contractLookup(contractName) {
    var contractNameSol = contractName + '.sol';
    return fs.statAsync(path.join(projectDir, 'contracts/'+contractNameSol)).then(
         function (res) {
             console.log("contract found, checking if it has been compiled next");

             return { contractExists : true,
                      contractName : contractName,
                      contractNameSol : contractNameSol,
                      serverURI : configFile.apiURL };
         },
         function (err) {
             console.log("contract not found, err: " + err);
             throw Error(
                      JSON.stringify(
                        {  contractExists : false,
                           contractName : contractName,
                           contractNameSol : contractNameSol,
                           contractNotExistMessage : " doesn't exist yet. Maybe you should write it!",
                           serverURI : configFile.apiURL }
                      )
                   );
          }
     );
}

function contractJSONLookup(contractObj) {
    var contractName = contractObj.contractName;

    return fs.readFileAsync(path.join(projectDir, 'meta/'+contractName+'.json')).then(
        function(fileData) {
             console.log("contract has been compiled");
             contractObj.contractIsCompiled = true;
             contractObj.contractIsCompiledMessage = " has been compiled!";

             contractObj.contractData = JSON.parse(fileData);
             contractObj.contractDataString = fileData;

             var symtab = contractObj.contractData.symTab;

             var funcs = Object.keys(symtab).filter(function(name) {
                return symtab[name]["jsType"] === "Function";
             });

             contractObj.funcs = funcs.map(function(funcName) {
                 return {
                     name: funcName,
                     args: symtab[funcName].functionArgs.map(function(arg){
                           return {argName: arg};
                    })};
             });

             if (typeof contractObj.contractData.address !== 'undefined')
                 contractObj.contractDataMessage = "contract has been uploaded with address: " + contractObj.contractData.address;

             return contractObj;
        },
        function (err) {
             console.log("contract has not been compiled: " + err);
             contractObj.contractIsCompiled = false;
             contractObj.contractIsNotCompiledMessage = " has not yet been compiled! Compile it with bloc compile";
             throw Error(JSON.stringify(contractObj));
        }
    );
}

function keyJSONLookup(contractObj) {
   return fs.readFileAsync(path.join(projectDir, 'key.json')).then(
        function(fileData) {
            console.log("key present");
            contractObj.hasKey = true;
            contractObj.developerKeystore = JSON.parse(fileData);
            contractObj.globalKeystore = contractObj.developerKeystore;
            contractObj.walletAddress = contractObj.developerKeystore.addresses[0];
            contractObj.developerKeystoreString = fileData;
            contractObj.globalKeystoreString = fileData;
            contractObj.contractUploadMessage = " has not been uploaded yet. Upload it with bloc upload " + contractObj.contractName;

            return contractObj;
        },
        function (err) {
             console.log("key missing: " + err);
             contractObj.hasKey = false;
             contractObj.generateKeyMessage = " You don't yet have a wallet. Use bloc genkey to create one. You ne\
ed one to upload and run contracts!";

             throw Error(JSON.stringify(contractObj));
         }

    );
}


function keyLookup() {
    return fs.readFileAsync(path.join(projectDir, 'key.json')).then(
        function(fileData) {
            console.log("key present");
            var dataObj = {};
            dataObj.hasKey = true;
            dataObj.developerKeystore = JSON.parse(fileData);
            dataObj.globalKeystore = dataObj.developerKeystore;
            dataObj.walletAddress = dataObj.developerKeystore.addresses[0];

            dataObj.developerKeystoreString = fileData;
            dataObj.globalKeystoreString = fileData;

            return dataObj;
        },
        function (err) {
             var dataObj = {};
             console.log("key missing: " + err);
             dataObj.hasKey = false;
             dataObj.generateKeyMessage = " You don't yet have a wallet. Use bloc genkey to create one. You need one to upload and run contracts!";

             throw Error(JSON.stringify(dataObj));
         }

    );
}

function keysLookup() {
    return readdirp( { root: path.join(projectDir), fileFilter: 'key*.+(json)'})
        .on('warn', function (err) { console.error('warning: ', err); })
        .on('error', function (err) { console.error('error: ', err); })
        .on('end', function (err) { console.log('looked up keys successfully!'); });
}

/* all stream based now */

/* 
  global state is just a flattened view of the file system, and is represented as: 

  { 
    fileName1: fileDataString1
    fileName2: fileDataString2
  }
*/

function lookupAllJsonStream() {
    return readdirp( { root: path.join(projectDir), fileFilter: function (path) {
                return minimatch(path,'*.+(json)');
            }
        })
        .on('warn', function (err) { console.error('warning: ', err); })
        .on('error', function (err) { console.error('error: ', err); })
        .on('end', function (err) { console.log('looked up all json successfully!'); });
}

function lookupKeysStream() {
    return readdirp( { root: path.join(projectDir), fileFilter: 'key*.+(json)'})
        .on('warn', function (err) { console.error('warning: ', err); })
        .on('error', function (err) { console.error('error: ', err); })
        .on('end', function (err) { console.log('looked up keys successfully!'); });
}

function lookupContractMetaStream() {
    return readdirp( { root: path.join(projectDir), fileFilter: '*.+(json)', directoryFilter: 'meta'})
        .on('warn', function (err) { console.error('warning: ', err); })
        .on('error', function (err) { console.error('error: ', err); })
        .on('end', function (err) { console.log('looked up contracts successfully!'); });
}

function lookupConfigStream() {
    return readdirp( { root: path.join(projectDir), fileFilter: 'config.yaml'})
        .on('warn', function (err) { console.error('warning: ', err); })
        .on('error', function (err) { console.error('error: ', err); })
        .on('end', function (err) { console.log('looked up config successfully!'); });
}

function filterContractNameStream(contractName) {
    
}

function filterKeysStream() {

}

module.exports  = {
  contractLookup : contractLookup,
  contractJSONLookup : contractJSONLookup,
  keyJSONLookup : keyJSONLookup,
  keyLookup : keyLookup,
  lookupAllJsonStream : lookupAllJsonStream,
  lookupKeysStream : lookupKeysStream,
  lookupConfigStream : lookupConfigStream,
  filterContractNameStream :   filterContractNameStream,
  filterKeysStream :  filterKeysStream
};
