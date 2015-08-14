#! /usr/bin/env node

var main = function() {

    var sc = require('../lib/scaffold.js');  
    var cmd = require('../lib/cmd.js');
    var yamlConfig = require('../lib/yaml-config.js');
    var cmdArr = cmd.argv._;
    var compile = require('../lib/compile.js');
    var fs = require('fs');
    var prompt = require('prompt');
    var createPassword = require('../lib/prompt-schema.js').createPassword;
    var requestPassword = require('../lib/prompt-schema.js').requestPassword;
    var scaffoldApp = require('../lib/prompt-schema.js').scaffoldApp;
    var key = require('../lib/keygen');
    var request = require('request');
    var upload = require('../lib/upload.js');
    var register = require('../lib/register');    
   
    var scaffold = (cmd.argv.s !== undefined);
    switch(cmdArr[0]) {
    case 'compile': 
        console.log("compiling sources");
        if (cmdArr[1] === undefined) {
            // compile all files
            var config = yamlConfig.readYaml('config.yaml')
            var dir = fs.readdirSync('contracts').filter(function(t) { 
                var splitStr = t.split('.'); // maybe should use regex
                return splitStr[splitStr.length-1] == 'sol';
            }
                                                        );
            var dirPath = dir.map(function (t) { return 'contracts/' + t; });
            var solSrc = dirPath.map(function (t) { console.log(t); return fs.readFileSync(t).toString() });

            compile.compileSol(solSrc,config.apiURL,scaffold,config.appName);
        }
        else { 
            // compile < filename > 

        }
        break;

      case 'upload':
//          console.log("uploading sources");
        
//          var dir = fs.readdirSync('contracts').filter(function(t) { 
//                var splitStr = t.split('.'); // maybe should use regex
//                return splitStr[splitStr.length-1] == 'sol';
//              }
//            );

//          var dirPath = dir.map(function (t) { return 'contracts/' + t; });
//          var solSrc = dirPath.map(function (t) { console.log(t); return fs.readFileSync(t).toString() });
        var contractName = cmdArr[1];
        if (contractName === undefined) {
            console.log("contract name required");
            break;
        }
	var config = yamlConfig.readYaml('config.yaml');
        var store = key.readKeystore();
        var address = store.addresses[0];

        prompt.start();
        prompt.get(requestPassword, function(err,result) {
            upload.upload(
                contractName, config.apiURL, config.appName, scaffold,
                store.exportPrivateKey(address, result.password)
            );
        });

        break;

      case 'genkey':
          var confURL = yamlConfig.readYaml('config.yaml').apiURL;
          prompt.start();
          prompt.get(createPassword, function (err,result) {
            key.generateKey(result.password, confURL+'/eth/v1.0/faucet');
          });

          break;

      case 'register':
          var config = yamlConfig.readYaml('config.yaml');
          register.registerApp(config,function (res) { console.log(res + ": registered, confirm via email"); });
          break;

      case 'init':
         // if (cmdArr[1] === undefined) { console.log("project name required"); break; }
         
         prompt.start();
         prompt.get(scaffoldApp, function(err,result) {
            sc.createDirScaffold(result.appName); 
            yamlConfig.writeYaml(result.appName + "/config.yaml",result);           
          });
         
         break;
          
      default:
         console.log("unrecognized command");
    }
}

if (require.main === module) {
    main();
}
