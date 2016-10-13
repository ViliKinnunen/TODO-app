/**
 * Created by vilik on 2.10.2016.
 */
(function () {
    "use strict";
    var config = require("./config");
    var mysql = require("mysql");




    var pool = mysql.createPool({
        host: config.db_host,
        user: config.db_user,
        password: config.db_password,
        database: config.db_name
    });

    var getConnection = function (callback) {
        pool.getConnection(function (err, connection) {
            if (!err) {
                callback(connection);
            } else {
                console.log("ERROR WITH POOLS!");
                callback(null);
            }
        })
    };

    module.exports.getConnection = getConnection;
}());