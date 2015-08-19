var path = require('path');
var blocRootDir = path.normalize(path.join(__dirname, '..'));
var yamlConfig = require(path.join(blocRootDir, 'lib', 'yaml-config.js'));
var abi = require('./abi.js');
var fs = require('fs');
var Mustache = require('mustache');

// makes an HTML file with submit buttons for each function name,
// and text inputs labeled with the types of the arguments to the functions.
// It allows you to call functions and loads the result (return value) and change to storage in json
// also scaffolds a login demo and a register new user demo
// login or register!

// note: returns a string - we're doing code generation.
// wish I were using Haskell / Purescript - could be much more 'combinator focused', 'nested'
// composable widgets FTW!

var writeHTML = function(xABI,appName) {
    var contractName = Object.keys(xABI)[0];
    var symtab = xABI[contractName];
    var funcs = Object.keys(symtab).filter(function(name) {
        return symtab[name]["jsType"] === "Function";
    });
    var templateString = fs.readFileSync(path.join(blocRootDir, 'templates', 'html', 'contract.html.template')).toString();
    var inflatedHTML = Mustache.render(templateString, {
        appName: appName,
        staticServer: 'hacknet.blockapps.net',
        contractName: contractName,
        funcs: funcs.map(function(funcName){
            // mustache style. (should replace with one the better template engines)
            return {
                name: funcName,
                args: symtab[funcName].functionArgs.map(function(arg){
                    return {argName: arg};
                })
            };
        }),
    });
    console.log('writing html/' + contractName + '.html');
    fs.writeFileSync('html/' + contractName + '.html', inflatedHTML);
};

var writeJS = function(confURL, contractName, address, xABI, appName, privkey) {
    var symtab = xABI[contractName];
    var funcs = Object.keys(symtab).filter(function(name){
        return symtab[name]["jsType"] == "Function";
    });
    var templateString = fs.readFileSync(path.join(blocRootDir, 'templates', 'js', 'contract.js.template')).toString();
    var inflatedJS = Mustache.render(templateString, {
        contractName: contractName,
        address: address,
        confURL: yamlConfig.readYaml('config.yaml').apiURL,
        xAbiString: JSON.stringify(xABI),
        funcs: funcs.map(function(funcName) {
            return {
                name: funcName,
                args: JSON.stringify(symtab[funcName].functionArgs)
            }
        })
     });
    console.log('writing js/' + contractName + '.js');
    fs.writeFileSync('js/' + contractName + '.js', inflatedJS);
};
var writeCSS = function(contractJSON)  {

}

module.exports = {
  writeHTML : writeHTML,
  writeJS : writeJS,
  writeCSS : writeCSS,
};
