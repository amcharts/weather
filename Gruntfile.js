/*jshint node:true*/
module.exports = function( grunt ) {
	'use strict';

	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-bower-concat' );

	grunt.initConfig( {
		"name": "amcharts-weather",
		"version": "0.1",
		"author": "Benjamin Maertz <maertz@benjaminmaertz.de>",
		"bugs": {
			"url": "https://github.com/amcharts/weather/issues"
		},
		"bower_concat": {
			"all": {
				"dest": {
					"js": "build/assets/tmp/js/bower.js",
					"css": "build/assets/tmp/css/bower.css"
				}
			}
		},
		"copy": {
			"all": {
				"files": [ {
					"expand": true,
					"flatten": true,
					"src": [
						"assets/js/*"
					],
					"dest": "build/assets/tmp/js/",
					"filter": "isFile"
				}, {
					"expand": true,
					"flatten": true,
					"src": [
						"assets/css/*"
					],
					"dest": "build/assets/tmp/css/",
					"filter": "isFile"
				}, {
					"expand": true,
					"cwd": "assets/img/",
					"src": "**",
					"dest": "build/assets/img/",
					"filter": "isFile"
				}, {
					"expand": true,
					"cwd": "assets/fonts/",
					"src": "**",
					"dest": "build/assets/fonts/",
					"filter": "isFile"
				}, {
					"expand": true,
					"cwd": "assets/json/",
					"src": [
						"manifest.json",
						"countries/**",
						"cities/all/**",
						"cities/top10/all.object.json"
					],
					"dest": "build/assets/json/",
					"filter": "isFile"
				} ]
			},
			"apikey": {
				"files": [ {
					"expand": true,
					"flatten": true,
					"src": "build/assets/tmp/js/OPENWEATHER_APIKEY.js",
					"dest": "build/assets/js/",
					"filter": "isFile"
				} ]
			}
		},
		"uglify": {
			"target": {
				"options": {
					"compress": false
				},
				"files": {
					"build/assets/js/app.min.js": [
						"build/assets/tmp/js/bower.js",
						"build/assets/tmp/js/app.weather.startup.js",
						"build/assets/tmp/js/app.weather.component.js",
						"build/assets/tmp/js/app.weather.collisionHandler.js"
					]
				}
			}
		},
		"cssmin": {
			"options": {
				"processImports": true
			},
			"target": {
				"files": [ {
					"build/assets/css/app.min.css": [
						"build/assets/tmp/css/bower.css",
						"build/assets/tmp/css/app.css",
						"build/assets/tmp/css/app.social.css"
					]
				} ]
			}
		},
		"clean": {
			"tmp": [
				"build/assets/tmp"
			]
		}
	} );

	grunt.registerTask( 'default', [ 'copy', 'bower_concat', 'uglify', 'cssmin', 'clean' ] );

};