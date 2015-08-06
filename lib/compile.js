
var request = require('request');

module.exports.compile = function(soliditySrcArray,apiURL,callback) {
   // add regex ignore

    var optionPrototype = {
       method: 'POST',
       uri: apiURL,
       port: 80, // change later
       headers: {
        'Content-type': 'application/x-www-form-urlencoded'
       },
       body: 'src='
    };

    soliditySrcArray.map(function (src)  {
                          var options = optionPrototype;
                          options.body = 'src='+src.replace(/(\r\n|\n|\r)/gm,"");;
                          console.log("sending with options.body: " + options.body);
                          request(
                            options,
                            function(err, res, body) { 
                             callback(body);
                            });
                          }
                        );
}


