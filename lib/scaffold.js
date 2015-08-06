
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
   fs.mkdirSync(projectName + '/js/');
   fs.mkdirSync(projectName + '/html/');
   fs.mkdirSync(projectName + '/css/');
   fs.mkdirSync(projectName + '/routes/');
   fs.mkdirSync(projectName + '/contracts/');
  }
}
