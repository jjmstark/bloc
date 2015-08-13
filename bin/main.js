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
   
    switch(cmdArr[0]) {
      case 'compile': 
          console.log("compiling sources");
          if (cmdArr[1] === undefined) {
          // compile all files
            var confURL = yamlConfig.readYaml('config.yaml').apiURL;
            var dir = fs.readdirSync('contracts').filter(function(t) { 
                var splitStr = t.split('.'); // maybe should use regex
                return splitStr[splitStr.length-1] == 'sol';
              }
            );
            var dirPath = dir.map(function (t) { return 'contracts/' + t; });
            var solSrc = dirPath.map(function (t) { console.log(t); return fs.readFileSync(t).toString() });

            var config = yamlConfig.readYaml('config.yaml');
            if (cmd.argv.s !== undefined) { compile.compileSol(solSrc,confURL+'/solc',function (t) { compile.writeContractJSON(t,true,config.appName) }); }
            else { compile.compileSol(solSrc,confURL+'/solc',function (t) { compile.writeContractJSON(t,false,config.appName) }); }
          } else { 
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

          if (cmdArr[1] === undefined) { console.log("contract name required"); break; }
	        var confURL = yamlConfig.readYaml('config.yaml').apiURL;
       	  var splitStr = cmdArr[1].split('.');

	        if (splitStr[splitStr.length-1] != 'sol') { console.log("incorrect extension, expecting '.sol'"); return; }

          var solSrc = fs.readFileSync(cmdArr[1]).toString();
        
          prompt.start();
          prompt.get(requestPassword, function(err,result) {
            var store = key.readKeystore();
            upload.upload([solSrc],confURL,store.exportPrivateKey(store.addresses[0],result.password));
          });

          break;

      case 'genkey':
          var confURL = yamlConfig.readYaml('config.yaml').apiURL;
          prompt.start();
          prompt.get(createPassword, function (err,result) {
            key.generateKey(result.password, confURL+'/faucet');
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
