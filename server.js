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

    app.all('/*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "%");
        next();
    });

    app.use(express.static("client"));

    app.use("/api", apiRouter);

    app.post("/login", function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';

        auth.login(username, password, function(err, token) {
            if (!err) {
                res.json({
                    status: 200,
                    message: "Success",
                    token: token
                });
            } else {
                res.status(err.code);
                res.json({
                    status: err.code,
                    message: err.message
                });
            }
        });
    });

    app.post("/register", function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';

        auth.register(username, password, function(err, id) {
            if (!err) {
                res.json({
                    status: 200,
                    message: "Account created",
                    id: id
                });
            } else {
                res.status(err.code);
                res.json({
                    status: err.code,
                    message: err.message
                });
            }
        })
    });

    app.listen(config.port, function() {
        console.log("App is alive at port " + config.port);
    });
}());
