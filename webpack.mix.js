let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/assets/js/app.js', 'public/js')
   .sass('resources/assets/sass/app.scss', 'public/css');

mix.scripts([
	'public/js/misc.js',
    'public/js/stx.js',
    'public/js/atx.js'
], 'public/js/main.js');

mix.scripts([
	'public/js/rz/misc.js',
    'public/js/rz/assembler.js',
    'public/js/rz/simulator.js'
], 'public/js/rz/main.js');
