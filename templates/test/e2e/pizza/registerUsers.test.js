'use strict'

var common = require("../../common");
var options = common.options;
var assert = common.assert;
var promise = common.promise;
var request = require('request-promise');

module.exports = registerUser;

function registerUser(user,password) {
  return request.post({
    uri: 'http://localhost:8000/users/' + user,
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    form: {
      "password": password,
      "faucet": 1
    }
  }, function (err, res, body) {
    console.log("err: " + err); 
    console.log("response: " + JSON.stringify(res));
    console.log("body: " + JSON.stringify(body));
    return res;
  });
}
