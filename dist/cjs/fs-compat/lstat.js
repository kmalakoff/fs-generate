"use strict";
var fs = require('fs');
function lstatAddOptions(path, _options, callback) {
    return fs.lstat(path, callback);
}
module.exports = fs.lstat.length === 3 ? fs.lstat : lstatAddOptions;
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }