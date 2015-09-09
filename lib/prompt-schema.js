
var units = require('blockapps-js').Units;

var scaffoldApp = { 
 properties: {
      appName: {
        message: "Enter the name of your app",
        required: true
      },
   
      developer: {
        message: "Enter your name",
        required: true
      },

      email: { 
        message: "Enter your email",
        required: true
      },

      appURL: {
        message: "Enter the URL for your app",
        required: true
      },

      repo: {
        message: "Enter the repo for your app",
        required: false
      },

      apiURL: {
        message: "Enter the BlockApps API URL you are using",
        required: false,
        default: 'http://hacknet.blockapps.net'
      },

      transferGasLimit: {
        message: "Enter default gas limit for sending transactions",
        required: true,
        default: 21000,
      },

      contractGasLimit: {
        message: "Enter default gas limit for contract uploads",
        required: true,
        default: 1000000,
      },
      
    }
  };


 var createPassword = { 
   properties: {
      password: {
        message: "Enter a high entropy password to encrypt your private key",
        hidden: true,
        required: true
      }
    }
  };

var registerPassword = { 
   properties: {
      password: {
        message: "Enter a password for the BlockApps app store",
        hidden: true,
        required: true
      }
    }
  };

var requestPassword = { 
 properties: {
      password: {
        message: "Enter your password to decrypt key file",
        hidden: true,
        required: true
      }
    }
  };

var transfer = { 
  properties: {
      password: {
        message: "Enter password to decrypt key file",
        hidden: true,
        required: true
      },
   
      to: {
        message: "Enter the address to which to transfer the Ether",
        required: true
      },

      unit: {
        message: "Enter the unit of value you wish to transfer",
        required: true,
        default: "ether"
      },

      value: {
        message: "Enter the amount of value to be transferred",
        required: true
      },

      gasLimit: {
        message: "Enter the gas limit for your transaction",
        required: true,
        default: 22000
      },      

      gasPrice: {
        message: "Enter the gas price for your transaction",
        required: true,
        default: 50000000000
      },
    }
  };

var confirmTransfer = function(promptObj) {
 console.log("sending " + ((parseInt(promptObj.value) * units.stringToEthUnit(promptObj.unit)) / units.unitSchema.ether)  
                        + " ether to " + promptObj.to 
                        + " plus a maximal gas fee of " + promptObj.gasLimit * promptObj.gasPrice / units.unitSchema.ether + " ether");
 return {
   properties : {
       password : {
        message : "type your password again to confirm the transfer",
        hidden : true,
        required : true
      }  
   }
 };
}

module.exports = (function () {
  return {
    scaffoldApp : scaffoldApp,
    createPassword : createPassword,
    registerPassword : registerPassword,
    requestPassword : requestPassword,
    transfer : transfer,
    confirmTransfer : confirmTransfer,
  };
})();

