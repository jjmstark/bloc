

var main = function() {
    var sc = require('../lib/scaffold.js');  
    var cmd = require('../lib/cmd.js');
    var yamlConfig = require('../lib/yaml-config.js');
    var cmdArr = cmd.argv._;
    var compile = require('../lib/compile.js');

    // handle command line args
    switch(cmdArr[0]) {
      case 'compile': 
          console.log("compile");
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

  compile.compile('contract f {}', 'http://stablenet.blockapps.net/solc');
}

if (require.main === module) {
    main();
}
