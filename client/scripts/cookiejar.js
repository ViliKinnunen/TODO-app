/**
 * @file Contains methods for writing and reading cookies. (methods originally from W3Schools.com examples, only slightly modified by me)
 * @author Vili Kinnunen
 */

/**
 * Sets a new cookie.
 * @param {string} cname     Cookie name
 * @param {string} cvalue    Cookie value
 * @param {number} exdays    Cookie expiration (in days)
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ";";
}

/**
 * Returns content of a cookie.
 * @param {string} cname        Cookie name
 * @returns {*}                 Cookie content (if no cookie found, returns empty string)
 */
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return false;
}

function delete_cookie (cname) {
    document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
