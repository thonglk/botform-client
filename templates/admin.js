"use strict";


app
    .controller('ladibotCtrl', function (AuthUser, $stateParams, $state, $scope, $rootScope, $timeout, CONFIG, $http, toastr) {
        $rootScope.myState = 'viewBot'

        console.log('$stateParams.page', $stateParams.page)
        if ($stateParams.page) {
            $rootScope.pageID = $stateParams.page
            window.localStorage.setItem('pageID', $stateParams.page)
        }
        $scope.query = {page: $rootScope.pageID}
        $rootScope.loadResponse($scope.query)
        $scope.setIDpage = function (card) {
            $rootScope.pageID = card.id
            $scope.query = {page: $rootScope.pageID}
            $rootScope.loadResponse($scope.query)

        }

    })

    .controller('createCtrl', function (AuthUser, $stateParams, $state, $scope, $rootScope, $timeout, CONFIG, $http, toastr) {
        $scope.viewLink = {}
        $scope.card = {}
        if ($stateParams.page != 'null') {
            $scope.pageID = $stateParams.page
            window.localStorage.setItem('pageID', $stateParams.page)
        }

        $rootScope.setPage = function (card) {
            $scope.card = card
            $scope.buildBot(card)
        }


        $scope.state = $stateParams.id
        console.log('$scope.state', $scope.state)
        $scope.chatBot = {}

        $scope.buildBot = function (card, url) {
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

            $scope.loading = true
            $rootScope.service.JoboApi('getchat', params).then(function successCallback(response) {
                $scope.loading = false
                console.log('response', response)
                $timeout(function () {
                    $scope.chatBot = response.data
                    $scope.viewLink = {
                        bot: `https://m.me/${card.id}`,
                        forms: `https://docs.google.com/forms/d/${$scope.chatBot.editId}/edit`,
                        sheet: `https://docs.google.com/spreadsheets/d/${$scope.chatBot.sheetId}/edit`
                    }
                })
                window.localStorage.setItem('pageID', card.id)
                $rootScope.pageID = card.id
            }, function (error) {
                console.log('error', error)
                toastr.error(error)
            })
        }


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


