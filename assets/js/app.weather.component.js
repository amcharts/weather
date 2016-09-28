/*
Name: amCharts Weather Map
Description: Weather forecast webapp
Author: Benjamin Maertz, amCharts
Version: 1.0.0
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

	// SEARCH
	_this.search = {
		data: [],
		input: ".search .input input",
		meta: ".search .meta",
		city: ".search .meta .city",
		autocomplete: null,
		cityMode: false,
		modeReset: false,
		switchedAt: 0,
		blacklist: []
	}

	_this.timer = 0;
	_this.bbox = {};

	// DATA
	_this.data = {
		countries: {},
		cities: {},
		merged: [],
		stations: {},
		extended: {},
		template: {
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

	// CHARTS
	_this.chart = null;
	_this.chartType = "temperature";
	_this.chartData = [];
	_this.chartGraphs = {};

	// CONFIG
	_this.config = {
		debug: false,
		units: "metric",
		language: "en",
		apikey: OPENWEATHER_APIKEY,
		pathToImages: "./assets/img/weather/",
		pathToImagesAnimated: "./assets/img/weather-animated/",
		easing: jQuery.easing.easeInOutCubic
	}

	// ENVIROMENT
	_this.env = {
		map: "worldLow",
		mapPath: "//www.amcharts.com/lib/3/maps/js/",
		maps: {
			"zimbabwe": "ZW",
			"zambia": "ZM",
			"south africa": "ZA",
			"mayotte": "YT",
			"yemen": "YE",
			"samoa": "WS",
			"wallis and futuna": "WF",
			"vanuatu": "VU",
			"vietnam": "VN",
			"u.s. virgin islands": "VI",
			"british virgin islands": "VG",
			"venezuela": "VE",
			"saint vincent and the grenadines": "VC",
			"vatican city": "VA",
			"uzbekistan": "UZ",
			"uruguay": "UY",
			"united states": "US",
			"uganda": "UG",
			"ukraine": "UA",
			"tanzania": "TZ",
			"taiwan": "TW",
			"tuvalu": "TV",
			"trinidad and tobago": "TT",
			"turkey": "TR",
			"tonga": "TO",
			"tunisia": "TN",
			"turkmenistan": "TM",
			"east timor": "TL",
			"tokelau": "TK",
			"tajikistan": "TJ",
			"thailand": "TH",
			"togo": "TG",
			"french southern territories": "TF",
			"chad": "TD",
			"turks and caicos islands": "TC",
			"swaziland": "SZ",
			"syria": "SY",
			"sint maarten": "SX",
			"el salvador": "SV",
			"são tomé and príncipe": "ST",
			"south sudan": "SS",
			"suriname": "SR",
			"somalia": "SO",
			"senegal": "SN",
			"san marino": "SM",
			"sierra leone": "SL",
			"slovakia": "SK",
			"svalbard and jan mayen": "SJ",
			"slovenia": "SI",
			"saint helena": "SH",
			"singapore": "SG",
			"sweden": "SE",
			"sudan": "SD",
			"seychelles": "SC",
			"solomon islands": "SB",
			"saudi arabia": "SA",
			"rwanda": "RW",
			"russia": "RU",
			"serbia": "RS",
			"romania": "RO",
			"réunion": "RE",
			"qatar": "QA",
			"paraguay": "PY",
			"palau": "PW",
			"portugal": "PT",
			"palestine": "PS",
			"puerto rico": "PR",
			"pitcairn islands": "PN",
			"saint pierre and miquelon": "PM",
			"poland": "PL",
			"pakistan": "PK",
			"philippines": "PH",
			"papua new guinea": "PG",
			"french polynesia": "PF",
			"peru": "PE",
			"panama": "PA",
			"oman": "OM",
			"new zealand": "NZ",
			"niue": "NU",
			"nauru": "NR",
			"nepal": "NP",
			"norway": "NO",
			"netherlands": "NL",
			"nicaragua": "NI",
			"nigeria": "NG",
			"norfolk island": "NF",
			"niger": "NE",
			"new caledonia": "NC",
			"namibia": "NA",
			"mozambique": "MZ",
			"malaysia": "MY",
			"mexico": "MX",
			"malawi": "MW",
			"maldives": "MV",
			"mauritius": "MU",
			"malta": "MT",
			"montserrat": "MS",
			"mauritania": "MR",
			"martinique": "MQ",
			"northern mariana islands": "MP",
			"mongolia": "MN",
			"myanmar [burma]": "MM",
			"macao": "MO",
			"mali": "ML",
			"macedonia": "MK",
			"marshall islands": "MH",
			"saint martin": "MF",
			"montenegro": "ME",
			"madagascar": "MG",
			"moldova": "MD",
			"monaco": "MC",
			"morocco": "MA",
			"libya": "LY",
			"latvia": "LV",
			"luxembourg": "LU",
			"lithuania": "LT",
			"lesotho": "LS",
			"liberia": "LR",
			"sri lanka": "LK",
			"liechtenstein": "LI",
			"saint lucia": "LC",
			"lebanon": "LB",
			"laos": "LA",
			"kazakhstan": "KZ",
			"cayman islands": "KY",
			"kuwait": "KW",
			"kosovo": "XK",
			"south korea": "KR",
			"north korea": "KP",
			"saint kitts and nevis": "KN",
			"comoros": "KM",
			"kiribati": "KI",
			"cambodia": "KH",
			"kyrgyzstan": "KG",
			"kenya": "KE",
			"japan": "JP",
			"jordan": "JO",
			"jamaica": "JM",
			"jersey": "JE",
			"italy": "IT",
			"iceland": "IS",
			"iran": "IR",
			"iraq": "IQ",
			"british indian ocean territory": "IO",
			"india": "IN",
			"isle of man": "IM",
			"israel": "IL",
			"ireland": "IE",
			"indonesia": "ID",
			"hungary": "HU",
			"haiti": "HT",
			"croatia": "HR",
			"honduras": "HN",
			"heard island and mcdonald islands": "HM",
			"hong kong": "HK",
			"guyana": "GY",
			"guinea-bissau": "GW",
			"guam": "GU",
			"guatemala": "GT",
			"south georgia and south sandwich islands": "GS",
			"greece": "GR",
			"equatorial guinea": "GQ",
			"guadeloupe": "GP",
			"guinea": "GN",
			"gambia": "GM",
			"greenland": "GL",
			"gibraltar": "GI",
			"ghana": "GH",
			"guernsey": "GG",
			"guyane": "GF",
			"grenada": "GD",
			"georgia": "GE",
			"united kingdom": "GB",
			"gabon": "GA",
			"france": "FR",
			"faroe islands": "FO",
			"micronesia": "FM",
			"falkland islands": "FK",
			"fiji": "FJ",
			"finland": "FI",
			"ethiopia": "ET",
			"spain": "ES",
			"eritrea": "ER",
			"western sahara": "EH",
			"estonia": "EE",
			"egypt": "EG",
			"ecuador": "EC",
			"algeria": "DZ",
			"dominican republic": "DO",
			"dominica": "DM",
			"denmark": "DK",
			"djibouti": "DJ",
			"germany": "DE",
			"czech republic": "CZ",
			"cyprus": "CY",
			"christmas island": "CX",
			"netherlands antilles": "CW",
			"cape verde": "CV",
			"cuba": "CU",
			"costa rica": "CR",
			"colombia": "CO",
			"china": "CN",
			"cameroon": "CM",
			"chile": "CL",
			"cook islands": "CK",
			"ivory coast": "CI",
			"switzerland": "CH",
			"congo": "CD",
			"central african republic": "CF",
			"cocos [keeling] islands": "CC",
			"canada": "CA",
			"belize": "BZ",
			"brest": "BY",
			"botswana": "BW",
			"bouvet island": "BV",
			"bhutan": "BT",
			"bahamas": "BS",
			"brazil": "BR",
			"bonaire, sint eustatius, and saba": "BQ",
			"bermuda": "BM",
			"bolivia": "BO",
			"brunei": "BN",
			"saint barthélemy": "BL",
			"benin": "BJ",
			"burundi": "BI",
			"bahrain": "BH",
			"bulgaria": "BG",
			"burkina faso": "BF",
			"belgium": "BE",
			"bangladesh": "BD",
			"barbados": "BB",
			"bosnia and herzegovina": "BA",
			"azerbaijan": "AZ",
			"åland": "AX",
			"aruba": "AW",
			"australia": "AU",
			"austria": "AT",
			"american samoa": "AS",
			"argentina": "AR",
			"angola": "AO",
			"armenia": "AM",
			"albania": "AL",
			"anguilla": "AI",
			"antigua and barbuda": "AG",
			"afghanistan": "AF",
			"united arab emirates": "AE",
			"andorra": "AD"
		},
		searchCountries: "./assets/json/countries/all/all.object.json",
		searchCities: "./assets/json/cities/top10/all.object.json",
		forcedCityMode: false,
		params: {}
	}

	_this.__initialize();
}


AmWeather.prototype.__getEnv = function() {
	var _this = this;
	var queryString = location.search.slice( 1 ).split( "&" );
	var params = {};

	// PARAMETERS
	for ( i1 in queryString ) {
		var batch = queryString[ i1 ].split( "=" );
		var key = jQuery.trim( batch[ 0 ] );
		var value = jQuery.trim( batch[ 1 ] );

		if ( key && value ) {
			params[ key ] = value;
		}
	}
	_this.env.params = params;

	// VALIDATE REQUESTED MAP FILE
	var cName = String(params.map).toLowerCase();
	var cCode = this.env.maps[ cName ];
	if ( cName && cCode !== undefined ) {
		_this.env.map = cName + "Low";
		_this.env.searchCountries = "./assets/json/countries/all/" + cCode + ".json";
		_this.env.searchCities = "./assets/json/cities/all/" + cCode + ".json";
		_this.env.forcedCityMode = true;
		jQuery( ".app" ).addClass( "sticky-mode" );
	}

	// GET MAP FILE
	var script = document.createElement( "script" );
	script.setAttribute( "type", "text/javascript" );
	script.setAttribute( "src", _this.env.mapPath + _this.env.map + ".js" );

	script.addEventListener( "load", function() {

		// CREATE MAP
		_this.__createMap();

		// GET SEARCH CONTEXT
		_this.getSearchData( cCode );
	} );
	document.body.appendChild( script );
};

/*
 ** INITIALIZE
 */
