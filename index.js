var es = require('event-stream');
var less = require('less');
var gutil = require('gulp-util');
var path = require('path');
var defaults = require('lodash.defaults');
var BufferStreams = require('bufferstreams');

// Consts
const PLUGIN_NAME = 'gulp-less';

// Options
function parseOptions(file, options) {
  // set the default options
  var opts = defaults(options || {}, {
    filename: file.path,
    paths: [ path.dirname(file.path) ]
  });

  // let people use their own compressor
  delete opts.compress;

  return opts;
}

// File level transform function
function lessTransform(opts) {

  // Return a callback function handling the buffered content
  return function(err, buf, cb) {

    // Handle any error
    if(err) {
      cb(new gutil.PluginError(PLUGIN_NAME, err, {showStack: true}));
    }

    // Use the buffered content
    var parser = new less.Parser(opts);
    var str = buf.toString('utf8');
    parser.parse(str, function (err, tree) {
      if (err) {
        cb(new gutil.PluginError(PLUGIN_NAME, err, {showStack: true}));
      }
      buf = new Buffer(tree.toCSS(opts));
      cb(null, buf);
    });

  };
}

// Plugin function
function lessGulp(options) {

  function parseLess (file, done) {
    if (file.isNull()) return done(null, file); // pass along

    var opts = parseOptions(file, options);

    file.path = gutil.replaceExtension(file.path, '.css');

    // Streams
    if (file.isStream()) {
      file.contents = file.contents.pipe(new BufferStreams(lessTransform(opts)));
      return done(null, file);
    }

    // Buffers
    var parser = new less.Parser(opts);
    var str = file.contents.toString('utf8');
    parser.parse(str, function (err, tree) {
      if (err) {
        return done(new gutil.PluginError(PLUGIN_NAME, err, {showStack: true}));
      }
      file.contents = new Buffer(tree.toCSS(opts));
      done(null, file);
    });
  }

  return es.map(parseLess);
}

// Export the file level transform function for other plugins usage
lessGulp.fileTransform = lessTransform;

// Export the plugin main function
module.exports = lessGulp;


