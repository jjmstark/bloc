

module.exports.scaffoldApp = { 
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
      
    }
  };


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