AmWeather.prototype.__initialize = function() {
	var _this = this;
	var auto = _this.__getEnv();

	// EXTEND JQUERY FOR OUR NEEDS
	_this.__extendJquery();

	// CREATE CHART INSTANCE
	_this.__createChart();

	// CREATE SEARCH INSTANCE
	_this.__createSearch();

	// CREATE TAB INSTANCE
	_this.__createTabs();

	// BIND BACK BUTTON
	jQuery( ".reset-mode" ).on( "click", function() {
		_this.countryMode();
	} );
}

/*
 ** MAP ZOOM HANDLER
 */
AmWeather.prototype.mapZoomHandler = function( e ) {
	var _this = this;

	_this.map = e.chart;

	_this.map.isAnimating = false;

	if ( _this.map.afterAnimating ) {
		_this.map.afterAnimating();
		_this.map.afterAnimating = false;
	}
}

/*
 ** SELECT COUNTRY BY COUNTRY MODE
 */
AmWeather.prototype.selectCountryByCountyCode = function( country_code ) {
	var _this = this;
	var areas = _this.map.dataProvider.areas;

	// HIGHLIGHT COUNTRY
	jQuery( areas ).each( function() {
		this.showAsSelected = this.id === country_code;
	} );
}

/*
 ** MAP CLICK HANDLER
 */
AmWeather.prototype.mapClickHandler = function( e ) {
	var _this = this;
	var mapObject = e.mapObject;
	var station = mapObject.station;
	var country = _this.getCountryByCountryCode( mapObject.id );
	var zoomLevel = _this.map.zoomLevel();

	// GET BY SELECTED STATION
	if ( station ) {
		_this.showWeather( station.current );

		// GET BY SELECTED COUNTRY CENTER POINT
	} else if ( country ) {
		_this.hideWeather();
		_this.cityMode( country.countryCode );
	}
}

/*
 ** MAP ZOOM ALLOWED
 */
AmWeather.prototype.mapZoomAllowed = function() {
	var _this = this;

	_this.map.dataProvider.zoomLevel = _this.map.zoomLevel();
	_this.map.dataProvider.zoomLatitude = _this.map.zoomLatitude();
	_this.map.dataProvider.zoomLongitude = _this.map.zoomLongitude();

	if ( _this.map.updatedData || _this.map.dataProvider.zoomLevel < 4 ) {
		return false;
	}

	return true;
}

/*
 ** GET WEATHER BY POINT
 */
