var less = require('less');
var through2 = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var applySourceMap = require('vinyl-sourcemaps-apply');

var parseVariableOptions = function(options) {
  var output = '';
  Object.keys(options).forEach(function(key) {
    output += '@' + key + ':' + options[key] + ';';
  });
  return output;
};
module.exports = function (options) {
  var _options = options || {};

  return through2.obj(function(file, enc, cb) {
    var options = Object.create(_options);

    if (typeof options.paths === 'function') {
      options.paths = options.paths(file);
    }

    if (file.isNull()) {
      return cb(null, file); // pass along
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-less', 'Streaming not supported'));
    }

    // Injects the paths.
    options.filename = options.filename || file.relative;
    options.paths = options.paths || [path.dirname(file.path)];

    var srcCode = file.contents.toString('utf8');

    // Equivalent to --modify-vars option.
    // Properties under options.modifyVars are appended as less variables
    // to override global variables.
    if (options.modifyVars) {
      var modifyVarsOutput = parseVariableOptions(options.modifyVars);
      srcCode += modifyVarsOutput;
    }

    if (file.sourceMap || options.sourceMap) {
      options.sourceMap = true;
      options.sourceMapBasepath = options.sourceMapBasepath || (file.cwd + '/' + file.base);
      options.outputSourceFiles = true;
      options.writeSourceMap = function(sourceMapContent) {
        if (file.sourceMap) {
          var sourceMap = JSON.parse(sourceMapContent);
          sourceMap.file = file.relative;
          applySourceMap(file, sourceMap);
        } else {
          this.push(new gutil.File({
            cwd: file.cwd,
            base: file.base,
            path: file.path + '.map',
            contents: new Buffer(sourceMapContent)
          }));
        }
      }.bind(this);
    }


    less.render(srcCode, options, function(err, css) {
      if (err) {
        // convert the keys so PluginError can read them
        err.lineNumber = err.line;
        err.fileName = err.filename;
        var message = less.formatError(err);

        err.message = message;

        return cb(new PluginError('gulp-less', err));
      }

      file.contents = new Buffer(css);
      file.path = gutil.replaceExtension(file.path, '.css');
      cb(null, file);
    }.bind(this));
  });
};
