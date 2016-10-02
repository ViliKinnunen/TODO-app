/**
 * Created by vilik on 1.10.2016.
 */
var config = require("./config");
var jwt = require("jwt-simple");
var bcrypt = require("bcrypt-nodejs");
var mysql = require("mysql");


var connection = mysql.createConnection({
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_name
});

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

var auth = {
    register: function (username, password, callback) {
        var usernameRegex = /^[A-Za-z0-9_\-]{3,20}$/,
            passwordRegex = /^[^\s]{8,50}$/,
            usernameValid = username.match(usernameRegex),
            passwordValid = password.match(passwordRegex);

        if (usernameValid && passwordValid) {
            bcrypt.hash(password, null, null, function (err, hash) {
                if (!err) {
                    var user = {username: username, password: hash};
                    connection.query("INSERT INTO User SET ?", user, function (err, result) {
                        if (!err) {
                            callback(null, result.insertId);
                        } else {
                            callback({
                                code: 500,
                                message: err.message // HIDE
                            });
                        }
                    });
                } else {
                    callback({
                        code: 500,
                        message: err.message // HIDE
                    });
                }
            });
        } else {
            callback({
                code: 400,
                message: "Username and/or password didn't meet requirements"
            })
        }
    },

    login: function (username, password, callback) {
        connection.query("SELECT * FROM User WHERE username = ?", username, function (err, rows) {
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
            return false;
        }
    }
};

module.exports = auth;