AmWeather.prototype.getWeatherByPoint = function( longitude, latitude ) {
	var _this = this;
	var query = {
		cnt: 200,
		cluster: "no",
		format: "json",
		apikey: _this.config.apikey,
		lang: _this.config.language,
		units: "metric",
		lon: longitude,
		lat: latitude
	}

	// CHECK IF ZOOM IS ALLOWED
	if ( !_this.mapZoomAllowed() ) {
		return;
	}

	// REQUEST DATA
	jQuery.ajax( {
		url: "http://api.openweathermap.org/data/2.5/find",
		data: query,
		success: function( data ) {
			// SET WEATHER STATIONS
			_this.setWeatherStations( data.list );
		},
		error: function() {
			_this.log( "getWeatherByPoint", arguments );
		}
	} )
}

/*
 ** GET WEATHER BY BOUNDARIES
 */
AmWeather.prototype.getWeatherByBoundaries = function() {
	var _this = this;
	var latlng;
	var bbr = _this.map.boundingRect;
	var coords = [];
	var query = {
		cnt: 200,
		cluster: "no",
		format: "json",
		apikey: _this.config.apikey,
		lang: _this.config.language,
		units: "metric",
		coords: ""
	}

	// CHECK IF ZOOM IS ALLOWED
	if ( _this.mapZoomAllowed() ) {
		return;
	}

	// TOP LEFT
	latlng = _this.map.stageXYToCoordinates( 0, 0 );
	coords.push( latlng.longitude );
	coords.push( latlng.latitude );

	// BOTTOM RIGHT
	latlng = _this.map.stageXYToCoordinates( _this.map.divRealWidth, _this.map.divRealHeight );
	coords.push( latlng.longitude );
	coords.push( latlng.latitude );

	query.bbox = coords.join( "," )

	// REQUEST DATA
	jQuery.ajax( {
		url: "http://api.openweathermap.org/data/2.5/box/city",
		data: query,
		success: function( data ) {
			// SET WEATHER STATIONS
			_this.setWeatherByStations( data.list );
		},
		error: function() {
			_this.log( "getWeatherByBoundaries", arguments );
		}
	} )
}

/*
 ** SET WEATHER STATIONS
 */
AmWeather.prototype.setWeatherStations = function( stations ) {
	var _this = this;
	var images = [];

	// WALKTHROUGH STATIONS
	jQuery.each( stations, function( i1, station ) {
		var current = station.current;
		var imageURL = [ _this.config.pathToImages, current.icon || "", ".svg" ].join( "" );

		// IGNORE THOSE WITH NO ICON
		if ( !current.icon ) {
			return;
		}

		// ICON
		images.push( {
			groupId: current.id,
			rollOverScale: 1.2,
			selectable: true,
			station: station,
			latitude: current.lat,
			longitude: current.lng,
			imageURL: imageURL,
			width: 64,
			height: 64,
			animationIcon: current.icon
		} );

		// LABEL
		images.push( {
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
		} );

		// TEMPERATURE
		images.push( {
			groupId: current.id,
			rollOverScale: 1.2,
			selectable: true,
			station: station,
			latitude: current.lat,
			longitude: current.lng,
			label: String( parseInt( current.temp ) ) + "\u00B0",
			labelFontSize: 24,
			labelColor: "#000000",
			labelRollOverColor: "#000000",
			labelPosition: "right",
			labelShiftX: 30,
			labelShiftY: 0,
			color: "transparent"
		} );
	} );

	// UPDATE DATA
	_this.updateMapData( {
		images: images
	} );
}

/*
 ** UPDATE MAP DATA
 */
AmWeather.prototype.updateMapData = function( dataProvider ) {
	var _this = this;

	// CALLEE
	function callback() {
		dataProvider = jQuery.extend( {
			zoomLevel: _this.map.zoomLevel(),
			zoomLatitude: _this.map.zoomLatitude(),
			zoomLatitudeC: _this.map.zoomLatitude(),
			zoomLongitude: _this.map.zoomLongitude(),
			zoomLongitudeC: _this.map.zoomLongitude()
		}, dataProvider );

		jQuery.extend( _this.map.dataProvider, dataProvider );

		setTimeout( function() {
			_this.map.validateData();
		}, 1 );
	}

	// SET ON HOLD IF IT'S STILL ANIMATING
	if ( _this.map.isAnimating ) {
		_this.map.afterAnimating = callback;

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
	jQuery( ".map" ).each( function() {
		_this.map = AmCharts.makeChart( this, {

			type: "map",

			fontFamily: "Roboto",

			dataProvider: {
				map: _this.env.map,
				getAreasFromMap: true,
				images: []
			},

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
				enabled: false
			},

			weather: {
				enabled: true
			},


			defs: {
				filter: [ {
					x: "-50%",
					y: "-50%",
					width: "200%",
					height: "200%",
					id: "blur",
					feGaussianBlur: { in : "SourceGraphic",
						stdDeviation: "15"
					}
				} ]
			},


			listeners: [ {
				event: "init",
				method: function() {
					jQuery( "article.loader" ).animate( {
						opacity: 0
					}, {
						done: function() {
							jQuery( "article" ).toggleClass( "visible" );

							jQuery( _this.search.input ).focus();
						}
					} );
				}
			}, {
				event: "zoomCompleted",
				method: function() {
					_this.mapZoomHandler.apply( _this, arguments );
				}
			}, {
				event: "dragCompleted",
				method: function() {
					_this.mapZoomHandler.apply( _this, arguments );
				}
			}, {
				event: "clickMapObject",
				method: function() {
					_this.mapClickHandler.apply( _this, arguments );
				}
			}, {
				event: "homeButtonClicked",
				method: function() {
					if ( !_this.env.forcedCityMode ) {
						_this.countryMode();
					}
				}
			}, {
				event: "rollOverMapObject",
				method: function( e ) {
					var mapObject = e.mapObject;

					if ( mapObject.groupId ) {
						_this.animateStationByStationId( mapObject.groupId );
					}
				}
			}, {
				event: "rollOutMapObject",
				method: function( e ) {
					var mapObject = e.mapObject;

					if ( mapObject.groupId ) {
						_this.resetAnimationByStationId( mapObject.groupId );
					}
				}
			} ]
		} );
	} );

	this.log( "MAP CREATED" );
}

/*
 ** CREATE CHART INSTANCE
 */
