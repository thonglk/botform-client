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
        'starter.configs',
        'starter.services',
        'ngFileUpload',
        'ngImgCrop',
        'datetime',
        'infinite-scroll',
        'chart.js',
        'froala',
        'color.picker'
    ])
    .value('froalaConfig', {
        toolbarInline: false,
        placeholderText: 'Edit Your Content Here!'
    })
    .config(function ($provide) {
        $provide.decorator('ColorPickerOptions', function ($delegate) {
            var options = angular.copy($delegate);
            options.alpha = false;
            options.format = 'hexString';
            return options;
        });
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

    .run(function ($rootScope, AuthUser, CONFIG, $timeout, toastr, $window, $state) {
        $rootScope.show = {}
        $rootScope.lang = window.localStorage.getItem('lang')
        if (!$rootScope.lang) {
            axios.get('https://api.ipdata.co/').then(result => {
                if (result.data.country_code == 'VN') $rootScope.lang == 'vi'
                else $rootScope.lang = 'en'
            })
        }


        $rootScope.L = function (en, vi) {
            if ($rootScope.lang == 'vi') return vi
            else return en

        }
        $rootScope.setLang = function (lang) {
            $rootScope.lang = lang;
            window.localStorage.setItem('lang', lang)
        }


        var pageID = window.localStorage.getItem('pageID')
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
        $rootScope.setIDpage = function (card) {
            $rootScope.pageID = card.id
            $rootScope.query = {page: $rootScope.pageID}
            $rootScope.loadResponse($rootScope.query)

        }

        $rootScope.loadBroadcast = function (query) {
            if (query.pageID) {
                $rootScope.loading = true
                $rootScope.service.JoboApi('loadBroadcast', query).then(results => {
                    $timeout(function () {
                        $rootScope.loading = false
                        $rootScope.broadcast = results.data
                    })
                })
            }

        }


        $rootScope.setTemplatePage = function (card, id) {
            $rootScope.loading = true

            axios.get('https://jobo-ana.herokuapp.com/copyFile', {
                params: {
                    id: id,
                    name: `${card.name} chatbot`
                }
            }).then(result => {
                var yourFormId = result.data.id
                $rootScope.loading = false
                $rootScope.buildBot(card, `https://docs.google.com/forms/d/${yourFormId}/edit`)
            })

        }


        $rootScope.buildBot = function (card, url) {
            return new Promise(function (resolve, reject) {


                var params = {
                    pageID: card.id,
                    access_token: card.access_token,
                    name: card.name
                }

                if (url) {
                    params.url = url;
                    params.type = 'url'
                }
                console.log(params)

                $rootScope.loading = true
                $rootScope.service.JoboApi('getchat', params).then(response => {
                    $rootScope.loading = false
                    console.log('response', response)
                    $timeout(function () {
                        $rootScope.pageData = response.data
                        $rootScope.pageData.link = {
                            bot: `https://m.me/${$rootScope.pageData.id}`,
                            forms: `https://docs.google.com/forms/d/${$rootScope.pageData.editId}/edit`,
                            sheet: `https://docs.google.com/spreadsheets/d/${$rootScope.pageData.sheetId}/edit`
                        }
                        $state.go('app.bot', {state: 'dashBoard', page: card.id})
                        resolve(response.data)
                    })
                    window.localStorage.setItem('pageID', card.id)
                    $rootScope.pageID = card.id
                }, error => {
                    console.log('error', error)
                    toastr.error(error)
                    reject(error)
                })
            })
        }

        $rootScope.updateSheet = function (sheetId, pageID) {
            return new Promise(function (resolve, reject) {
                $rootScope.loading = true
                axios.get(`https://jobo-ana.herokuapp.com/saveDataToSheet?pageID=${pageID}&sheetId=${sheetId}`)
                    .then(response => $timeout(() => {
                            $rootScope.loading = false

                            window.location = $rootScope.viewLink.sheet
                            resolve(response.data)
                        }), error => $timeout(() => {
                            $rootScope.loading = false
                            resolve(error)
                        })
                    )
            })
        }

        $rootScope.customercodeSet = {
            theme_color: '#0084ff',
            logged_out_greeting: 'Click Chat now to subscribe our newletters',
            logged_in_greeting: 'Click Chat now to subscribe our newletters',
            minimized: 'false',
            ref: 'widget',
            domain: ''
        }
        $rootScope.customercode = ``


        $rootScope.sendToMessengerSet = {
            color: 'blue',
            size: 'standard',
            ref: 'widget'
        }
        $rootScope.sendToMessenger = ``
        $rootScope.generateCode = function (type) {


            $rootScope.service.JoboApi('setWhiteListDomain', {
                pageID: $rootScope.pageID,
                domain: $rootScope.customercodeSet.domain
            }).then(result => toastr.success('Copy this code to your website!'))


            if (type == 'sendToMessenger') $rootScope.sendToMessenger = `
            <div class="fb-send-to-messenger" 
  messenger_app_id="295208480879128" 
  page_id="${$rootScope.pageID}" 
  data-ref="${$rootScope.sendToMessengerSet.ref}" 
  color="${$rootScope.sendToMessengerSet.color}" 
  size="${$rootScope.sendToMessengerSet.size}">
</div>
`
            else $rootScope.customercode = `
                                <!-- Load Facebook SDK for JavaScript -->
                                <div id="fb-root"></div>
                                <script>(function(d, s, id) {
                                    var js, fjs = d.getElementsByTagName(s)[0];
                                    if (d.getElementById(id)) return;
                                    js = d.createElement(s); js.id = id;
                                    js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.12&autoLogAppEvents=1';
                                    fjs.parentNode.insertBefore(js, fjs);
                                }(document, 'script', 'facebook-jssdk'));</script>

                                <!-- Your customer chat code -->
                                <div class="fb-customerchat"
                                     page_id="${$rootScope.pageID}"
                                     theme_color="${$rootScope.customercodeSet.theme_color}" 
                                     logged_out_greeting="${$rootScope.customercodeSet.logged_out_greeting}"
                                     logged_in_greeting="${$rootScope.customercodeSet.logged_in_greeting}"
                                     minimized="${$rootScope.customercodeSet.minimized}"
                                     ref="${$rootScope.customercodeSet.ref}"
                                     >
                                </div>`

        }


        function auth_status_change_callback(response) {
            console.log('response', response)
            if (response.status == 'connected') {

                var params = response.authResponse
                axios.get(CONFIG.APIURL + '/user/update', {params}).then((result, err) => {

                    if (err) {
                        FB.api('/me', function (user) {
                            FB.api('/me/accounts?limit=100', function (response) {
                                $timeout(function () {
                                    $rootScope.pageList = response.data
                                })
                            });

                        })
                    }
                    toastr.info(`Welcome! ${result.data.name}`);
                    $rootScope.pageList = result.data.pageList

                    axios.get(CONFIG.APIURL + '/chooseBot?userID=' + result.data.id).then((result, err) => {
                        $rootScope.botList = result.data.data


                    })

                    if ($rootScope.pageList.length > 0) {

                    } else toastr.info('No page created');


                })


            }

        }

        function statusChangeCallback(response) {


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

                FB.Event.subscribe('send_to_messenger', function (e) {
                    // callback for events triggered by the plugin
                    console.log(e)


                });

            });


            $rootScope.loginFB = function () {
                FB.login(function (response) {
                    // handle the response
                    console.log('loginFB', response)
                }, {scope: 'public_profile,email,manage_pages,pages_messaging,read_page_mailboxes'});
            }
            $rootScope.logoutFB = function () {
                FB.logout(function (response) {
                    toastr.info('Log out');
                });
            }
        };
        $window.extAsyncInit = function () {
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

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
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
        $rootScope.today = new Date().getTime()


        $rootScope.gotoState = function (state) {
            $rootScope.myState = state
            if ($rootScope.pageID) {
                $rootScope.service.JoboApi('dashBoard', {pageID: $rootScope.pageID}).then(response => {
                    $rootScope.loading = false
                    console.log('response', response)
                    $timeout(function () {
                        $rootScope.pageData = response.data
                        $rootScope.dataBot = $rootScope.pageData.bot
                        $rootScope.viewLink = {
                            bot: `https://m.me/${$rootScope.pageData.id}`,
                            forms: `https://docs.google.com/forms/d/${$rootScope.pageData.editId}/edit`,
                            sheet: `https://docs.google.com/spreadsheets/d/${$rootScope.pageData.sheetId}/edit`
                        }
                        var day = (Date.now() - $rootScope.pageData.createdAt) / 86400000
                        if ($rootScope.pageData.package == 'trialover') $rootScope.gotoState('pricing')

                    })
                }, error => {
                    console.log('error', error)
                    toastr.error(error)
                })
            }

            if ($rootScope.myState == 'viewBot') {
                $rootScope.loadResponse({page: $rootScope.pageID})

            } else if ($rootScope.myState == 'dashBoard') {


            } else if ($rootScope.myState == 'broadCast') {
                $rootScope.loadBroadcast({pageID: $rootScope.pageID})


            } else if ($rootScope.myState == 'template') {


                $rootScope.template = {}
                axios.get('https://jobo-ana.herokuapp.com/getData?spreadsheetId=1yi5h9rCtJGAUpiOe-WOufqZInKgIdJozICuFwIC26VE&range=template').then(result => {
                    $rootScope.template = result.data.data

                })
            }

        }
        $rootScope.buildMessage = function (card) {
            $rootScope.service.JoboApi('buildMessage', {
                pageID: $rootScope.pageID,
                blockName: card[1]
            }).then((result, err) => {
                if (err) toastr.error(err)
                $timeout(function () {
                    $rootScope.messageBroadcast = result.data

                })

            })
        }
        $rootScope.getTargetUser = function (sheetId) {
            $rootScope.service.JoboApi('getTargetUser', {spreadsheetId: sheetId}).then((result, err) => {
                if (err) toastr.error(err)
                $timeout(function () {
                    $rootScope.TargetUser = result.data
                })

            })
        }
        $rootScope.sendBroadCast = function (message) {
            console.log('message', message)
            $rootScope.service.JoboApi('sendBroadCast', {
                sheetId: $rootScope.pageData.sheetId,
                blockName: message,
                pageID: $rootScope.pageID
            }).then((result, err) => {
                if (err) toastr.error(err)
                $timeout(function () {
                    $rootScope.broadcastSend = result.data
                })

            })
        }


        $rootScope.mailSheet = {}
        $rootScope.loadMailSheet = function (sheetId, range) {
            return new Promise((resolve, reject) => {
                $rootScope.loading == true
                axios.get(`https://jobo-ana.herokuapp.com/getData?spreadsheetId=${sheetId}&range=${range}`)
                    .then(result => {
                        $timeout(() => {
                            $rootScope.loading == false
                            $rootScope.mailSheet[range] = result.data.data
                            resolve(result.data)
                        })
                    })
            })

        }
        $rootScope.loadSelectedData = {}
        $rootScope.loadSelected = function (sheetId, range) {
            return new Promise((resolve, reject) => {
                $rootScope.loading == true
                var to_list = range
                if (to_list.match('/')) var urlList = `${to_list.split('/')[0]}&range=${to_list.split('/')[1]}`
                else urlList = `${sheetId}&range=${to_list}`
                axios.get(`https://jobo-ana.herokuapp.com/getData?spreadsheetId=${urlList}`)
                    .then(result => $timeout(() => {
                            $rootScope.loading == false
                            $rootScope.mailSheet[range] = result.data.data
                            var a = 0
                            for (var i in $rootScope.mailSheet[range]) {
                                var per = $rootScope.mailSheet[range][i]
                                if (per.send_now == 'TRUE') a++
                            }

                            $rootScope.loadSelectedData[range] = {send_now: a, total: $rootScope.mailSheet[range].length}

                            resolve(result.data)
                        })
                    )
            })
        }


        $rootScope.addMailSheet = function (sheetId, range, data) {
            return new Promise((resolve, reject) => {
                function per() {
                    $rootScope.mailSheet[range].push(data)
                    axios.post(`https://jobo-ana.herokuapp.com/saveData?sheet=${sheetId}&range=${range}`, $rootScope.mailSheet[range])
                        .then(result => {
                            toastr.success('Save done')
                            resolve(data)
                        })
                        .catch(err => toastr.error('Error!'))
                }

                var f = document.getElementById('file_html').files[0];
                if (f) upload(f.name, f).then(url => {
                    data.html = url
                    per()


                })
                else per()


            })

        }

        $rootScope.sendMailSheet = function (sheetId, mailSentNow) {

            axios.get(`https://mailsheet.glitch.me/send?sheet=${sheetId}&subject=${mailSentNow.subject}`)
                .then(result => toastr.success(result.data))
                .catch(err => toastr.error(err))


        }


        function upload(filename, file) {
            return new Promise((resolve, reject) => {
                var uploadTask = firebase.storage().ref('mailsheet').child('mail/' + filename).put(file);

                uploadTask.on('state_changed', function (snapshot) {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                            console.log('Upload is paused');
                            break;
                        case firebase.storage.TaskState.RUNNING: // or 'running'
                            console.log('Upload is running');
                            break;
                    }
                }, function (error) {
                    // Handle unsuccessful uploads
                }, function () {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                        console.log('File available at', downloadURL);
                        resolve(downloadURL)

                    });
                });
            })

        }


    })


    .controller('navbarCtrl', function ($scope, $rootScope, $timeout, AuthUser, toastr, $state, $stateParams) {
        $rootScope.service.Ana('trackView', {track: $stateParams['#'], state: $state.current.name || 'new'})
        var params = $stateParams['#']
        if (params && params.startsWith("ref")) {
            window.localStorage.setItem('ref', $rootScope.service.getRefer(params))
        }

    })
    .controller('mailSheetCtrl', function (AuthUser, $stateParams, $state, $scope, $rootScope, $timeout, CONFIG, $http, toastr) {

        console.log('$stateParams.page', $stateParams.page)
        $rootScope.sheetId = $stateParams.sheetId

        if ($rootScope.sheetId) {
            window.localStorage.setItem('sheetId', $stateParams.sheetId)
            $rootScope.loadMailSheet($rootScope.sheetId, 'account')
            $rootScope.loadMailSheet($rootScope.sheetId, 'mail')

        }


    })
