#! /usr/bin/env node
var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var prompt = Promise.promisifyAll(require('prompt'));

var cmd = require('../lib/cmd.js');
var key = require('../lib/keygen');
var scaffold = require('../lib/scaffold.js');
var yamlConfig = require('../lib/yaml-config.js');

var compile = require('../lib/compile.js');
var upload = require('../lib/upload.js');
var codegen = require('../lib/codegen.js');

var api = require("blockapps-js");

function main (){
    var cmdArr = cmd.argv._;
    if (cmdArr[0] == "init") {
        // if (cmdArr[1] === undefined) { console.log("project name required"); break; }
        var scaffoldApp = require('../lib/prompt-schema.js').scaffoldApp;
        prompt.start();
        prompt.getAsync(scaffoldApp).then(function(result) {
            scaffold(result.appName);
            yamlConfig.writeYaml(result.appName + "/config.yaml", result);
        });

        return;
    }

    var config = yamlConfig.readYaml('config.yaml');
    api.query.serverURI = config.apiURL;

    var doScaffold = (cmd.argv.s !== undefined);

    switch(cmdArr[0]) {
    case 'compile':
        console.log("compiling sources");
        var solObjs;
        if (cmdArr[1] === undefined) {
            // compile all files
            var solSrcDir = path.normalize('./contracts');
            var srcFiles = fs.readdirSync(solSrcDir).filter(function(filename) {
                return path.extname(filename) === '.sol';
            });
            var solSrc = srcFiles.map(function (filename) {
                console.log(path.join(solSrcDir, filename));
                return fs.readFileSync(path.join(solSrcDir, filename)).toString()
            });

            solObjs = compile(solSrc,config.appName);
        }
        else if (cmdArr[1] && path.parse(cmdArr[1]).ext === '.sol') {
            // compile < filename >
            console.log('compiling single file: ' + cmdArr[1]);
            var contents = fs.readFileSync(cmdArr[1]);
            solObjs = compile([contents], config.appName);
        }

        if (doScaffold) {
            Promise.each(solObjs,codegen.writeHTML.bind(null, config.appName));
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
        
        var store = key.readKeystore();
        var address = store.addresses[0];

        var requestPassword = require('../lib/prompt-schema.js').requestPassword;
        prompt.start();
        prompt.getAsync(requestPassword).then(function(result) {
            var privkey = store.exportPrivateKey(address, result.password);
            return upload(contractName, privkey);
        }).then(function (solObjWAddr) {
            if (doScaffold) {
                codegen.writeJS(contractName, solObjWAddr);
            }
        });

        break;

    case 'genkey':
        var createPassword = require('../lib/prompt-schema.js').createPassword;
        prompt.start();
        prompt.getAsync(createPassword).get("password").then(key.generateKey);
        break;

    case 'register':
        var registerPassword = require('../lib/prompt-schema.js').registerPassword;
        prompt.start();
        prompt.getAsync(registerPassword).get("password").then(function(password) {
            var loginObj = {
                "email": config.email,
                "app": config.appName,
                "loginpass": password
            };
            var appObj = {
                "developer": config.developer,
                "appurl": config.appURL,
                "repourl": config.repo
            };
            return api.routes.register(loginObj, appObj);
        }).tap(function() {
            console.log("registered, confirm via email")
        });
        break;

    default:
        console.log("unrecognized command");
    }
}

if (require.main === module) {
    main();
}