AmWeather.prototype.__createChart = function() {
	var _this = this;

	// WALKTRHOUGH CHARTS
	jQuery( ".chart" ).each( function() {
		_this.chart = AmCharts.makeChart( this, {

			type: "serial",

			fontFamily: "Roboto",

			dataProvider: [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
			categoryField: "timestamp",

			autoMargins: false,
			zoomOutOnDataUpdate: false,

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

			valueAxes: [ {
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
			} ],

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
					labelFunction: function( e ) {
						var dataContext = e.dataContext;
						return AmCharts.formatDataContextValue( e.graph.labelText, {
							value: parseInt( dataContext.value )
						} );
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
					bulletSize: 64,
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
					labelFunction: function( e ) {
						_this.__rotateWindRose( e );
					}
				}

			],

			listeners: [

				{
					event: "init",
					method: function( e ) {
						jQuery( e.chart.graphs ).each( function() {
							_this.chartGraphs[ this.id ] = this;
						} );

						e.chart.zoomToIndexes( 1, 7 );
					}
				},

				{
					event: "rollOverGraphItem",
					method: function( e ) {
						if ( e.graph.id == "wind_deg" ) {
							setTimeout( function() {
								_this.__rotateWindRose( e.item );
							}, 1 );
						}
					}
				},

			]
		} );
	} );
}

/*
 ** CREATE SEARCH
 */
AmWeather.prototype.__createSearch = function() {
	var _this = this;
	var input = jQuery( ".input input" );

	// CREATE SEARCH INSTANCE
	_this.search.input = jQuery( input ).autocomplete( {
		appendTo: ".search .results",
		minLength: 0,

		// CONTEXT HANDLER
		source: function( request, response ) {
			var stations = jQuery.ui.autocomplete.filter( _this.search.data, request.term );
			var first = stations[ 0 ];

			// HIDE LIST IN COUNTRY MODE WITH NO SEARCH TERM
			if ( !_this.search.cityMode && request.term.length == 0 ) {
				_this.search.autocomplete.close();
				return;
			}

			// NO RESULTS
			if ( stations.length === 0 ) {
				var message = "No results...";

				// HINT
				if ( !_this.search.cityMode ) {
					message = "No results, try country first...";
				}

				// PUSH MESSAGE
				stations = [ {
					err: true,
					value: message
				} ];

				// AUTO SWITCH TO COUNTRY MODE
			} else if ( stations.length === 1 && first && first.isCountry ) {
				stations = _this.cityMode( first.countryCode, true );
			}

			// TOP 10 RESULTS
			response( stations.slice( 0, 10 ) );
		},

		// RESULTS HANDLER
		response: function( event, ui ) {
			var stations = ui.content;

			_this.getWeatherByStations( stations );
		},

		// SELECTION HANDLER
		select: function( event, ui ) {
			var item = ui.item;

			// ERROR
			if ( item.err ) {
				_this.filterSearchList( "" );
				return false;
			}

			// SELECT COUNTRY
			if ( item.isCountry ) {
				_this.cityMode( item.countryCode, true );

				// SELECT CITY
			} else {
				_this.selectItem( item );
			}

			return false;
		},

		open: function() {
			jQuery( ".app" ).addClass( "show-search-results" );
		},

		close: function() {
			jQuery( ".app" ).removeClass( "show-search-results" );
		},

		// FOCUS HANDLER
		focus: function( event, ui ) {
			_this.focusItem( ui.item );
		}
	} );

	// RESEARCH VALUE
	_this.search.input.on( "focus", function() {
		if ( this.value.length || _this.search.cityMode ) {
			_this.filterSearchList( this.value );
		}
	} );

	// RESET CITY MODE
	_this.search.input.on( "keyup", function( e ) {
		var input = jQuery( this ).val();
		var isBackspace = e.keyCode == jQuery.ui.keyCode.BACKSPACE;

		if ( _this.search.cityMode && isBackspace && !_this.env.forcedCityMode ) {
			if ( input == "" ) {
				if ( !_this.search.modeReset ) {
					_this.search.modeReset = true;
				} else {
					_this.search.modeReset = false;
					_this.countryMode();
				}
			}
		} else {
			_this.search.modeReset = false;
		}
	} );

	// REFERENCE
	_this.search.autocomplete = _this.search.input.data( "ui-autocomplete" );
}

/*
 ** CREATE TABS
 */
AmWeather.prototype.__createTabs = function() {
	var _this = this;

	// WALKTHROUGH TABS; HIGHLIGHT FIRST
	jQuery( ".tabs a" )
		.on( "click", function( e ) {
			e.preventDefault();
			var data = jQuery( this ).data();

			jQuery( ".tabs li" ).removeClass( "active" );

			jQuery( this ).parent().addClass( "active" );
			_this.setChartType( data.type, true );
		} )
		.first()
		.parent()
		.addClass( "active" );
}

/*
 ** SET CHART TYPE
 */
AmWeather.prototype.setChartType = function( chartType, updateChartData ) {
	var _this = this;

	_this.chartType = chartType;

	// UPDATE CHART DATA
	if ( updateChartData ) {
		_this.updateChartData();
	}
}

/*
 ** EXTEND JQUERY
 */
AmWeather.prototype.__extendJquery = function() {
	var _this = this;

	// AUTOCOMPLETE; MODIFY RENDER ITEMS
	var template = jQuery( "#tpl-search" );

	jQuery.extend( jQuery.ui.autocomplete.prototype, {
		_renderItem: function( ul, item ) {
			var data = _this.getStationDataById( item.id );
			var temp = data.current.temp;
			var icon = ( data.current.icon || "" ).split( "-" )[ 0 ];

			// ICON REPLACEMENT
			if ( icon == "night" ) {
				icon = "day"
			} else if ( icon == "thunder" ) {
				icon = "rainy"
			} else if ( icon == "snowy" ) {
				icon = "cloudy"
			}

			// TEMPERATUR SIGN
			if ( temp ) {
				temp += "\u00B0";
			} else {
				temp = "..\u00B0";
			}

			// HIGHLIGHT SEARCH KEY
			var re = new RegExp( "(" + this.term + ")", "gi" );
			var bold = "<span class=\"bold-that\">$1</span>";
			var title = ( item.label || item.name ).replace( re, bold );

			// CREATE TEMPLATE
			var tpl = jQuery( "<li>" )
				.appendTo( ul );
			var wrapper = jQuery( "<div>" )
				.appendTo( tpl );

			jQuery( "<span>" )
				.addClass( "icon " + icon )
				.appendTo( wrapper );

			jQuery( "<span>" )
				.addClass( "title" )
				.html( title )
				.appendTo( wrapper );

			jQuery( "<span>" )
				.addClass( "meta" )
				.text( temp )
				.appendTo( wrapper );

			return tpl;
		},
		_suggest: function( items ) {
			var ul = this.menu.element.empty();
			this._renderMenu( ul, items );
			this.isNewMenu = true;
			this.menu.refresh();

			// size and position menu
			ul.show();
			this._resizeMenu();

			// Commented this, which throwed an issue
			// ul.position( $.extend({
			// 	of: this.element
			// }, this.options.position ) );

			if ( this.options.autoFocus ) {
				this.menu.next();
			}
		},
	} );
}


