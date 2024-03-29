"use strict";
var path = require("path");
var fs = require("graceful-fs");
var rimraf = require("rimraf");
var mkpath = require("mkpath");
var Queue = require("queue-cb");
var fsCompat = require("./fs-compat");
var STAT_OPTIONS = {
    bigint: process.platform === "win32"
};
function directory(fullPath, callback) {
    fsCompat.lstat(fullPath, STAT_OPTIONS, function(err, stat) {
        if (err || !stat) mkpath(fullPath, callback);
        else if (!stat.isDirectory()) {
            rimraf(fullPath, function(err) {
                err ? callback(err) : mkpath(fullPath, callback);
            });
        } else callback();
    });
}
function file(fullPath, contents, callback) {
    fsCompat.lstat(fullPath, STAT_OPTIONS, function(err, stat) {
        if (err || !stat) fs.writeFile(fullPath, contents, "utf8", callback);
        else if (!stat.isFile()) {
            rimraf(fullPath, function(err) {
                err ? callback(err) : fs.writeFile(fullPath, contents, "utf8", callback);
            });
        } else {
            fs.readFile(fullPath, "utf8", function(err, existingContents) {
                if (err) callback(err);
                else if (existingContents !== contents) fs.writeFile(fullPath, contents, "utf8", callback);
                else callback();
            });
        }
    });
}
function symlink(targetFullPath, fullPath, callback) {
    fsCompat.lstatReal(targetFullPath, STAT_OPTIONS, function(err, targetStat) {
        if (err || !targetStat) return callback(err || new Error("Symlink path does not exist".concat(targetFullPath)));
        var targetRelativePath = path.relative(path.dirname(fullPath), targetFullPath);
        var type = targetStat.isDirectory() ? "dir" : "file";
        fsCompat.lstat(fullPath, STAT_OPTIONS, function(err, stat) {
            if (err || !stat) fs.symlink(targetRelativePath, fullPath, type, callback);
            else if (!stat.isSymbolicLink()) {
                rimraf(fullPath, function(err) {
                    err ? callback(err) : fs.symlink(targetRelativePath, fullPath, type, callback);
                });
            } else {
                fsCompat.realpath(fullPath, function(err, realpath) {
                    if (err || realpath !== targetFullPath) rimraf(fullPath, function(err) {
                        err ? callback(err) : fs.symlink(targetRelativePath, fullPath, type, callback);
                    });
                    else callback();
                });
            }
        });
    });
}
function link(targetFullPath, fullPath, callback) {
    fsCompat.lstatReal(targetFullPath, STAT_OPTIONS, function(err, targetStat) {
        if (err || !targetStat) return callback(err || new Error("Symlink path does not exist".concat(targetFullPath)));
        fsCompat.lstat(fullPath, STAT_OPTIONS, function(err, stat) {
            if (err || !stat) fs.link(targetFullPath, fullPath, callback);
            else if (!stat.isFile()) {
                rimraf(fullPath, function(err) {
                    err ? callback(err) : fs.link(targetFullPath, fullPath, callback);
                });
            } else {
                fsCompat.realpath(fullPath, function(err, realpath) {
                    if (err || realpath !== targetFullPath) rimraf(fullPath, function(err) {
                        err ? callback(err) : fs.link(targetFullPath, fullPath, callback);
                    });
                    else callback();
                });
            }
        });
    });
}
function generateOne(dir, relativePath, contents, callback) {
    var fullPath = path.join(dir, relativePath.split("/").join(path.sep));
    if (!contents) return directory(fullPath, callback);
    mkpath(path.dirname(fullPath), function(err) {
        if (err) return callback(err);
        if (contents.length && contents[0] === "~") symlink(path.join(dir, contents.slice(1).split("/").join(path.sep)), fullPath, callback);
        else if (contents.length && contents[0] === ":") link(path.join(dir, contents.slice(1).split("/").join(path.sep)), fullPath, callback);
        else file(fullPath, contents, callback);
    });
}
function generate(dir, structure, callback) {
    var queue = new Queue(1);
    for(var relativePath in structure){
        queue.defer(generateOne.bind(null, dir, relativePath, structure[relativePath]));
    }
    queue.await(callback);
}
module.exports = function(dir, structure, callback) {
    if (callback !== undefined) return generate(dir, structure, callback);
    return new Promise(function(resolve, reject) {
        generate(dir, structure, function(err) {
            err ? reject(err) : resolve();
        });
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }