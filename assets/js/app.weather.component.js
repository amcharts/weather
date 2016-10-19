/*
Name: amCharts Weather Map
Description: Weather forecast webapp
Author: Benjamin Maertz, amCharts
Version: 1.0.5
Author URI: http://www.amcharts.com/

Copyright 2016 amCharts

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Please note that the above license covers only this plugin. It by all means does
not apply to any other amCharts products that are covered by different licenses.
*/
var AmWeather = function() {
    var _this = this;

    // VERSION :)
    _this.version = "1.0.5";
    _this.bbox = {};

    // SELECTOR
    _this.selector = {
        app: {
            wrapper: ".app",
            views: ".app .view",
            loader: ".app .view.loader",
            container: ".app .view.container",
            map: ".map",
            chart: ".chart",
            nav: ".nav",
            navToggle: ".nav .toggle a",
            navLoadMap: ".nav .loadmap",
            navLoadMapWorld: ".nav .loadmap.world",
            navLoadMapCountry: ".nav .loadmap.country"
        },
        search: {
            input: ".search .input input",
            inputIcon: ".search .input .icon",
            inputUnitSwitcher: ".search .input .unit-switcher button",
            results: ".search .results"
        }
    }

    // SEARCH
    _this.search = {
        data: [],
        autocomplete: null,
        countyMode: false,
        modeReset: false,
        switchedAt: 0,
        blacklist: []
    }

    // DATA
    _this.data = {
        countries: {},
        cities: {},
        merged: [],
        stations: {},
        extended: {},
        template: {
            units: "metric",
            forecast: [],
            current: {
                id: null,

                lat: null,
                lng: null,

                name: "",
                countryCode: null,
                timestamp: null,

                temp: null,
                humidity: null,
                pressure: null,

                wind_deg: null,
                wind_speed: null,

                sunrise: null,
                sunset: null,

                icon: null
            }
        }
    }

    // CONFIG
    _this.config = {
        debug: false,
        units: "metric",
        language: "en",
        apikey: OPENWEATHER_APIKEY,
        endpoint: OPENWEATHER_ENDPOINT,
        pathToImages: "./assets/img/weather/",
        pathToImagesAnimated: "./assets/img/weather-animated/",
        pathToResources: "./assets/csv/resources.csv",
        easing: jQuery.easing.easeInOutCubic,
        labels: {
            showThis: "Show",
            hideThis: "Hide"
        },

        defaultZoom: {
            zoomLevel: 1.25,
            zoomLatitude: 25.1337,
            zoomLatitudeC: 25.1337,
            zoomLongitude: 10.3268,
            zoomLongitudeC: 10.3268
        },

        // TOP 15 BY POPULATION
        defaultStations: [{
            "id": 1814991
        }, {
            "id": 1269750
        }, {
            "id": 6252001
        }, {
            "id": 1643084
        }, {
            "id": 3469034
        }, {
            "id": 1168579
        }, {
            "id": 1210997
        }, {
            "id": 2328926
        }, {
            "id": 2017370
        }, {
            "id": 1861060
        }, {
            "id": 3996063
        }, {
            "id": 1694008
        }, {
            "id": 1562822
        }, {
            "id": 337996
        }, {
            "id": 2921044
        }]
    }

    // CURRENT BUFFER
    _this.current = {
        station: false,
        stations: false,
        units: _this.config.units,
        country_code: false,
        isCountryMode: false,

        map_instance: null,
        map_isAnimating: false,
        map_afterAnimating: false,

        chart_instance: null,
        chart_type: "temperature",
        chart_data: [],
        chart_graphs: {},
    }

    // ENVIROMENT
    _this.env = {
        map: "worldLow",
        searchCountries: "",
        searchCities: "",
        params: {},
        maps: {
            world: "//www.amcharts.com/lib/3/maps/js/worldLow.js"
        }
    }

    // INITIALIZE
    _this.__initialize();
}

/*
 ** SHOW OFF
 */
AmWeather.prototype.__showOff = function() {
    var _this = this;
    jQuery(_this.selector.app.wrapper).addClass("show-drawer");
    jQuery(_this.selector.app.loader).removeClass("visible");
    jQuery(_this.selector.app.container).addClass("visible");
    jQuery(_this.selector.search.input).focus();
}

/*
 ** INITIALIZE
 */
AmWeather.prototype.__initialize = function() {
    var _this = this;

    // EXTEND JQUERY FOR OUR NEEDS
    _this.__extendJquery();

    // CREATE MAP INSTANCE
    _this.__createMap();

    // CREATE CHART INSTANCE
    _this.__createChart();

    // CREATE SEARCH INSTANCE
    _this.__createSearch();

    // CREATE TAB INSTANCE
    _this.__createTabs();

    // INITIALIZE ENVIROMENT
    _this.__getEnv();

    // BIND TOGGLE BUTTON
    jQuery(_this.selector.app.navToggle).on("click", function(e) {
        e.preventDefault();

        // TOGGLE
        jQuery(_this.selector.app.wrapper).toggleClass("show-drawer");

        // TEXT
        if (jQuery(_this.selector.app.wrapper).hasClass("show-drawer")) {
            jQuery(this).text(_this.config.labels.hideThis);
        } else {
            jQuery(this).text(_this.config.labels.showThis);
        }
    });

    // BIND BACK BUTTON
    jQuery(_this.selector.search.inputIcon).on("click", function(e) {
        e.preventDefault();

        // RESET
        if (_this.env.map == "worldLow" && _this.current.isCountryMode) {
            _this.worldMode();
        }
    });

    // BIND LOAD MAP LINK
    jQuery(_this.selector.app.navLoadMap).on("click", function(e) {
        e.preventDefault();
        var button_data = jQuery(this).data();
        var isForced = jQuery(this).hasClass("forced");
        var isCountry = jQuery(this).hasClass("country");

        if (button_data && button_data.map) {
            if (!isCountry || isForced) {
                _this.loadMap(button_data.map);
            }
        }
    });

    // BIND UNIT TOGGLE BUTTONS
    jQuery(_this.selector.search.inputUnitSwitcher).on("click", function(e) {
        e.preventDefault();

        var data = jQuery(this).data();

        // UPDATE UNITS
        _this.current.units = data.units;
        _this.updateUnits();

        // UPDATE SEARCH BY TRIGGERING BLUR
        _this.search.input.trigger("blur");

        // TOGGLE BUTTONS
        jQuery(this).parent().find("button").removeClass("active");
        jQuery(this).addClass("active");
    });
}

/*
 ** LOAD MAP FILE AND GATHER SEARCH CONTEXT
 */
AmWeather.prototype.loadMap = function(country_name) {
    var _this = this;
    var mapFile = _this.env.maps[country_name];
    var mapFileName = _this.env.map;

    // FILENAME
    if (mapFile) {
        mapFileName = country_name + "Low";

        // FALLBACK TO WORLD
    } else {
        mapFile = _this.env.maps["world"];
    }

    // UPDATE ENV
    _this.env.map = mapFileName;
    _this.env.searchCountries = "./assets/json/countries/all/all.object.json";
    _this.env.searchCities = "./assets/json/cities/top10/all.object.json";

    // LOAD MAP FILE
    function handleMapFile() {
        var country_map = AmCharts.maps[mapFileName];
        var country_paths, country_code, country_projection;

        // NOT HERE
        if (!country_map) {
            return false;
        }

        // PREPARE FOR REQUESTED MAP
        if (mapFileName != "worldLow") {
            jQuery(_this.selector.app.wrapper).addClass("country-map");
            if (country_map) {
                country_paths = country_map.svg.g.path;
                if (country_paths && country_paths.length) {
                    country_code = country_paths[0].id.split("-")[0];
                    if (country_code) {
                        _this.env.searchCountries = "./assets/json/countries/all/" + country_code + ".json";
                        _this.env.searchCities = "./assets/json/cities/all/" + country_code + ".json";
                    }
                }
            }
        } else {
            jQuery(_this.selector.app.wrapper).removeClass("country-map");
        }

        // MAP PROJECTION
        if (_this.env.map == "usaMercatorLow") {
            country_projection = "eckert3";
        } else {
            country_projection = "mercator";
        }

        // UPDATE MAP
        _this.current.map_instance.dataProvider = {
            map: _this.env.map,
            getAreasFromMap: true,
            images: [],
            projection: country_projection
        }
        _this.current.map_instance.validateNow();

        // LOAD SEARCH CONTEXT
        _this.getSearchDataByCountryCode(country_code);

        return true;
    }

    // GET MAP FILE
    if (!handleMapFile()) {
        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", mapFile);
        script.addEventListener("load", handleMapFile);
        document.body.appendChild(script);
    }
}

