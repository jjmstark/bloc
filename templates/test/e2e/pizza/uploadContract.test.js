'use strict'

var common = require("../../common");
var options = common.options;
var assert = common.assert;
var promise = common.promise;
var request = require('request-promise');

module.exports = uploadContract;

function uploadContract(argObj) {
    console.log("uploading src: " + argObj.src);
    return request.post({
      uri: 'http://localhost:8000/users/' + argObj.user + '/' + argObj.address + '/contract',
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      form: {
        "password": argObj.password,
        "src": argObj.src
      }
      }, function (err, res, body) {
        console.log("err: " + err); 
        console.log("response: " + JSON.stringify(res));
        console.log("body: " + JSON.stringify(body));
    return res;
  });
}
