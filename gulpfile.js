// Load Gulp
const { src, dest, task, watch, series, parallel } = require('gulp');


var rename = require( 'gulp-rename' );
var sass = require( 'gulp-sass' );
var autoprefixer = require( 'gulp-autoprefixer' );
var sourcemaps = require( 'gulp-sourcemaps' );
var browserify = require ( 'browserify');
var babelify = require ('babelify');
var source = require ('vinyl-source-stream');
var buffer = require ('vinyl-buffer');
var uglify = require ('gulp-uglify');
var plumber = require( 'gulp-plumber');
var notify = require( 'gulp-notify' );
var browserSync = require ('browser-sync').create();
//var reload = browserSync.reload;

var styleSRC = 'src/scss/style.scss';
var styleDIST = './dist/css/';

var jsSRC = 'script.js';
var jsFolder = 'src/js/';
var jsDIST = './dist/js/';
var jsFILES = [jsSRC];
var jsURL = './dist/js/';

var styleWatch   = './src/scss/**/*.scss';
var jsWatch      = './src/js/**/*.js';
var imgWatch     = './src/images/**/*.*';
var fontsWatch   = './src/fonts/**/*.*';
var htmlWatch = './src/**/*.html';

var imgSRC       = './src/images/**/*';
var imgURL       = './dist/images/';

var fontsSRC     = './src/fonts/**/*';
var fontsURL     = './dist/fonts/';

var htmlSRC     = './src/**/*.html';
var htmlURL = './dist/';

function reload(done){
    browserSync.reload();
    done();
}

function browser_sync(){
  browserSync.init({
    server:{
        baseDir: './dist/'
    }
  });
};

function css(done){
    //compile
    src( styleSRC )
        .pipe( sourcemaps.init())
        .pipe ( sass({
            errorLogToConsole: true,
            outputStyle: 'compressed'
        }) )
        .on( 'error', console.error.bind( console ))
        .pipe( autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false 
        }))
        .pipe( rename( {suffix: '.min' } ) )
        .pipe( sourcemaps.write( './'))
        .pipe( dest( styleDIST) )
        .pipe( browserSync.stream());
    done();
};

function js(done){
    jsFILES.map(function( entry ){
        return browserify({
            entries: [jsFolder + entry]
        })
        .transform( babelify, {presets: ['@babel/env']})
        .bundle()
        .pipe( source( entry ) )
        .pipe( rename({extname:'.min.js'}))
        .pipe( buffer())
        .pipe( sourcemaps.init({ loadmaps:true }))
        .pipe( uglify())
        .pipe( sourcemaps.write('./'))
        .pipe( dest (jsDIST))
        .pipe( browserSync.stream());
    });
    done();
};

function triggerPlumber( src_file, dest_file ) {
	return src( src_file )
		.pipe( plumber() )
		.pipe( dest( dest_file ) );
}

function images() {
	return triggerPlumber( imgSRC, imgURL );
};

function fonts() {
	return triggerPlumber( fontsSRC, fontsURL );
};

function html() {
	return triggerPlumber( htmlSRC, htmlURL );
};

function watch_files() {
	watch(styleWatch, series(css, reload));
	watch(jsWatch, series(js, reload));
	watch(imgWatch, series(images, reload));
	watch(fontsWatch, series(fonts, reload));
	watch(htmlWatch, series(html, reload));
	src(jsURL + 'script.min.js')
		.pipe( notify({ message: 'Gulp is Watching...' }) );
}

task("css", css);
task("js", js);
task("images", images);
task("fonts", fonts);
task("html", html);
task("default", parallel(css, js, images, fonts, html));
task("watch", parallel(browser_sync, watch_files));