/*
 ** EXPLORE ENVIROMENT
 */
AmWeather.prototype.__getEnv = function() {
    var _this = this;
    var queryString = location.search.slice(1).split("&");
    var params = {};

    // QUERY STRING
    for (i1 in queryString) {
        var batch = queryString[i1].split("=");
        var key = jQuery.trim(batch[0]);
        var value = jQuery.trim(batch[1]);

        if (key && value) {
            params[key] = value;
        }
    }

    // UPDATE ENV
    _this.env.params = params;

    // GATHER RESOURCES
    jQuery.ajax({
        url: _this.config.pathToResources,

        // GET AVAILABLE RESOURCES AND LOAD REQUESTED MAP
        success: function(data) {
            var rows = data.split("\n");
            var maps = [];

            // WALKTHROUGH DATA
            jQuery(rows).each(function(i1, fileName) {
                var explode = fileName.split("/");
                var file = explode.pop();

                // EXTRACT FILENAME AND ADD LINK INTO MAP
                if (file && file.indexOf("Low") != -1) {
                    var mapName = file.replace("Low.js", "");

                    _this.env.maps[mapName] = fileName;
                }
            });

            // LOAD MAP FILE
            _this.loadMap(_this.env.params.map);
        },

        // LOAD BY DEFAULT THE WORLD MAP
        error: function() {
            _this.loadMap();
        }
    });
};

/*
 ** UPDATE SHOWN COMPONENTS
 */
AmWeather.prototype.updateUnits = function() {
    var _this = this;

    // UPDATE WEATHER BADGE
    if (_this.current.station) {
        _this.getWeatherById(_this.current.station.id);
    }

    // UPDATE SHOWN WEATHER STATIONS
    if (_this.current.stations) {
        _this.setWeatherStations(_this.current.stations);
    }
};

/*
 ** CONVERT TEMPERATUR TO SET UNIT
 */
AmWeather.prototype.getTemperatur = function(src, value, dest) {
    var _this = this;

    dest = dest ? dest : _this.current.units;

    if (!isNaN(value)) {
        if (src == "metric" && dest == "imperial") {
            return parseInt(value * 1.8 + 32);
        } else if (src == "imperial" && dest == "metric") {
            return parseInt((value - 32) / 1.8);
        }
    }
    return value;
}

/*
 ** MAP ZOOM HANDLER
 */
AmWeather.prototype.mapZoomHandler = function(e) {
    var _this = this;

    _this.current.map_isAnimating = false;
    if (_this.current.map_afterAnimating) {
        _this.current.map_afterAnimating();
        _this.current.map_afterAnimating = false;
    }
}

/*
 ** SELECT COUNTRY BY COUNTRY MODE
 */
AmWeather.prototype.selectCountryByCountyCode = function(country_code) {
    var _this = this;
    var areas = _this.current.map_instance.dataProvider.areas;

    // HIGHLIGHT COUNTRY
    jQuery(areas).each(function() {
        this.showAsSelected = this.id === country_code;
        this.balloonText = this.id === country_code ? "" : undefined;
    });
}

/*
 ** MAP CLICK HANDLER
 */
AmWeather.prototype.mapClickHandler = function(e) {
    var _this = this;
    var mapObject = e.mapObject;
    var station = mapObject.station;
    var country = _this.getCountryByCountryCode(mapObject.id);
    var zoomLevel = _this.current.map_instance.zoomLevel();

    // GET BY SELECTED STATION
    if (station) {
        if (station.current.isCountry) {
            _this.hideWeather();
            _this.countryMode(station.current.countryCode, true);
        } else {
            _this.showWeather(station.current);
        }

        // GET BY SELECTED COUNTRY CENTER POINT
    } else if (country) {
        _this.hideWeather();
        _this.countryMode(country.countryCode, "autoZoom");
    }
}

/*
 ** MAP ZOOM ALLOWED
 */
AmWeather.prototype.mapZoomAllowed = function() {
    var _this = this;

    _this.current.map_instance.dataProvider.zoomLevel = _this.current.map_instance.zoomLevel();
    _this.current.map_instance.dataProvider.zoomLatitude = _this.current.map_instance.zoomLatitude();
    _this.current.map_instance.dataProvider.zoomLongitude = _this.current.map_instance.zoomLongitude();

    if (_this.current.map_instance.updatedData || _this.current.map_instance.dataProvider.zoomLevel < 4) {
        return false;
    }

    return true;
}

/*
 ** GET WEATHER BY POINT
 */
AmWeather.prototype.getWeatherByPoint = function(longitude, latitude) {
    var _this = this;
    var query = {
        cnt: 200,
        cluster: "no",
        format: "json",
        appid: _this.config.apikey,
        lang: _this.config.language,
        units: _this.config.units,
        lon: longitude,
        lat: latitude
    }

    // CHECK IF ZOOM IS ALLOWED
    if (!_this.mapZoomAllowed()) {
        return;
    }

    // REQUEST DATA
    jQuery.ajax({
        url: _this.config.endpoint + "find",
        data: query,
        success: function(data) {
            // SET WEATHER STATIONS
            _this.setWeatherStations(data.list);
        },
        error: function() {
            _this.log("getWeatherByPoint", arguments);
        }
    })
}

/*
 ** GET WEATHER BY BOUNDARIES
 */
AmWeather.prototype.getWeatherByBoundaries = function() {
    var _this = this;
    var latlng;
    var bbr = _this.current.map_instance.boundingRect;
    var coords = [];
    var query = {
        cnt: 200,
        cluster: "no",
        format: "json",
        appid: _this.config.apikey,
        lang: _this.config.language,
        units: _this.config.units,
        coords: ""
    }

    // CHECK IF ZOOM IS ALLOWED
    if (_this.mapZoomAllowed()) {
        return;
    }

    // TOP LEFT
    latlng = _this.current.map_instance.stageXYToCoordinates(0, 0);
    coords.push(latlng.longitude);
    coords.push(latlng.latitude);

    // BOTTOM RIGHT
    latlng = _this.current.map_instance.stageXYToCoordinates(_this.current.map_instance.divRealWidth, _this.current.map_instance.divRealHeight);
    coords.push(latlng.longitude);
    coords.push(latlng.latitude);

    query.bbox = coords.join(",")

    // REQUEST DATA
    jQuery.ajax({
        url: _this.config.endpoint + "box/city",
        data: query,
        success: function(data) {
            // SET WEATHER STATIONS; TODO UPDATE TO DATA SHAPE
            _this.setWeatherStations(data.list);
        },
        error: function() {
            _this.log("getWeatherByBoundaries", arguments);
        }
    })
}

/*
 ** SET WEATHER STATIONS
 */