/*
 ** LOGGER
 */
AmWeather.prototype.log = function() {
	var _this = this;

	if ( !_this.config.debug ) {
		return
	}

	jQuery( arguments ).each( function( i1, msg ) {} );
}

/*
 ** SET MAP MARKER
 */
AmWeather.prototype.setMarker = function( item, animate ) {
	var _this = this;
	var zoomLevel = item.zoomLevel || _this.bbox.zoomLevel || 10;

	_this.updateMapData( {
		images: [ {
			type: "circle",
			longitude: item.lng,
			latitude: item.lat
		} ]
	} );

	// SET NEW ZOOM
	if ( !_this.search.cityMode ) {
		zoomLevel = 1;
	}

	// ZOOM INTO POINT
	_this.map.zoomToLongLat( zoomLevel, item.lng, item.lat, !animate );
}


/*
 ** ROTATE WIND ROSE
 */
AmWeather.prototype.__rotateWindRose = function( item ) {
	var _this = this;

	if ( item.bulletGraphics ) {
		var bullet = item.bulletGraphics.node;
		var data = item.dataContext;
		var wind = data.wind_deg;
		var transform = bullet.getAttribute( "transform" );

		transform += " rotate(" + wind + ")";

		bullet.setAttribute( "transform", transform );
	}
}

/*
 ** MARGE DATA LISTS
 */
AmWeather.prototype.mergeSearchData = function() {
	var _this = this;
	var list = [];
	var countryCodes = Object.keys( _this.data.countries );

	// WALKTHROUGH COUNTRY CODES
	jQuery( countryCodes ).each( function( i1, countryCode ) {
		var country = _this.data.countries[ countryCode ];
		var cities = _this.data.cities[ countryCode ];

		// AUTOCOMPLETE
		country.countryCode = countryCode;
		country.value = country.name;
		country.isCountry = true;

		list.push( country );

		// WALKTHROUGH CITIES
		jQuery( cities ).each( function( i2, city ) {

			// AUTOCOMPLETE
			city.value = city.name;
			city.isCity = true;
			city.countryCode = countryCode;

			// UPDATE STATION CONTEXT
			_this.updateStationById( city.id, {
				current: city
			} );

			list.push( city );
		} );

		// UPDATE STATION CONTEXT
		_this.updateStationById( country.id, {
			current: country
		} );
	} );

	// REFERENCE
	_this.data.merged = list;

	// OUTPUT
	return _this.data.merged;
}


/*
 ** GET SEARCH DATA
 */
AmWeather.prototype.getSearchData = function( country_code ) {
	var _this = this;

	// GET COUNTRIES
	jQuery.ajax( {
		url: _this.env.searchCountries,
		success: function( data ) {

			// GET IN SHAPE
			if ( country_code ) {
				var tmp = {};
				tmp[ country_code ] = data;
				data = tmp;
			}

			_this.data.countries = data;

			// GET TOP10 CITIES (top10 only due payload)
			jQuery.ajax( {
				url: _this.env.searchCities,

				success: function( data ) {
					// GET IN SHAPE
					if ( country_code ) {
						var tmp = {};
						tmp[ country_code ] = data;
						data = tmp;
					}

					_this.data.cities = data;
					_this.search.data = _this.mergeSearchData();

					if ( country_code ) {
						_this.cityMode( country_code );
					}
				},

				error: function( err ) {
					_this.log( "getSearchData", arguments );
				}
			} );
		}
	} );
}

/*
 ** GET CURRENT USER LOCATION
 */
AmWeather.prototype.getUserLocation = function() {
	var _this = this;

	if ( "geolocation" in navigator ) {

		function success( res ) {

			// HIGHLIGHT HIS LOCATION
			_this.setMarker( {
				longitude: res.coords.longitude,
				latitude: res.coords.latitude
			}, true );
		}

		function error( res ) {
			_this.log( "getUserLocation", arguments );
		}

		// REQUEST LOCATION
		navigator.geolocation.getCurrentPosition( success, error );
	}
}

/*
 ** GET STATION DATA TEMPLATE
 */
AmWeather.prototype.getStationDataTemplate = function() {
	var _this = this;

	return jQuery.extend( true, {}, _this.data.template );
}

/*
 ** UPDATE STATION BY ID
 */
AmWeather.prototype.updateStationById = function( id, data ) {
	var _this = this;
	var station = _this.data.stations[ id ];

	if ( !station ) {
		station = _this.data.stations[ id ] = _this.getStationDataTemplate();
	}

	return jQuery.extend( true, station, data );
}

/*
 ** UPDATE SEARCH RESULTS
 */
AmWeather.prototype.updateSearchResults = function( val ) {
	var _this = this;
	var term = val || _this.search.input.val();

	_this.filterSearchList( term );
}

/*
 ** GET STATION DATA BY ID
 */
AmWeather.prototype.getStationDataById = function( id ) {
	var _this = this;
	return _this.data.stations[ id ] || _this.getStationDataTemplate();
}

/*
 ** GET STATION DATA BY IDS
 */
AmWeather.prototype.getStationDataByIds = function( ids ) {
	var _this = this;
	var list = [];

	jQuery( ids ).each( function( i1, id ) {
		list.list( _this.getStationDataById( id ) );
	} );

	return list;
}

/*
 ** GET STATION DATA BY STATIONS
 */
AmWeather.prototype.getStationDataByStations = function( stations ) {
	var _this = this;
	var list = [];

	jQuery( stations ).each( function( i1, station ) {
		station = _this.getStationDataById( station.id );
		list.push( station );
	} );

	return list;
}

/*
 ** GET UNKNOWN STATION IDS BY STATIONS
 */
AmWeather.prototype.getUnknownStationIds = function( stations ) {
	var _this = this;
	var stationIds = Object.keys( _this.data.stations );

	return jQuery.map( stations, function( station ) {
		var stationId = String( station.id );
		var isBlacklisted = jQuery.inArray( stationId, _this.search.blacklist ) != -1;

		if ( !station.id ) {
			return;
		}

		if ( !isBlacklisted ) {
			return stationId;
		}
	} );
}

/*
 ** GET WEATHER BY STATIONS
 */
