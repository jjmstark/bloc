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

//api.setProfile("ethereum-frontier", apiURI, stratoVersion);                   
api.setProfile("strato-dev", apiURI);

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
  var password = req.body.password;

  console.log("body: " + JSON.stringify(req.body));

  //console.log("thePath: " + thePath);
    
  if (req.body.faucet === '1'){
    if ((typeof password === 'undefined') || (password === '')) { 
      res.send('password required for faucet call');
      return;
    }
    var seed = lw.keystore.generateRandomSeed();

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
      
    api.routes.faucet(store.addresses[0])
      .then(function(result) {
          res.send(store.addresses[0]);
      })
      .catch(function(err) { 
          res.send(err);
      });

  } else if(req.body.remove === '1'){

    if ((typeof password === 'undefined') || (password === '')) { 
      // TODO should really check password here?
      res.send('password required for removal call');
      return;
    }
    var newAddress = req.body.address;
    var fileName = path.join(thePath, newAddress + '.json');
    console.log("REMOVING: name: " + user + "  address = " + req.body.address)

    del([fileName]).then(function(paths){
      console.log('Deleted files and folders:\n', paths.join('\n'));
        fs.rmdir(thePath, function(err, files){
            console.log("user " + user + " gone because empty: "+err);
      });
    });

  } else if(req.body.register == '1'){
    console.log("registering address with device");

    var address = req.body.address;
    var token = req.body.token;

    var json = {"addresses":[address], "token":token};

    var fileName = path.join(thePath, address + '.json');
    console.log("filename: " + fileName)

    mkdirp(thePath, function (err) { 
        if (err) { console.err(err); res.send(err); }
        else { 
            fs.writeFile(fileName, JSON.stringify(json), function() { 
                res.send(address);
            });
        }
    });

  } else {
    if ((typeof password === 'undefined') || (password === '')) { 
      res.send('password required for key generation');
      return;
    }
    console.log("just registering name, no faucet called");

    var seed = lw.keystore.generateRandomSeed();
  
    var store = new lw.keystore(seed, password);
    store.generateNewAddress(password);

    var newAddress = store.addresses[0];

    var fileName = path.join(thePath, newAddress + '.json');
    
    mkdirp(thePath, function (err) { 
        if (err) { console.err(err); res.send(err); }
        else { 
            fs.writeFile(fileName, store.serialize(), function() { 
                res.send(newAddress);
            });
        }
    });
  }
});

// router.get('/:user/pending', cors(), function(req, res){

//     var user = req.params.user; 
//     console.log("finding pending transactions for user: " + user)

//     contractHelpers.pendingForUser(user)
//     .pipe(contractHelpers.collect())

//     .on('data', function (data) {
//       res.send(data);
//     })
// });

