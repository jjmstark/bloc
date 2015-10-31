module.exports = scaffold;
function scaffold(projectName) {
    var fs = require('fs');
    var path = require('path');
    var readdirp = require('readdirp');
    var mkdirp = require('mkdirp');
    var through = require('through2')

    var stat;

    try {
        stat = fs.statSync(projectPath);
    } catch (e) {
        fs.mkdirSync(projectName);
    }

    if (stat !== undefined) {
        console.log("project: " + projectName + " already exists");
        return;
    }
    else {
        var projectAbsolutePath = path.resolve(projectName);
        var templatesFolder =
            path.normalize(path.join(__dirname, '..', 'templates'));

        readdirp({ root: path.join(templatesFolder), fileFilter: '*.+(js|hbs|template|sol|css|json)' })
            .on('warn', function (err) { console.error('non-fatal error', err); })
            .on('error', function (err) { console.error('fatal error', err); })
            .pipe(through.obj(
                function (entry, _, cb) {
                    mkdirp(path.join(projectAbsolutePath,entry.parentDir), function (err) {
                        if (err) console.error(err);
                        else { 
                           fs.createReadStream(entry.fullPath, { encoding: 'utf-8' })
                          .pipe(fs.createWriteStream(path.join(projectAbsolutePath, entry.path)));
                        }
                     });
                    this.push({ path: entry.path });

                    cb();
                }))
            .pipe(through.obj(
                function (res, _, cb) { 
                    this.push("Wrote: " + (path.join(projectAbsolutePath, res.path)) + "\n");
                    cb();
                }))
            .pipe(process.stdout);      
    }
}
