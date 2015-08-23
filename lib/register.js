
var request = require('request');
var querystring = require('querystring');

// given config information registers app
var registerApp = function(config,callback) {
    var prompt = require('prompt');
    var registerPassword = require('./prompt-schema.js').registerPassword;

    prompt.start()
    prompt.get(registerPassword, function (err,pass) {   
       var options = {
          method: 'POST',
          uri: 'http://hacknet.blockapps.net/eth/v1.0/register', // needs to change
          port: 80, // change later
          headers: {
            'Content-type': 'application/x-www-form-urlencoded'
          },
          body: 'app='+config.appName+
                                   '&developer='+config.developer+
                                   '&email='+config.email+
                                   '&appurl='+config.appURL+
                                   '&loginpass='+pass.password
        };

        request(
             options,
             function(err, res, body) { 
               callback(body);
              }
           );
   });
}

module.exports = (function () {
  return {
    registerApp : registerApp
  };
})();
