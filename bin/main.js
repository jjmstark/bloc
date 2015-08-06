

var main = function() {
    var sc = require('../lib/scaffold.js');  
    var cmd = require('../lib/cmd.js');
    var yamlConfig = require('../lib/yaml-config.js');
    var cmdArr = cmd.argv._;
    var compile = require('../lib/compile.js');
    var fs = require('fs');

    // handle command line args
    switch(cmdArr[0]) {
      case 'compile': 
          console.log("compiling sources");
          if (cmdArr[1] === undefined) {
          // compile all files
            var confURL = yamlConfig.readYaml('config.yaml').apiURL;
            var dir = fs.readdirSync('contracts');
            var dirPath = dir.map(function (t) { return 'contracts/' + t; });
            var solSrc = dirPath.map(function (t) { console.log(t); return fs.readFileSync(t).toString() });

            compile.compile(solSrc,confURL+'/solc',function (t) { console.log(t) });
          } else { 
 
          }
          break;
      case 'upload':
          console.log("upload");
          break;
      default:
          sc.createDirScaffold(cmdArr[0]);
          yamlConfig.defaultConfigObj.appName = cmdArr[0];
          yamlConfig.writeYaml(cmdArr[0] + "/config.yaml",yamlConfig.defaultConfigObj);
          // code scaffolding
    }
}

if (require.main === module) {
    main();
}