AmWeather.prototype.getWeatherByStations = function( stations ) {
	var _this = this;
	var unknownStationIds = _this.getUnknownStationIds( stations );
	var query = {
		format: "json",
		apikey: _this.config.apikey,
		lang: _this.config.language,
		units: _this.config.units,
		id: unknownStationIds.join( "," )
	}
	var receivedStations = [];

	// DISPLAY FROM CACHE
	if ( !unknownStationIds.length ) {
		receivedStations = _this.getStationDataByStations( stations );
		_this.setWeatherStations( receivedStations );
		return;
	}

	// BLACKLIST ALL
	jQuery.merge( _this.search.blacklist, unknownStationIds );

	// REQUEST FORECAST DATA
	jQuery.ajax( {
		url: "http://api.openweathermap.org/data/2.5/group",
		dataType: "json",
		data: query,
		success: function( res ) {
			var receivedStationIds = [];
			jQuery.each( res.list, function( i1, item ) {
				var stationId = String( item.id );
				var snapshot = {
					current: {
						// GATHER DATA
						timestamp: parseInt( item.dt * 1000 ),

						// DATA
						temp: parseInt( item.main.temp ),
						humidity: parseInt( item.main.humidity ),
						pressure: parseInt( item.main.pressure ),

						// WIND
						wind_deg: parseInt( item.wind.deg ),
						wind_speed: parseInt( item.wind.speed ),

						// SUNRISE
						sunrise: parseInt( item.sys.sunrise * 1000 ),
						sunset: parseInt( item.sys.sunset * 1000 ),

						// ICON
						icon: _this.getIcon( item.weather[ 0 ].icon, true )
					}
				}

				// MARK AS RECEIVED
				receivedStationIds.push( stationId );
				receivedStations.push( _this.updateStationById( stationId, snapshot ) );
			} );

			// MARK AS NOT AVAILABLE
			jQuery( unknownStationIds ).each( function() {
				var stationId = String( this );
				if ( jQuery.inArray( stationId, receivedStationIds ) == -1 ) {
					_this.updateStationById( stationId, {
						current: {
							temp: "n/a"
						}
					} );
				}
			} );

			// SET WEATHER STATIONS
			_this.setWeatherStations( receivedStations );

			// UPDATE SEARCH CONTEXT
			_this.updateSearchResults();
		},
		error: function( err ) {
			_this.log( "getWeatherByStations", arguments );

			// UNBLOCK STATIONS
			_this.search.blacklist = jQuery.grep( _this.search.blacklist, function( stationId ) {
				return jQuery.inArray( stationId, unknownStationIds ) == -1;
			} );
		}
	} );
}

/*
 ** GET WEATHER BY STATION ID
 */
AmWeather.prototype.getWeatherById = function( station_id ) {
	var _this = this;
	var query = {
		format: "json",
		apikey: _this.config.apikey,
		lang: _this.config.language,
		units: _this.config.units,
		id: station_id
	}

	// GET STATION DATA
	var data = _this.getStationDataById( station_id );

	// NO FORECAST AVAILABLE
	function updateForecastState( data ) {
		if ( !data.forecast.length ) {
			jQuery( ".app" ).addClass( "no-forecast" );
			_this.setChartData( [], true, true );
			data.cached = true;
		}

		return !!data.forecast.length;
	}

	// UPDATE BADGE WITH PRE FETCHED DATA
	_this.setWeather( data );

	// LOAD JUST ONCE
	if ( data.cached ) {
		updateForecastState( data );
		return;
	}

	// REQUEST FORECAST DATA
	jQuery.ajax( {
		url: "http://api.openweathermap.org/data/2.5/forecast",
		dataType: "json",
		data: query,
		success: function( res ) {

			// ERROR
			if ( res.cod != "200" ) {
				_this.log( "getWeatherById", arguments );

				updateForecastState( data );

				return;
			}

			// FORECAST
			jQuery.each( res.list, function( i1, item ) {
				var wind = item.wind || {
					deg: 0,
					speed: 0
				};
				var snapshot = {
					timestamp: parseInt( item.dt * 1000 ),

					temp: parseInt( item.main.temp ),
					humidity: parseInt( item.main.humidity ),
					pressure: parseInt( item.main.pressure ),

					wind_deg: parseInt( wind.deg ),
					wind_speed: parseInt( wind.speed )
				}

				snapshot.icon = _this.getIcon( item.weather[ 0 ].icon, true );

				data.forecast.push( snapshot );
			} );

			// CACHE FLAG
			data.cached = true;

			// UPDATE STATION DATA
			data = _this.updateStationById( station_id, data );

			// UPDATE WEATHER BADGE
			_this.setWeather( data );

		},
		error: function( err ) {
			_this.log( "getWeatherById", arguments );

			updateForecastState( data );
		}
	} );
}


/*
 ** GET ICON NAME
 */
AmWeather.prototype.getIcon = function( icon, lessExt ) {
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
	var mapIcon = MAP[ icon ];

	// LESS EXTENSION
	if ( lessExt ) {
		return mapIcon;
	}

	// WITH EXTENSION
	return [ _this.config.pathToImages, mapIcon, ".svg" ].join( "" );
}

/*
 ** SET WEATHER BADGE; GIVEN DATA IN FORCED STRUCTURE
 */
