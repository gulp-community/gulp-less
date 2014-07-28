var less = require('less');
var through2 = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var defaults = require('lodash.defaults');
var convert = require('convert-source-map');
var applySourceMap = require('vinyl-sourcemaps-apply');

module.exports = function (options) {
  // Mixes in default options.
  options = defaults(options || {}, {
    compress: false,
    paths: []
  });

  function transform (file, enc, next) {
    var self = this;

    if (file.isNull()) {
      this.push(file); // pass along
      return next();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-less', 'Streaming not supported'));
      return next();
    }

    var str = file.contents.toString('utf8');

    // Clones the options object.
    var opts = defaults({}, options);

    // Injects the path of the current file.
    opts.filename = file.path;

    // Disables source maps
    opts.sourceMap = false;
    // Enables source maps if gulp-sourcemaps has been initted
    if (file.sourceMap) {
      opts.sourceMap = true;
    }

    var modifyVarsOutput = parseVariableOptions(options['modifyVars']);
    if (modifyVarsOutput) {
      str += '\n';
      str += modifyVarsOutput;
    }

    less.render(str, opts, function (err, css) {
      if (err) {

        // convert the keys so PluginError can read them
        err.lineNumber = err.line;
        err.fileName = err.filename;

        // add a better error message
        err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

        self.emit('error', new PluginError('gulp-less', err));
      } else {
        file.contents = new Buffer(css);
        file.path = gutil.replaceExtension(file.path, '.css');
    
        if (file.sourceMap) {
          var comment = convert.fromSource(css);
          if (comment) {
            file.contents = new Buffer(convert.removeComments(css));
            var sourceMap = comment.sourcemap;
            for (var i = 0; i < sourceMap.sources.length; i++) {
              sourceMap.sources[i] = path.relative(file.base, sourceMap.sources[i]);
            }
            applySourceMap(file, sourceMap);
          }
        }


        self.push(file);
      }
      next();
    });


    function parseVariableOptions(options) {
      var output = '';
      for (var key in options) {
          output += '@' + key + ':\'' + options[key] + '\';';
      }
      return output;
    }
  }

  return through2.obj(transform);
};


