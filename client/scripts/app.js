(function () {
    "use strict";
    var app = angular.module("todoApp", ["ngRoute", "ngResource"]);

    app.config(function ($routeProvider) {
        $routeProvider.when("/", {
            templateUrl: "views/index.html",
            controller: "indexCtrl"
        });

        $routeProvider.when("/login", {
            templateUrl: "views/login.html",
            controller: "loginCtrl"
        });

        $routeProvider.when("/register", {
            templateUrl: "views/register.html",
            controller: "registerCtrl"
        });

        $routeProvider.when("/logout", {
            templateUrl: "views/logout.html",
            controller: "logoutCtrl"
        });

        $routeProvider.otherwise({
            redirectTo: "/"
        });
    });

    app.factory("AuthService", ["$resource", function ($resource, $rootScope) {
        var search = "http://localhost/:path";
        var result = $resource(search);
        return {
            getToken: function () {
                return getCookie("access-token");
            },
            setToken: function (token) {
                setCookie("access-token", token, 14);
            },
            logout: function () {
                delete_cookie("access-token");
            },
            login: function (username, password, callback) {
                var root = result.save({path: "login"}, "username=" + username + "&password=" + password, function () {
                    if (root.status === 200) {
                        callback(null, root.token);
                    }
                }, function (err) {
                    callback({
                        code: err.data.status,
                        message: err.data.message
                    });
                });
            },
            register: function (username, password, callback) {
                var root = result.save({path: "register"}, "username=" + username + "&password=" + password, function () {
                    if (root.status === 200) {
                        callback(null);
                    }
                }, function (err) {
                    callback({
                        code: err.data.status,
                        message: err.data.message
                    });
                });
            }
        };
    }]);

    app.factory("ListService", ["$resource", "$rootScope", function ($resource, $rootScope) {
        var search = "http://localhost/api/lists/:path";
        var result = $resource(search);
        return {
            getAll: function (callback) {
                var root = result.get({path: ""}, function () {
                    root.lists.forEach(function(value, index) {
                        var reminders = result.get({path: value.id}, function () {
                            root.lists[index].reminders = reminders.reminders;
                        });
                    });

                    callback(null, root.lists);
                }, function (err) {
                    callback(err.data);
                });
            },
            addNew: function (name, callback) {
                var root = result.save({path: ""}, "name="+name, function () {
                    callback(null);
                }, function (err) {
                    callback(err.data);
                });
            }
        };
    }]);

    app.controller("indexCtrl", function ($scope, AuthService, ListService, $rootScope, $http) {
        $scope.error = {
            visible: false,
            code: 200,
            message: "All good everything"
        };

        $scope.newlist = "";

        $rootScope.token = AuthService.getToken();
        if (!$rootScope.token) {
            location.href = "#/login";
        }

        $http.defaults.headers.common['x-access-token']= $rootScope.token;

        $scope.updateLists = function() {
            ListService.getAll(function (err, lists) {
                if (!err) {
                    $scope.lists = lists;
                } else {
                    if (err.message === "Token expired") {
                        location.href = "#/login";
                    } else {
                        $scope.error = {
                            visible: true,
                            code: err.code,
                            message: err.message
                        };
                    }
                }
            })
        };

        $scope.addList = function () {
            if ($scope.newlist.match(/^.{2,50}$/)) {
                ListService.addNew($scope.newlist, function (err) {
                    if (!err) {
                        $scope.updateLists();
                        $scope.newlist = "";
                    } else {
                        $scope.error = {
                            visible: true,
                            code: err.code,
                            message: err.message
                        };
                    }
                });
            } else {
                $scope.error = {
                    visible: true,
                    code: null,
                    message: "List name has to be 2 - 50 characters long"
                };
            }
        };

        $scope.updateLists();
    });

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
    });
}());
