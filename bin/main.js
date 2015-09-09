#! /usr/bin/env node

var main = function() {

    var sc = require('../lib/scaffold.js');
    var cmd = require('../lib/cmd.js');
    var yamlConfig = require('../lib/yaml-config.js');
    var cmdArr = cmd.argv._;
    var compile = require('../lib/compile.js');
    var fs = require('fs');
    var path = require('path');
    var prompt = require('prompt');
    var promptSchema = require('../lib/prompt-schema.js');
    var createPassword = require('../lib/prompt-schema.js').createPassword;
    var requestPassword = require('../lib/prompt-schema.js').requestPassword;
    var transfer = require('../lib/prompt-schema.js').transfer;
    var confirmTransfer = require('../lib/prompt-schema.js').confirmTransfer;
    var scaffoldApp = require('../lib/prompt-schema.js').scaffoldApp;
    var key = require('../lib/keygen');
    var request = require('request');
    var upload = require('../lib/upload.js');
    var register = require('../lib/register.js');

    var scaffold = (cmd.argv.s !== undefined);
    switch(cmdArr[0]) {
    case 'compile':
        console.log("compiling sources");
        if (cmdArr[1] === undefined) {
            // compile all files
            var solSrcDir = path.normalize('./contracts');
            var config = yamlConfig.readYaml('config.yaml')
            var srcFiles = fs.readdirSync(solSrcDir).filter(function(filename) {
                return path.extname(filename) === '.sol';
            });
            var solSrc = srcFiles.map(function (filename) {
                console.log(path.join(solSrcDir, filename));
                return fs.readFileSync(path.join(solSrcDir, filename)).toString()
            });

            compile.compileSol(solSrc,config.apiURL,scaffold,config.appName);
        }
        else if (cmdArr[1] && path.parse(cmdArr[1]).ext === '.sol') {
            // compile < filename >
            console.log('compiling single file: ' + cmdArr[1]);
            try {
                console.log(cmdArr[1])
                var config = yamlConfig.readYaml('config.yaml')
                var contents = fs.readFileSync(cmdArr[1]);
                compile.compileSol([contents], config.apiURL, scaffold, config.appName);
            } catch (e) {
                console.error(e);
            }
        }
        break;

      case 'upload':
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
         prompt.start();
         prompt.get(scaffoldApp, function(err,result) {
            sc.createDirScaffold(result.appName);
            yamlConfig.writeYaml(result.appName + "/config.yaml", result);
          });

      case 'send':
         prompt.start();
         prompt.get(transfer, function(err,result) {
           prompt.get(promptSchema.confirmTransfer(result), function(err2, result2) {
             
           });
         });

         break;

      default:
         console.log("unrecognized command");
    }
}

if (require.main === module) {
    main();
}