AmWeather.prototype.setWeatherStations = function(stations) {
    var _this = this;
    var images = [];

    // SET AS CURRENT
    _this.current.stations = stations;

    // WALKTHROUGH STATIONS
    jQuery.each(stations, function(i1, station) {
        var current = station.current;
        var imageURL = [_this.config.pathToImages, current.icon || "", ".svg"].join("");

        // IGNORE THOSE WITH NO ICON
        if (!current.icon) {
            return;
        }

        // ICON
        images.push({
            groupId: current.id,
            rollOverScale: 1.2,
            selectable: true,
            station: station,
            latitude: current.lat,
            longitude: current.lng,
            imageURL: imageURL,
            width: 128,
            height: 128,
            positionScale: 0.5,
            animationIcon: current.icon
        });

        // LABEL
        images.push({
            groupId: current.id,
            rollOverScale: 1.2,
            selectable: true,
            station: station,
            latitude: current.lat,
            longitude: current.lng,
            label: current.name.toUpperCase(),
            labelFontSize: 9,
            labelColor: "#7890B0",
            labelRollOverColor: "#7890B0",
            labelPosition: "right",
            labelShiftX: 30,
            labelShiftY: -20,
            color: "transparent"
        });

        // TEMPERATURE
        images.push({
            groupId: current.id,
            rollOverScale: 1.2,
            selectable: true,
            station: station,
            latitude: current.lat,
            longitude: current.lng,
            label: String(_this.getTemperatur(station.units, current.temp)) + "\u00B0",
            labelFontSize: 24,
            labelColor: "#000000",
            labelRollOverColor: "#000000",
            labelPosition: "right",
            labelShiftX: 30,
            labelShiftY: 0,
            color: "transparent"
        });
    });

    // UPDATE DATA
    _this.updateMapData({
        images: images
    });
}

/*
 ** UPDATE MAP DATA
 */
AmWeather.prototype.updateMapData = function(dataProvider) {
    var _this = this;

    // CALLEE
    function callback() {
        var zoomSettings = _this.config.defaultZoom;

        if (_this.current.isCountryMode) {
            zoomSettings = {
                zoomLevel: _this.current.map_instance.zoomLevel(),
                zoomLatitude: _this.current.map_instance.zoomLatitude(),
                zoomLatitudeC: _this.current.map_instance.zoomLatitude(),
                zoomLongitude: _this.current.map_instance.zoomLongitude(),
                zoomLongitudeC: _this.current.map_instance.zoomLongitude()
            }
        }

        // MERGE ZOOMSETTINGS;
        dataProvider = jQuery.extend(dataProvider, zoomSettings);

        jQuery.extend(_this.current.map_instance.dataProvider, dataProvider);

        setTimeout(function() {
            _this.current.map_instance.validateData();
        }, 1);
    }

    // SET ON HOLD IF IT'S STILL ANIMATING
    if (_this.current.map_isAnimating) {
        _this.current.map_afterAnimating = callback;

    } else {
        callback();
    }
};

/*
 ** CREATE MAP INSTANCE
 */
AmWeather.prototype.__createMap = function() {
    var _this = this;

    // WALKTHROUGH MAPS
    jQuery(_this.selector.app.map).each(function() {
        _this.current.map_instance = AmCharts.makeChart(this, {

            type: "map",

            fontFamily: "Roboto",
            fontSize: 17,

            dataProvider: {},

            mouseWheelZoomEnabled: true,

            backgroundColor: "#CEE0F6",
            backgroundAlpha: 1,

            areasSettings: {
                autoZoom: true,
                selectable: true,
                rollOverOutlineColor: "#A9C1DA",
                rollOverColor: "#FFFFFF",
                rollOverOutlineColor: "#A9C1DA",
                selectedColor: "#FFFFFF",
                outlineColor: "#A9C1DA",
                outlineThickness: 1,
                color: "#F2F6FA"
            },

            creditsPosition: "bottom-right",

            zoomControl: {
                homeButtonEnabled: true,
                bottom: 20,
                left: 30,
                buttonSize: 40,
                buttonBorderAlpha: 0,
                gridHeight: 10,
                maxZoomLevel: 1000
            },

            balloon: {
                enabled: true,
                horizontalPadding: 15,
                verticalPadding: 12
            },

            weather: {
                enabled: true
            },


            defs: {
                filter: [{
                    x: "-50%",
                    y: "-50%",
                    width: "200%",
                    height: "200%",
                    id: "blur",
                    feGaussianBlur: { in: "SourceGraphic",
                        stdDeviation: "15"
                    }
                }]
            },


            listeners: [{
                event: "init",
                method: function() {
                    _this.__showOff();
                }
            }, {
                event: "zoomCompleted",
                method: function() {
                    _this.mapZoomHandler.apply(_this, arguments);
                }
            }, {
                event: "dragCompleted",
                method: function() {
                    _this.mapZoomHandler.apply(_this, arguments);
                }
            }, {
                event: "clickMapObject",
                method: function() {
                    _this.mapClickHandler.apply(_this, arguments);
                }
            }, {
                event: "homeButtonClicked",
                method: function() {
                    if (_this.env.map == "worldLow") {
                        _this.worldMode();
                    } else {
                        _this.current.map_instance.zoomToGroup();
                        _this.hideWeather();
                    }
                }
            }, {
                event: "rollOverMapObject",
                method: function(e) {
                    var mapObject = e.mapObject;

                    if (mapObject.groupId) {
                        _this.animateStationByStationId(mapObject.groupId);
                    }
                }
            }, {
                event: "rollOutMapObject",
                method: function(e) {
                    var mapObject = e.mapObject;

                    if (mapObject.groupId) {
                        _this.resetAnimationByStationId(mapObject.groupId);
                    }
                }
            }]
        });
    });

    this.log("MAP CREATED");
}

/*
 ** CREATE CHART INSTANCE
 */
AmWeather.prototype.__createChart = function() {
    var _this = this;

    // WALKTRHOUGH CHARTS
    jQuery(_this.selector.app.chart).each(function() {
        _this.current.chart = AmCharts.makeChart(this, {

            type: "serial",

            fontFamily: "Roboto",

            dataProvider: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
            categoryField: "timestamp",

            autoMargins: false,
            zoomOutOnDataUpdate: false,
            addClassNames: true,

            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,

            creditsPosition: "bottom-right",

            categoryAxis: {
                axisAlpha: 0,
                gridAlpha: 0.1,
                labelsEnabled: false,
                gridPosition: "start"
            },

            valueAxes: [{
                id: "v1",
                minimum: 0,
                maximum: 100,
                axisAlpha: 0,
                gridAlpha: 0,
                labelsEnabled: false
            }, {
                id: "v2",
                minimum: 0,
                maximum: 100,
                axisAlpha: 0,
                gridAlpha: 0,
                labelsEnabled: false
            }],

            zoomOutText: "",

            balloon: {
                enabled: false
            },

            fontFamily: "Open Sans",

            graphs: [

                // TIME
                {
                    id: "time",
                    clustered: false,
                    lineAlpha: 0,
                    fontSize: 12,
                    valueField: "v2top",
                    valueAxis: "v2",
                    labelOffset: 20,
                    labelText: "[[time]]",
                    labelPosition: "bottom"
                },


                // LABEL
                {
                    id: "label",
                    clustered: false,
                    lineAlpha: 0,
                    labelOffset: 30,
                    valueField: "value",
                    labelText: "[[label]]",
                    labelFunction: function(e) {
                        var dataContext = e.dataContext;
                        return AmCharts.formatDataContextValue(e.graph.labelText, {
                            value: parseInt(dataContext.label)
                        });
                    },
                    labelPosition: "top",
                    fontSize: 20
                },

                // VALUE
                {
                    id: "value",
                    type: "line",
                    valueField: "value",

                    bullet: "round",
                    bulletAlpha: 1,
                    bulletSize: 10,
                    bulletColor: "#B6CCE2",

                    bulletBorderAlpha: 1,
                    bulletBorderColor: "#FFFFFF",
                    bulletBorderThickness: 5,

                    lineAlpha: 1,
                    lineColor: "#A9C1DA",
                    fillAlphas: 0.3,
                    fillColors: "#F2F6FA"
                },

                // WEATHERICON
                {
                    id: "icon",
                    clustered: false,
                    lineAlpha: 0,
                    bulletSize: 128,
                    bulletOffset: 90,
                    valueField: "value",
                    customBulletField: "icon"
                },

                // WIND ROSE
                {
                    id: "wind_deg",
                    clustered: false,
                    lineAlpha: 0,
                    bulletSize: 20,
                    bulletOffset: -80,
                    valueField: "v2top",
                    valueAxis: "v2",
                    labelText: "[[wind_deg]]",
                    labelPosition: "bottom",
                    customBullet: _this.config.pathToImages + "weather_sagittarius.svg",
                    labelFunction: function(e) {
                        _this.__rotateWindRose(e);
                    }
                }

            ],

            listeners: [

                {
                    event: "init",
                    method: function(e) {
                        jQuery(e.chart.graphs).each(function() {
                            _this.current.chart_graphs[this.id] = this;
                        });

                        e.chart.zoomToIndexes(1, 7);
                    }
                },

                {
                    event: "rollOverGraphItem",
                    method: function(e) {
                        if (e.graph.id == "wind_deg") {
                            setTimeout(function() {
                                _this.__rotateWindRose(e.item);
                            }, 1);
                        }
                    }
                },

            ]
        });
    });
}

