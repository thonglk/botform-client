//Default colors
var brandPrimary = '#1FBDF1';
var brandSuccess = '#39DFA5';
var brandInfo = '#67c2ef';
var brandWarning = '#fabb3d';
var brandDanger = '#ff5454';

var grayDark = '#384042';
var gray = '#9faecb';
var grayLight = '#90949c';
var grayLighter = '#e1e6ef';
var grayLightest = '#f9f9fa';

var app = angular
    .module('app', [
        'bw.paging',
        '720kb.socialshare',
        'ionSlider',
        'ui.router',
        "com.2fdevs.videogular",
        'toastr',
        'angularModalService',
        'angularSpinner',
        'oc.lazyLoad',
        'pascalprecht.translate',
        'ncy-angular-breadcrumb',
        'angular-loading-bar',
        'ngSanitize',
        'ngAnimate',
        'firebase',
        'starter.configs',
        'starter.services',
        'ngFileUpload',
        'ngImgCrop',
        'datetime',
        'infinite-scroll',
        'chart.js',
        'froala'
    ])
    .value('froalaConfig', {
        toolbarInline: false,
        placeholderText: 'Edit Your Content Here!'
    })
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.latencyThreshold = 1;


    }])
    .config(function (toastrConfig) {
        angular.extend(toastrConfig, {
            autoDismiss: false,
            closeButton: true,
            containerId: 'toast-container',
            maxOpened: 0,
            newestOnTop: true,
            positionClass: 'toast-top-left',
            target: 'body',
            progressBar: false,
            tapToDismiss: true

        });
    })

    .run(function ($rootScope, AuthUser, CONFIG, $timeout, toastr, $window) {

        $rootScope.gotoState = function (state) {
            $rootScope.myState = state
        }

        var pageID = window.localStorage.getItem('pageID')
        void 0;
        if (pageID != 'undefined') $rootScope.pageID = pageID


        $rootScope.pageList = []
        $rootScope.loadResponse = function (query) {
            void 0
            if (query.page) {
                $rootScope.loading = true
                $rootScope.service.JoboApi('viewResponse', query).then(results => {
                    $timeout(function () {
                        $rootScope.loading = false

                        $rootScope.responses = results.data
                    })
                })
            }

        }

        $rootScope.loadBroadcast = function (query) {
            void 0
            if (query.page) {
                $rootScope.loading = true
                $rootScope.service.JoboApi('loadBroadcast', query).then(results => {
                    $timeout(function () {
                        $rootScope.loading = false
                        $rootScope.broadcast = results.data
                    })
                })
            }

        }



        function auth_status_change_callback(response) {
            void 0;
            if (response.status == 'connected') {
                toastr.info('Welcome!  Fetching your information.... ');
                FB.api('/me', function (user) {

                    void 0;

                    FB.api('/me/accounts?limit=100', function (response) {
                        void 0
                        $timeout(function () {
                            $rootScope.pageList = response.data
                            user.pageList = $rootScope.pageList
                            axios.post(CONFIG.APIURL + '/user/update', user).then(result => {
                                void 0
                            })


                            if ($rootScope.pageList.length > 0) {


                            } else {
                                toastr.info('No page created.');

                            }
                        })


                    });

                })
            }

        }

        function statusChangeCallback(response) {
            void 0;
            void 0;
            // The response object is returned with a status field that lets the
            // app know the current login status of the person.
            // Full docs on the response object can be found in the documentation
            // for FB.getLoginStatus().
            if (response.status === 'connected') {
                // Logged into your app and Facebook.
                auth_status_change_callback(response);
            } else {
                // The person is not logged into your app or we are unable to tell.
                void 0
            }
        }


        $window.fbAsyncInit = function () {
            FB.init({
                appId: '295208480879128',
                cookie: true,  // enable cookies to allow the server to access
                xfbml: true,  // parse social plugins on this page
                version: 'v2.8' // use graph api version 2.8
            });
            FB.AppEvents.logPageView();
            void 0
            FB.getLoginStatus(function (response) {
                statusChangeCallback(response);

                FB.Event.subscribe('auth.statusChange', auth_status_change_callback);


            });


            $rootScope.loginFB = function () {
                FB.login(function (response) {
                    // handle the response
                    void 0
                }, {scope: 'public_profile,email,manage_pages,pages_messaging,pages_messaging_subscriptions,read_page_mailboxes'});
            }
        };
        $window.extAsyncInit = function() {
            // the Messenger Extensions JS SDK is done loading
            void 0
            $rootScope.closeBrowser = function () {
                MessengerExtensions.requestCloseBrowser(function success() {
                    // webview closed
                }, function error(err) {
                    // an error occurred
                });
            }

        };
        // Load the SDK asynchronously
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'Messenger'));

        $rootScope.searchName = ''
        $rootScope.view = {}
        $rootScope.width = window.innerWidth;
        $rootScope.service = AuthUser;
        $rootScope.CONFIG = CONFIG;



        function checkPlatform() {
            var ua = navigator.userAgent.toLowerCase();
            var platforms;
            if (ua.indexOf('mobile') < 0) {
                platforms = "web"
            } else {
                if (ua.indexOf('chrome') > 0 || ua.indexOf('safari') > 0 || ua.indexOf('firefox') > 0 || ua.indexOf('edge') > 0) {
                    platforms = "mobile"
                } else {
                    platforms = "app"
                }
            }
            return platforms
        }

        function checkDevice() {
            var ua = navigator.userAgent.toLowerCase();
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
            if (ipad || iphone || ipod) {
                return 'ios'
            }
            if (android) {
                return 'android'
            }

        }

        $rootScope.checkAgent = {
            platform: checkPlatform(),
            device: checkDevice() || ''
        }
        void 0
        $rootScope.today = new Date().getTime()

    })


    .controller('navbarCtrl', function ($scope, $rootScope, $timeout, AuthUser, toastr, $state, $stateParams) {
        $rootScope.service.Ana('trackView', {track: $stateParams['#'], state: $state.current.name || 'new'})
        var params = $stateParams['#']
        if (params && params.startsWith("ref")) {
            window.localStorage.setItem('ref', $rootScope.service.getRefer(params))
            void 0
        }

    })
    .controller('shortlinkCtrl', function (CONFIG, $stateParams) {
        axios.get(`${CONFIG.AnaURL}/l/${$stateParams.queryString}`)
            .then(result => window.location.href = result.data.url)
            .catch(err => void 0);
    })
    .controller('unsubscribeCtrl', function ($scope, CONFIG, $stateParams, toastr) {
        const {id, email} = $stateParams;
        $scope.unsubscribe = function (reason) {
            axios.post(`${CONFIG.APIURL}/unsubscribe`, {
                notiId: id,
                email,
                reason
            })
                .then(result => toastr.success(result.data.message))
                .catch(err => toastr.error(err.data.message));
        }
    })