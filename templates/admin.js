"use strict";


app
    .controller('ladibotCtrl', function (AuthUser, $stateParams, $state, $scope, $rootScope, $timeout, CONFIG, $http, toastr) {

        console.log('$stateParams.page', $stateParams.page)
        if ($stateParams.page) {
            $rootScope.pageID = $stateParams.page
            window.localStorage.setItem('pageID', $stateParams.page)
        }
        if ($stateParams.state) {
            $rootScope.gotoState($stateParams.state)
        } else $rootScope.gotoState('dashBoard')


    })

    .controller('createCtrl', function (AuthUser, $stateParams, $state, $scope, $rootScope, $timeout, CONFIG, $http, toastr) {
        $scope.viewLink = {}
        $scope.card = {}


        if ($stateParams.page != 'null') {
            $rootScope.pageID = $stateParams.page
            window.localStorage.setItem('pageID', $stateParams.page)
        }


        $rootScope.state = $stateParams.id
        console.log('$rootScope.state', $rootScope.state)
        $rootScope.pageData = {}


    })
    .controller('rebrandCtrl', function (AuthUser, $stateParams, $state, $scope, $rootScope, $timeout, CONFIG, $http, toastr) {
        if ($stateParams.page != 'null') {
            $scope.pageID = $stateParams.page
            window.localStorage.setItem('pageID', $stateParams.page)
        }

        $rootScope.removeBranding = function (card) {
            $rootScope.loading = true

            $scope.card = card
            $rootScope.service.JoboApi('removeChatfuelBranding', {
                pageID: card.id,
            }).then(function successCallback(response) {
                $rootScope.loading = false
                toastr.success(response.data)
                console.log('response', response)
            }, function (error) {
                console.log('error', error)
                toastr.error(error)
            })
        }


    })



