/**
 * Created by vilik on 10.10.2016.
 */
(function () {
    "use strict";
    angular.module("todoApp").factory("AuthService", ["$resource", function ($resource, $rootScope) {
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
}());
