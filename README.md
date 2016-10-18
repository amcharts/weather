# amCharts Weather Map

Version: 1.0.4


## Description

amCharts Weather Map is a JavaScript library that helps your create beautiful, dynamically-updated, searchable maps and charts with all kinds of weather-related information


## Installation

Before you start, ensure you have your own [OpenWeather API-Key](http://openweathermap.org/price) to be able to retrieve the weather data.

##### Quick and Dirty
You just want to give it a quick try and check it's capabilities, follow these few points.
* Uncompressed (development version)
	* Copy [`/`](./blob/master/) anywhere you want or leave it there.
	* Delete [`/build`](./blob/master/build/) in your _anywhere_ (actually not necessary)
	* Place your OpenWeather API-Key in [`/assets/js/OPENWEATHER_APIKEY.js`](./blob/master/build/assets/js/OPENWEATHER_APIKEY.js).
	* Open [`/index.html`](./blob/master/index.html) and voilá.

* Compressed (production version)
	* Copy [`/build`](./blob/master/build/) anywhere you want or leave it there.
	* Place your OpenWeather API-Key in [`/build/assets/js/OPENWEATHER_APIKEY.js`](./blob/master/build/assets/js/OPENWEATHER_APIKEY.js).
	* Open [`/build/index.html`](./blob/master/build/index.html) and voilá.

##### Advanced
You did it quick and dirty and now you feel to mess around with it? Here we go, this is your new route.
* Enter your new playground in [`/assets`](./blob/master/assets) and get crazy (not the one in [`/build`](./blob/master/build/)).
* Place your OpenWeather API-Key in [`/assets/js/OPENWEATHER_APIKEY.js`](./blob/master/assets/js/OPENWEATHER_APIKEY.js).
* If needed adapt the [`index.html`](./blob/master/index.html) as well.
* Open the [`index.html`](./blob/master/index.html) in your browser to enjoy all your changes.
* Everything good? Alright you probably wonder [`how to build`](#how-to-build).


## How to build

We use [`gruntjs`](http://gruntjs.com/) to do all the magic behind the scenes.
It minifies and combines several files together to lower the payload of the web-app.

* Install [NPM and node.js](https://docs.npmjs.com/getting-started/installing-node)
* Install [Bower](https://bower.io/#install-bower)
* Goto `/` of this web-app in  your terminal
* Run following command to install all node dependencies
```
> npm install -D
```
* Run following command to install all bower dependencies
```
> bower install
```
* Run grunt to create your own build
```
> grunt
```
* Copy [`/build`](./blob/master/build/), place it anywhere you want and voilá.

## Support

Important thing to know is this: amCharts Weather Map is not a product. It's 
rather a showcase of what can be done with amCharts products. While we'll do 
our best to answer your queries in GitHub issue tracker, we won't be able to
extend full-fledged [amCharts support service](https://www.amcharts.com/support/about-support/)
to this tool.


## License

amCharts Weather Map library is licensed under Apache License 2.0.

This basically means you're free to use or modify it, even make your own
versions or completely different products out of them.

Please see attached file "license.txt" for the complete license or online here:

http://www.apache.org/licenses/LICENSE-2.0

**Important!** amCharts Weather Maps relies on other amCharts products such as 
[JavaScript Maps](https://www.amcharts.com/javascript-maps/) and 
[JavaScript Charts](https://www.amcharts.com/javascript-charts/), that are 
licensed differently.

## Contact us

* Email: contact@amcharts.com
* Web: https://www.amcharts.com/
* Facebook: https://www.facebook.com/amcharts
* Twitter: https://twitter.com/amcharts


## Changelog

### 1.0.4
* Added: Necessary bower components for uncompressed version
* Fixed: bower.json, package.json

### 1.0.3
* Fixed: Belarus title issue
* Fixed: US exception zooming into the states less alaska
* Fixed: Initial zoom to gain more space
* Fixed: Initial stations `defaultStations` in config, top 15 by population has been hardcoded
* Fixed: Top NAV menu to toggle the menu
* Fixed: Search / Results behaviour
* Fixed: below zero temperature display

### 1.0.2
* Fixed: SVG icon display issue on Firefox
* Changed: Versioning structure
* Changed: Beautified all JS and CSS files
* Added: Resource CSV to load the specific country map files
* Added: Country map switch to load specific country maps
* Added: Unit switcher to toggle between celsius and fahrenheit
* Added: `loadMap` to dynamically replace the map files and search context
* Removed: OpenWeather API Key

### 0.1 PR
* Pre-release

### Credits

This tool uses [OpenWeatherMap](http://openweathermap.org/) API.

This tool relies on data extracted from [GeoNames](http://www.geonames.org/).

It also uses amCharts JavaScript libraries: [JavaScript Maps](https://www.amcharts.com/javascript-maps/) and [JavaScript Charts](https://www.amcharts.com/javascript-charts/)
