'use strict';

angular.module('app')

    .filter('reverse', function () {
        return function (items) {
            return items.slice().reverse();
        };
    })

    .filter('capitalize', function () {
        return function (input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })

    .controller("ExecHomeController",
        ['$scope', '$http', '$filter', 'Notifications', 'SensorData',
            function ($scope, $http, $filter, Notifications, SensorData) {


            }])

    .controller("ExecFacilityUtilizationController",
        ['$scope', '$http', '$filter', 'Notifications', 'SensorData', 'Reports',
            function ($scope, $http, $filter, Notifications, SensorData, Reports) {

                $scope.facilities = Reports.getFacilities();

                $scope.config = {
                    units: 'sq. ft.'
                };

                $scope.donutConfig = {
                    chartId: 'chart-util',
                    thresholds: {'warning': '60'}
                };

                $scope.sparklineConfig = {
                    chartId: 'chart-spark',
                    tooltipType: 'percentage',
                    units: 'sq. ft.'
                };

                $scope.centerLabel = "used";
                $scope.custChartHeight = 60;
                $scope.custShowXAxis = false;
                $scope.custShowYAxis = false;

                $scope.utilData = {};

                function processFacilityUtilization(facilities) {

                    // figure total sq ft and utilization
                    var totalSize = 0;
                    var usedSize = 0;
                    facilities.forEach(function(facility) {
                        totalSize += facility.size;
                        usedSize += (facility.utilization * facility.size);
                    });

                    var today = new Date();
                    var dates = ['dates'];
                    var yData = ['used'];

                    for (var d = 20 - 1; d >= 1; d--) {
                        dates.push(new Date(today.getTime() - (d * 24 * 60 * 60 * 1000)));
                        yData.push(Math.floor(totalSize * Math.random()));
                    }

                    // add one more representing today
                    dates.push(new Date(today.getTime()));
                    yData.push(Math.floor(usedSize));

                    $scope.utilData = {
                        dataAvailable: true,
                        used: Math.floor(usedSize),
                        total: Math.floor(totalSize),
                        xData: dates,
                        yData: yData
                    };
                }

                processFacilityUtilization($scope.facilities);

                $scope.$on('facilities:updated', function(event, facilities) {
                    processFacilityUtilization(facilities);
                });

            }])

    .controller("ExecTopFacilitiesController",
        ['$scope', '$http', '$filter', 'Notifications', 'SensorData', 'Reports',
            function ($scope, $http, $filter, Notifications, SensorData, Reports) {

                $scope.facilities = Reports.getFacilities();
                $scope.data = {};
                $scope.titles = {};
                $scope.units = "";
                $scope.donutData = {};
                $scope.donutConfig = {};

                var colorPal = [
                    patternfly.pfPaletteColors.blue,
                    patternfly.pfPaletteColors.green,
                    patternfly.pfPaletteColors.orange,
                    patternfly.pfPaletteColors.red
                ];

                function processFacilities(facilities) {

                    $scope.facilities = facilities.sort(function(f1, f2) {
                        return (f2.utilization - f1.utilization);
                    });

                    $scope.donutData = {
                        type: 'donut',
                        columns: $scope.facilities.map(function(facility) {
                            return [
                                facility.name, facility.utilization
                            ]
                        }),
                        colors: {}
                    };

                    $scope.facilities.forEach(function(facility, idx) {
                        $scope.donutData.colors[facility.name] =  colorPal[idx % colorPal.length];
                    });

                    $scope.donutConfig = {
                        'chartId': 'noneChart',
                        'thresholds':{'warning':'60','error':'90'}
                    };

                    $scope.facilities.forEach(function(facility) {
                        $scope.data[facility.name] = {
                            used: facility.utilization * 100,
                            total: 100
                        };

                        $scope.titles[facility.name] = facility.name;
                    });


                    var donutConfig = patternfly.c3ChartDefaults().getDefaultDonutConfig();
                    donutConfig.bindto = '#donut-chart-8';
                    donutConfig.tooltip = {show: true};
                    donutConfig.data = $scope.donutData;

                    donutConfig.legend = {
                        show: true,
                        position: 'right'
                    };
                    // donutConfig.size = {
                    //     width: 251,
                    //     height: 161
                    // };

                    c3.generate(donutConfig);
                    patternfly.pfSetDonutChartTitle("#donut-chart-8", "4", "Facilities");

                }

                if ($scope.facilities && $scope.facilities.length > 0) {
                    processFacilities($scope.facilities);
                }

                $scope.$on('facilities:updated', function(event, facilities) {
                    if (facilities && facilities.length > 0) {
                        processFacilities(facilities);
                    }
                });

            }])

    .controller("ExecBizTrendsController",
        ['$scope', '$http', '$filter', 'Notifications', 'SensorData',
            function ($scope, $http, $filter, Notifications, SensorData) {

        $scope.chartConfig = patternfly.c3ChartDefaults().getDefaultAreaConfig();

        $scope.setPeriod = function(period) {
            xPoints = ['x'];
            currentUse = ['Current Period'];
            previousUse = ['Previous Period'];

            if (period == 'month') {
                $scope.timeFrame = "Last Month";
                for (var i = 30; i >= 0; i--) {
                    xPoints.push(now - (i * 24 * 60 * 60 * 1000));
                    currentUse.push(Math.random() * 200);
                    previousUse.push(Math.random() * 200);
                }
            } else if (period == 'year') {
                $scope.timeFrame = "Last Year";
                for (var i = 12; i >= 0; i--) {
                    xPoints.push(now - (i * 30 * 24 * 60 * 60 * 1000));
                    currentUse.push(Math.random() * 200);
                    previousUse.push(Math.random() * 200);
                }
            } else {
                $scope.timeFrame = "Beginning of Time";
                for (var i = 60; i >= 0; i--) {
                    xPoints.push(now - (i * 30 * 24 * 60 * 60 * 1000));
                    currentUse.push(Math.random() * 200);
                    previousUse.push(Math.random() * 200);
                }
            }

            $scope.chartConfig.data = {
                x: 'x',
                columns: [
                    xPoints, currentUse, previousUse
                ],
                type: 'area-spline',
                colors: {
                    'Previous Period': '#dddddd'
                }

            };

            $scope.chartConfig.axis = {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: (period == 'month') ? '%b %d': (period == 'year' ? '%b' : '%b %Y')
                    }
                }
            };

            $scope.chartConfig.tooltip = {
                format: {
                    value: function (value, ratio, id, index) {
                        return ( value.toFixed(1) + " m.p.g.");
                    }
                }
            };
        };



        var now = new Date().getTime();
        var xPoints = ['x'], currentUse = ['Current Period'], previousUse = ['Previous Period'];

        $scope.setPeriod('year');
        $scope.timeFrame = "Last Year";


            }])

    .controller("ExecSummaryController",
        ['$scope', '$http', '$filter', 'Notifications', 'SensorData', 'Reports',
            function ($scope, $http, $filter, Notifications, SensorData, Reports) {

            $scope.summaries = Reports.getSummaries();

            var icons = {
                'clients': 'fa fa-user',
                'packages': 'fa fa-tag',
                'vehicles': 'fa fa-truck',
                'operators': 'fa fa-group',
                'facilities': 'fa fa-building',
                'managers': 'fa fa-group'
            };

            function processSummaries(summaries) {
                $scope.summaries = summaries;
                summaries.forEach(function(summary) {
                    $scope.summaries[summary.name] = {
                        "name": summary.name,
                        "title": summary.title,
                        "count": summary.count,
                        "iconClass": icons[summary.name],
                        "notifications": []
                    };


                    if (summary.warningCount <= 0 && summary.errorCount <= 0) {
                        $scope.summaries[summary.name].notifications = [{
                            "iconClass":"pficon pficon-ok"
                        }]
                    }

                    if (summary.warningCount > 0) {
                        $scope.summaries[summary.name].notifications.push({
                            "iconClass":"pficon pficon-warning-triangle-o",
                            "count":summary.warningCount
                        })
                    }
                    if (summary.errorCount > 0) {
                        $scope.summaries[summary.name].notifications.push({
                            "iconClass":"pficon pficon pficon-error-circle-o",
                            "count":summary.errorCount
                        })
                    }
                });

            }

            $scope.$on("summaries:updated", function(event, summaries) {
                processSummaries(summaries);
            });

            processSummaries($scope.summaries);

            }])


    .controller("HomeController",
        ['$scope', '$http', '$filter', 'Notifications', 'SensorData',
            function ($scope, $http, $filter, Notifications, SensorData) {

                $scope.showDialog = false;

            }])



    .controller("AlertListController",
        ['$timeout', '$scope', '$http', 'Notifications', 'SensorData', 'Alerts',
            function ($timeout, $scope, $http, Notifications, SensorData, Alerts) {

                $scope.alerts = Alerts.getAlerts();

                $scope.$on('alert', function (event, alert) {
                    $scope.alerts = Alerts.getAlerts();
                });

                Alerts.addAlert("system", "system", "info", "Startup", "Fetching shipments...");
                Alerts.addAlert("system", "system", "info", "Startup", "Initializing Sensor Telemetry...");
                Alerts.addAlert("system", "system", "success", "System Initialized", "System is Ready");


                $scope.getAlertCount = function (pkgName, type) {
                    if ($scope.alerts == null) {
                        return 0;
                    }
                    return $scope.alerts.filter(function (alert) {
                        if (alert == null) return false;
                        return ((alert.pkgName == pkgName) && (alert.type == type));
                    }).length;
                };

                $scope.clearAlerts = function () {
                    Alerts.clearAlerts();
                    $scope.alerts = [];
                };
                $scope.addListener = function (l) {
                    SensorData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    SensorData.removeListener(l);
                };

            }])

    .controller("VehiclesListController",
        ['$timeout', '$rootScope', '$scope', '$http', 'Notifications', 'SensorData', 'Vehicles',
            function ($timeout, $rootScope, $scope, $http, Notifications, SensorData, Vehicles) {

                $scope.vehicleQuery = '';

                $scope.selectedVehicle = null;

                $scope.vehicles = Vehicles.getVehicles();

                $scope.resetAll = function() {
                    $rootScope.$broadcast("resetAll");
                };

                $scope.isSelected = function (vehicle) {
                    if (!$scope.selectedVehicle) {
                        return false;
                    }
                    return $scope.selectedVehicle.vin == vehicle.vin;
                };


                $scope.selectVehicle = function(vehicle) {
                    $scope.selectedVehicle = vehicle;
                    $rootScope.$broadcast("vehicles:selected", vehicle);
                };

                $scope.$on('vehicles:updated', function(event) {
                    // you could inspect the data to see if what you care about changed, or just update your own scope
                    $scope.vehicles = Vehicles.getVehicles();
                });

            }])

    .controller("PkgTelemetryController",
        ['$filter', '$interval', '$rootScope', '$scope', '$modal', '$http', 'Notifications', 'SensorData',
            function ($filter, $interval, $rootScope, $scope, $modal, $http, Notifications, SensorData) {

                var MAX_POINTS = 20;

                function addData(pkg, data) {

                    if (pkg != $scope.selectedPkg) {
                        return;
                    }

                    data.forEach(function(metric) {

                        var dataSet = $scope.n3data[metric.name];
                        var config = $scope.n3options[metric.name];

                        dataSet.hasData = true;
                        dataSet.dataset0.push({
                            x: new Date(),
                            val_0: metric.value
                        });
                        dataSet.value = metric.value;
                        if (dataSet.dataset0.length > (MAX_POINTS + 1)) {
                            // remove the earliest value
                            dataSet.dataset0.splice(0, 1);
                        }

                        if (metric.value > dataSet.upperLimit || metric.value < dataSet.lowerLimit) {
                            config.warning = true;
                            config.series[0].color = '#ec7a08';
                        } else {
                            config.warning = false;
                            config.series[0].color = '#1f77b4';
                        }
                    });
                }

                $scope.selectedPkg = null;

                $scope.n3options = [];
                $scope.n3data = [];

                // $interval(function() {
                //
                // }, 2000);


                $scope.$on('package:selected', function(event, pkg) {
                    pkg.telemetry.forEach(function(telemetry) {
                        $scope.n3options[telemetry.name] = {
                            warning: false,
                            series: [
                                {
                                    axis: "y",
                                    dataset: "dataset0",
                                    key: "val_0",
                                    label: telemetry.name,
                                    color: "#1f77b4",
                                    type: ['area'],
                                    id: 'mySeries0',
                                    interpolation: {mode: "bundle", tension: 0.98}
                                }
                            ],
                            axes: {
                                x: {
                                    key: "x",
                                    type: 'date',
                                    tickFormat: function(value, idx) {
                                        return ($filter('date')(value, 'H:mm:ss'));
                                    }
                                }
                            },
                            margin: {
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0
                            }
                        };

                        $scope.n3data[telemetry.name] = {
                            hasData: false,
                            upperLimit:telemetry.max,
                            lowerLimit:telemetry.min,
                            value: 0,
                            dataset0: [

                            ]
                        };

                    });
                    $scope.selectedPkg = pkg;
                    SensorData.subscribePkg(pkg, function(data) {
                        $scope.$apply(function() {
                            addData(pkg, data);
                        });
                    });

                });

                $scope.showHistory = function(telemetry) {

                    if (!$scope.selectedPkg) {
                        alert("You must choose a shipment!");
                        return;
                    }

                    SensorData.getRecentData($scope.selectedPkg, telemetry, function(cbData) {
                        $modal.open({
                            templateUrl: 'partials/history.html',
                            controller: 'HistoryController',
                            size: 'lg',
                            resolve: {
                                pkg: function() {return $scope.selectedPkg},
                                data: function() {
                                    var newData = {
                                        hasData: false,
                                        upperLimit:telemetry.max,
                                        lowerLimit:telemetry.min,
                                        value: 0,
                                        dataset0: []
                                    };

                                    cbData.forEach(function(pt) {
                                        newData.dataset0.push({
                                            x: new Date(pt.timestamp),
                                            val_0: pt.value
                                        });
                                    });
                                    return newData;
                                },
                                telemetry: function() {return telemetry},
                                config: function() {
                                    return {
                                        series: [
                                            {
                                                axis: "y",
                                                dataset: "dataset0",
                                                key: "val_0",
                                                label: telemetry.name,
                                                color: "#1f77b4",
                                                type: ['area'],
                                                id: 'mySeries0',
                                                interpolation: {mode: "bundle", tension: 0.98}
                                            }
                                        ],
                                        axes: {
                                            x: {
                                                key: "x",
                                                type: 'date',
                                                tickFormat: function(value, idx) {
                                                    return ($filter('date')(value, 'medium'));
                                                }
                                            }
                                        },
                                        margin: {
                                            top: 0,
                                            right: 0,
                                            bottom: 0,
                                            left: 0
                                        },
                                        symbols: [
                                            {
                                                type: 'hline',
                                                value: telemetry.min,
                                                color: '#FF0000',
                                                axis: 'y'
                                            },
                                            {
                                                type: 'hline',
                                                value: telemetry.max,
                                                color: '#FF0000',
                                                axis: 'y'
                                            }

                                        ]

                                    }
                                }

                            }
                        });

                    });


                }
            }])

    .controller("HistoryController",
        ['$scope', '$http', 'Notifications', 'SensorData', 'pkg', 'telemetry', 'data', 'config',
            function ($scope, $http, Notifications, SensorData, pkg, telemetry, data, config) {

                $scope.data = data;
                $scope.telemetry = telemetry;
                $scope.config = config;
                $scope.pkg = pkg;

            }])

    .controller("MapController",
        ['$timeout', '$scope', '$http', 'Notifications', "SensorData", "NgMap", "APP_CONFIG",
            function ($timeout, $scope, $http, Notifications, SensorData, NgMap, APP_CONFIG) {
                $scope.addListener = function (l) {
                    SensorData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    SensorData.removeListener(l);
                };

                $scope.mapsUrl = 'https://maps.googleapis.com/maps/api/js?key=' + APP_CONFIG.GOOGLE_MAPS_API_KEY;

                var timers = [];

                $scope.$on('vehicles:selected', function (event, vehicle) {
                    timers.forEach(function (timer) {
                        $timeout.cancel(timer);
                    });
                    timers = [];

                    var directionsDisplay = new google.maps.DirectionsRenderer();
                    var directionsService = new google.maps.DirectionsService();

                    var request = {
                        origin: vehicle.origin.address,
                        destination: vehicle.destination.address,
                        travelMode: google.maps.DirectionsTravelMode.DRIVING
                    };
                    directionsService.route(request, function (response, status) {
                        if (status === google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(response);
                            NgMap.getMap().then(function (map) {
                                directionsDisplay.setMap(map);

                                var st = $timeout(function () {
                                    map.markers.cp.setMap(null);
                                    var steps = directionsDisplay.directions.routes[0].legs[0].steps;
                                    var totalsteps = steps.length;
                                    var curStepIdx = Math.floor(totalsteps * 0.2);
                                    var curStep = steps[curStepIdx];

                                    map.markers.cp.setMap(map);
                                    map.markers.cp.setPosition(curStep.start_location);

                                    function movecontainer(marker, dlat, dlng, index, total, delay) {
                                        var t = $timeout(function () {
                                            movemarker(marker, dlat, dlng, index, total);
                                        }, delay);
                                        timers.push(t);
                                    }

                                    function movemarker(marker, dlat, dlng, index, total) {
                                        var newpos = new google.maps.LatLng(marker.getPosition().lat() + dlat,
                                            marker.getPosition().lng() + dlng);
                                        marker.setPosition(newpos);
                                        map.setCenter(newpos);
                                        if (index < total) {
                                            var t2 = $timeout(function () {
                                                movemarker(marker, dlat, dlng, index + 1, total);
                                            }, 1000);
                                            timers.push(t2);
                                        }
                                    }

                                    for (var i = curStepIdx, idx = 0; i < totalsteps; i++, idx++) {
                                        var startloc = steps[i].start_location;
                                        var endloc = steps[i].end_location;
                                        var dlat = (endloc.lat() - startloc.lat()) / 50;
                                        var dlng = (endloc.lng() - startloc.lng()) / 50;
                                        movecontainer(map.markers.cp, dlat, dlng, 0, 50, 1000 * 50 * idx);
                                    }
                                }, 1000);
                                timers.push(st);

                            });
                        } else {
                            Notifications.error('Unable to display directions');
                        }
                    });
                });


            }])
    .controller("ShipListController",
        ['$rootScope', '$scope', '$http', 'Notifications', "SensorData", "Shipments", "Alerts",
            function ($rootScope, $scope, $http, Notifications, SensorData, Shipments, Alerts) {
                $scope.getAlertCount = function (pkgName, type) {
                    if ($scope.shipalerts == null) {
                        return 0;
                    }
                    var count = $scope.shipalerts.filter(function (alert) {
                        if (alert == null) return false;
                        return ((alert.pkgName == pkgName) && (alert.type == type));
                    }).length;

                    return count;
                };

                $scope.shipQuery = '';

                $scope.shipments = null;
                $scope.selectedShipment = null;
                $scope.selectedVehicle = null;
                $scope.shipalerts = [];

                $scope.$on('vehicles:selected', function(event, vehicle) {
                    $scope.selectedVehicle = vehicle;
                    Shipments.getShipments(vehicle, function(shipments) {
                        $scope.shipments = shipments;
                    });
                });



                $scope.isAlerted = function (pkgName) {

                    for (var i = 0; i < $scope.shipments.length; i++) {
                        var ship = $scope.shipments[i];
                        if (ship.name == pkgName && ship.indicator) {
                            return ship.indicator;
                        }
                    }
                    return false;
                };

                $scope.clearAlert = function (shipment) {
                    if (confirm("Click OK to clear this Alert.")) {
                        var topic = shipment.name.replace('assets', 'notification');
                        var payload = {
                            metrics: {
                                metric: [
                                    {
                                        name: 'red',
                                        type: 'boolean',
                                        value: false
                                    },
                                    {
                                        name: 'green',
                                        type: 'boolean',
                                        value: false
                                    }
                                ]
                            }
                        };

                        SensorData.publish(topic, payload, function () {
                            $scope.selectedShipment.indicator = undefined;
                        }, function (err) {
                            Notifications.error(err.statusText + ": " + err.data.message);
                        });
                    }
                };

                $scope.isSelected = function (shipment) {
                    if (!$scope.selectedShipment) {
                        return false;
                    }
                    return $scope.selectedShipment.name == shipment.name;
                };

                function notificationListener(data) {

                    var shipment = null;
                    var origId = data.name.replace('notification', 'assets');
                    if (origId == $scope.selectedShipment.name) {
                        shipment = $scope.selectedShipment;
                    } else {

                        $scope.shipments.forEach(function(shipObj) {
                            if (shipObj.name == origId) {
                                shipment = shipObj;
                            }
                        });
                    }

                    if (shipment == null) {
                        // we know of no shipment that matches the id from the data message
                        return;
                    }
                    if (data.red) {
                        Alerts.addAlert(shipment.name, shipment.name, "danger", "Indicator", "RED Sensor Indicator");
                        shipment.indicator = 'red';
                    } else if (data.green) {
                        Alerts.addAlert(shipment.name, shipment.name, "success", "Indicator", "GREEN Sensor Indicator");
                        shipment.indicator = 'green';
                    } else {
                        shipment.indicator = undefined;
                    }
                    if (!shipment.randomData) {
                    }

                    $scope.$apply();
                }

                $scope.selectShipment = function (shipment) {
                    if ($scope.selectedShipment && (shipment.name == $scope.selectedShipment.name)) {
                        return;
                    }
               //   SensorData.unsubscribeAll();
                    $scope.selectedShipment = shipment;
                    $rootScope.$broadcast('package:selected', shipment);

                };

                // TODO: alerts should come from server eventually...
                $scope.$on('alert', function (event, alert) {
                    $scope.shipalerts = Alerts.getAlerts();
                });

            }])

    .controller("HeaderController",
        ['$scope', '$location', '$http', 'APP_CONFIG', 'Notifications', 'Reports',
            function ($scope, $location, $http, APP_CONFIG, Notifications, Reports) {
                $scope.userInfo = {
                    fullName: "John Q. Shipper"
                };

                $scope.$on("resetAll", function(evt) {
                    $scope.resetAll();
                });

                $scope.resetAll = function() {
                    var resetUrl = "http://" + APP_CONFIG.DATASTORE_REST_HOSTNAME + '.' + $location.host().replace(/^.*?\.(.*)/g,"$1") + '/api/utils/resetAll';
                    $http({
                        method: 'POST',
                        url: resetUrl
                    }).then(function (response) {
                        Notifications.success("Reset successful.");
                        location.reload();
                    }, function err(response) {
                        Notifications.error("Error resetting. Reload to retry");
                    });
                };
                $scope.shipmentCount = Reports.getShipCount();

                $scope.$watch(function () {
                    return Reports.getShipCount();
                }, function (newVal, oldVal) {
                    $scope.shipmentCount = newVal;
                });

            }])