/*
 ** CREATE SEARCH
 */
AmWeather.prototype.__createSearch = function() {
    var _this = this;
    var input = jQuery(_this.selector.search.input);

    // CREATE SEARCH INSTANCE
    _this.search.input = jQuery(input).autocomplete({
        appendTo: _this.selector.search.results,
        minLength: 0,

        // CONTEXT HANDLER
        source: function(request, response) {
            var stations = jQuery.ui.autocomplete.filter(_this.search.data, request.term);
            var first = stations[0];

            // HIDE LIST IN COUNTRY MODE WITH NO SEARCH TERM
            if (!_this.current.isCountryMode && request.term.length == 0) {
                _this.search.autocomplete.close();
                return;
            }

            // NO RESULTS
            if (stations.length === 0) {
                var message = "No results...";

                // HINT
                if (!_this.current.isCountryMode) {
                    message = "No results, try country first...";
                }

                // PUSH MESSAGE
                stations = [{
                    err: true,
                    value: message
                }];

                // AUTO SWITCH TO COUNTRY MODE
            } else if (stations.length === 1 && first && first.isCountry) {
                stations = _this.countryMode(first.countryCode, true);
            }

            // TOP 10 RESULTS
            response(stations.slice(0, 10));
        },

        // RESULTS HANDLER
        response: function(event, ui) {
            var stations = ui.content;

            _this.getWeatherByStations(stations);
        },

        // SELECTION HANDLER
        select: function(event, ui) {
            var item = ui.item;

            // ERROR
            if (item.err) {
                _this.filterSearchList("");
                return false;
            }

            // SELECT COUNTRY
            if (item.isCountry) {
                _this.countryMode(item.countryCode, true);

                // SELECT CITY
            } else {
                _this.selectItem(item);
            }

            return false;
        },

        open: function() {
            jQuery(_this.selector.app.wrapper).addClass("show-search-results");
        },

        close: function() {
            // RESET
            jQuery(".search .results ul").css({
                height: "auto"
            });
            jQuery(_this.selector.app.wrapper).removeClass("show-search-results");
        },

        // FOCUS HANDLER
        focus: function(event, ui) {
            _this.focusItem(ui.item);
        }
    });

    // RESEARCH VALUE
    _this.search.input.on("focus", function() {
        if (this.value.length || _this.current.isCountryMode) {
            _this.filterSearchList(this.value);
        }
    });


    // RESEARCH VALUE
    _this.search.input.on("blur", function() {
        if (_this.current.station) {
            if (this.value.length) {
                _this.filterSearchList(this.value);
            } else {
                _this.search.autocomplete.close();
            }
        } else {
            _this.filterSearchList(this.value);
        }
    });

    // RESET CITY MODE
    _this.search.input.on("keyup", function(e) {
        var input = jQuery(this).val();
        var isBackspace = e.keyCode == jQuery.ui.keyCode.BACKSPACE;

        if (_this.current.isCountryMode && isBackspace && _this.env.map == "worldLow") {
            if (input == "") {
                if (!_this.search.modeReset) {
                    _this.search.modeReset = true;
                } else {
                    _this.search.modeReset = false;
                    _this.worldMode();
                }
            }
        } else {
            _this.search.modeReset = false;
        }
    });

    // REFERENCE
    _this.search.autocomplete = _this.search.input.data("ui-autocomplete");
}

/*
 ** CREATE TABS
 */
AmWeather.prototype.__createTabs = function() {
    var _this = this;

    // WALKTHROUGH TABS; HIGHLIGHT FIRST
    jQuery(".tabs a")
        .on("click", function(e) {
            e.preventDefault();
            var data = jQuery(this).data();

            jQuery(".tabs li").removeClass("active");

            jQuery(this).parent().addClass("active");
            _this.setChartType(data.type, true);
        })
        .first()
        .parent()
        .addClass("active");
}

/*
 ** SET CHART TYPE
 */
AmWeather.prototype.setChartType = function(chartType, updateChartData) {
    var _this = this;

    _this.current.chart_type = chartType;

    // UPDATE CHART DATA
    if (updateChartData) {
        _this.updateChartData();
    }
}



/*
 ** EXTEND JQUERY
 */
AmWeather.prototype.__extendJquery = function() {
    var _this = this;

    // AUTOCOMPLETE; MODIFY RENDER ITEMS
    var template = jQuery("#tpl-search");

    jQuery.extend(jQuery.ui.autocomplete.prototype, {
        _renderItem: function(ul, item) {
            var data = _this.getStationDataById(item.id);
            var temp = data.current.temp;
            var icon = (data.current.icon || "").split("-")[0];

            // ICON REPLACEMENT
            if (icon == "night") {
                icon = "day"
            } else if (icon == "thunder") {
                icon = "rainy"
            } else if (icon == "snowy") {
                icon = "cloudy"
            }

            // TEMPERATUR SIGN
            if (temp) {
                temp = _this.getTemperatur(data.units, temp);
                temp += "\u00B0";
            } else {
                temp = "..\u00B0";
            }

            // HIGHLIGHT SEARCH KEY
            var re = new RegExp("(" + this.term + ")", "gi");
            var bold = "<span class=\"bold-that\">$1</span>";
            var title = (item.label || item.name).replace(re, bold);

            // CREATE TEMPLATE
            var tpl = jQuery("<li>")
                .appendTo(ul);
            var wrapper = jQuery("<div>")
                .appendTo(tpl);

            jQuery("<span>")
                .addClass("icon " + icon)
                .appendTo(wrapper);

            jQuery("<span>")
                .addClass("title")
                .html(title)
                .appendTo(wrapper);

            jQuery("<span>")
                .addClass("meta")
                .text(temp)
                .appendTo(wrapper);

            return tpl;
        },
        _suggest: function(items) {
            var ul = this.menu.element.empty();
            this._renderMenu(ul, items);
            this.isNewMenu = true;
            this.menu.refresh();

            // size and position menu
            ul.show();
            this._resizeMenu();

            // Commented this, which throwed an issue
            // ul.position( $.extend({
            // 	of: this.element
            // }, this.options.position ) );

            if (this.options.autoFocus) {
                this.menu.next();
            }
        },
    });
}


