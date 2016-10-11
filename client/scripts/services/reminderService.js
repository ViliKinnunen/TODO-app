/**
 * Created by vilik on 10.10.2016.
 */
(function () {
    "use strict";
    angular.module("todoApp").factory("ReminderService", ["$resource", "$rootScope", function ($resource, $rootScope) {
        var search = "http://46.101.135.218/api/lists/:list/:reminder";
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
            },
            edit: function (name, priority, reminderId, listId, callback) {
                var root = result.put({list: listId, reminder: reminderId}, "name="+name+"&priority="+priority, function () {
                    callback(null);
                }, function (err) {
                    callback(err.data);
                });
            }
        };
    }]);
}());