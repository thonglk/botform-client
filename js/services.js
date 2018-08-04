angular.module('starter.services', [])
    .service('myService', function (CacheFactory) {
        var profileCache;
        // Check to make sure the cache doesn't already exist
        if (!CacheFactory.get('profileCache')) {
            profileCache = CacheFactory('profileCache');
        }
    })

    .service('AuthUser', function ($rootScope, $q, toastr, ModalService, $http, CONFIG, $timeout, $state) {


        this.PostFacebook = function (content, channel) {
            if (content.image) content.type = 'image'
            if (content.time) content.time = new Date(content.time).getTime()
            if (channel) {
                content.channel = channel
            }
            void 0

            $rootScope.service.JoboApi('PostFacebook', content, 'post').then(function (res) {
                void 0
                toastr.info(res.data)
            })
        };
        this.PostComment = function (comment) {
            void 0
            $rootScope.service.JoboApi('PostComment', comment, 'post').then(function (res) {
                void 0
                toastr.info(res.data)
            })
        };
        this.deg2rad = function (deg) {
            return deg * (Math.PI / 180)
        };
        this.getDistanceFromLatLonInKm = function (lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = $rootScope.service.deg2rad(lat2 - lat1);  // deg2rad below
            var dLon = $rootScope.service.deg2rad(lon2 - lon1);
            var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos($rootScope.service.deg2rad(lat1)) * Math.cos($rootScope.service.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var x = R * c; // Distance in km
            var n = parseFloat(x);
            x = Math.round(n * 10) / 10;
            return x;
        };
        this.timeAgo = function (timestamp) {
            var time;
            timestamp = new Date(timestamp).getTime()
            var now = new Date().getTime()
            var a = now - timestamp
            if (a > 0) {
                var minute = Math.round(a / 60000);
                if (minute < 60) {
                    time = minute + " phút trước"
                } else {
                    var hour = Math.round(minute / 60);
                    if (hour < 24) {
                        time = hour + " giờ trước"
                    } else {
                        var day = Math.round(hour / 24);
                        if (day < 30) {
                            time = day + " ngày trước"
                        } else {
                            var month = Math.round(day / 30);
                            if (month < 12) {
                                time = month + " tháng trước"
                            } else {
                                var year = Math.round(month / 12);
                                time = year + " năm trước"
                            }
                        }
                    }
                }

                return time;
            }
            if (a < 0) {
                a = Math.abs(a);

                var minute = Math.round(a / 60000);
                if (minute < 60) {
                    time = "còn " + minute + " phút"
                } else {
                    var hour = Math.round(minute / 60);
                    if (hour < 24) {
                        time = "còn " + hour + " giờ"
                    } else {
                        var day = Math.round(hour / 24);
                        if (day < 30) {
                            time = "còn " + day + " ngày"
                        } else {
                            var month = Math.round(day / 30);
                            if (month < 12) {
                                time = "còn " + month + " tháng"
                            } else {
                                var year = Math.round(month / 12);
                                time = "còn " + year + " năm "
                            }
                        }
                    }
                }

                return time;

            }

        }


        this.Ana = function (action, data) {
            if (!data) {
                data = {}
            }
            var anany = $rootScope.userId
            if (!$rootScope.userId) {
                anany = window.localStorage.getItem('anany')
                if (!anany) {
                    anany = Math.round(100000000000000 * Math.random())
                    window.localStorage.setItem('anany', anany)
                }
            }

            data.agent = $rootScope.checkAgent.platform + ':' + $rootScope.checkAgent.device;

            var analyticKey = Math.round(100000000000000 * Math.random());

            var obj = {
                userId: anany,
                action: action,
                createdAt: new Date().getTime(),
                data: data,
                id: analyticKey
            };

            $rootScope.service.JoboApi('update/log?userId=' + anany, {log: obj}, 'post')
                .then(result => void 0)
                .catch(err => void 0)



        }
        this.shortAddress = function (fullAddress) {
            if (fullAddress) {
                var mixAddress = fullAddress.split(",")
                if (mixAddress.length < 3) {
                    return fullAddress
                } else {
                    var address = mixAddress[0] + ', ' + mixAddress[1] + ', ' + mixAddress[2]
                    return address
                }

            }
        };


        this.JoboApi = function (url, params, type) {

            return new Promise(function (resolve, reject) {
                if (type == 'post') {
                    axios.post(CONFIG.APIURL + '/' + url, params)
                        .then((response,err) => {
                            $timeout(()=>{
                                if(err) reject(err)
                                resolve(response)
                            })
                    })

                } else {
                    axios.get(CONFIG.APIURL + '/' + url, {
                        headers: {'Content-Type': 'application/json'},
                        params: params
                    }).then(function (response,err) {
                        $timeout(()=>{
                            $rootScope.loading = false
                            if(err) reject(err)
                            resolve(response)
                        })

                    })
                }

            })
        }

        function getToken() {
            messaging.getToken()
                .then(function (currentToken) {
                    if (currentToken) {
                        if ($rootScope.userId) {
                            $rootScope.service.JoboApi('update/user', {
                                userId: $rootScope.userId,
                                user: JSON.stringify({webToken: currentToken})
                            });
                            // db.ref('user/' + $rootScope.userId).update({webToken: currentToken})
                            $rootScope.service.Ana('getToken', {token: currentToken});
                            void 0
                        }

                    } else {

                        void 0;
                        requestPermission();
                    }
                })
                .catch(function (err) {
                    void 0;
                })
        }

        function requestPermission() {
            messaging.requestPermission()
                .then(function () {

                    // TODO(developer): Retrieve an Instance ID token for use with FCM.
                    // ...
                    getToken();
                    // Get Instance ID token. Initially this makes a network call, once retrieved
                    // subsequent calls to getToken will return from cache.


                })
                .catch(function (err) {
                    $rootScope.service.Ana('requestPermission', {err: err})

                    void 0;
                });


        }


        this.getRefer = function (str) {
            var res
            if (str) {
                var n = str.search("&");
                var m = str.search("ref");
                var k = m + 4
                if (n == -1) {
                    res = str.substr(k, str.length - k);
                } else {
                    res = str.substr(k, n - k);
                }
                return res;
            }
        };


    })
    .service('ngCopy', ['$window', function ($window) {
        var body = angular.element($window.document.body);
        var textarea = angular.element('<textarea/>');
        textarea.css({
            position: 'fixed',
            opacity: '0'
        });

        return function (toCopy) {
            textarea.val(toCopy);
            body.append(textarea);
            textarea[0].select();

            try {
                var successful = document.execCommand('copy');
                if (!successful) throw successful;
            } catch (err) {
                window.prompt("Copy to clipboard: Ctrl+C, Enter", toCopy);
            }

            textarea.remove();
        }
    }])


app.filter('myLimitTo', [function () {
    return function (obj, limit) {
        var keys = Object.keys(obj);
        if (keys.length < 1) {
            return [];
        }

        var ret = new Object,
            count = 0;
        angular.forEach(keys, function (key, arrayIndex) {
            if (count >= limit) {
                return false;
            }
            ret[key] = obj[key];
            count++;
        });
        return ret;
    };
}]);

app.factory('debounce', function ($timeout) {
    return function (callback, interval) {
        var timeout = null;
        return function () {
            $timeout.cancel(timeout);
            var args = arguments;
            timeout = $timeout(function () {
                callback.apply(this, args);
            }, interval);
        };
    };
});


