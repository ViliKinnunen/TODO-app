/**
 * Created by vilik on 1.10.2016.
 */

var express = require("express");
var auth = require("../authentication");

var router = express.Router();


router.use(function(req, res, next) {
    var token = req.query.token;
    if (token) {
        var session = auth.validate(token);
        if (session) {
            if (!session.expired) {
                req.user_id = session.user;
                next();
            } else {
                res.status(400);
                res.json({
                    status: 400,
                    message: "Token expired"
                });
            }
        } else {
            res.status(401);
            res.json({
                status: 401,
                message: "Invalid token"
            });
        }
    } else {
        res.status(401);
        res.json({
            status: 401,
            message: "Missing token"
        });
    }
});

router.get("/lists", function(req, res) {
    res.json(["shoppinglist", "santaslist", "blacklist"]);
});

module.exports = router;







