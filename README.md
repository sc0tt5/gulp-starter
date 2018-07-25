# Gulp Starter

Demonstrates various gulp plugins.

Built with:

-   [Babel](https://www.npmjs.com/package/babel-core)
-   [Gulp](https://www.npmjs.com/package/gulp)
    -   [autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer) (add vender prefixes to CSS rules)
    -   [babel](https://www.npmjs.com/package/gulp-babel) (transpile ES6 to ES5)
    -   [clean](https://www.npmjs.com/package/gulp-clean) (remove folders and files)
    -   [clean css](https://www.npmjs.com/package/gulp-clean-css) (minify CSS and remove comments)
    -   [concat](https://www.npmjs.com/package/gulp-concat) (concatenate files)
    -   [flatten](https://www.npmjs.com/package/gulp-flatten) (remove file path, return file name only)
    -   [header](https://www.npmjs.com/package/gulp-header) (insert comment at top of file)
    -   [htmlmin](https://www.npmjs.com/package/gulp-htmlmin) (minify HTML)
    -   [inject](https://www.npmjs.com/package/gulp-inject) (inject CSS and JavaScript bundles into HTML files)
    -   [load plugins](https://www.npmjs.com/package/gulp-load-plugins) (load gulp plugins from package.json)
    -   [notify](https://www.npmjs.com/package/gulp-notify) (system notifications)
    -   [plumber](https://www.npmjs.com/package/gulp-plumber) (dripping faucents, leaky pipes, running toilets, etc)
    -   [sass](https://www.npmjs.com/package/gulp-sass) (compile SCSS to CSS)
    -   [sequence](https://www.npmjs.com/package/gulp-sequence) (run tasks in order)
    -   [source maps](https://www.npmjs.com/package/gulp-sourcemaps) (connecting min to source files for debugging)
    -   [uglify](https://www.npmjs.com/package/gulp-uglify) (minify JavaScript)
    -   [jasmine](https://www.npmjs.com/package/jasmine-core) (unit testing)
    -   [karma](https://www.npmjs.com/package/karma) (test runner)
    -   [phantomjs](https://www.npmjs.com/package/phantomjs-prebuilt) (headless browser for unit testing)

## Getting Started

### Clone Repo

```
git clone https://github.com/sc0tt5/gulp-starter
```

### Installing

```
cd gulp-starter
npm install
npm start
```

## ToDo

-   Jasmine spec files in ES6
-   Run test on changed file only using gulp-newer, prevent src-to-dist if fail
