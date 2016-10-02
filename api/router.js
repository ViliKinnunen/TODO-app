/**
 * Created by vilik on 1.10.2016.
 */

var express = require("express");
var auth = require("../authentication");

var lists = require("./lists");
var list = require("./list");
var reminder = require("./reminder");

var router = express.Router();

router.use(function(req, res, next) {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];

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

/* -------------------------------------------------
   LISTS
   - get: view all lists by the user
   - post: add new list
---------------------------------------------------- */

router.get("/lists", lists.get);
router.post("/lists", lists.post);

/* -------------------------------------------------
 LISTS/:id
 - get: view list name and reminders
 - post: add new reminder to the list
 - delete: delete list
 - put: rename list
 ---------------------------------------------------- */

router.get("/lists/:id([0-9]+)", list.get);
router.post("/lists/:id([0-9]+)", list.post);
router.delete("/lists/:id([0-9]+)", list.delete);
router.put("/lists/:id([0-9]+)", list.put);

/* -------------------------------------------------
 LISTS/:id/:reminder

 - delete: delete reminder
 - put: modify reminder
 ---------------------------------------------------- */

router.get("/lists/:id([0-9]+)/:reminder([0-9]+)", reminder.get);
router.delete("/lists/:id([0-9]+)/:reminder([0-9]+)", reminder.delete);
router.put("/lists/:id([0-9]+)/:reminder([0-9]+)", reminder.put);

module.exports = router;







