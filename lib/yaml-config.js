
var yaml = require('js-yaml');
var fs   = require('fs');

var defaultConfigObj = { 
  apiURL: 'http://hacknet.blockapps.net',
  appName: 'newproj',
  appURL: 'http://google.com',
  developer: 'kjl',
  email: 'kieren1@gmail.com',
  repo: '',
  transferGasLimit: 21000, 
  contractGasLimit: 10000000
}

var writeYaml = function(filename, obj) {
  fs.writeFileSync(filename, yaml.safeDump(obj)); 
}

var readYaml = function(filename) {
  return yaml.safeLoad(fs.readFileSync(filename)); 
}

module.exports = (function () {
  return {
    defaultConfigObj : defaultConfigObj,
    writeYaml : writeYaml,
    readYaml : readYaml
  };
})();
