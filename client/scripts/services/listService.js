/**
 * Created by vilik on 10.10.2016.
 */
(function () {
    "use strict";
    angular.module("todoApp").factory("ListService", ["$resource", "$rootScope", function ($resource, $rootScope) {
        var search = "http://localhost/api/lists/:path";
        var result = $resource(search, null, { put: { method: "put"}});
        return {
            getAll: function (callback) {
                var root = result.get({path: ""}, function () {
                    root.lists.forEach(function(value, index) {
                        root.lists[index].reminders = [];
                        root.lists[index].open = false;
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
            },
            edit: function (id, name, callback) {
                var root = result.put({path: id}, "name="+name, function () {
                    callback();
                }, function (err) {
                    callback(err.data);
                });
            }
        };
    }]);
}());