var express = require('express');
var exphbs = require('express-handlebars');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var path = require('path');
/*
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
*/

var home = require('./routes/home.js');
var login = require('./routes/login.js');
var contract = require('./routes/contract.js');

var blocRootDir = path.normalize(path.join(__dirname, '..'));
var yamlConfig = require(path.join(blocRootDir, 'lib', 'yaml-config.js'));
var configFile = yamlConfig.readYaml('config.yaml');

var app = express();

app.engine('.hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());

app.use(session({resave: true, 
                 saveUninitialized: true,
                 secret: 'session-to-track-global-wallet-pass-in-memory', 
                 cookie: { maxAge: 60000 }}));

app.use('/', home);
app.use('/login', login);
app.use('/contracts', contract);
app.use('/css', express.static('css'));

/*
function contractLookup(contractName) {
    var contractNameSol = contractName + '.sol';
    return fs.statAsync(path.join(__dirname, 'contracts/'+contractNameSol)).then(
         function (res) {
             console.log("contract found, checking if it has been compiled next"); 
              
             return { contractExists : true, 
                      contractName : contractName,
                      contractNameSol : contractNameSol,
                      serverURI : configFile.apiURL }; 
         },
         function (err) { 
             console.log("contract not found, err: " + err); 
             throw Error(
                      JSON.stringify(
                        {  contractExists : false, 
                           contractName : contractName, 
                           contractNameSol : contractNameSol,
                           contractNotExistMessage : " doesn't exist yet. Maybe you should write it!",
                           serverURI : configFile.apiURL }
                      )
                   ); 
          } 
     );        
}

function contractJSONLookup(contractObj) {
    var contractName = contractObj.contractName;

    return fs.readFileAsync(path.join(__dirname, 'meta/'+contractName+'.json')).then(
        function(fileData) {
             console.log("contract has been compiled"); 
             contractObj.contractIsCompiled = true;
             contractObj.contractIsCompiledMessage = " has been compiled!";

             contractObj.contractData = JSON.parse(fileData);
             contractObj.contractDataString = fileData;

             var symtab = contractObj.contractData.symTab;

             var funcs = Object.keys(symtab).filter(function(name) {
                return symtab[name]["jsType"] === "Function";
             });

             contractObj.funcs = funcs.map(function(funcName) {
                 return {
                     name: funcName,
                     args: symtab[funcName].functionArgs.map(function(arg){
                           return {argName: arg};
                    })};
             });

             if (typeof contractObj.contractData.address !== 'undefined')  
                 contractObj.contractDataMessage = "contract has been uploaded with address: " + contractObj.contractData.address;

             return contractObj;
        }, 
        function (err) { 
             console.log("contract has not been compiled: " + err); 
             contractObj.contractIsCompiled = false;
             contractObj.contractIsNotCompiledMessage = " has not yet been compiled! Compile it with bloc compile!";
             throw Error(JSON.stringify(contractObj)); 
        } 
    );
}

function keyJSONLookup(contractObj) {
    return fs.readFileAsync(path.join(__dirname, 'key.json')).then(
        function(fileData) {
            console.log("key present"); 
            contractObj.hasKey = true;
            contractObj.developerKeystore = JSON.parse(fileData);
            contractObj.globalKeystore = contractObj.developerKeystore;
            contractObj.walletAddress = contractObj.developerKeystore.addresses[0];
            
            contractObj.developerKeystoreString = fileData;
            contractObj.globalKeystoreString = fileData;
            contractObj.contractUploadMessage = " has not been uploaded yet. Upload it with bloc upload " + contractObj.contractNameSol;  

            return contractObj;
        }, 
        function (err) { 
             console.log("key missing: " + err); 
             contractObj.hasKey = false;
             contractObj.generateKeyMessage = " You don't yet have a wallet. Use bloc genkey to create one. You need one to upload and run contracts!"

             throw Error(JSON.stringify(contractObj)); 
         } 

    );
}
*/
/*
app.get('/', function (req, res) {
  res.render('Landing', 
              { globalPassword : globalPassword,
                isLoggedInMessage : "Welcome to BlockApps' landing page! You are logged in and can sign transactions",
                isNotLoggedInMessage : "Welcome to BlockApps' landing page! You are not logged in, and need to do so to sign transactions",
                title : "Welcome to BlockApps!" }       
             );
});


app.post('/login', function (req, res) {
  globalPassword = req.body.password;
  console.log("password set globally");

  backURL=req.header('Referer') || '/';
  res.redirect(backURL);
});
 
app.get('/contracts/:contractName', function (req, res) {
  var contractName = req.params.contractName;
  var contractNameSol = contractName + '.sol';
  
  contractLookup(contractName)
   .then(
        function (contractTemplateObj) {
          return contractJSONLookup(contractTemplateObj);
        }
    ).then(
        function (contractTemplateObj) {
          return keyJSONLookup(contractTemplateObj);
        }
    ).then(
        function (contractTemplateObj) {
          contractTemplateObj.globalPassword = globalPassword;
          contractTemplateObj.isLoggedInMessage = "Status: you are logged in and can sign transactions";
          contractTemplateObj.isNotLoggedInMessage = "Status: you are not logged in, and need to do so to sign transactions. Those buttons won't work yet!";
          contractTemplateObj.title = "Viewing " + contractTemplateObj.contractNameSol;
          contractTemplateObj.txFailedHandlerCode = "function txFailHandler(e) { $('#passwordModal').modal('show'); }";
          contractTemplateObj.txFailedHandlerName = "txFailHandler";

          res.render('Contract', contractTemplateObj);
        }
    ).catch(function(err) {
          console.log("short circuited with status: " + err);          
          contractTemplateObj = JSON.parse(err.message);
          contractTemplateObj.globalPassword = globalPassword;
          contractTemplateObj.isLoggedInMessage = "Status: you are logged in and can sign transactions";
          contractTemplateObj.isNotLoggedInMessage = "Status: you are not logged in, and need to do so to sign transactions.";
          if (contractTemplateObj.contractExists) contractTemplateObj.title = "Viewing " + contractNameSol;
          else contractTemplateObj.title = "Viewing Non-Existent Contract ;)";

          contractTemplateObj.txFailedHandlerCode = "function txFailHandler(e) { $('#passwordModal').modal('show'); }";
          contractTemplateObj.txFailedHandlerName = "txFailHandler";

          res.render('Contract', contractTemplateObj);
        }
    );
});
*/
  var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('bloc is listening on http://%s:%s', host, port);
});
