/**
 * Created by vilik on 1.10.2016.
 */
var config = require("./config");
var jwt = require("jwt-simple");
var mysql = require("mysql");


var connection = mysql.createConnection({
    host     : config.db_host,
    user     : config.db_user,
    password : config.db_password,
    database : config.db_name
});

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

var auth = {
    login: function (username, password, callback) {
        var loginDetails = [username, password],
            token = false;

        connection.query("SELECT * FROM User WHERE username = ? AND password = ?", loginDetails, function(err, rows) {
            if (!err && rows.length > 0) {
                var expires = expiresIn(14);
                token = jwt.encode({
                    user: rows[0].id,
                    exp: expires
                }, config.token_secret);
            }
            callback(token);
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
        } catch (err){
            return false;
        }
    }
};

module.exports = auth;