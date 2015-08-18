
module.exports.createDirScaffold = function(projectName) {
  var fs = require('fs');
  var path = require('path');
  var stat;

  try {
    stat = fs.statSync(projectPath);
  } catch (e) {
    fs.mkdirSync(projectName);
  }

  if (stat !== undefined) { console.log("project: " + projectName + " already exists"); return; }
  else {
    var projectAbsolutePath = path.resolve(projectName);
    var projectFolders = ['js', 'html', 'css', 'routes', 'contracts', 'meta'];

    var templatesFolder = path.normalize(path.join(__dirname, '..', 'templates'));
    var contractTemplates = fs.readdirSync(path.join(templatesFolder, 'sol'));

    projectFolders.forEach(function(folderName, index) {
       fs.mkdirSync(path.join(projectAbsolutePath, folderName));
    });


    contractTemplates.forEach(function(filename, index){
        var templateStream = fs.createReadStream(path.join(templatesFolder, 'sol', filename));
        var writeStream = fs.createWriteStream(path.join(projectAbsolutePath, 'contracts', filename));
        templateStream.pipe(writeStream);
    });
  }
}
