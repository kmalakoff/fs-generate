"use strict";
var fs = require('fs');
function statAddOptions(path, _options, callback) {
    return fs.stat(path, callback);
}
module.exports = fs.stat.length === 3 ? fs.stat : statAddOptions;
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }