var should = require('should');
var less = require('../');
var gutil = require('gulp-util');
var fs = require('fs');
var pj = require('path').join;

function createVinyl(lessFileName, contents) {
  var base = pj(__dirname, 'fixtures');
  var filePath = pj(base, lessFileName);

  return new gutil.File({
    cwd: __dirname,
    base: base,
    path: filePath,
    contents: contents || fs.readFileSync(filePath)
  });
}

describe('gulp-less', function () {
  describe('less()', function () {

    it('should pass file when it isNull()', function (done) {
      var stream = less();
      var emptyFile = {
        isNull: function () { return true; }
      };
      stream.once('data', function (data) {
        data.should.equal(emptyFile);
        done();
      });
      stream.write(emptyFile);
      stream.end();
    });

    it('should emit error when file isStream()', function (done) {
      var stream = less();
      var streamFile = {
        isNull: function () { return false; },
        isStream: function () { return true; }
      };
      stream.once('error', function (err) {
        err.message.should.equal('Streaming not supported');
        done();
      });
      stream.write(streamFile);
      stream.end();
    });

    it('should compile single less file', function (done) {
      var lessFile = createVinyl('buttons.less');

      var stream = less();
      stream.once('data', function (cssFile) {
        should.exist(cssFile);
        should.exist(cssFile.path);
        should.exist(cssFile.relative);
        should.exist(cssFile.contents);
        cssFile.path.should.equal(pj(__dirname, 'fixtures', 'buttons.css'));
        String(cssFile.contents).should.equal(
          fs.readFileSync(pj(__dirname, 'expect/buttons.css'), 'utf8'));
        done();
      });
      stream.write(lessFile);
      stream.end();
    });

    it('should emit error when less contains errors', function (done) {
      var errorCalled = false;
      var stream = less();
      var errorFile = createVinyl('somefile.less',
        new Buffer('html { color: @undefined-variable; }'));
      stream.once('error', function (err) {
        err.message.should.equal('variable @undefined-variable is undefined in file '+errorFile.path+' line no. 1');
        errorCalled = true;
        errorCalled.should.equal(true);
        done();
      });
      stream.once('end', function(){
        errorCalled.should.equal(true);
        done();
      });
      stream.write(errorFile);
      stream.end();
    });

    it('should compile multiple less files', function (done) {
      var files = [
        createVinyl('buttons.less'),
        createVinyl('forms.less'),
        createVinyl('normalize.less')
      ];

      var stream = less();
      var count = files.length;
      stream.on('data', function (cssFile) {
        should.exist(cssFile);
        should.exist(cssFile.path);
        should.exist(cssFile.relative);
        should.exist(cssFile.contents);
        if (!--count) { done(); }
      });

      files.forEach(function (file) {
        stream.write(file);
      });
      stream.end();
    });

    it('should produce sourcemap filenames and mappings', function (done) {
      var files = [
        createVinyl('buttons.less'),
        createVinyl('forms.less'),
        createVinyl('normalize.less')
      ] .map(function (file) {
        file.sourceMap = {
          file: '',
          version : 3,
          sourceRoot : '',
          sources: [],
          names: [],
          mappings: ''
        };

        return file;
      });

      var stream = less();
      var count = files.length;
      stream.on('data', function (cssFile) {
        should.exist(cssFile.sourceMap.file);
        should.exist(cssFile.sourceMap.mappings);
        should(cssFile.sourceMap.mappings.length).be.greaterThan(1);
      });
      stream.once('end', done);

      files.forEach(function (file) {
        stream.write(file);
      });
      stream.end();
    });
  });
});
