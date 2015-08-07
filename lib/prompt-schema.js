
module.exports.createPassword = { 
 properties: {
      password: {
        message: "Enter a high entropy password",
        hidden: true,
        required: true
      }
    }
  };

module.exports.registerPassword = { 
 properties: {
      password: {
        message: "Enter password for app store",
        hidden: true,
        required: true
      }
    }
  };

module.exports.requestPassword = { 
 properties: {
      password: {
        message: "Enter password to decrypt key file",
        hidden: true,
        required: true
      }
    }
  };
