var express = require('express');
var cors = require('cors');
var router = express.Router();
var contractHelpers = require('../lib/contract-helpers.js');
var lw = require('eth-lightwallet');

var es = require('event-stream');
var del = require('del');
var rimraf = require('rimraf');
var vinylFs  = require( 'vinyl-fs' );
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs')); 
var mkdirp = Promise.promisifyAll(require('mkdirp'));

var path = require('path');
var yaml = require('js-yaml');

var config = yaml.safeLoad(fs.readFileSync('config.yaml'));
var apiURI = config.apiURL;

var api = require('blockapps-js');
var stratoVersion = "1.1";

api.setProfile("ethereum-frontier", apiURI, stratoVersion);                   

var Solidity = require('blockapps-js').Solidity;
var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();




var Transaction = api.ethbase.Transaction;
var units = api.ethbase.Units;
var Int = api.ethbase.Int;
var ethValue = api.ethbase.Units.ethValue;

function float2rat(x) {
    var tolerance = 1.0E-6;
    var h1=1; var h2=0;
    var k1=0; var k2=1;
    var b = x;
    do {
        var a = Math.floor(b);
        var aux = h1; h1 = a*h1+h2; h2 = aux;
        aux = k1; k1 = a*k1+k2; k2 = aux;
        b = 1/(b-a);
    } while (Math.abs(x-h1/k1) > x*tolerance);
    
    return h1+"/"+k1;
}

router.get('/', cors(), function(req, res) {
    contractHelpers.userNameStream()
      .pipe(contractHelpers.collect())
      .on('data', function(data) {
          res.send(JSON.stringify(data));
       });
});

router.get('/:user', cors(), function(req, res) {
    var user = req.params.user;

    contractHelpers.userKeysStream(user)
      .pipe( es.map( function (data, cb) { 
          cb(null, data.addresses[0]);
        }))
      .pipe(contractHelpers.collect())
      .on('data', function(data) {
          res.send(JSON.stringify(data));
       });
});

/* generate key, and hit faucet */
router.post('/:user', cors(), function(req, res) {

  var user = req.params.user;
  var thePath = path.join('app', 'users', user);

  console.log("thePath: " + thePath);
    
  if (req.body.faucet === '1'){
    var seed = lw.keystore.generateRandomSeed();
    var password = req.body.password;

    var store = new lw.keystore(seed, password);
    store.generateNewAddress(password);

    var fileName = path.join(thePath, store.addresses[0] + '.json');
      
    mkdirp(thePath, function (err) { 
        if (err) { console.err(err); res.send(err); }
        else { 
            fs.writeFile(fileName, store.serialize(), function() { 
                console.log("wrote: " + fileName);
            });
        }
    });
   
    api.query.serverURI =  process.env.API || apiURI;
    console.log("hitting faucet for " + store.addresses[0]);
      
    api.routes.faucet(store.addresses[0]).then(function(result) {
                res.send(store.addresses[0]);
      });
      

  } else if(req.body.remove === '1'){
    var newAddress = req.body.address;

    var fileName = path.join(thePath, newAddress + '.json');
    console.log("REMOVING: name: " + user + "  address = " + req.body.address)

    del([fileName]).then(function(paths){
      console.log('Deleted files and folders:\n', paths.join('\n'));
        fs.rmdir(thePath, function(err, files){
            console.log("user " + user + " gone because empty: "+err);
      });
    });

  } else {
    console.log("just registering name, no faucet called");


    var seed = lw.keystore.generateRandomSeed();
    var password = req.body.password;

    var store = new lw.keystore(seed, password);
    store.generateNewAddress(password);

    var newAddress = store.addresses[0];

    var fileName = path.join(thePath, newAddress + '.json');
    
    mkdirp(thePath, function (err) { 
        if (err) { console.err(err); res.send(err); }
        else { 
            fs.writeFile(fileName, JSON.stringify({ "addresses":[ newAddress ] }), function() { 
                res.send(newAddress);
            });
        }
    });
  }
});

router.post('/:user/:address/send', cors(), function(req, res) {
    var password = req.body.password;
    var user = req.params.user;  
    var address = req.params.address;
    var toAddress = req.body.toAddress;
    var value = req.body.value;

    var found = false;

    var strVal = float2rat(value)

    var h1 = strVal.split('/')[0]
    var h2 = strVal.split('/')[1]

    contractHelpers.userKeysStream(user)
      .pipe(es.map(function (data,cb) {
                      if (data.addresses[0] == address) cb(null,data);
                      else cb();
                   }))
      .on('data', function (data) {
          
              api.query.serverURI =  process.env.API || apiURI;               
              found = true; 
             
              try { 
                var store = new lw.keystore.deserialize(JSON.stringify(data));
                var privkeyFrom = store.exportPrivateKey(address, password);

                var valWei = units.convertEth(h1,h2).from("ether").to("wei")
                console.log(valWei)

                var valueTX = Transaction({"value" : valWei, 
                                           "gasLimit" : Int(21000),
                                           "gasPrice" : Int(50000000000)});
                 
                valueTX.send(privkeyFrom, toAddress).then(function(txResult) {
                  console.log("transaction result: " + txResult.message);
                  res.send(JSON.stringify(valueTX));
                });                 
                
              } catch (e) {
                console.log("don't have the key!")
              }
       })
      .on('end', function () {
           if (!found) res.send('address not found');
       });
});

