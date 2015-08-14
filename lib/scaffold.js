
module.exports.createDirScaffold = function(projectName) {
  var fs = require('fs');
  var stat;

  try {
    stat = fs.statSync(projectPath);
  } catch (e) {
    fs.mkdirSync(projectName);
  }

  if (stat !== undefined) { console.log("project: " + projectName + " already exists"); return; }
  else {
   var simpleStorageString = "contract SimpleStorage {\n" +
    "  uint storedData;\n" + 
    "  function set(uint x) {\n" + 
    "    storedData = x;\n" + 
    "  }\n" +
    "  function get() returns (uint retVal) {\n" + 
    "    return storedData;\n" +
    "  }\n" +
    "}"; 

    var simpleMultiSigString = "contract SimpleMultiSig {\n" + 
     "address alice1;\n" +
     "address alice2;\n" +
     "address bob;\n" + 
     "uint numSigned = 0;\n" +
     "bytes32 error;\n" + 
     "bool registeredYet;\n" +   
     "mapping (address => bool) signedYet;\n\n"+ 
     "function SimpleMultiSig() {\n" + 
     "  bob = msg.sender;\n" +
     "  registeredYet = false;\n" + 
     "}\n\n" +
     "function register(address registerAlice1, address registerAlice2) {\n" +
     "  if (msg.sender == bob && registeredYet == false) {\n" +
       "    alice1 = registerAlice1;\n" +
       "    alice2 = registerAlice2;\n" +
       "    registeredYet = true;\n" +
     "  } else if (msg.sender == bob) {\n" +
       '    error = "registered already";\n' +
     "  } else {\n" +
     '    error = "you are not bob!";\n' +
     "  }\n" +
   "}\n\n" +
   "function withdraw(address to) {\n" +
   "  if ((msg.sender == alice1 || msg.sender == alice2) && numSigned >= 2) {\n" +
   "     to.send(this.balance);\n" + 
   "     numSigned = 0;\n" +
   "    signedYet[alice1] = signedYet[alice2] = signedYet[bob] = false;\n" +
   "  } else {\n" +
   '     error = "cannot withdraw yet!";\n' +
   "  }\n" +
   "}\n\n" +
   "function addSignature() {\n" +
   "  if (msg.sender == alice1 && signedYet[alice1]==false) {\n" + 
   "    signedYet[alice1] = true;\n" +
   "    numSigned++;\n" + 
   "  } else if (msg.sender == alice2 && signedYet[alice2]==false) {\n" + 
   "    signedYet[alice2] = true;\n" +
   "    numSigned++;\n" +
   "  } else if (msg.sender == bob && signedYet[bob]==false) {\n" + 
   "    signedYet[bob] = true;\n" + 
   "    numSigned++;\n" +
   "  } else {\n" +
   "    error = 'unknown address';\n" +
   "  }\n"+ 
   "}\n"+
   "}\n";
 
   fs.mkdirSync(projectName + '/js/');
   fs.mkdirSync(projectName + '/html/');
   fs.mkdirSync(projectName + '/css/');
   fs.mkdirSync(projectName + '/routes/');
   fs.mkdirSync(projectName + '/contracts/');
   fs.mkdirSync(projectName + '/meta/');
   fs.writeFileSync(projectName + '/contracts/SimpleStorage.sol', simpleStorageString);
   fs.writeFileSync(projectName + '/contracts/SimpleMultiSig.sol', simpleMultiSigString);

  }
}
