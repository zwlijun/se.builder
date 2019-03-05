//build service

"use strict"

const pkg = require("../package.json");

//基础配置
exports.debug = true;
exports.port = 8000;
exports.webmaster = "zwlijun@gmail.com";
exports.siteName = pkg.name;
exports.siteVersion = pkg.version;
exports.copyright = "SESHENGHUO.COM";