/* create contract from source */
router.options('/:user/:address/contract', cors()); // enable pre-flight request for DELETE request
router.post('/:user/:address/contract', cors(), function(req, res) {
    var user = req.params.user;  
    var address = req.params.address;

    var password = req.body.password;
    var src = req.body.src;

    var found = false;
    var userContractPath = path.join('app', 'users', user, 'contracts');
    var contractPath = path.join('app', 'contracts');     
    var metaPath = path.join('app','meta');
    
    console.log("+++++++++++++++++++++++++++++++++++++");
    //console.log(req.body.password);
    //console.log(req.body);

    contractHelpers.userKeysStream(user)
      .pipe(es.map(function (data,cb) {
                      if (data.addresses[0] == address) cb(null,data);
                      else cb();
                   }))
      .on('data', function (data) {
              console.log("data is: " + data.addresses[0])
              api.query.serverURI =  process.env.API || apiURI;               
              found = true; 
             
              try { 
                  var store = new lw.keystore.deserialize(JSON.stringify(data));
                  var privkeyFrom = store.exportPrivateKey(address, password);

                  console.log("About to upload contract")

                  var contractCreationTx = Solidity(src)
                    .then(function(solObj) {
                              console.log(JSON.stringify(solObj))
                              mkdirp(userContractPath + '/' + solObj.name, function (err) { 
                                if (err) { console.err(err); res.send(err); }
                                else {  console.log("success contractCreationTx, returning solObj: " + JSON.stringify(solObj)); 
                                     return solObj; }
                               });

                   return solObj;
                  })

                  .then(function(solObj) {
                     mkdirp(metaPath + '/' + solObj.name, function (err) { 
                              if (err) { console.err(err); res.send(err); }
                              else {  console.log("success metaCreationTx, returning solObj: " + JSON.stringify(solObj)); 
                                     return solObj; }
              });

             return solObj;
           })
      
          .then(function(solObj) {
             return Promise.join(solObj.newContract(privkeyFrom,{"gasLimit" : Int(3141592),"gasPrice" : Int(1)}), Promise.resolve(solObj));
           })

           .then(function(txResult)  {
            var metaWithAddress = txResult[1];
            metaWithAddress.address = txResult[0].account.address.toString();
            console.log("txResult[0]: " + JSON.stringify(txResult[0]));
//          console.log("txResult[1]: " + JSON.stringify(txResult[1]));
                                                          
           return metaWithAddress;
          })
          .then(function(solObj) {
                          var fileName = metaPath + '/' + solObj.name + '/' + solObj.address + '.json';
                          console.log("synchronously committing metadata to disk");
                          fs.writeFileSync(fileName, JSON.stringify(solObj));
        
                          return solObj;
          })

          .then(function(solObj) {
                          var fileName = userContractPath + '/' + solObj.name + '/' +  solObj.address + '.json';
                          fs.writeFile(fileName, JSON.stringify(solObj));
        
                          res.send(solObj.address);
          });
                 
//                 res.send("contract creation in progress");
              } catch (e) {
                  console.log("don't have the key! error: " + e);
              }
       })
      .on('end', function () {
           if (!found) res.send('contract creation failed');
       });
});

/*
   arguments JSON object
   {
     contract: contractName,
     password: yourPassword,
     method: theMethod,
     args: {
        namedArg1: val1,
  namedArg2: val2,
  ..
        }
    }
*/
router.options('/:user/:address/contract/:contractName/:contractAddress/call', cors()); // enable pre-flight request for POST request
router.post('/:user/:address/contract/:contractName/:contractAddress/call', jsonParser, cors(), function(req, res) {
    var password = req.body.password;
    var method = req.body.method;
    var args = req.body.args;
    var value = req.body.value;
    
    var contractName = req.params.contractName;
    var contractAddress = req.params.contractAddress;
    var address = req.params.address;
    var user = req.params.user;
  
    var found = false;

    var userContractPath = path.join('app', 'users', user, 'contracts', contractName);
    var metaPath = path.join('app', 'meta', contractName);

    console.log('args: ' + JSON.stringify(args));
    console.log('method: ' + method);
    
    contractHelpers.userKeysStream(user)
        .pipe(es.map(function (data,cb) {
          if (data.addresses[0] == address) { found = true; cb(null,data); }
          else cb();
        }))

        .pipe(es.map(function(data, cb) {
           var privkeyFrom;
           try { 
                var store = new lw.keystore.deserialize(JSON.stringify(data));
                privkeyFrom = store.exportPrivateKey(address, password);
            } catch (e) {
              res.send("address not found or password incorrect");
            }

      cb(null, privkeyFrom);
  }))

  .on('data', function(privkeyFrom) {
      var fileName = path.join(metaPath,contractAddress+'.json');
      
      fs.readFile(fileName, function (err,data) {
                //console.log("err: " + err);
                //console.log("contract: " + data);

                var contractJson = JSON.parse(data);
                var contract = Solidity.attach(JSON.parse(data));

                contract.address = contractJson.address;

                var params = {"gasLimit" : Int(1000000),"gasPrice" : Int(50000000000)};

                value = Math.max(0, value)
                if (value != undefined) {
                    params.value = units.convertEth(value).from("ether").to("wei" );
                    console.log("params.value: " + params.value);
                }

                try {
                    console.log("trying to invoke contract")
                    contract.state[method](args)
                       .txParams(params).callFrom(privkeyFrom)
                       .then(function (txResult) {
                          console.log("txResult: " + txResult);
                          res.send("transaction returned: " + txResult);
                       });
                    } catch (e) { res.send('method call failed'); }
      });
  })

  .on('end', function () {
           if (!found) res.send('method call failed');
        });
});

module.exports = router;
