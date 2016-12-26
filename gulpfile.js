'use strict';

var path = require('path');
var gulp = require('gulp');
var less = require('gulp-less');
var clean = require('gulp-clean');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var del = require('del');

gulp.task('default', ['clean', 'js', 'less']);

gulp.task('clean', () => {
    del.sync(['public'], { force: true });
});

function compile(watch) {
    var bundler = browserify('./js/index.js', { debug: true }).transform(babel);

    function rebundle() {
        bundler.bundle()
            .on('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source('build.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./public/js'));
    }

    if (watch) {
        bundler = watchify(bundler);
        bundler.on('update', function() {
            console.log('-> bundling...');
            rebundle();
            console.log('done.');
        });
    }

    rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('js', () => compile(false));
gulp.task('less', function () {
    return gulp.src('./less/**/*.less')
        .pipe(less({
          paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./public/css'))
});

gulp.task('watch js', () => watch());
gulp.task('watch less', () => gulp.watch('./less/**/*.less', ['less']));
gulp.task('watch', ['watch less', 'watch js']);
