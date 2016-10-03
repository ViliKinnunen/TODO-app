/**
 * Created by vilik on 2.10.2016.
 */
(function () {
    "use strict";
    var db = require("../db-connector"),
        escape = require("escape-html"),
        utils = require("./utils");

    var actions = {
        add: function (name, user, callback) {
            var regexName = /^.{2,50}$/;

            if (name.match(regexName)) {
                db.query("INSERT INTO List (name, user) VALUES (?, ?)", [escape(name), user], function (err, results) {
                    if (!err) {
                        callback(null, results.insertId);
                    } else {
                        callback({
                            code: 500,
                            message: err.message // HIDE
                        });
                        throw err;
                    }
                });
            } else {
                callback({
                    code: 400,
                    message: "List name has to be 2 - 50 characters long"
                });
            }
        },
        get: function (user, callback) {
            db.query("SELECT * FROM List WHERE ?", {user: user}, function (err, results) {
                if (!err) {
                    callback(null, results);
                } else {
                    callback({
                        code: 500,
                        message: err.message // HIDE
                    });
                    throw err;
                }
            });
        }
    };

    module.exports = {
        post: function (req, res) {
            if (req.body.name && req.user_id) {
                actions.add(req.body.name, req.user_id, function (err, id) {
                    if (!err) {
                        res.json({
                            status: 200,
                            message: "List created successfully",
                            list_id: id
                        });
                    } else {
                        utils.error(res, err.code, err.message);
                    }
                });
            } else {
                utils.error(res, 400, "Missing required parameters");
            }
        },

        get: function (req, res) {
            if (req.user_id) {
                actions.get(req.user_id, function (err, rows) {
                    if (!err) {
                        res.json({
                            status: 200,
                            message: "Success",
                            lists: rows
                        });
                    } else {
                        utils.error(res, err.code, err.message);
                    }
                });
            } else {
                utils.error(res, 400, "Missing required parameters");
            }
        }
    };
}());