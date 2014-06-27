gulp-less
=========

A LESS plugin for Gulp

[![Build Status](https://travis-ci.org/plus3network/gulp-less.png?branch=master)](https://travis-ci.org/plus3network/gulp-less)

## Install

```
npm install gulp-less
```

## Usage
```javascript
var less = require('gulp-less');

gulp.task('less', function () {
  gulp.src('./less/**/*.less')
    .pipe(gulp.dest('./public/css'));
});
```


## Options

The options are the same as what's supported by the less parser, with the exception of `sourceMapFilename`.  This option will do nothing.

## Source maps

Specifiying `sourceMap: true` will write an inline source map at the end of the file.

```javascript
var less = require('gulp-less');
var path = require('path');

gulp.task('javascript', function() {
  gulp.src('./less/**/*.less')
      .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
        sourcemap: true
      }))
    .pipe(gulp.dest('dist'));
});
```
gulp-less can be used in tandem with [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps) to generate source maps for the less to css transition. You will need to initialize [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps) prior to running gulp-less and write the source maps after. By default, gulp-sourcemaps writes the source maps inline in the compiled javascript files.

```javascript
var sourcemaps = require('gulp-sourcemaps');

gulp.task('javascript', function() {
  gulp.src('./less/**/*.less')
    .pipe(sourcemaps.init())
      .pipe(less({
        sourcemap: true
      }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});
```

To write source maps to a separate file, specify a relative path in the `sourcemaps.write()` function.

```javascript
var sourcemaps = require('gulp-sourcemaps');

gulp.task('javascript', function() {
  gulp.src('./less/**/*.less')
    .pipe(sourcemaps.init())
      .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
        sourcemap: true
      }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('dist'));

// will write the source map to ./dest/maps;
```

## Error handling

By default, a gulp task will fail and all streams will halt when an error happens. To change this behavior check out the error handling documentation [here](https://github.com/gulpjs/gulp/blob/master/docs/recipes/combining-streams-to-handle-errors.md)

## License

(MIT License)

Copyright (c) 2014 Plus 3 Network dev@plus3network.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
