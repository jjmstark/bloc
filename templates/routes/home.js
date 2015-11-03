var express = require('express');
var router = express.Router();
var helper = require('../lib/contract-helpers.js');


// assuming existence of global session

router.get('/', function (req, res) {
  console.log(req.session);
  if (typeof req.session.globalPassword == null) req.session.globalPassword = null;
 
  helper.keyLookup()
    .then( function (keyObj) { 
               res.render('Landing',
                  { globalPassword : req.session.globalPassword,
                    isLoggedInMessage : "Welcome to BlockApps' landing page! You are logged in and can sign transactions",
                    isNotLoggedInMessage : "Welcome to BlockApps' landing page! You are not logged in, and need to do so to sign transactions",
                    title : "Welcome to BlockApps!",
                    hasKeyMessage : "You've got a key already!", 
                    hasKey : keyObj.hasKey,
                    generateKeyMessage : "You need to generate a key with bloc genkey!" }
               )
           }
    );
});

module.exports = router;