AmWeather.prototype.setWeather = function( data ) {
	var _this = this;
	var overlap = false;
	var dataProvider = [];
	var midnight = new Date();
	var city = data.current.name;
	var country = _this.getCountryByCountryCode( data.current.countryCode );
	var station = data.current.name + ", " + country.name;

	// REMOVE THINGY
	jQuery( ".app" ).removeClass( "no-forecast" );

	// FORMAT DATE
	function processPlaceholder( value, format, output ) {
		value = value ? new Date( value ) : false;

		if ( value instanceof Date ) {
			value = AmCharts.formatDate( value, format );
		} else {
			value = "n/a";
		}

		return AmCharts.formatDataContextValue( output, {
			output: value
		} );
	}

	/*
	 ** CURRENT
	 */

	// FORMAT TIME
	var now = processPlaceholder( data.current.timestamp, "HH:NN", "[[output]] GMT" );
	var sunrise = processPlaceholder( data.current.sunrise, "HH:NN", "Sunrise [[output]]" );
	var sunset = processPlaceholder( data.current.sunset, "HH:NN", "Sunset [[output]]" );

	// UPDATE ELEMENTS
	jQuery( ".current .badge .temp .icon" ).attr( "class", "icon " + data.current.icon );
	jQuery( ".current .badge .temp .wind" ).attr( "style", "transform: rotate(" + data.current.wind_deg + "deg)" );
	jQuery( ".current .badge .temp .value" ).text( data.current.temp );
	jQuery( ".current .badge .city .name" ).text( station );
	jQuery( ".current .badge .city .time" ).text( now );
	jQuery( ".current .badge .meta .sunrise" ).text( sunrise );
	jQuery( ".current .badge .meta .sunset" ).text( sunset );

	/*
	 ** FORECAST
	 */

	// RESET MIDNIGHT DATE
	midnight.setHours( 24, 0, 0, 0 );

	// PREPARE FORECAST DATA
	jQuery.each( data.forecast, function( i1, item ) {
		var timestamp = item.timestamp;
		var datetime = new Date( timestamp );
		var formattime = AmCharts.formatDate( datetime, "HH:NN" );
		var snapshot = {
			v2top: 100,

			time: formattime,
			timestamp: timestamp,

			temp: item.temp,
			humidity: item.humidity,
			pressure: item.pressure,

			wind_deg: item.wind_deg,
			wind_speed: item.wind_speed,

			icon: _this.config.pathToImages + item.icon + ".svg"
		}

		// TWICE TO PUSH IT TO THE EDGE
		if ( i1 == 0 ) {
			dataProvider.push( snapshot );
		}

		dataProvider.push( snapshot );

		// FORMAT OVERLAPING DAY
		if ( timestamp > midnight && !overlap ) {
			snapshot.time = AmCharts.formatDate( datetime, "EEE" ).toUpperCase() + " " + snapshot.time;
			overlap = true;
		}
	} );

	// UPDATE CHART
	_this.setChartData( dataProvider, true );
}

/*
 ** SET CHART DATA
 */
AmWeather.prototype.setChartData = function( dataProvider, updateChartData, force ) {
	var _this = this;

	// SKIP IF NO DATA AVAILABLE
	if ( !dataProvider.length && !force ) {
		return;
	}

	// CURRENT CHART DATA
	_this.chartData = dataProvider;

	// UPDATE CHART DATA
	if ( updateChartData ) {
		_this.updateChartData();
	}
}

/*
 ** UPDATE CHART DATA
 */
AmWeather.prototype.updateChartData = function() {
	var _this = this;
	var graphs = _this.chartGraphs;
	var dataProvider = [];

	// WALKTHROUGH CHARTDATA
	jQuery( _this.chartData ).each( function() {
		var tmp = {
			timestamp: this.timestamp,
			time: this.time,
			v2top: this.v2top,
			wind_deg: this.wind_deg // wind rose handler
		}

		if ( _this.chartType == "temperature" ) {
			tmp.icon = this.icon;
			tmp.max = 100;
			tmp.value = this.temp / tmp.max * 100;

			_this.chartGraphs.label.labelText = "[[value]]\u00B0";

		} else if ( _this.chartType == "humidity" ) {
			tmp.max = 200;
			tmp.value = this.humidity / tmp.max * 100;

			_this.chartGraphs.label.labelText = "[[value]]%";

		} else if ( _this.chartType == "wind" ) {
			tmp.max = 20
			tmp.value = this.wind_speed / tmp.max * 100;

			_this.chartGraphs.label.labelText = "[[value]] m/s";
		}

		dataProvider.push( tmp );
	} );

	// ANIMATE DATA CHANGE
	_this.chart.animateData( dataProvider, {
		duration: 1000,
		easing: _this.config.easing
	} );
}

/*
 ** SELECT ITEM BY STATION
 */
AmWeather.prototype.selectItem = function( station ) {
	var _this = this;

	_this.filterSearchList( "" );
	setTimeout( function() {
		_this.search.autocomplete.close();
	}, 1 );

	_this.showWeather( station );
}

/*
 ** FOCUS ITEM BY STATION
 */
AmWeather.prototype.focusItem = function( station ) {
	var _this = this;

	// WALKTHOUGH IMAGES
	jQuery( _this.map.dataProvider.images ).each( function() {

		// MATCHING GROUP
		if ( this.groupId === station.id ) {

			// HIGHLIGHT
			_this.map.rollOverMapObject( this );
			_this.animateStationByStationId( this.groupId );

			// RESET ANIMATION ON OTHERS
		} else {
			_this.resetAnimationByStationId( this.groupId );
		}
	} );
}

/*
 ** ANIMATE STATION BY STATION ID
 */
AmWeather.prototype.animateStationByStationId = function( station_id ) {
	var _this = this;
	var images = _this.map.getGroupById( station_id );

	jQuery( images ).each( function() {
		if ( this.animationIcon && !this.changedImage ) {
			var link = this.image.node.getAttribute( "xlink:href" );
			var imageURL = [ _this.config.pathToImagesAnimated, this.animationIcon, ".svg" ].join( "" );

			this.image.node.setAttribute( "xlink:href", imageURL );
			this.changedImage = true;

			return false;
		}
	} );
}

/*
 ** RESET STATION ANIMATION BY STATION ID
 */
AmWeather.prototype.resetAnimationByStationId = function( station_id ) {
	var _this = this;
	var images = _this.map.getGroupById( station_id );

	jQuery( images ).each( function() {
		if ( this.animationIcon && this.changedImage ) {
			var link = this.image.node.getAttribute( "xlink:href" );
			var imageURL = [ _this.config.pathToImages, this.animationIcon, ".svg" ].join( "" );

			this.image.node.setAttribute( "xlink:href", imageURL );
			this.changedImage = false;

			return false;
		}
	} );
}

/*
 ** GET CITITES BY COUNTRY CODE
 */
AmWeather.prototype.getCitiesByCountryCode = function( country_code ) {
	var _this = this;
	return _this.data.cities[ country_code ];
}

/*
 ** GET COUNTRY BY COUNTRY CODE
 */
AmWeather.prototype.getCountryByCountryCode = function( country_code ) {
	var _this = this;
	return _this.data.countries[ country_code ];
}

/*
 ** GET DATA BY COUNTY CODE
 */
