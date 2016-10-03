/**
 * Created by vilik on 2.10.2016.
 */
(function () {
    "use strict";
    var db = require("../db-connector"),
        escape = require("escape-html"),
        utils = require("./utils");

    var reminder = {
        hasAccess: function (reminderId, user, callback) {
            db.query("SELECT * FROM Reminder INNER JOIN List ON List.id = Reminder.list WHERE Reminder.id = ? AND List.user = ?", [reminderId, user], function (err, results) {
                if (!err && results.length === 1) {
                    callback(true);
                } else {
                    callback(false);
                }
            });
        },

        view: function (reminderId, user, callback) {
            reminder.hasAccess(reminderId, user, function (access) {
                if (access) {
                    db.query("SELECT * FROM Reminder WHERE id = ?", reminderId, function (err, results) {
                        if (!err) {
                            if (results.length > 0) {
                                callback(false, results[0]);
                            } else {
                                callback({
                                    code: 500,
                                    message: "Oops, something went wrong"
                                });
                            }
                        } else {
                            callback({
                                code: 500,
                                message: err.message
                            });
                        }
                    });
                } else {
                    callback({
                        code: 403,
                        message: "No access to the list"
                    });
                }
            });
        },

        update: function (name, priority, done, reminderId, user, callback) {
            var modifiedReminder = {};
            var nameRegex = /^.{1,140}$/;
            var invalidParameters = false;

            if (name) {
                if (name.match(nameRegex)) {
                    modifiedReminder.name = escape(name);
                } else {
                    invalidParameters = true;
                }
            }

            if (priority) {
                if (utils.validatePriority(priority)) {
                    modifiedReminder.priority = utils.validatePriority(priority);
                } else {
                    invalidParameters = true;
                }
            }

            if (done) {
                if (utils.validateDone(done)) {
                    modifiedReminder.done = utils.validateDone(done);
                } else {
                    invalidParameters = true;
                }
            }

            if (invalidParameters) {
                callback({
                    code: 400,
                    message: "Invalid parameters"
                });
            } else {
                reminder.hasAccess(reminderId, user, function (access) {
                    if (access) {
                        db.query("UPDATE Reminder SET ? WHERE id = ?", [modifiedReminder, reminderId], function (err, results) {
                            if (!err) {
                                if (results.affectedRows > 0) {
                                    callback(false);
                                } else {
                                    callback({
                                        code: 500,
                                        message: "Oops, something went wrong"
                                    });
                                }
                            } else {
                                callback({
                                    code: 500,
                                    message: err.message
                                });
                            }
                        });
                    } else {
                        callback({
                            code: 403,
                            message: "No access to the list"
                        });
                    }
                });
            }
        },

        delete: function (reminderId, user, callback) {
            reminder.hasAccess(reminderId, user, function (access) {
                if (access) {
                    db.query("DELETE FROM Reminder WHERE id = ?", reminderId, function (err, results) {
                        if (!err) {
                            if (results.affectedRows === 1) {
                                callback(false);
                            } else {
                                callback({
                                    code: 500,
                                    message: "Oops, something went wrong"
                                });
                            }
                        } else {
                            callback({
                                code: 500,
                                message: err.message // HIDE
                            });
                        }
                    });
                } else {
                    callback({
                        code: 403,
                        message: "No access to the list"
                    });
                }
            });
        }
    };

    module.exports = {
        get: function (req, res) {
            if (req.params.reminder && req.user_id) {
                var validId = utils.validateId(req.params.reminder);
                if (validId) {
                    reminder.view(validId, req.user_id, function (err, result) {
                        if (!err) {
                            res.json({
                                status: 200,
                                message: "Success",
                                reminder: result
                            });
                        } else {
                            utils.error(res, err.code, err.message);
                        }
                    });
                } else {
                    utils.error(res, 400, "Invalid parameters");
                }
            } else {
                utils.error(res, 400, "Missing required parameters");
            }
        },

        put: function (req, res) {
            if (req.params.id && req.params.reminder && req.user_id && (req.body.name || req.body.priority || req.body.done)) {
                reminder.update(req.body.name, req.body.priority, req.body.done, req.params.reminder, req.user_id, function (err) {
                    if (!err) {
                        res.json({
                            status: 200,
                            message: "Reminder edited successfully"
                        });
                    } else {
                        utils.error(res, err.code, err.message);
                    }
                });
            } else {
                utils.error(res, 400, "Missing required parameters");
            }
        },

        delete: function (req, res) {
            if (req.params.reminder && req.user_id) {
                var validId = utils.validateId(req.params.reminder);
                if (validId) {
                    reminder.delete(validId, req.user_id, function (err) {
                        if (!err) {
                            res.json({
                                status: 200,
                                message: "Reminder deleted successfully"
                            });
                        } else {
                            utils.error(res, err.code, err.message);
                        }
                    });
                } else {
                    utils.error(res, 400, "Invalid parameters");
                }
            } else {
                utils.error(res, 400, "Missing required parameters");
            }
        }
    };
}());