(function () {
    "use strict";
    angular.module("todoApp").controller("indexCtrl", function ($scope, AuthService, ListService, ReminderService, $rootScope, $http) {
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

        $scope.sortRemindersBy = "name";
        $scope.sortRemindersReverse = false;

        $scope.sortReminders = function (property) {
            $scope.sortRemindersReverse = ($scope.sortRemindersBy === property) ? !$scope.sortRemindersReverse : false;
            $scope.sortRemindersBy = property;
        };

        $scope.sortListsReverse = false;

        $scope.sortLists = function () {
            $scope.sortListsReverse = !$scope.sortListsReverse;
        };

        $scope.toggleList = function (listId) {
            $("#list-"+listId).slideToggle();
        };

        $scope.toggleModal = function (modalId) {
            $("#"+modalId).modal("show");
        };

        $scope.toggleArrow = function (arrowId) {
            $("#arrow-"+arrowId).toggleClass("arrow-up");
        };

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
                            open: true,
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

        $scope.initializeListRenaming = function (listId) {
            $scope.lists.forEach(function(list) {
                if (list.id === listId) {
                    $scope.listToBeRenamed = {
                        id: list.id,
                        name: list.name
                    };
                }
            });
        };

        $scope.initializeReminderEdit = function (reminderId, listId) {
            $scope.lists.forEach(function(list) {
                if (list.id === listId) {
                    list.reminders.forEach(function (reminder) {
                        if (reminder.id === reminderId) {
                            $scope.reminderToBeModified = {
                                id: reminder.id,
                                name: reminder.name,
                                priority: reminder.priority,
                                list: list.id
                            };
                        }
                    });
                }
            });
        };

        $scope.updateReminder = function () {
            ReminderService.edit($scope.reminderToBeModified.name, $scope.reminderToBeModified.priority, $scope.reminderToBeModified.id, $scope.reminderToBeModified.list, function (err) {
                if (!err) {
                    $scope.lists.forEach(function(list) {
                        if (list.id === $scope.reminderToBeModified.list) {
                            list.reminders.forEach(function (reminder) {
                                if (reminder.id === $scope.reminderToBeModified.id) {
                                    reminder.name = $scope.reminderToBeModified.name;
                                    reminder.priority = $scope.reminderToBeModified.priority
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

        $scope.updateListName = function () {
            ListService.edit($scope.listToBeRenamed.id, $scope.listToBeRenamed.name, function (err) {
                if (!err) {
                    $scope.lists.forEach(function(list) {
                        if (list.id === $scope.listToBeRenamed.id) {
                            list.name = $scope.listToBeRenamed.name;
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

        $scope.updateLists();
    });
}());