# amCharts Weather Map

Version: 1.0.2


## Description

amCharts Weather Map is a JavaScript library that helps your create beautiful, dynamically-updated, searchable maps and charts with all kinds of weather-related information


## Installation

Before you start, ensure you have your own [OpenWeather API-Key](http://openweathermap.org/price) to be able to retrieve the weather data.

##### Quick and Dirty
You just want to give it a quick try and check it's capabilities, follow these few points.
* Copy [`/build`](./blob/master/build/) anywhere you want or leave it there.
* Place your OpenWeather API-Key in [`/build/assets/js/OPENWEATHER_APIKEY.js`](./blob/master/build/assets/js/OPENWEATHER_APIKEY.js).
* Open [`/build/index.html`](./blob/master/build/index.html) and voilá.

##### Advanced
You did it quick and dirty and now you feel to mess around with it? Here we go, this is your new route.
* Enter your new playground in [`/assets`](./blob/master/assets) and get crazy.
* Place your OpenWeather API-Key in [`/assets/js/OPENWEATHER_APIKEY.js`](./blob/master/assets/js/OPENWEATHER_APIKEY.js).
* If needed adapt the [`index.html`](./blob/master/index.html) as well.
* Open the [`index.html`](./blob/master/index.html) in your browser to enjoy all your changes.


## How to build

We use [`gruntjs`](http://gruntjs.com/) to do all the magic behind the scenes.
It minifies and combines several files together to lower the payload of the web-app.

1. Install [NPM and node.js](https://docs.npmjs.com/getting-started/installing-node)
2. Install [Bower](https://bower.io/#install-bower)
3. Goto `/` of this web-app in  your terminal
4. Run following command to install all node dependencies
```
> npm install -D
```
5. Run following command to install all bower dependencies
```
> bower install
```
6. Run grunt to create your own build
```
> grunt
```
7. Copy [`/build`](./blob/master/build/), place it anywhere you want and voilá.


## License

amCharts Weather Map library is licensed under Apache License 2.0.

This basically means you're free to use or modify it, even make your own
versions or completely different products out of them.

Please see attached file "license.txt" for the complete license or online here:

http://www.apache.org/licenses/LICENSE-2.0

**Important!** amCharts Weather Maps relies on other amCharts products such as [JavaScript Maps](https://www.amcharts.com/javascript-maps/) and [JavaScript Charts](https://www.amcharts.com/javascript-charts/), that are licensed differently.

## Contact us

* Email: contact@amcharts.com
* Web: https://www.amcharts.com/
* Facebook: https://www.facebook.com/amcharts
* Twitter: https://twitter.com/amcharts


## Changelog

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
