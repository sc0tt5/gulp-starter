import gulp from 'gulp';
import del from 'del';
import babel from 'gulp-babel';
import cleanCSS from 'gulp-clean-css';
import concat from 'gulp-concat';
import htmlclean from 'gulp-htmlclean';
import htmlmin from 'gulp-htmlmin';
import inject from 'gulp-inject';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

// paths
const paths = {
	src: 'src/**/*',
	srcHTML: 'src/**/*.html',
	srcCSS: 'src/**/*.css',
	srcJS: 'src/**/*.js',
	dist: 'dist',
	distIndex: 'dist/index.html',
	distCSS: 'dist/**/*.css',
	distJS: 'dist/**/*.js'
};

// html to dist
gulp.task('html:dist', () =>
	gulp
		.src(paths.srcHTML)
		.pipe(sourcemaps.init())
		.pipe(htmlclean())
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.dist))
);

// css to dist
gulp.task('css:dist', () =>
	gulp
		.src(paths.srcCSS)
		.pipe(cleanCSS())
		.pipe(gulp.dest(paths.dist))
);

// js to dist
gulp.task('js:dist', () =>
	gulp
		.src(paths.srcJS)
		.pipe(sourcemaps.init())
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
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.dist))
);

// wrapper task
gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist']);

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
