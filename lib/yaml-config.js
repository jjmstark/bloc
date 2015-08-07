
var yaml = require('js-yaml');
var fs   = require('fs');

module.exports.defaultConfigObj = { 
  apiURL: 'http://stablenet.blockapps.net',
  appName: 'newproj',
  appURL: 'http://google.com',
  developer: 'kjl',
  email: 'kieren1@gmail.com',
  repo: '', 
}

module.exports.writeYaml = function(filename, obj) {
  fs.writeFileSync(filename, yaml.safeDump(obj)); 
}

module.exports.readYaml = function(filename) {
  return yaml.safeLoad(fs.readFileSync(filename)); 
}
