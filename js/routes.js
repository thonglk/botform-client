angular
    .module('app')
    .config(['CONFIG', '$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$breadcrumbProvider', '$locationProvider', function (CONFIG, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $breadcrumbProvider, $locationProvider) {


        $urlRouterProvider.otherwise(`/bot`);

        $locationProvider.html5Mode(CONFIG.Location)
        $locationProvider.hashPrefix('!');

        $ocLazyLoadProvider.config({
            // Set to true if you want to see what and when is dynamically loaded
            debug: false
        });

        $breadcrumbProvider.setOptions({
            prefixStateName: 'app.main',
            includeAbstract: true,
            template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
        });

        $stateProvider
            .state('app', {
                abstract: true,
                templateUrl: 'templates/tab.html',
                controller: 'navbarCtrl',

                //page title goes here
                ncyBreadcrumb: {
                    label: 'Root',
                    skip: true
                },
                resolve: {
                    loadCSS: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load CSS files
                        return $ocLazyLoad.load([{
                            serie: true,
                            name: 'Font Awesome',
                            files: ['css/font-awesome.min.css']
                        }, {
                            serie: true,
                            name: 'Simple Line Icons',
                            files: ['css/simple-line-icons.css']
                        }]);
                    }],
                    loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load([{
                            serie: true,
                            name: 'chart.js',
                            files: [
                                'js/libs/Chart.min.js',
                                'js/libs/angular-chart.min.js'
                            ]
                        }]);
                    }]
                }
            })
            .state('app.bot', {
                url: '/bot?page?state',
                templateUrl: 'templates/ladibot.html',
                controller: 'ladibotCtrl'
            })
            .state('create', {
                url: '/create?page',
                templateUrl: 'templates/create.html',
                controller: 'createCtrl'
            })
            .state('rebrand', {
                url: '/botwithoutmenu',
                templateUrl: 'templates/rebrand.html',
                controller: 'rebrandCtrl'

            })


            .state('mailsheet', {
                url: '/mailsheet?sheetId?email',
                templateUrl: 'templates/mailsheet.html',
                controller: 'mailSheetCtrl'


            })

        // static


    }]);