/*
 ** LOGGER
 */
AmWeather.prototype.log = function() {
    var _this = this;

    if (!_this.config.debug) {
        return
    }

    jQuery(arguments).each(function(i1, msg) {});
}

/*
 ** SET MAP MARKER
 */
AmWeather.prototype.setMarker = function(item, animate) {
    var _this = this;
    var zoomLevel = item.zoomLevel || _this.bbox.zoomLevel || 10;

    _this.updateMapData({
        images: [{
            type: "circle",
            longitude: item.lng,
            latitude: item.lat
        }]
    });

    // SET NEW ZOOM
    if (!_this.current.isCountryMode) {
        zoomLevel = 1;
    }

    // ZOOM INTO POINT
    _this.current.map_instance.zoomToLongLat(zoomLevel, item.lng, item.lat, !animate);
}


/*
 ** ROTATE WIND ROSE
 */
AmWeather.prototype.__rotateWindRose = function(item) {
    var _this = this;

    if (item.bulletGraphics) {
        var bullet = item.bulletGraphics.node;
        var data = item.dataContext;
        var wind = data.wind_deg;
        var transform = bullet.getAttribute("transform");

        transform += " rotate(" + wind + ")";

        bullet.setAttribute("transform", transform);
    }
}

/*
 ** MARGE DATA LISTS
 */
AmWeather.prototype.mergeSearchData = function() {
    var _this = this;
    var list = [];
    var countryCodes = Object.keys(_this.data.countries);

    // OBTAIN TITLES FROM WORLD LOW; WORKAROUND
    if (AmCharts.maps.worldLow) {
        jQuery(AmCharts.maps.worldLow.svg.g.path).each(function(i1, country) {
            if (!_this.data.countries[country.id]) {
                _this.data.countries[country.id] = {}
            }
            _this.data.countries[country.id].name = country.title;
        });
    }

    // WALKTHROUGH COUNTRY CODES
    jQuery(countryCodes).each(function(i1, countryCode) {
        var country = _this.data.countries[countryCode];
        var cities = _this.data.cities[countryCode];

        // AUTOCOMPLETE
        country.countryCode = countryCode;
        country.value = country.name;
        country.isCountry = true;

        list.push(country);

        // WALKTHROUGH CITIES
        jQuery(cities).each(function(i2, city) {

            // AUTOCOMPLETE
            city.value = city.name;
            city.isCity = true;
            city.countryCode = countryCode;

            // UPDATE STATION CONTEXT
            _this.updateStationById(city.id, {
                current: city
            });

            list.push(city);
        });

        // UPDATE STATION CONTEXT
        _this.updateStationById(country.id, {
            current: country
        });
    });

    // REFERENCE
    _this.data.merged = list;

    // OUTPUT
    return _this.data.merged;
}


/*
 ** GET SEARCH DATA
 */
AmWeather.prototype.getSearchDataByCountryCode = function(country_code) {
    var _this = this;

    // GET COUNTRIES
    jQuery.ajax({
        url: _this.env.searchCountries,
        success: function(data) {

            // GET IN SHAPE
            if (country_code) {
                var tmp = {};
                tmp[country_code] = data;
                data = tmp;
            }

            _this.data.countries = data;

            // GET TOP10 CITIES (top10 only due payload)
            jQuery.ajax({
                url: _this.env.searchCities,

                success: function(data) {
                    // GET IN SHAPE
                    if (country_code) {
                        var tmp = {};
                        tmp[country_code] = data;
                        data = tmp;
                    }

                    _this.data.cities = data;
                    _this.search.data = _this.mergeSearchData();

                    if (country_code) {
                        _this.countryMode(country_code);
                    } else {
                        _this.worldMode();
                    }
                },

                error: function(err) {
                    _this.log("getSearchDataByCountryCode", arguments);
                }
            });
        }
    });
}

/*
 ** GET CURRENT USER LOCATION
 */