router.post('/:user/:address/send', cors(), function(req, res) {
    var password = req.body.password;
    var user = req.params.user;  
    var address = req.params.address;
    var toAddress = req.body.toAddress;
    var value = req.body.value;

    var found = false;

    var strVal = float2rat(value);

    var h1 = strVal.split('/')[0];
    var h2 = strVal.split('/')[1];

    if ((typeof password === 'undefined') || (password === '')) {
        res.send('password required');
        return;
    }

    if ((typeof toAddress === 'undefined') || (toAddress === '')) {
        res.send('toAddress required');
        return;
    }

    if ((typeof value === 'undefined') || (value === '')) {
        res.send('value required');
        return;
    }

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
              } catch (e) {
                  console.log("don't have the key!");
                  res.send("invalid address or incorrect password");     
                  return;
              }
  
              var valWei = units.convertEth(h1,h2).from("ether").to("wei");
              console.log(valWei);

              var valueTX = Transaction({"value" : valWei, 
                                         "gasLimit" : Int(21000),
                                         "gasPrice" : Int(50000000000)});
                 
              valueTX.send(privkeyFrom, toAddress)
                .then(function(txResult) {
                    console.log("transaction result: " + txResult.message);
                    res.send(JSON.stringify(valueTX));
                })
                
                .catch(function(err) { 
                    res.send(err);
                });                 
                
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

    if ((typeof password === 'undefined') || (password === '')) {
        res.send('password required');
        return;
    }
    
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
              } catch (e) {
                  console.log("don't have the key! error: " + e);
                  res.send('invalid address or incorrect password');
                  return;
              }

              var contractCreationTx = Solidity(src)
                    .then(function(solObj) {
                              console.log(JSON.stringify(solObj))
                              mkdirp(userContractPath + '/' + solObj.name, function (err) { 
                                if (err) { console.err(err); res.send(err); }
                                else {  
                                     console.log("success contractCreationTx, returning solObj: " + JSON.stringify(solObj)); 
                                     return solObj; 
                               }
                          });
                        return solObj;
                    })

                    .catch(function(err) { 
                        res.send(err);
                        return;
                    })

                    .then(function(solObj) {
                       mkdirp(metaPath + '/' + solObj.name, function (err) { 
                           if (err) { console.err(err); res.send(err); }
                           else {  
                               console.log("success metaCreationTx, returning solObj: " + JSON.stringify(solObj));
                               return solObj; 
                           }
                       });

                         return solObj;
                    })

                    .catch(function(err) { 
                        res.send(err);
                        return;
                    })
      
                    .then(function(solObj) {
                        console.log("attempting to upload now");
                        return Promise.join(solObj
              .construct()
                            .txParams({"gasLimit" : Int(31415920),"gasPrice" : Int(1)})
                        .callFrom(privkeyFrom), Promise.resolve(solObj) );
                    })

                  .catch(function(err) {
            console.log("error after upload!!!!");
          console.log("Error: " + err)
//                        res.send(err);
                        return;
                    })

                    .then(function(txResult)  {
                        var metaWithAddress = txResult[1];
                        metaWithAddress.address = txResult[0].account.address.toString();
                        console.log("txResult[0]: " + JSON.stringify(txResult[0]));

                        return metaWithAddress;
                    })
 
                    .then(function(solObj) {
                          var fileName = metaPath + '/' + solObj.name + '/' + solObj.address + '.json';
                          console.log("synchronously committing metadata to disk");
                          fs.writeFileSync(fileName, JSON.stringify(solObj));
        
                          return solObj;
                     })

                    .catch(function(err) { 
//                        res.send(err);
                        return;
                    })

                    .then(function(solObj) {
                          var fileName = userContractPath + '/' + solObj.name + '/' +  solObj.address + '.json';
                          fs.writeFile(fileName, JSON.stringify(solObj));
        
                          res.send(solObj.address);
                    })

                    .catch(function(err) { 
  //                      res.send(err);
                        return;
                    });                 

       })
      .on('end', function () {
           if (!found) res.send('invalid address or incorrect password');
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
    console.log("helo")
    
    contractHelpers.userKeysStream(user)
        .pipe(es.map(function (data,cb) {
          //console.log("data.addresses[0] == address: " + data.addresses[0] +"  "+ address)
          if (data.addresses[0] == address) {
            console.log("address found");
            found = true; cb(null,data); 
          }
          else{
            console.log("address does not exist for user");
            //res.send("address does not exist for user");
            //return;
            cb();
          } 
        }))
        .pipe(es.map(function(data, cb) {
          console.log(data)
          if (data.token) {
            console.log("actually called through device - saving in queue"); 
            cb(null, data)
          } else { 
        
           var privkeyFrom;
           try { 
                var store = new lw.keystore.deserialize(JSON.stringify(data));
                privkeyFrom = store.exportPrivateKey(address, password);
            } catch (e) {
              res.send("address not found or password incorrect");
            }

      cb(null, privkeyFrom);
    }
  }))
  .on('data', function(privkeyFrom) {
    console.log(privkeyFrom)
    // if(privkeyFrom.token){
    //     console.log("in token land")
    //     var date = new Date();
    //     var dt = date.getTime();
    //     var call = {
    //                 contractName: contractName, 
    //                 method: method,
    //                 args: args,
    //                 txArgs: {"gasLimit" : Int(31415920),"gasPrice" : Int(1)},
    //                 time: dt,
    //                 value: req.body.value,
    //                 message: req.body.message
    //               }
    //     var pp = path.join('app', 'pending');
    //     var filename = path.join(pp, address+"_"+dt+".json");
    //     mkdirp(pp, function (err) { 
    //       if (err) { console.err(err); res.send(err); }
    //         else { 
    //             console.log('path: ' + pp)
    //             console.log('filename: ' + filename)
    //             fs.writeFile(filename, JSON.stringify(call), function() { 
    //                 console.log("wrote: " + filename);
    //                 res.send("put transaction in queue for: " + address)
    //             });
    //         }
    //     });
      //} else {
        var fileName = path.join(metaPath,contractAddress+'.json');
        fs.readFile(fileName, function (err,data) {
          if(data == undefined){
            console.log("contract does not exist at that address: " + err);
            res.send("contract does not exist at that address");
            return;
          }
          var contractJson = JSON.parse(data);
          var contract = Solidity.attach(contractJson);
          contract.address = contractJson.address;
          var params = {"gasLimit" : Int(31415920),"gasPrice" : Int(1)};
          value = Math.max(0, value)
          if (value != undefined) {
              params.value = units.convertEth(value).from("ether").to("wei" );
              console.log("params.value: " + params.value);
          }
          console.log("trying to invoke contract")
          //console.log("methods: " + JSON.stringify(contract.state))
          if(contract.state[method] != undefined){
            var contractstate = contract.state[method](args).txParams(params);

            if(privkeyFrom.token){
              console.log("token land")

              var date = new Date();
              var dt = date.getTime();
              var pp = path.join('app', 'pending', address);
              var filename = path.join(pp, dt+".json");
              mkdirp(pp, function (err) { 
                if (err) { console.err(err); res.send(err); }
                  else { 
                      console.log('path: ' + pp)
                      console.log('filename: ' + filename)
                      var jj = JSON.stringify(contractHelpers.txToJSON(contractstate));
                      var callData =  {
                                        contractName: contractName, 
                                        method: method,
                                        args: args,
                                        txArgs: {"gasLimit" : Int(31415920),"gasPrice" : Int(1)},
                                        time: dt,
                                        value: req.body.value,
                                        message: req.body.message
                                      };
                      var allData = {
                                      "tx":contractHelpers.txToJSON(contractstate)
                                    , "time":dt
                                    , "contract": JSON.parse(contract.detach())
                                    , "call":callData
                                  };
                      console.log("to put in file: " + JSON.stringify(allData))
                      fs.writeFile(filename, JSON.stringify(allData), function() { 
                          console.log("wrote: " + filename);
                          res.send("put transaction in queue for: " + address)
                      });
                  }
              });
            } else {
              console.log("calling land")
              contractstate.callFrom(privkeyFrom)
               .then(function (txResult) {
                  console.log("txResult: " + txResult);
                  res.send("transaction returned: " + txResult);
               })
               .catch(function(err) { 
                  console.log("error calling contract: " + err)
                  res.send(err);
                  return;
                });
            }
          } else {
            console.log("contract " + contractName + " doesn't have method: " + method);
            res.send("contract " + contractName + " doesn't have method: " + method);
            return;
          } 
        })
     // }
    })
    .on('end', function () {
       if (!found){
        console.log('user not found: ' + user);
        res.send('user not found: ' + user);
       }
     })
  });

module.exports = router;
