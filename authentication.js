/**
 * Created by vilik on 1.10.2016.
 */
var config = require("config");
var jwt = require("jwt-simple");
var mysql = require("mysql");

var users = [
    {
        id: 1,
        username: "vili",
        password: "testpass"
    }
];

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

var auth = {
    login: function (username, password) {
        for (var user in users) {
            if (user.username === username && user.password === password) {
                var expires = expiresIn(14);
                return jwt.encode({
                    user: user.id,
                    exp: expires
                }, config.token_secret);
            }
        }
        return false;
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
        } catch (err){
            return false;
        }
    }
};

module.exports = auth;