AmWeather.prototype.getUserLocation = function() {
    var _this = this;

    if ("geolocation" in navigator) {

        function success(res) {

            // HIGHLIGHT HIS LOCATION
            _this.setMarker({
                longitude: res.coords.longitude,
                latitude: res.coords.latitude
            }, true);
        }

        function error(res) {
            _this.log("getUserLocation", arguments);
        }

        // REQUEST LOCATION
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

/*
 ** GET STATION DATA TEMPLATE
 */
AmWeather.prototype.getStationDataTemplate = function() {
    var _this = this;

    return jQuery.extend(true, {}, _this.data.template);
}

/*
 ** UPDATE STATION BY ID
 */
AmWeather.prototype.updateStationById = function(id, data) {
    var _this = this;
    var station = _this.data.stations[id];

    if (!station) {
        station = _this.data.stations[id] = _this.getStationDataTemplate();
    }

    return jQuery.extend(true, station, data);
}

/*
 ** UPDATE SEARCH RESULTS
 */
AmWeather.prototype.updateSearchResults = function(val) {
    var _this = this;
    var term = val || _this.search.input.val();

    _this.filterSearchList(term);
}

/*
 ** GET STATION DATA BY ID
 */
AmWeather.prototype.getStationDataById = function(id) {
    var _this = this;
    return _this.data.stations[id] || _this.getStationDataTemplate();
}

/*
 ** GET STATION DATA BY IDS
 */
AmWeather.prototype.getStationDataByIds = function(ids) {
    var _this = this;
    var list = [];

    jQuery(ids).each(function(i1, id) {
        list.list(_this.getStationDataById(id));
    });

    return list;
}

/*
 ** GET STATION DATA BY STATIONS
 */
AmWeather.prototype.getStationDataByStations = function(stations) {
    var _this = this;
    var list = [];

    jQuery(stations).each(function(i1, station) {
        station = _this.getStationDataById(station.id);
        list.push(station);
    });

    return list;
}

/*
 ** GET UNKNOWN STATION IDS BY STATIONS
 */
AmWeather.prototype.getUnknownStationIds = function(stations) {
    var _this = this;
    var stationIds = Object.keys(_this.data.stations);

    return jQuery.map(stations, function(station) {
        var stationId = String(station.id);
        var isBlacklisted = jQuery.inArray(stationId, _this.search.blacklist) != -1;

        if (!station.id) {
            return;
        }

        if (!isBlacklisted) {
            return stationId;
        }
    });
}

/*
 ** GET WEATHER BY STATIONS
 */
AmWeather.prototype.getWeatherByStations = function(stations) {
    var _this = this;
    var unknownStationIds = _this.getUnknownStationIds(stations);
    var query = {
        format: "json",
        appid: _this.config.apikey,
        lang: _this.config.language,
        units: _this.config.units,
        id: unknownStationIds.join(",")
    }
    var receivedStations = [];

    // DISPLAY FROM CACHE
    if (!unknownStationIds.length) {
        receivedStations = _this.getStationDataByStations(stations);
        _this.setWeatherStations(receivedStations);
        return;
    }

    // BLACKLIST ALL
    jQuery.merge(_this.search.blacklist, unknownStationIds);

    // REQUEST FORECAST DATA
    jQuery.ajax({
        url: _this.config.endpoint + "group",
        dataType: "json",
        data: query,
        success: function(res) {
            var receivedStationIds = [];
            jQuery.each(res.list, function(i1, item) {
                var stationId = String(item.id);
                var snapshot = {
                    units: _this.config.units,
                    current: {
                        // GATHER DATA
                        timestamp: parseInt(item.dt * 1000),

                        // DATA
                        temp: parseInt(item.main.temp),
                        humidity: parseInt(item.main.humidity),
                        pressure: parseInt(item.main.pressure),

                        // WIND
                        wind_deg: parseInt(item.wind.deg),
                        wind_speed: parseInt(item.wind.speed),

                        // SUNRISE
                        sunrise: parseInt(item.sys.sunrise * 1000),
                        sunset: parseInt(item.sys.sunset * 1000),

                        // ICON
                        icon: _this.getIcon(item.weather[0].icon, true)
                    }
                }

                // MARK AS RECEIVED
                receivedStationIds.push(stationId);
                receivedStations.push(_this.updateStationById(stationId, snapshot));
            });

            // MARK AS NOT AVAILABLE
            jQuery(unknownStationIds).each(function() {
                var stationId = String(this);
                if (jQuery.inArray(stationId, receivedStationIds) == -1) {
                    _this.updateStationById(stationId, {
                        current: {
                            temp: "n/a"
                        }
                    });
                }
            });

            // SET WEATHER STATIONS
            _this.setWeatherStations(receivedStations);

            // UPDATE SEARCH CONTEXT
            _this.updateSearchResults();
        },
        error: function(err) {
            _this.log("getWeatherByStations", arguments);

            // UNBLOCK STATIONS
            _this.search.blacklist = jQuery.grep(_this.search.blacklist, function(stationId) {
                return jQuery.inArray(stationId, unknownStationIds) == -1;
            });
        }
    });
}

/*
 ** GET WEATHER BY STATION ID
 */
AmWeather.prototype.getWeatherById = function(station_id) {
    var _this = this;
    var query = {
        format: "json",
        appid: _this.config.apikey,
        lang: _this.config.language,
        units: _this.config.units,
        id: station_id
    }

    // GET STATION DATA
    var data = _this.getStationDataById(station_id);

    // NO FORECAST AVAILABLE
    function updateForecastState(data) {
        if (!data.forecast.length) {
            jQuery(_this.selector.app.wrapper).addClass("no-forecast");
            _this.setChartData([], true, true);
            data.cached = true;
        }

        return !!data.forecast.length;
    }

    // UPDATE BADGE WITH PRE FETCHED DATA
    _this.setWeather(data);

    // LOAD JUST ONCE
    if (data.cached) {
        updateForecastState(data);
        return;
    }

    // REQUEST FORECAST DATA
    jQuery.ajax({
        url: _this.config.endpoint + "forecast",
        dataType: "json",
        data: query,
        success: function(res) {

            // ERROR
            if (res.cod != "200") {
                _this.log("getWeatherById", arguments);

                updateForecastState(data);

                return;
            }

            // FORECAST
            jQuery.each(res.list, function(i1, item) {
                var wind = item.wind || {
                    deg: 0,
                    speed: 0
                };
                var snapshot = {
                    timestamp: parseInt(item.dt * 1000),

                    temp: parseInt(item.main.temp),
                    humidity: parseInt(item.main.humidity),
                    pressure: parseInt(item.main.pressure),

                    wind_deg: parseInt(wind.deg),
                    wind_speed: parseInt(wind.speed)
                }

                snapshot.icon = _this.getIcon(item.weather[0].icon, true);

                data.forecast.push(snapshot);
            });

            // CACHE FLAG
            data.cached = true;

            // UPDATE STATION DATA
            data = _this.updateStationById(station_id, data);

            // UPDATE WEATHER BADGE
            _this.setWeather(data);

        },
        error: function(err) {
            _this.log("getWeatherById", arguments);

            updateForecastState(data);
        }
    });
}


/*
 ** GET ICON NAME
 */
AmWeather.prototype.getIcon = function(icon, lessExt) {
    var _this = this;
    var MAP = {
        "01d": "day",
        "01n": "night",
        "02d": "cloudy-day-1",
        "02n": "cloudy-night-1",
        "03d": "cloudy",
        "03n": "cloudy",
        "04d": "rainy-2",
        "04n": "rainy-2",
        "09d": "rainy-3",
        "09n": "rainy-3",
        "10d": "rainy-4",
        "10n": "rainy-4",
        "11d": "thunder",
        "11n": "thunder",
        "13d": "snowy-5",
        "13n": "snowy-5",
        "50d": "cloudy",
        "50n": "cloudy"
    }
    var mapIcon = MAP[icon];

    // LESS EXTENSION
    if (lessExt) {
        return mapIcon;
    }

    // WITH EXTENSION
    return [_this.config.pathToImages, mapIcon, ".svg"].join("");
}

/*
 ** SET WEATHER BADGE; GIVEN DATA IN FORCED STRUCTURE
 */
AmWeather.prototype.setWeather = function(data) {
    var _this = this;
    var overlap = false;
    var dataProvider = [];
    var midnight = new Date();
    var city = data.current.name;
    var country = _this.getCountryByCountryCode(data.current.countryCode);
    var station = data.current.name + ", " + country.name;

    // REMOVE THINGY
    jQuery(_this.selector.app.wrapper).removeClass("no-forecast");

    // FORMAT DATE
    function processPlaceholder(value, format, output) {
        value = value ? new Date(value) : false;

        if (value instanceof Date) {
            value = AmCharts.formatDate(value, format);
        } else {
            value = "n/a";
        }

        return AmCharts.formatDataContextValue(output, {
            output: value
        });
    }

    /*
     ** CURRENT
     */

    // FORMAT TIME
    var now = processPlaceholder(data.current.timestamp, "HH:NN", "[[output]] GMT");
    var sunrise = processPlaceholder(data.current.sunrise, "HH:NN", "Sunrise [[output]]");
    var sunset = processPlaceholder(data.current.sunset, "HH:NN", "Sunset [[output]]");

    // UPDATE ELEMENTS
    jQuery(".current .badge .temp .icon").attr("class", "icon " + data.current.icon);
    jQuery(".current .badge .temp .wind").attr("style", "transform: rotate(" + data.current.wind_deg + "deg)");
    jQuery(".current .badge .temp .value").text(_this.getTemperatur(data.units, data.current.temp));
    jQuery(".current .badge .city .name").text(station);
    jQuery(".current .badge .city .time").text(now);
    jQuery(".current .badge .meta .sunrise").text(sunrise);
    jQuery(".current .badge .meta .sunset").text(sunset);

    /*
     ** FORECAST
     */

    // RESET MIDNIGHT DATE
    midnight.setHours(24, 0, 0, 0);

    // PREPARE FORECAST DATA
    jQuery.each(data.forecast, function(i1, item) {
        var timestamp = item.timestamp;
        var datetime = new Date(timestamp);
        var formattime = AmCharts.formatDate(datetime, "HH:NN");
        var snapshot = {
            v2top: 100,

            time: formattime,
            timestamp: timestamp,

            temp: _this.getTemperatur(data.units, item.temp),
            humidity: item.humidity,
            pressure: item.pressure,

            wind_deg: item.wind_deg,
            wind_speed: item.wind_speed,

            icon: _this.config.pathToImages + item.icon + ".svg"
        }

        // TWICE TO PUSH IT TO THE EDGE
        if (i1 == 0) {
            dataProvider.push(snapshot);
        }

        dataProvider.push(snapshot);

        // FORMAT OVERLAPING DAY
        if (timestamp > midnight && !overlap) {
            snapshot.time = AmCharts.formatDate(datetime, "EEE").toUpperCase() + " " + snapshot.time;
            overlap = true;
        }
    });

    // UPDATE CHART
    _this.setChartData(dataProvider, true);
}

/*
 ** SET CHART DATA
 */
AmWeather.prototype.setChartData = function(dataProvider, updateChartData, force) {
    var _this = this;

    // SKIP IF NO DATA AVAILABLE
    if (!dataProvider.length && !force) {
        return;
    }

    // CURRENT CHART DATA
    _this.current.chart_data = dataProvider;

    // UPDATE CHART DATA
    if (updateChartData) {
        _this.updateChartData();
    }
}

/*
 ** UPDATE CHART DATA
 */
AmWeather.prototype.updateChartData = function() {
    var _this = this;
    var dataProvider = [];
    var zeroValue = false;

    // WALKTHROUGH CHARTDATA
    jQuery(_this.current.chart_data).each(function() {
        var tmp = {
            timestamp: this.timestamp,
            time: this.time,
            v2top: this.v2top,
            wind_deg: this.wind_deg // wind rose handler
        }

        if (_this.current.chart_type == "temperature") {
            tmp.icon = this.icon;
            tmp.max = 100;

            tmp.value = _this.getTemperatur(_this.current.units, this.temp, _this.config.units);
            tmp.value = tmp.value / tmp.max * 100;
            tmp.label = this.temp;

            _this.current.chart_graphs.wind_deg.hidden = false;
            _this.current.chart_graphs.label.labelText = "[[value]]\u00B0";

        } else if (_this.current.chart_type == "humidity") {
            tmp.max = 200;
            tmp.value = this.humidity / tmp.max * 100;
            tmp.label = this.humidity;

            _this.current.chart_graphs.wind_deg.hidden = true;
            _this.current.chart_graphs.label.labelText = "[[value]]%";

        } else if (_this.current.chart_type == "wind") {
            tmp.max = 20
            tmp.value = this.wind_speed / tmp.max * 100;
            tmp.label = this.wind_speed;

            _this.current.chart_graphs.wind_deg.hidden = true;
            _this.current.chart_graphs.label.labelText = "[[value]] m/s";
        }

        // GET LOWEST VALUE
        if (tmp.value < 0 && (zeroValue == false || tmp.value < zeroValue)) {
            zeroValue = tmp.value;
        }

        dataProvider.push(tmp);
    });

    // RESET BASE LINE
    if (zeroValue) {
        jQuery(dataProvider).each(function() {
            this.value += (zeroValue * -1);
        });
    }

    // ANIMATE DATA CHANGE
    _this.current.chart.animateData(dataProvider, {
        duration: 1000,
        easing: _this.config.easing
    });
}

/*
 ** SELECT ITEM BY STATION
 */
AmWeather.prototype.selectItem = function(station) {
    var _this = this;

    _this.search.selected = true;
    _this.filterSearchList("");
    setTimeout(function() {
        _this.search.autocomplete.close();
    }, 1);

    _this.showWeather(station);
}

/*
 ** FOCUS ITEM BY STATION
 */
AmWeather.prototype.focusItem = function(station) {
    var _this = this;

    // WALKTHOUGH IMAGES
    jQuery(_this.current.map_instance.dataProvider.images).each(function() {

        // MATCHING GROUP
        if (this.groupId === station.id) {

            // HIGHLIGHT
            _this.current.map_instance.rollOverMapObject(this);
            _this.animateStationByStationId(this.groupId);

            // RESET ANIMATION ON OTHERS
        } else {
            _this.resetAnimationByStationId(this.groupId);
        }
    });
}

/*
 ** ANIMATE STATION BY STATION ID
 */
AmWeather.prototype.animateStationByStationId = function(station_id) {
    var _this = this;
    var images = _this.current.map_instance.getGroupById(station_id);

    jQuery(images).each(function() {
        if (this.animationIcon && !this.changedImage) {
            var link = this.image.node.getAttribute("xlink:href");
            var imageURL = [_this.config.pathToImagesAnimated, this.animationIcon, ".svg"].join("");

            this.image.node.setAttribute("xlink:href", imageURL);
            this.changedImage = true;

            return false;
        }
    });
}

/*
 ** RESET STATION ANIMATION BY STATION ID
 */
AmWeather.prototype.resetAnimationByStationId = function(station_id) {
    var _this = this;
    var images = _this.current.map_instance.getGroupById(station_id);

    jQuery(images).each(function() {
        if (this.animationIcon && this.changedImage) {
            var link = this.image.node.getAttribute("xlink:href");
            var imageURL = [_this.config.pathToImages, this.animationIcon, ".svg"].join("");

            this.image.node.setAttribute("xlink:href", imageURL);
            this.changedImage = false;

            return false;
        }
    });
}

/*
 ** GET CITITES BY COUNTRY CODE
 */
AmWeather.prototype.getCitiesByCountryCode = function(country_code) {
    var _this = this;
    return _this.data.cities[country_code];
}

/*
 ** GET COUNTRY BY COUNTRY CODE
 */
AmWeather.prototype.getCountryByCountryCode = function(country_code) {
    var _this = this;
    return _this.data.countries[country_code];
}

/*
 ** GET DATA BY COUNTY CODE
 */
AmWeather.prototype.getDataByCountryCode = function(country_code) {
    var _this = this;
    var country = _this.getCountryByCountryCode(country_code);
    var cities = _this.getCitiesByCountryCode(country_code);
    var hasExtended = _this.data.extended[country_code];

    // GET EXTENDED DATA SET
    if (!hasExtended) {
        var url = "./assets/json/cities/all/" + country_code + ".json"

        _this.data.extended[country_code] = true;

        // REQUEST DATA
        jQuery.ajax({
            url: url,
            success: function(data) {

                // EXTEND DATA
                _this.data.cities[country_code] = data;

                // UPDATE MERGED LIST
                _this.mergeSearchData();

                // UPDATE SEARCH LIST
                _this.updateSearchList(_this.current.isCountryMode ? data : _this.data.merged, true);
            },
            error: function(err) {
                _this.log("getDataByCountryCode", arguments);
                _this.data.extended[country_code] = false;
            }
        });
    }

    return {
        country: country,
        cities: cities,
        extending: !hasExtended
    }
}

/*
 ** ZOOM TO COUNTRY BY COUNTRY CODE (using map feature)
 */
AmWeather.prototype.zoomToCountryByCountryCode = function(country_code) {
    var _this = this;

    // LOOP THROUGH AREAS
    jQuery(_this.current.map_instance.dataProvider.areas).each(function() {

        // ZOOM TO GIVEN COUNTRY
        if (this.id == country_code) {
            _this.current.map_instance.zoomToObject(this);
            return false;
        }
    });
}

/*
 ** ZOOM TO COUNTRY BY COUNTRY CODE (using country data boundaries)
 */
AmWeather.prototype.zoomToCountryWithBBOX = function(country_code) {
    var _this = this;
    var data = _this.getDataByCountryCode(country_code);
    var bbox = _this.bbox = data.country.bbox;
    var zoomControl = _this.current.map_instance.zoomControl;
    var dataProvider = _this.current.map_instance.dataProvider;
    var rw = Math.abs(bbox.east - bbox.west);
    var rh = Math.abs(bbox.north - bbox.south);
    var fw = Math.abs(dataProvider.rightLongitude - dataProvider.leftLongitude);
    var fh = Math.abs(dataProvider.topLatitude - dataProvider.bottomLatitude);
    var cw = rw / fw;
    var ch = rh / fh;
    var newZoomLevel;

    // NEW ZOOM LEVEL
    if (cw > ch) {
        newZoomLevel = fw * 0.8 / rw;
    } else {
        newZoomLevel = fh * 0.8 / rh;
    }

    // SET NEW ZOOM LEVEL
    _this.bbox.zoomLevel = AmCharts.fitToBounds(newZoomLevel, zoomControl.minZoomLevel, zoomControl.maxZoomLevel);

    // ZOOM TO BOUNDARIES
    _this.current.map_instance.zoomToLatLongRectangle(_this.bbox.west, _this.bbox.north, _this.bbox.east, _this.bbox.south);
}

/*
 ** UPDATE SEARCH META LABELS
 */
AmWeather.prototype.updateNavLabels = function() {
    var _this = this;
    var country_data = _this.getDataByCountryCode(_this.current.country_code);
    var country_title = country_data.country.name;
    var country_name = country_data.country.value;
    var guesses = [];

    function updateLabels(country_label, country_name) {
        // UPDATE LABEL
        if (country_label) {
            jQuery(_this.selector.app.navLoadMapCountry).text(country_label);
        }

        // UPDATE HREF; APP CLASS
        if (country_name) {
            jQuery(_this.selector.app.wrapper).removeClass("no-country-map");

            jQuery(_this.selector.app.navLoadMapCountry)
                .attr({
                    href: "?map=" + country_name
                });
        } else {
            jQuery(_this.selector.app.wrapper).addClass("no-country-map");

            jQuery(_this.selector.app.navLoadMapCountry)
                .attr({
                    href: null
                });
        }

        // UPDATE LABEL DATA CONTEXT
        jQuery(_this.selector.app.navLoadMapCountry)
            .data("map", country_name || false);

    }

    // EXCEPTIONS
    if (_this.current.country_code == "US") {
        guesses.push("usaMercator");

        // TRY TO FIND MAP THROUGH TITLE
    } else {
        var explode = country_title.split(/\s/);
        var explodeMerged = explode.join("");
        var checkMerged = RegExp(explodeMerged, "i");

        // WALKTHROUGH MAPS
        for (country_name in _this.env.maps) {

            // STRAIGHT MATCHES
            if (country_name.toLowerCase() == explodeMerged.toLowerCase()) {
                guesses = new Array(country_name);
                break;

                // MERGED MATCHES
            } else if (country_name.match(checkMerged)) {
                guesses.push(country_name);
            }
        }
    }

    // WALKTHROUGH GUESSES
    if (guesses.length) {
        jQuery(guesses).each(function(i1, country_name) {
            var mapFile = _this.env.maps[country_name];

            if (mapFile) {
                updateLabels(country_title, country_name);
                return false;
            }
        });
    } else {
        updateLabels(country_title);
    }
}


/*
 ** ACITVATE CITY MODE BY COUNTRY CODE
 */
AmWeather.prototype.countryMode = function(country_code, zoomToCountryByCountryCode) {
    var _this = this;
    var data = _this.getDataByCountryCode(country_code);
    var list = data.cities;

    // CURRENT
    _this.current.country_code = country_code;
    _this.current.isCountryMode = true;

    // UPDATE SEARCH SCOPE
    _this.search.modeReset = false;

    // UPDATE ELEMENTS
    jQuery(_this.search.input).attr("placeholder", "Search City...");
    _this.updateNavLabels();
    jQuery(_this.selector.search.meta).show();

    // FLAG ANIMATION
    _this.current.map_isAnimating = true;

    // ZOOM INTO COUNTRY
    if (zoomToCountryByCountryCode) {
        if (zoomToCountryByCountryCode != "autoZoom") {
            _this.zoomToCountryByCountryCode(country_code);
        } else if (country_code == "US") {
            _this.current.map_instance.zoomToLongLat(4.4214, -81.6588, 39.6798)
        }
    } else {
        _this.current.map_instance.zoomOut();
    }

    // HIGHLIGHT COUNTRY
    _this.selectCountryByCountyCode(country_code);

    // OFFER COUNTRY CITIES
    _this.updateSearchList(list, true);

    // RESET SEARCH
    _this.filterSearchList("", true);

    // FLAG APP CONTAINER
    jQuery(_this.selector.app.wrapper).addClass("country-mode");
    jQuery(_this.selector.app.wrapper).removeClass("world-mode");

    return list;
}

/*
 ** ACITVATE COUNTRY MODE
 */
AmWeather.prototype.worldMode = function() {
    var _this = this;
    var list = _this.data.merged;

    if (_this.env.map != "worldLow") {
        _this.loadMap("world");
        return;
    }

    // CURRENT
    _this.current.country_code = false;
    _this.current.isCountryMode = false;

    // UPDATE SEARCH SCOPE
    _this.search.modeReset = false;

    // UPDATE ELEMENTS
    jQuery(_this.search.input).attr("placeholder", "Search City, Country...");
    jQuery(_this.selector.search.meta).hide();

    // RESET ZOOM
    _this.current.map_isAnimating = true;
    _this.current.map_instance.zoomToLongLat(_this.config.defaultZoom.zoomLevel, _this.config.defaultZoom.zoomLongitude, _this.config.defaultZoom.zoomLatitude);
    _this.selectCountryByCountyCode(false);

    // LOAD DEFAULT SET
    _this.getWeatherByStations(_this.config.defaultStations);

    // HIDE WEATHER
    _this.hideWeather();

    // OFFER TOP 10 CITIES
    _this.updateSearchList(list, true);
    _this.search.autocomplete.close();

    // FLAG APP CONTAINER
    jQuery(_this.selector.app.wrapper).removeClass("country-mode");
    jQuery(_this.selector.app.wrapper).addClass("world-mode");

    return list;
}

/*
 ** SUGGEST SEARCH
 */
AmWeather.prototype.filterSearchList = function(term, withWeatherStations) {
    var _this = this;

    // "VALIDATE" TERM
    term = term || "";

    // UPDATE SEARCH TERM
    jQuery(_this.search.input).val(term);

    // DELAY UPDATE DUE AUTOCOMPLETE INTERNAL PROCESS
    setTimeout(function() {

        // MANUAL SEARCH
        _this.search.autocomplete.source({
            term: term

            // REFRESH SUGGESTIONS
        }, function(list) {
            _this.search.autocomplete._suggest(list);

            // SHOW WEATHER STATIONS
            if (withWeatherStations) {
                _this.search.autocomplete.__response(list);
            }

            // ADD CLASS
            jQuery(_this.selector.app.wrapper).addClass("show-search-results");

            // SHOW RESULTS
            jQuery(".search .results ul").show();

            // SET RESULTS HEIGHT IF NEEDED
            var offset = jQuery(_this.selector.search.results).offset();
            var rh = jQuery(_this.selector.search.results).height();
            var vh = jQuery(window).height() - offset.top;
            var nh = rh > vh ? vh : "auto";

            jQuery(".search .results ul").css({
                height: nh
            });
        });
    }, 1);
}

/*
 ** UPDATE SEARCH LIST
 */
AmWeather.prototype.updateSearchList = function(list, silently) {
    var _this = this;

    // UPDATE DATA
    _this.search.data = list;

    // REFRESH SEARCH LIST
    if (!silently) {
        _this.filterSearchList(_this.search.autocomplete.term);
    }
}

/*
 ** SHOW WEATHER BADGE
 */
AmWeather.prototype.showWeather = function(item) {
    var _this = this;

    // SET AS CURRENT
    _this.current.station = item;

    // UPDATE STATION BY ID
    _this.updateStationById(item.id, {
        current: item
    });

    // GET WEATHER BY ID
    _this.getWeatherById(item.id);

    jQuery(_this.search.input).blur();
    jQuery(_this.selector.app.wrapper).addClass("show-weather");
    jQuery(_this.selector.app.wrapper).addClass("show-drawer");
}

/*
 ** HIDE WEATHER BADGE
 */
AmWeather.prototype.hideWeather = function() {
    var _this = this;

    _this.current.station = false;
    _this.current.stations = false;

    jQuery(_this.selector.app.wrapper).removeClass("show-weather");
}
