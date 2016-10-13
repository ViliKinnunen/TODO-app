/**
 * Created by vilik on 1.10.2016.
 */
(function () {
    "use strict";
    var config = require("./config"),
        jwt = require("jwt-simple"),
        bcrypt = require("bcrypt-nodejs"),
        dbConnector = require("./db-connector"),
        db;

    function updateConnection () {
        dbConnector.getConnection(function (conn) {
            if (conn != null) {
                db = conn;
            }
        });
    }

    updateConnection();

    function expiresIn(numDays) {
        var dateObj = new Date();
        return dateObj.setDate(dateObj.getDate() + numDays);
    }

    module.exports = {
        register: function (username, password, callback) {
            updateConnection();
            var usernameRegex = /^[A-Za-z0-9_\-]{3,20}$/,
                passwordRegex = /^[^\s]{8,50}$/,
                usernameValid = username.match(usernameRegex),
                passwordValid = password.match(passwordRegex);

            if (usernameValid && passwordValid) {
                bcrypt.hash(password, null, null, function (err, hash) {
                    if (!err) {
                        var user = {username: username, password: hash};
                        db.query("INSERT INTO User SET ?", user, function (err, result) {
                            if (!err) {
                                callback(null, result.insertId);
                            } else {
                                callback({
                                    code: 500,
                                    message: "Username is already in use"
                                });
                            }
                        });
                    } else {
                        callback({
                            code: 500,
                            message: "Couldn't encrypt the password"
                        });
                    }
                });
            } else {
                callback({
                    code: 400,
                    message: "Username and/or password didn't meet requirements"
                });
            }
        },

        login: function (username, password, callback) {
            updateConnection();
            db.query("SELECT * FROM User WHERE username = ?", username, function (err, rows) {
                if (!err) {
                    if (rows.length === 1) {
                        bcrypt.compare(password, rows[0].password, function (err, res) {
                            if (!err) {
                                if (res) {
                                    var expires = expiresIn(14);
                                    var token = jwt.encode({
                                        user: rows[0].id,
                                        exp: expires
                                    }, config.token_secret);
                                    callback(null, token);
                                } else {
                                    callback({
                                        code: 401,
                                        message: "Invalid credentials"
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
                            code: 401,
                            message: "Invalid credentials" // HIDE
                        });
                    }
                } else {
                    callback({
                        code: 500,
                        message: err.message
                    });
                }
            });
        },

        validate: function (token) {
            try {
                var decoded = jwt.decode(token, config.token_secret);

                if (decoded.exp <= Date.now()) {
                    return {
                        user: decoded.user,
                        expired: true
                    };
                } else {
                    return {
                        user: decoded.user,
                        expired: false
                    };
                }
            } catch (err) {
                console.log(err.message);
                return false;
            }
        }
    };
}());
