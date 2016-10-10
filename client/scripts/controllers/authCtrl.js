(function () {
    "use strict";
    var app = angular.module("todoApp");

    app.controller("loginCtrl", function ($scope, AuthService, $rootScope) {
        $scope.error = {
            visible: false,
            code: 200,
            message: "All good everything"
        };

        $rootScope.token = AuthService.getToken();
        if ($rootScope.token) {
            location.href = "#/";
        }

        $scope.credentials = {
            username: "",
            password: ""
        };

        $scope.login = function () {
            $("#loading").show();
            AuthService.login($scope.credentials.username, $scope.credentials.password, function (err, token) {
                if (err) {
                    $scope.error = {
                        visible: true,
                        code: err.code,
                        message: err.message
                    };
                } else {
                    AuthService.setToken(token);
                    location.href = "#/";
                }
                $("#loading").hide();
            });
        };
    });

    app.controller("registerCtrl", function ($scope, AuthService, $rootScope) {
        $scope.error = {
            visible: false,
            code: 200,
            message: "All good everything"
        };

        $rootScope.token = AuthService.getToken();
        if ($rootScope.token) {
            location.href = "#/";
        }

        $scope.credentials = {
            username: "",
            password: ""
        };

        $scope.register = function () {
            $("#loading").show();
            AuthService.register($scope.credentials.username, $scope.credentials.password, function (err) {
                if (err) {
                    $scope.error = {
                        visible: true,
                        code: err.code,
                        message: err.message
                    };
                } else {
                    AuthService.login($scope.credentials.username, $scope.credentials.password, function (err, token) {
                        if (err) {
                            $scope.error = {
                                visible: true,
                                code: err.code,
                                message: err.message
                            };
                        } else {
                            AuthService.setToken(token);
                            location.href = "#/";
                        }
                    });
                }
                $("#loading").hide();
            });
        };
    });

    app.controller("logoutCtrl", function ($rootScope, AuthService) {
        AuthService.logout();
        $rootScope.token = false;
        setTimeout(function() {
            location.href="#/login";
        }, 2000);
    });
}());