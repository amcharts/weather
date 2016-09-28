/*
Plugin Name: amMap group collision
Description: Detects group collisions within zoom level and toggles group visibility,
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
AmCharts.addInitHandler( function( map ) {
    var hidden = [];

    // CHECK INTERSECTION
    function intersectRect( r1, r2 ) {
        return !( r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top );
    }

    // CHECK FOR COLLISIONS
    function checkCollisions( e ) {
        var images = map.dataProvider.images;
        var groups = {};
        var groupIds = [];
        var hidden = [];

        // WALKTHROUGH IMAGES TO GET GROUP BOUNDARIES
        for ( i1 = 0; i1 < images.length; i1++ ) {
            var image = images[ i1 ];

            // SKIP BROKEN IMAGES
            if ( !image.displayObject ) {
                continue;
            }

            // PREPARE NEW GROUP
            if ( groups[ image.groupId ] === undefined ) {
                groups[ image.groupId ] = {
                    id: image.groupId,
                    bbox: {
                        top: false,
                        right: false,
                        bottom: false,
                        left: false
                    },
                    hidden: image.hidden,
                    images: [],
                    intersections: []
                };
                groupIds.push( image.groupId );
            }

            // GET GROUP BOUNDARIES
            var group = groups[ image.groupId ];
            var bbox1 = group.bbox;
            var bbox2 = image.displayObject.node.getBoundingClientRect();

            // UPDATE GROUP BOUNDARIES
            bbox1.top = bbox1.top === false ? bbox2.top : bbox2.top < bbox1.top ? bbox2.top : bbox1.top;
            bbox1.left = bbox1.left === false ? bbox2.left : bbox2.left < bbox1.left ? bbox2.left : bbox1.left;
            bbox1.bottom = bbox1.bottom === false ? bbox2.bottom : bbox2.bottom > bbox1.bottom ? bbox2.bottom : bbox1.bottom;
            bbox1.right = bbox1.right === false ? bbox2.right : bbox2.right > bbox1.right ? bbox2.right : bbox1.right;

            group.images.push( image );
        }

        // CHECK COLLISION
        for ( i1 = 0; i1 < groupIds.length; i1++ ) {
            var g1 = groups[ groupIds[ i1 ] ];

            // MARK COLLISIONS
            for ( i2 = 0; i2 < groupIds.length; i2++ ) {
                var g2 = groups[ groupIds[ i2 ] ];

                if ( i1 == i2 || g2.priotized ) {
                    continue;
                }

                if ( intersectRect( g1.bbox, g2.bbox ) ) {
                    g1.priotized = true;
                    g1.intersections.push( g2 );
                }
            }
        }

        // PROCESS COLLISIONS
        for ( i1 = 0; i1 < groupIds.length; i1++ ) {
            var g1 = groups[ groupIds[ i1 ] ];
            var intersections = g1.intersections;

            for ( i2 = 0; i2 < g1.intersections.length; i2++ ) {
                var g2 = g1.intersections[ i2 ];
                var images = g2.images;

                map.hideGroup( g2.id );
                g2.hidden = true;
                hidden.push( g2.id );

                for ( i3 = 0; i3 < images.length; i3++ ) {
                    images[ i3 ].displayObject.node.setAttribute( "pointer-events", "none" );
                }
            }
        }

        // SHOW PREVIOUSLY HIDDEN ONES
        for ( i1 = 0; i1 < groupIds.length; i1++ ) {
            var g1 = groups[ groupIds[ i1 ] ];
            var images = g1.images;

            if ( g1.hidden && hidden.indexOf( g1.id ) == -1 ) {
                g1.hidden = false;
                map.showGroup( g1.id );

                for ( i2 = 0; i2 < images.length; i2++ ) {
                    images[ i2 ].displayObject.node.setAttribute( "pointer-events", "default" );
                }
            }

        }
    }

    // LISTEN TO SOME MAP EVENTS
    map.addListener( "dataUpdated", checkCollisions );
    map.addListener( "zoomCompleted", checkCollisions );
}, [ "map" ] );