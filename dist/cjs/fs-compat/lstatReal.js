"use strict";
var lstat = require('./lstat');
var realpath = require('./realpath');
module.exports = function lstatReal(path, options, callback) {
    realpath(path, function realpathCallback(err, realpath) {
        if (err) return callback(err);
        lstat(realpath, options, callback);
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }