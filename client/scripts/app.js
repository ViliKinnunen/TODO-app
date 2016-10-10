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
}());
