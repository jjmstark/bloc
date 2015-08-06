
var request = require('request');

module.exports.compile = function(fileNameObj,apiURL) {
    var options = {
       method: 'POST',
       uri: apiURL,
       port: 80, // change later
       headers: {
        'Content-type': 'application/x-www-form-urlencoded'
       },
       body: 'src='+fileNameObj 
    };

    request(options,
            function(err, res, body) { 
              console.log(body);
            });
}


