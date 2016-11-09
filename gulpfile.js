/**
 * Common web project build tasks for a gulp package
 * @author Andrei Nekrasov <bonerdelli@gmail.com>
 * @version 1.6.0
 */

var gulp = require('gulp');
var flatten = require('gulp-flatten');
var gulpif = require('gulp-if');
var lazypipe = require('lazypipe');
var del = require('del');

var less = require('gulp-less');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');

var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var htmlMin = require('gulp-htmlmin');
var useref = require('gulp-useref');

// TODO: use it nice things
// var cached = require('gulp-cached');
// var remember = require('gulp-remember');

/**
 * Project paths configuration
 */

var path = {
  source: {
    html:   'source/*.html',
    assets: 'source/assets/*',
    less:   'source/styles/**/*.less',
    img:    'source/images/**/*.+(jpg|jpeg|png|gif|svg)',
    js:     'source/scripts/**/*.js',
  },
  target: {
    assets: 'source/vendor/',
    less:   'source/styles/vendor/',
    css:    'source/build/css/'
  },
  build: {
    root:   'docs',
    sync:   'docs/**',
    html:   'docs/',
    js:     'docs/js/',
    css:    'docs/css/',
    img:    'docs/images/',
    fonts:  'docs/fonts/',
    assets: 'docs/'
  },
  watch: {
    html:   'source/*.html',
    less:   'source/styles/**/*.less',
    css:    'source/styles/**/*.css',
    js:     'source/scripts/**/*.js',
    yml:    'config/**/*.yml'
  },
  assets: {
    js: [
      'bower_components/**/*.js',
    ],
    less: [
      'bower_components/**/*.less',
    ],
    css: [
      'bower_components/**/*.css',
    ],
    img: [

    ],
    fonts: [
      'bower_components/*/fonts/*'
    ]
  },
  clean: [
    'source/vendor',
    'source/styles/vendor/',
    'source/fonts',
    'source/build'
  ]
};

/**
 * Modules configuration
 */

var opts = {
  env: 'develop',
  version: '0.7.1',
  autoprefixer: [
    'last 1 version',
    '> 1%'
  ],
  htmlMin: {
    removeComments: true,
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    conservativeCollapse: false
  },
  uglifyJs: {
    compress: {
      global_defs: [],
    }
  }
};

/**
 * Pipelines for assets proccessing
 * TODO: build only modified files
 */

var buildJsPipe = lazypipe()
  .pipe(uglify, opts.uglifyJs) // Pass through only changed files
;

var buildCssPipe = lazypipe()
  .pipe(autoprefixer, opts.autoprefixer)
  .pipe(csso)
;

/**
 * Assets copying pipelines
 */

function copyAssetsJs() {
  return gulp.src(path.assets.js)
    .pipe(gulp.dest(path.target.assets));
}

function copyAssetsCss() {
  return gulp.src(path.assets.css)
    .pipe(gulp.dest(path.target.assets));
}

function copyAssetsLess() {
  return gulp.src(path.assets.less)
    .pipe(gulp.dest(path.target.less));
}

function copyFonts() {
  return gulp.src(path.assets.fonts)
    .pipe(gulp.dest(path.target.assets))
    .pipe(flatten())
      .pipe(gulp.dest(path.build.fonts));
}

/**
 * Main build tasks
 */

function buildHtml() {
  return gulp.src(path.source.html)
    .pipe(useref())
      .pipe(gulpif('**/*.css',  buildCssPipe()))
      .pipe(gulpif('**/*.js',   buildJsPipe()))
      .pipe(gulpif('**/*.html', htmlMin(opts.htmlMin)))
    .pipe(gulp.dest(path.build.html));
}

function buildLess() {
  return gulp.src(path.source.less)
    .pipe(sourcemaps.init())
      .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.target.css));
}

/**
 * Build for distribution
 */

function copyDistImages() {
  return gulp.src(path.source.img)
    .pipe(gulp.dest(path.build.img));
}

function copyDistAssets() {
  return gulp.src(path.source.assets)
    .pipe(gulp.dest(path.build.assets));
}

/**
 * Define available tasks
 */

gulp.task('clean', function() {
  return del(path.clean);
});

gulp.task('copy', gulp.parallel(
  copyAssetsJs, copyAssetsCss, copyAssetsLess, copyFonts
));

gulp.task('build:less', gulp.series(
  copyAssetsLess, buildLess
));

gulp.task('copy', gulp.parallel(
  copyAssetsJs, copyAssetsCss, copyFonts,
  copyDistImages, copyDistAssets
));

gulp.task('build', gulp.series(
  'clean', 'copy', 'build:less', buildHtml
));

/**
 * Default task
 */

gulp.task('default', gulp.series(
  'clean', 'build'
));
