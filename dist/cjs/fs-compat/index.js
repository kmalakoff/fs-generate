"use strict";
var lstat = require('./lstat');
var lstatReal = require('./lstatReal');
var readdir = require('./readdir');
var realpath = require('./realpath');
var stat = require('./stat');
module.exports = {
    lstat: lstat,
    lstatReal: lstatReal,
    readdir: readdir,
    realpath: realpath,
    stat: stat
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }