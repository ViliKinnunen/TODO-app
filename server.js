/**
 * Created by vilik on 1.10.2016.
 */

(function() {
    "use strict";
    var config = require("./config");
    var express = require("express");
    var app = express();

    var apiRouter = require("./api/router");

    app.use(express.static("client"));

    app.use("/api", apiRouter);

    app.listen(config.port, function() {
        console.log("App is alive at port " + config.port);
    });
}());