AmWeather.prototype.getDataByCountryCode = function( country_code ) {
	var _this = this;
	var country = _this.getCountryByCountryCode( country_code );
	var cities = _this.getCitiesByCountryCode( country_code );
	var hasExtended = _this.data.extended[ country_code ];

	// GET EXTENDED DATA SET
	if ( !hasExtended ) {
		var url = "./assets/json/cities/all/" + country_code + ".json"

		_this.data.extended[ country_code ] = true;

		// REQUEST DATA
		jQuery.ajax( {
			url: url,
			success: function( data ) {

				// EXTEND DATA
				_this.data.cities[ country_code ] = data;

				// UPDATE MERGED LIST
				_this.mergeSearchData();

				// UPDATE SEARCH LIST
				_this.updateSearchList( _this.search.cityMode ? data : _this.data.merged, true );
			},
			error: function( err ) {
				_this.log( "getDataByCountryCode", arguments );
				_this.data.extended[ country_code ] = false;
			}
		} );
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
AmWeather.prototype.zoomToCountryByCountryCode = function( country_code ) {
	var _this = this;

	// LOOP THROUGH AREAS
	jQuery( _this.map.dataProvider.areas ).each( function() {

		// ZOOM TO GIVEN COUNTRY
		if ( this.id == country_code ) {
			_this.map.zoomToObject( this );
			return false;
		}
	} );
}

/*
 ** ZOOM TO COUNTRY BY COUNTRY CODE (using country data boundaries)
 */
AmWeather.prototype.zoomToCountryWithBBOX = function( country_code ) {
	var _this = this;
	var data = _this.getDataByCountryCode( country_code );
	var bbox = _this.bbox = data.country.bbox;
	var zoomControl = _this.map.zoomControl;
	var dataProvider = _this.map.dataProvider;
	var rw = Math.abs( bbox.east - bbox.west );
	var rh = Math.abs( bbox.north - bbox.south );
	var fw = Math.abs( dataProvider.rightLongitude - dataProvider.leftLongitude );
	var fh = Math.abs( dataProvider.topLatitude - dataProvider.bottomLatitude );
	var cw = rw / fw;
	var ch = rh / fh;
	var newZoomLevel;

	// NEW ZOOM LEVEL
	if ( cw > ch ) {
		newZoomLevel = fw * 0.8 / rw;
	} else {
		newZoomLevel = fh * 0.8 / rh;
	}

	// SET NEW ZOOM LEBEL
	_this.bbox.zoomLevel = AmCharts.fitToBounds( newZoomLevel, zoomControl.minZoomLevel, zoomControl.maxZoomLevel );

	// ZOOM TO BOUNDARIES
	_this.map.zoomToLatLongRectangle( _this.bbox.west, _this.bbox.north, _this.bbox.east, _this.bbox.south );
}

/*
 ** ACITVATE CITY MODE BY COUNTRY CODE
 */
AmWeather.prototype.cityMode = function( country_code, zoomToCountryByCountryCode ) {
	var _this = this;
	var data = _this.getDataByCountryCode( country_code );
	var list = data.cities;

	// UPDATE SEARCH SCOPE
	_this.search.cityMode = true;
	_this.search.modeReset = false;

	// UPDATE ELEMENTS
	jQuery( _this.search.input ).attr( "placeholder", "Search City..." );
	jQuery( _this.search.city ).text( data.country.value );
	jQuery( _this.search.meta ).show();

	if ( !_this.env.forcedCityMode ) {
		// FLAG ANIMATION
		_this.map.isAnimating = true;

		// ZOOM INTO COUNTRY
		if ( zoomToCountryByCountryCode ) {
			_this.zoomToCountryByCountryCode( country_code );
		}

		// HIGHLIGHT COUNTRY
		_this.selectCountryByCountyCode( country_code );
	}

	// OFFER COUNTRY CITIES
	_this.updateSearchList( list, true );

	// RESET SEARCH
	_this.filterSearchList( "", true );

	// FLAG APP CONTAINER
	jQuery( ".app" ).addClass( "city-mode" );
	jQuery( ".app" ).removeClass( "country-mode" );

	return list;
}

/*
 ** ACITVATE COUNTRY MODE
 */
AmWeather.prototype.countryMode = function( stayWhereYouAt ) {
	var _this = this;
	var list = _this.data.merged;

	// UPDATE SEARCH SCOPE
	_this.search.cityMode = false;
	_this.search.modeReset = false;

	// UPDATE ELEMENTS
	jQuery( _this.search.input ).attr( "placeholder", "Search City, Country..." );
	jQuery( _this.search.city ).text( "" );
	jQuery( _this.search.meta ).hide();

	// UPDATE DATA
	if ( !stayWhereYouAt ) {

		// RESET ZOOM
		_this.map.isAnimating = true;
		_this.map.zoomToGroup();
		_this.selectCountryByCountyCode( false );

		_this.updateMapData( {
			images: []
		} );

		_this.hideWeather();
	}

	// OFFER TOP 10 CITIES
	_this.updateSearchList( list, true );
	_this.search.autocomplete.close();

	// FLAG APP CONTAINER
	jQuery( ".app" ).removeClass( "city-mode" );
	jQuery( ".app" ).addClass( "country-mode" );

	return list;
}

/*
 ** SUGGEST SEARCH
 */
AmWeather.prototype.filterSearchList = function( term, withWeatherStations ) {
	var _this = this;

	// "VALIDATE" TERM
	term = term || "";

	// UPDATE SEARCH TERM
	jQuery( _this.search.input ).val( term );

	// DELAY UPDATE DUE AUTOCOMPLETE INTERNAL PROCESS
	setTimeout( function() {

		// MANUAL SEARCH
		_this.search.autocomplete.source( {
			term: term

			// REFRESH SUGGESTIONS
		}, function( list ) {
			_this.search.autocomplete._suggest( list );

			if ( withWeatherStations ) {
				_this.search.autocomplete.__response( list );
			}

			// ADD CLASS
			jQuery( ".app" ).addClass( "show-search-results" );

			// SHOW RESULTS
			jQuery( ".search .results ul" ).show();
		} );
	}, 1 );
}

/*
 ** UPDATE SEARCH LIST
 */
AmWeather.prototype.updateSearchList = function( list, silently ) {
	var _this = this;

	// UPDATE DATA
	_this.search.data = list;

	// REFRESH SEARCH LIST
	if ( !silently ) {
		_this.filterSearchList( _this.search.autocomplete.term );
	}
}

/*
 ** SHOW WEATHER BADGE
 */
AmWeather.prototype.showWeather = function( item ) {
	var _this = this;

	// UPDATE STATION BY ID
	_this.updateStationById( item.id, {
		current: item
	} );

	// GET WEATHER BY ID
	_this.getWeatherById( item.id );

	jQuery( _this.search.input ).blur();
	jQuery( ".app" ).addClass( "show-weather" );
}

/*
 ** HIDE WEATHER BADGE
 */
AmWeather.prototype.hideWeather = function() {
	var _this = this;

	jQuery( ".app" ).removeClass( "show-weather" );
}