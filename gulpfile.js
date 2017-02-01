var path = require("path");

var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var less = require('gulp-less');
var notify = require('gulp-notify');
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var pug = require('gulp-pug');
var autoprefixer = require('gulp-autoprefixer');

var paths = {
  pages: 'src/pages',
  style: 'src/style',
  build: 'build'
};

//  PUG: compile template files to html
//===========================================
gulp.task('pug', function() {
  return gulp.src([
    'src/pages/**/*.pug',
    '!src/pages/**/_*.pug',
  ])
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(pug())
    .pipe(gulp.dest(paths.build))
    .pipe(livereload())
    .pipe(notify({ message: 'Pug files recompiled!', onLast: true }));
});

//  LESS: compile less to css
//===========================================
gulp.task('less', function() {
  return gulp.src([
    'src/style/**/*.less',
    '!src/style/**/_*.less',
  ])
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(less({ style: 'expanded', sourceComments: 'map', errLogToConsole: true}))
    .pipe(autoprefixer('last 2 version', "> 1%", 'ie 8', 'ie 9'))
    .pipe(gulp.dest(paths.build+'/css'))
    .pipe(livereload())
    .pipe(notify({ message: 'Less files recompiled!', onLast: true }));
});

gulp.task('images', function() {
  return gulp.src('src/img/**/*')
    .pipe(gulp.dest('build/img'));
});

//  Connect: run simple dev sever
//===========================================
gulp.task('connect', function() {
  connect.server({
    port: 3555,
    root: [__dirname+'/'+paths.build],
    fallback: __dirname+'/'+paths.build+'/404.html',
    middleware: function(connect, opt) {
      return [function(req, res, next) {
        console.log('Loading URL: '+req.url);
        // default to index.html
        if (req.url == '/') req.url = '/index.html';
        // if no file extension, add ".html" - nginx settings will be same
        if (req.url.indexOf('.') == -1) req.url += '.html';
        next();
      }]
    }
  })
});


/////////////////////////////////
// Tasks to run - via package.json scripts

gulp.task('build', ['less', 'pug', 'images'], function(){
});

gulp.task('dev', ['build', 'connect'], function() {
  livereload.listen();
  gulp.watch('src/style/**/*.less', ['less']);
  gulp.watch('src/pages/**/*.pug', ['pug']);
});
