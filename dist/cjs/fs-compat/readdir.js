"use strict";
var fs = require("fs");
// prior to Node 9, fs.readdir did not return sorted files
var readdir = fs.readdir;
if (+process.versions.node.split(".")[1] <= 8) {
    readdir = function readdirSort(path, callback) {
        fs.readdir(path, function(err, files) {
            err ? callback(err) : callback(null, files.sort());
        });
    };
}
function readdirAddOptions(path, _options, callback) {
    return readdir(path, callback);
}
module.exports = fs.readdir.length === 3 ? fs.readdir : readdirAddOptions;
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }