/* jshint node: true */
var path = require('path');
var less = require('less');
var through2 = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var defaults = require('lodash.defaults');
var convert = require('convert-source-map');
var applySourceMap = require('vinyl-sourcemaps-apply');

module.exports = function (options, additionalData) {
    // Mixes in default options.
    options = defaults(options || {}, {
        compress: false,
        verbose: false,
        paths: []
    });

    return through2.obj(function (file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new PluginError('gulp-less', 'Streaming not supported'));
        }

        if (path.extname(file.path).toLowerCase() !== '.less') {
            if (options.verbose) {
                gutil.log('gulp-less: Skipping unsupported file type ' + chalk.blue(file.relative));
            }
            return cb(null, file);
        }

        // Clones the options object.
        var opts = defaults({}, options);

        // Injects the path of the current file.
        opts.filename = file.path;

        // Enables source maps only if gulp-sourcemaps has been initted
        // Even this enable we can turn off source map by {sourceMap: false} option
        opts.sourceMap = !!file.sourceMap && (opts.sourceMap !== false);

        var errCb = function (err, css) {
            if (err) {
                // Convert the keys so PluginError can read them
                err.lineNumber = err.line;
                err.fileName = err.filename;

                // Add a better error message
                err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

                cb(new PluginError('gulp-less', err));
              return;
            }
        };

        var str = file.contents.toString();
        var parser = new (less.Parser)(opts);
        parser.parse(str, function (e, root) {
            if (e) {
                errCb(e);
                return;
            }
            var css;
            try {
                css = root && root.toCSS && root.toCSS(opts);
            } catch (err) {
                errCb(err);
                return;
            }

            // all is ok
            file.contents = new Buffer(css);

            if (file.sourceMap) {
                var comment = convert.fromSource(css);
                if (comment) {
                    file.contents = new Buffer(convert.removeComments(css));
                    var sourceMap = comment.sourcemap;
                    if (!sourceMap.file) {
                        sourceMap.file = path.relative(file.base, file.path);
                    }
                    for (var i = 0; i < sourceMap.sources.length; i++) {
                        sourceMap.sources[i] = path.relative(file.base, sourceMap.sources[i]);
                    }

                    applySourceMap(file, sourceMap);
                }
            }

            file.path = gutil.replaceExtension(file.path, '.css');
            cb(null, file);
        }, additionalData);
    });
};


