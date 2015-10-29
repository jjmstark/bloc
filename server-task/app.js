var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var path = require('path');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));

var blocRootDir = path.normalize(path.join(__dirname, '..'));

app.engine('.hbs', exphbs({defaultLayout: 'SampleLayout', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

function contractLookup(contractName) {
    var contractNameSol = contractName + '.sol';
    return fs.statAsync(path.join(__dirname, 'contracts/'+contractNameSol)).then(
        function (res, err) {
             if (err) { 
               console.log("contract not found, err: " + err); 
               return { 
                          contractExists : false, 
                          contractName : contractName, 
                          contractNameSol : contractNameSol  
                      }; 
            }
            else { 
               console.log("contract found, checking if it has been compiled next"); 
               return { 
                          contractExists : true, 
                          contractName : contractName,
                          contractNameSol : contractNameSol
                       }; 
            } 
     }
  );        
}

function contractJSONLookup(contractObj) {
    var contractName = contractObj.contractName;

    return fs.readFileAsync(path.join(__dirname, 'meta/'+contractName+'.json')).then(
        function(fileData, err) {
            if (err) { 
               console.log("contract json not found, err: " + err); 
               contractObj.contractIsCompiled = false;

               return contractObj;                   
            }
            else { 
               console.log("contract compiled"); 
               contractObj.contractIsCompiled = true;
               contractObj.contractData = JSON.parse(fileData);
            
               return contractObj;
            }
 
        }
    );
}

function keyJSONLookup(contractObj) {
    return fs.readFileAsync(path.join(__dirname, 'key.json')).then(
        function(fileData, err) {
            if (err) { 
               console.log("key not found, err: " + err); 
               contractObj.hasKey = false;

               return contractObj;                   
            }
            else { 
               console.log("key present"); 
               contractObj.hasKey = true;
               contractObj.developerKey = JSON.parse(fileData);
            
               return contractObj;
            }
 
        }
    );
}
 
app.get('/contracts/:contractName', function (req, res) {
  var contractName = req.params.contractName;
  var contractNameSol = contractName + '.sol';

  contractLookup(contractName)
    .catch( function(err) {
        console.log("caught error: " + err);
        res.render(  'Contract', 
                     { contractExists : false,
                       contractName : contractName,
                       contractNameSol : contractNameSol }
                  );
        }
    ).then(
        function (contractTemplateObj) {
          return contractJSONLookup(contractTemplateObj);
        }
    ).then(
        function (contractTemplateObj) {
          return keyJSONLookup(contractTemplateObj);
        }
    ).then(
        function (contractTemplateObj) {
          res.render('Contract', contractTemplateObj);
        }
    );
  
//  res.render('Contract', contractObj);
});

  var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('bloc is listening on http://%s:%s', host, port);
});
