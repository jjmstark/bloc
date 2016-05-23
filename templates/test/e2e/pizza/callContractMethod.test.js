var request = require('request-promise');

module.exports = callContractMethod;

function callContractMethod(argObj) {
  return request.post({
    uri: 'http://localhost:8000/users/' + argObj.user + '/' + argObj.userAddress + '/contract/' +argObj.contract+'/'+ argObj.contractAddress + '/call',
    headers: {
      "content-type": "application/json"
    },
    body:  JSON.stringify({
      "password": argObj.password,
      "method": argObj.method,
      "value": argObj.value,
      "args": argObj.args
    }),
    }, function (err, res, body) {
    console.log("err: " + err); 
    console.log("response: " + JSON.stringify(res)); 
  });
}