.controller("VehiclePanelController",
    ['$scope', '$interval', '$location', '$http', 'APP_CONFIG', 'Notifications', 'SensorData',
        function ($scope, $interval, $location, $http, APP_CONFIG, Notifications, SensorData) {

            $scope.selectedVehicle = null;
            $scope.truckImageType = 'plain';
            $scope.config = [];
            $scope.data = [];

            function addData(vehicle, data) {

                if (vehicle != $scope.selectedVehicle) {
                    return;
                }
                var truckType = 'plain';

                data.forEach(function(metric) {
                    var dataSet = $scope.data[metric.name];

                    dataSet.used = metric.value;
                    dataSet.dataAvailable = true;
                    if (metric.value > (.90 * dataSet.total)) {
                        truckType = 'warning';
                    }

                });
                $scope.truckImageType = truckType;
            }

            $scope.$on('vehicles:selected', function(event, vehicle) {
                $scope.selectedVehicle = vehicle;
                vehicle.telemetry.forEach(function(telemetry) {
                    $scope.config[telemetry.name] = {
                        'chartId'      :  telemetry.metricName + "vehiclechart",
                        'units'        : telemetry.units,
                        'thresholds'    : {'warning':80,'error':90},
                        'tooltipType'  : 'default'
                    };
                    $scope.data[telemetry.name] = {
                        'used': 0,
                        'total': telemetry.max,
                        'dataAvailable': false
                    };
                });

                SensorData.subscribeVehicle(vehicle, function(data) {
                    $scope.$apply(function() {
                        addData(vehicle, data);
                    });
                });
            });


        }]);
