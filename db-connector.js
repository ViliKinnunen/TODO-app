/**
 * Created by vilik on 2.10.2016.
 */
(function () {
    "use strict";
    var config = require("./config");
    var mysql = require("mysql");

    module.exports = mysql.createConnection({
        host: config.db_host,
        user: config.db_user,
        password: config.db_password,
        database: config.db_name
    });
}());