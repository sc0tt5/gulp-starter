import del from 'del';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import cleanCSS from 'gulp-clean-css';
import concat from 'gulp-concat';
import flatten from 'gulp-flatten';
import htmlclean from 'gulp-htmlclean';
import htmlmin from 'gulp-htmlmin';
import inject from 'gulp-inject';
import minifycss from 'gulp-minify-css';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import uglify from 'gulp-uglify';

// paths
const paths = {
	// src
	src: 'src/**/*',
	srcHTML: 'src/**/*.html',
	srcCSS: 'src/**/*.scss',
	srcJS: 'src/**/*.js',
	// dist
	dist: 'dist',
	distIndex: 'dist/index.html',
	distCSS: 'dist/**/*.css',
	distJS: 'dist/**/*.js'
};

// html to dist
gulp.task('html:dist', () =>
	gulp
		.src(paths.srcHTML)
		.pipe(htmlclean())
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest(paths.dist))
);

// scss to dist as css
gulp.task('css:dist', () =>
	gulp
		.src(paths.srcCSS)
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(sass({ style: 'compressed' }))
		.pipe(autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9'))
		.pipe(cleanCSS())
		.pipe(minifycss())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.dist))
);

// js to dist
gulp.task('js:dist', () =>
	gulp
		.src(paths.srcJS)
		.pipe(
			babel({
				presets: ['env']
			})
		)
		.pipe(concat('script.min.js'))
		.pipe(
			uglify().on('error', e => {
				console.log(e);
			})
		)
		.pipe(gulp.dest(paths.dist))
);

// copy dependencies to ./dist/libs/
gulp.task('copy:libs', () => {
	gulp.src([
		'node_modules/**/*jquery.min.js',
		'node_modules/**/*lodash.min.js'
	])
		.pipe(flatten())
		.pipe(gulp.dest('./dist/lib'));
});

// wrapper task
gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist', 'copy:libs']);

// inject, build and watch
gulp.task('inject:dist', ['copy:dist'], () => {
	let css = gulp.src(paths.distCSS),
		js = gulp.src(paths.distJS);

	return gulp
		.src(paths.distIndex)
		.pipe(inject(css, { relative: true }))
		.pipe(inject(js, { relative: true }))
		.pipe(gulp.dest(paths.dist));
});

gulp.task('build', ['inject:dist']);

gulp.task('watch', ['build'], () => {
	gulp.watch(paths.src, ['inject:dist']);
});

gulp.task('default', ['watch']);

// prevent dist from pushing to repo
gulp.task('clean', () => {
	del([paths.dist]);
});
