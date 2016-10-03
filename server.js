/**
 * Created by vilik on 1.10.2016.
 */
(function () {
    "use strict";
    var config = require("./config"),
        express = require("express"),
        bodyParser = require("body-parser"),
        auth = require("./authentication"),
        app = express(),
        apiRouter = require("./api/router"),
        utils = require("./api/utils");

    // Allow cross-origin requests
    app.all("/*", function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "%");
        next();
    });

    // Add bodyparser middleware to all requests
    app.use(bodyParser.urlencoded({extended: false, type: "*/*"}));

    // For client
    app.use(express.static("client"));

    // Handler for all API routes
    app.use("/api", apiRouter);

    // LOGIN Method
    app.post("/login", function (req, res) {
        var username = req.body.username || "";
        var password = req.body.password || "";

        auth.login(username, password, function (err, token) {
            if (!err) {
                res.json({
                    status: 200,
                    message: "Success",
                    token: token
                });
            } else {
                utils.error(res, err.code, err.message);
            }
        });
    });

    // REGISTER Method
    app.post("/register", function (req, res) {
        var username = req.body.username || "";
        var password = req.body.password || "";

        auth.register(username, password, function (err, id) {
            if (!err) {
                res.json({
                    status: 200,
                    message: "Account created",
                    id: id
                });
            } else {
                utils.error(res, err.code, err.message);
            }
        });
    });

    app.listen(config.port, function () {
        console.log("App is alive at port " + config.port);
    });
}());
