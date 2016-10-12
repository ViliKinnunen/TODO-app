/**
 * Created by vilik on 2.10.2016.
 */
(function () {
    "use strict";
    var config = require("./config");
    var mysql = require("mysql");

    var connection;

    function connect() {
        connection = mysql.createConnection({
            host: config.db_host,
            user: config.db_user,
            password: config.db_password,
            database: config.db_name

        });
    }

    connect();

    setInterval(function () {
        connection.end();
        connect();
    }, 1000*60*60*5);

    module.exports = connection;
}());