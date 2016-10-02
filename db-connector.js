/**
 * Created by vilik on 2.10.2016.
 */
var config = require("./config");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_name
});

module.exports = connection;