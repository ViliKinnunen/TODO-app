/**
 * Created by vilik on 2.10.2016.
 */
(function () {
    "use strict";
    var db = require("../db-connector"),
        escape = require("escape-html"),
        utils = require("./utils"),
        list;

    list = {
        hasAccess: function (listId, user, callback) {
            db.query("SELECT * FROM List WHERE id = ? AND user = ?", [listId, user], function (err, results) {
                if (!err && results.length === 1) {
                    callback(true);
                } else {
                    callback(false);
                }
            });
        },

        getName: function (listId, user, callback) {
            list.hasAccess(listId, user, function (access) {
                if (access) {
                    db.query("SELECT * FROM List WHERE id = ?", listId, function (err, results) {
                        if (!err && results.length === 1) {
                            callback(null, results[0].name);
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
        },

        getReminders: function (listId, user, callback) {
            list.hasAccess(listId, user, function (access) {
                if (access) {
                    db.query("SELECT id, name, priority, done FROM Reminder WHERE list = ?", listId, function (err, results) {
                        if (!err) {
                            callback(null, results);
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

        addReminder: function (name, priority, listId, user, callback) {
            var nameRegex = /^.{1,140}$/;
            if (name.match(nameRegex)) {
                list.hasAccess(listId, user, function (access) {
                    if (access) {
                        db.query("INSERT INTO Reminder (name, priority, list) VALUES (?, ?, ?)", [escape(name), priority, listId], function (err, results) {
                            if (!err) {
                                callback(null, results.insertId);
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
            } else {
                callback({
                    code: 400,
                    message: "Reminder has to be 1 - 140 characters long"
                });
            }
        },

        delete: function (listId, user, callback) {
            list.hasAccess(listId, user, function (access) {
                if (access) {
                    db.query("DELETE FROM List WHERE id = ?", listId, function (err, results) {
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
        },

        rename: function (newName, listId, user, callback) {
            var regexName = /^.{2,50}$/;
            if (newName.match(regexName)) {
                list.hasAccess(listId, user, function (access) {
                    if (access) {
                        db.query("UPDATE List SET name = ? WHERE id = ?", [escape(newName), listId], function (err, results) {
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
            } else {
                callback({
                    code: 400,
                    message: "Invalid list name"
                });
            }
        }
    };

    module.exports = {
        get: function (req, res) {
            if (req.params.id && req.user_id) {
                var listId = utils.validateId(req.params.id);

                if (listId) {
                    list.getName(listId, req.user_id, function (err, name) {
                        if (!err) {
                            list.getReminders(listId, req.user_id, function (err, reminders) {
                                if (!err) {
                                    res.json({
                                        status: 200,
                                        message: "Success",
                                        name: name,
                                        reminders: reminders
                                    });
                                } else {
                                    utils.error(res, err.code, err.message);
                                }
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

        post: function (req, res) {
            if (req.params.id && req.user_id && req.body.name && req.body.priority) {
                var validId = utils.validateId(req.params.id);
                var validPriority = utils.validatePriority(req.body.priority);
                if (validId && validPriority) {
                    list.addReminder(req.body.name, validPriority, validId, req.user_id, function (err, reminderId) {
                        if (!err) {
                            res.json({
                                status: 200,
                                message: "Reminder added successfully",
                                reminder_id: reminderId
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

        delete: function (req, res) {
            if (req.params.id && req.user_id) {
                var validId = utils.validateId(req.params.id);

                if (validId) {
                    list.delete(validId, req.user_id, function (err) {
                        if (!err) {
                            res.json({
                                status: 200,
                                message: "List deleted succesfully"
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
            if (req.params.id && req.user_id && req.body.name) {
                var validId = utils.validateId(req.params.id);

                if (validId) {
                    list.rename(req.body.name, validId, req.user_id, function (err) {
                        if (!err) {
                            res.json({
                                status: 200,
                                message: "List renamed successfully"
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
