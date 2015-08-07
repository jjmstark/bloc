

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
    var key = require('../lib/keygen');
    var request = require('request');
  //  var upload = require('../lib/upload.js');
    var register = require('../lib/register');    
   
    switch(cmdArr[0]) {
      case 'compile': 
          console.log("compiling sources");
          if (cmdArr[1] === undefined) {
          // compile all files
            var confURL = yamlConfig.readYaml('config.yaml').apiURL;
            var dir = fs.readdirSync('contracts');
            var dirPath = dir.map(function (t) { return 'contracts/' + t; });
            var solSrc = dirPath.map(function (t) { console.log(t); return fs.readFileSync(t).toString() });

            compile.compileSol(solSrc,confURL+'/solc',function (t) { compile.writeContractJSON(t) });
          } else { 
         // compile < filename > 

          }
          break;

      case 'upload':
          console.log("uploading sources");
          var confURL = yamlConfig.readYaml('config.yaml').apiURL;
          var dir = fs.readdirSync('contracts');
          var dirPath = dir.map(function (t) { return 'contracts/' + t; });
          var solSrc = dirPath.map(function (t) { console.log(t); return fs.readFileSync(t).toString() });
   
          prompt.start();
          prompt.get(requestPassword, function(err,result) {
            var store = key.readKeystore();
            upload.upload(solSrc,confURL,store.exportPrivateKey(store.addresses[0],result.password));
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
          register.registerApp(config,function (res) { console.log(res); });
          break;

      case 'init':
         if (cmdArr[1] === undefined) { console.log("project name required"); break; }
         sc.createDirScaffold(cmdArr[1]);
         yamlConfig.defaultConfigObj.appName = cmdArr[1]; // use prompt to scaffold full opcp
         yamlConfig.writeYaml(cmdArr[1] + "/config.yaml",yamlConfig.defaultConfigObj);
         break;
          
      default:
         console.log("unrecognized command");
    }
}

if (require.main === module) {
    main();
}
