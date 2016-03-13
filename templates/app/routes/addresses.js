var express = require('express');
var cors = require('cors');
var router = express.Router();
var contractHelpers = require('../lib/contract-helpers.js');
var lw = require('eth-lightwallet');
var fs = require('fs');
var mkdirp = require('mkdirp');
var es = require('event-stream');
var del = require('del');
var rimraf = require('rimraf')
var vinylFs  = require( 'vinyl-fs' )
var _ = require('underscore')

router.get('/', cors(), function(req, res){
   console.log(contractHelpers.allKeysStream())
    contractHelpers.allKeysStream()
      .pipe(contractHelpers.collect())
      .on('data', function(data) {
      	  var temp = _.map(data, function(v){
      	  	return v.addresses;
      	  })
          res.send(JSON.stringify(_.flatten(temp)));
       });
});

module.exports = router;