/* jshint node: true */

'use strict';

var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

// test whatever is specified in tests/ folder
gulp.task('tests', function () {
  return gulp.src('tests/lib/*.js')
    .pipe(jasmine());
});
