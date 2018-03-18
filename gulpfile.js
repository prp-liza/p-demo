var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var reactify = require('reactify')
var babelify = require('babelify')

var envify = require('envify/custom')
var uglifyify = require('uglifyify')

var uglify = require('gulp-uglify')
var buffer = require('vinyl-buffer')

var path = require('path')

// var changed = require('gulp-changed'),
// ngAnnotate = require('gulp-ng-annotate')

var browserSync = require('browser-sync');


var DEST = './public/js'


gulp.task('bundle-production',function(){
	process.env.NODE_ENV = 'production'
	return browserify('./main.jsx')
	.transform(babelify)
	.transform(require('browserify-css'))
	.transform(uglifyify)
	.bundle()
	.pipe(source('app.js'))
	.pipe(buffer())
	.pipe(uglify())
	.pipe(gulp.dest(DEST))
})

function build(_path){
	// process.env.NODE_ENV = 'production'
	return browserify('src/'+path.basename(_path))
	.transform(babelify)
	.transform(require('browserify-css'))
	// .transform(uglifyify)
	.bundle()
	.pipe(source(path.basename(_path)))
	// .pipe(buffer())
	// .pipe(uglify())
	.pipe(gulp.dest(DEST))
}

gulp.task('default',function(){

	browserSync.init(null,{
        proxy:"http://localhost:8000",
        port: 9000
    })

	gulp.watch(['src/*.js'],function(ev){
		if(ev.type==='added'||ev.type==='changed'){
			build(ev.path)
		}
	})

	gulp.watch(['public/js/*.js']).on('change',browserSync.reload)
	
})
