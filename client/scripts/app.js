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
                        root.lists[index].reminders = [];
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
                    callback(null, root.list_id);
                }, function (err) {
                    callback(err.data);
                });
            },
            remove: function (id, callback) {
                var root = result.delete({path: id}, function () {
                    callback();
                }, function (err) {
                    callback(err.data);
                });
            }
        };
    }]);

    app.factory("ReminderService", ["$resource", "$rootScope", function ($resource, $rootScope) {
        var search = "http://localhost/api/lists/:list/:reminder";
        var result = $resource(search, null, { put: { method: "put"}});
        return {
            addNew: function (name, listId, priority, callback) {
                var root = result.save({list: listId, reminder: ""}, "name="+name+"&priority="+priority, function () {
                    callback(null, root.reminder_id);
                }, function (err) {
                    callback(err.data);
                });
            },
            remove: function(reminderId, listId, callback) {
                var root = result.delete({list: listId, reminder: reminderId}, function () {
                    callback(null);
                }, function (err) {
                    callback(err.data);
                });
            },
            toggle: function(done, reminderId, listId, callback) {
                var root = result.put({list: listId, reminder: reminderId}, "done="+done, function () {
                    callback(null);
                }, function (err) {
                    callback(err.data);
                });
            }
        };
    }]);

    app.controller("indexCtrl", function ($scope, AuthService, ListService, ReminderService, $rootScope, $http) {
        $scope.remindernames = {};
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
                    $scope.error.visible = false;
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
            });
        };

        $scope.addList = function () {
            if ($scope.newlist !== undefined && $scope.newlist.match(/^.{2,50}$/)) {
                ListService.addNew($scope.newlist, function (err, listId) {
                    if (!err) {
                        $scope.remindernames[listId] = "";
                        $scope.lists.push({
                            id: listId,
                            name: $scope.newlist,
                            reminders: []
                        });
                        $scope.newlist = "";
                        $scope.error.visible = false;
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

        $scope.addReminder = function (listId) {
            if ($scope.remindernames[listId]) {
                ReminderService.addNew($scope.remindernames[listId], listId, 1, function (err, reminderId) {
                    if (!err) {
                        $scope.lists.forEach(function (value, index) {
                            if (value.id === listId) {
                                $scope.lists[index].reminders.push({
                                    id: reminderId,
                                    name: $scope.remindernames[listId],
                                    priority: 1,
                                    done: 0
                                });
                            }
                        });

                        $scope.remindernames[listId] = "";
                        $scope.error.visible = false;
                    } else {
                        $scope.error = {
                            visible: true,
                            code: err.code,
                            message: err.message
                        };
                    }
                });
            }
        };

        $scope.removeList = function (listId) {
            ListService.remove(listId, function(err) {
                if (!err) {
                    $scope.lists.forEach(function(list, index) {
                        if (list.id === listId) {
                            $scope.lists.splice(index, 1);
                        }
                    });
                } else {
                    $scope.error = {
                        visible: true,
                        code: err.code,
                        message: err.message
                    };
                }
            });
        };

        $scope.removeReminder = function(reminderId, listId) {
            ReminderService.remove(reminderId, listId, function (err) {
                if (!err) {
                    $scope.lists.forEach(function(list, index) {
                        if (list.id === listId) {
                            $scope.lists[index].reminders.forEach(function(reminder, reminderIndex, reminders) {
                                if (reminder.id === reminderId) {
                                    reminders.splice(reminderIndex, 1);
                                }
                            });
                        }
                    });
                } else {
                    $scope.error = {
                        visible: true,
                        code: err.code,
                        message: err.message
                    };
                }
            });
        };

        $scope.toggleReminder = function (reminder, listId) {
            ReminderService.toggle(reminder.done, reminder.id, listId, function (err) {
                if (err) {
                    $scope.error = {
                        visible: true,
                        code: err.code,
                        message: err.message
                    };
                }
            });
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
        setTimeout(function() {
            location.href="#/login";
        }, 2000);
    });
}());
