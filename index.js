var less = require('less');
var through2 = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var defaults = require('lodash.defaults');

module.exports = function (options) {
  // Mixes in default options.
  options = defaults(options || {}, {
    compress: false,
    paths: []
  });

  function transform (file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);// pass along
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-less', 'Streaming not supported'));
    }

    var str = file.contents.toString('utf8');

    // Clones the options object.
    var opts = defaults({}, options);

    // Injects the path of the current file.
    opts.filename = file.path;

    // Modify vars
    if (options.modifyVars !== undefined) {
      var modifyVarsOutput = parseVariableOptions(options.modifyVars);
      str += modifyVarsOutput;
    }

    less.render(str, opts, function (err, css) {
      if (err) {

        // convert the keys so PluginError can read them
        err.lineNumber = err.line;
        err.fileName = err.filename;

        // add a better error message
        err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

        cb(new PluginError('gulp-less', err));
      } else {
        file.contents = new Buffer(css);
        file.path = gutil.replaceExtension(file.path, '.css');
        cb(null, file);
      }
    });

    function parseVariableOptions(options) {
      var output = '';
      for (var key in options) {
          output += '@' + key + ':' + options[key] + ';';
      }
      return output;
    }
  }

  return through2.obj(transform);
};
