'use strict'

var registerUsers = require('./registerUsers.test');
var uploadContract = require('./uploadContract.test');
var callContractMethod = require('./callContractMethod.test');
var path = require('path');
var fs = require('fs');

// register the users
var addressMaker = '',
    addressBuyer = '',
    addressOracle = '',
    pizzaContractAddress = '';

registerUsers('pizzaMaker', 'thepass').then(function(response){

  addressMaker = response;
  registerUsers('buyer', 'thepass').then(function(response){

    addressBuyer = response;
    registerUsers('oracle', 'thepass').then(function(response){

      addressOracle = response;
      var file = path.join(__dirname, 'Pizza.sol');
      var contract = fs.readFileSync(file, {'encoding':'utf8'});
      var argObj =  { 
        'src': contract,
        'user': 'pizzaMaker',
        'address': addressMaker,
        'password': 'thepass' 
      };

      uploadContract(argObj).then(function(response){
        console.log("WE UPLOADED THIS SHIT");
        pizzaContractAddress = response;
        console.log(response);

        
        var argObj = {
          'user': 'pizzaMaker',
          'userAddress': addressMaker,
          'password': 'thepass',
          'contract': 'Pizza',
          'contractAddress': pizzaContractAddress,
          'method': 'setUpPizzaDetails',
          'value': '0',
          'args': {
            'price': '6',
            'topping': 'Pepperoni'
          }
        };

        callContractMethod(argObj).then(function(response){
          console.log("PIZZA SET UP");
            var argObj = {
            'user': 'buyer',
            'userAddress': addressBuyer,
            'password': 'thepass',
            'contract': 'Pizza',
            'contractAddress': pizzaContractAddress,
            'method': 'buyerAcceptsPizzaContract',
            'value': '6',
            'args': {}
          };

          callContractMethod(argObj).then(function(response){
            console.log("This is the END");
            var argObj = {
              'user': 'oracle',
              'userAddress': addressOracle,
              'password': 'thepass',
              'contract': 'Pizza',
              'contractAddress': pizzaContractAddress,
              'method': 'rateSatisfaction',
              'value': '0',
              'args': {
                'isHappy': true
              }
            };
            callContractMethod(argObj).then(function(){
              console.log("PIZZA COMPLETE");
            });
            
          });
        });
      });
    });
  });
});
