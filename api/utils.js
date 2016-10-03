/**
 * Created by vilik on 2.10.2016.
 */
(function () {
    "use strict";
    function toInt(number) {
        var int = Number(number);
        return !isNaN(int) ? int : false;
    }

    module.exports = {
        validateId: function (number) {
            var int = toInt(number);
            return (int && int > 0) ? int : false;
        },

        validatePriority: function (priority) {
            var int = toInt(priority);
            return (int && int > 0 && int <= 10) ? int : false;
        },

        validateDone: function (done) {
            var int = toInt(done);
            return (int && (int === 0 || int === 1)) ? int : false;
        },

        error: function (res, status, message) {
            res.status(status);
            res.json({
                status: status,
                message: message
            });
        }
    };
}());