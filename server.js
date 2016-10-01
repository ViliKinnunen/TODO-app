/**
 * Created by vilik on 1.10.2016.
 */

(function() {
    "use strict";
    var config = require("./config");
    var express = require("express");
    var bodyParser = require('body-parser');
    var auth = require("./authentication");

    var app = express();
    app.use(bodyParser.urlencoded({extended: false, type: "*/*"}));

    var apiRouter = require("./api/router");

    app.use(express.static("client"));

    app.use("/api", apiRouter);

    app.post("/login", function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';

        auth.login(username, password, function(token) {
            if (token) {
                res.json({
                    token: token
                });
            } else {
                res.status(401);
                res.json({
                    status: 401,
                    message: "Invalid credentials"
                });
            }
        });
    });

    app.listen(config.port, function() {
        console.log("App is alive at port " + config.port);
    });
}());
