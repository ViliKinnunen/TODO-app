/**
 * Created by vilik on 2.10.2016.
 */
(function () {
    "use strict";
    var config = require("./config");
    var mysql = require("mysql");

    var connection;

    function handleDisconnect () {
        connection = mysql.createConnection({
            host: config.db_host,
            user: config.db_user,
            password: config.db_password,
            database: config.db_name
        });

        connection.connect(function (err) {
            if (err) {
                console.log("Error connecting to db:", err);
                setTimeout(handleDisconnect, 1000);
            }
        });

        connection.on("error", function (err) {
            console.log("DB error:", err);

            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                handleDisconnect();
            } else {
                throw err;
            }
        });
    }

    handleDisconnect();

    module.exports = connection;
}());