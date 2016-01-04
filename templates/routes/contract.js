var express = require('express');
var helper = require('../lib/contract-helpers.js');
var router = express.Router();

require('marko/node-require').install();
var contractTemplate = require('marko').load(require.resolve('../components/contracts/template.marko'));

router.get('/:contractName', function (req, res) {
  var contractName = req.params.contractName;

  var contractNameStream =  helper.contractsStream()
     .pipe( helper.collect() )
     .pipe( es.map(function (data,cb) {
                      var contractData = {};
                      contractData.contracts = data;
                      cb(null,contractData);
                   }));

  var contractMetaStream =  helper.contractsMetaStream()
     .pipe( es.map(function (data,cb) {
                      var contractData = {};
                      contractData.contractMeta = data;
                      /* filter */
                      if (contractData.contractMeta.name == contractName) cb(null,contractData);
                      else cb();                      
                   }));

  var configStream = helper.configStream()
     

   helper.fuseStream([contractNameStream,contractMetaStream,configStream])
       .on('data', function (data) {
                      contractTemplate.render(data, res);
                   });
});

module.exports = router;
