var less = require('less');
var through2 = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var defaults = require('lodash.defaults');
var pick = require('lodash.pick');
var applySourceMap = require('vinyl-sourcemaps-apply');

var lessOptions = {
  parse: ['paths', 'optimization', 'filename', 'strictImports', 'syncImport', 'dumpLineNumbers', 'relativeUrls', 'rootpath'],
  render: ['compress', 'cleancss', 'ieCompat', 'strictMath', 'strictUnits', 'sourceMapRootpath', 'sourceMapBasepath']
};

var parseVariableOptions = function(options) {
    var output = '';
    Object.keys(options).forEach(function(key) {
      output += '@' + key + ':' + options[key] + ';';
    });
    return output;
  };


module.exports = function (options) {
  // Mixes in default options.
  options = defaults(options || {}, {
    compress: false,
  });

  if (typeof options.paths === 'function') {
      options.paths = options.paths(srcFile);
  }

  return through2.obj(function(file, enc, next) {
    var self = this;

    if (file.isNull()) {
      this.push(file); // pass along
      return next();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-less', 'Streaming not supported'));
      return next();
    }

    var lessError = function(e) {
      var message = less.formatError ? less.formatError(e) : formatLessError(e);

      // convert the keys so PluginError can read them
      e.lineNumber = e.line;
      e.fileName = e.filename;

      e.message = e.message + ' in file ' + e.fileName + ' line no. ' + e.lineNumber;


      self.emit('error', new PluginError('gulp-less', e));
    };



    // Clones the options object.
    var opts = defaults({}, options);

    // Injects the paths.
    opts.filename = opts.filename || file.relative;
    opts.paths = opts.paths || [path.dirname(file.path)];

    var srcCode = file.contents.toString('utf8');
    var parser = new less.Parser(pick(opts, lessOptions.parse));

    // Equivalent to --modify-vars option.
    // Properties under options.modifyVars are appended as less variables
    // to override global variables.
    if (opts.modifyVars) {
      var modifyVarsOutput = parseVariableOptions(opts.modifyVars);
      srcCode += modifyVarsOutput;
    }

    parser.parse(srcCode, function(parse_err, tree) {
      if (parse_err) {
        lessError(parse_err);
        return next();
      }

      var renderOptions = pick(opts, lessOptions.render);

      if (file.sourceMap || opts.sourceMap) {
        renderOptions.sourceMap = true;
        renderOptions.sourceMapBasepath = renderOptions.sourceMapBasepath || (file.cwd + '/' + file.base);
        renderOptions.outputSourceFiles = true;
        renderOptions.writeSourceMap = function(sourceMapContent) {
            if (file.sourceMap) {
                applySourceMap(file, sourceMapContent);
                file.sourceMap.file = file.relative;
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

      try {
        var css = tree.toCSS(renderOptions);
        file.contents = new Buffer(css);
        file.path = gutil.replaceExtension(file.path, '.css');
        self.push(file);
        next();
      } catch (e) {
        lessError(e);
        return next();
      }
    }.bind(this));
  });
};
