"use strict";
app.controller('ModalController', function ($scope, $rootScope, email, toastr, close) {

    $scope.close = function (result) {
        close(result, 500); // close, but give 500ms for bootstrap to animate
    };

})
    .controller('ModalCtrlViewInbox', function ($scope, $rootScope, email, toastr, close,$timeout) {
        var newfilter = {email}
        $rootScope.service.JoboApi('api/notification', newfilter).then(function (response) {
            $scope.dataEmail = []
            if (!response.data.data) return

            angular.forEach(response.data.data, function (data) {
                var newData = {notiId: data.notiId, userData: data.userData, mail: data.mail, channel: data.channel}
                var obj = Object.assign({}, data)
                delete obj._id;
                delete obj.notiId;
                delete obj.userData;
                delete obj.mail;
                delete obj.channel;
                newData.sent = obj;
                $timeout(function () {
                    $scope.dataEmail.push(newData)

                })
            })

        }).catch(function (err) {
            toastr.error(err)
        });

        $scope.close = function (result) {
            close(result, 500); // close, but give 500ms for bootstrap to animate
        };

    })
    .controller('ModalCtrlViewSendNotification', function ($scope, $rootScope) {

        $scope.close = function (result) {
            close(result, 500); // close, but give 500ms for bootstrap to animate
        };

    })

    .controller('ModalPermitCtrl', function ($scope, close) {

        $scope.close = function (result) {
            close(result, 500); // close, but give 500ms for bootstrap to animate
        };

    })
    .controller('ModalMatchCtrl', function ($scope, close, userId, storeId) {

        $rootScope.service.JoboApi('on/store', {storeId: storeId}).then(function (data) {
            $scope.store = data.data;
        });
        $rootScope.service.JoboApi('on/profile', {userId: userId}).then(function (data) {
            $scope.user = data.data;
        });



        $scope.close = function (result) {
            close(result, 500); // close, but give 500ms for bootstrap to animate
        };

    })

    .controller('ModalAddressCtrl', function ($scope, close, $http, CONFIG, $rootScope) {

        $scope.autocompleteAddress = {text: ''};
        $scope.ketquasAddress = [];
        $scope.searchAddress = function () {
            $scope.URL = 'https://maps.google.com/maps/api/geocode/json?address=' + $scope.autocompleteAddress.text + '&components=country:VN&sensor=true&key=' + CONFIG.APIKey;
            $http({
                method: 'GET',
                url: $scope.URL
            }).then(function successCallback(response) {
                $scope.ketquasAddress = response.data.results;
                console.log($scope.ketquasAddress);

                $('#list-add').show();

            })
        };

        $scope.setSelectedAddress = function (selected) {
            $scope.autocompleteAddress.text = selected.formatted_address;
            $scope.address = selected;
            $rootScope.userData.address = selected.formatted_address;
            $rootScope.userData.location = selected.geometry.location;

            console.log(selected);
            $('#list-add').hide();

        };

        $scope.eraseAddress = function () {
            $scope.autocompleteAddress.text = null;
            $('#list-add').hide();
        }

        $scope.close = function () {
            close($rootScope.userData, 500); // close, but give 500ms for bootstrap to animate
        };

    })
    .controller('ModalCtrlStore', function (data, $scope, close, $http, CONFIG, $rootScope,$timeout) {
        if(data.storeId){
            $rootScope.service.JoboApi('on/store',{storeId:data.storeId}).then(result =>{
               $timeout(function () {
                   $scope.storeData = result
                   $scope.userInfo = result.userData || {}
                   $scope.jobData = result.jobData || []
               })

            } )
        }
        $scope.close = function (result) {
            close(result, 500); // close, but give 500ms for bootstrap to animate
        };

    })