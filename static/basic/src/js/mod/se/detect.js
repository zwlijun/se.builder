/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 环境检测（UserAgent）
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.4
 *
 */
;define(function(require, exports, module){
    var _ua = navigator.userAgent;

    // os
    // os -> windows
    // os -> osx
    // os -> android
    // os -> ios
    // os -> ipad
    // os -> iphone
    // os -> ipod
    // os -> windowsphone
    // os -> blackberry
    // os -> symbian
    // browser
    // browser -> ie
    // browser -> edge
    // browser -> iemobile
    // browser -> chrome
    // browser -> safari
    // browser -> firefox
    // browser -> opera
    // browser -> operamini
    // browser -> operamobile
    // browser -> ucbrowser
    // browser -> qqbrowser
    // browser -> mqqbrowser
    // browser -> blackberry
    // browser -> mqq
    // browser -> qq
    // browser -> wechat
    // browser -> tbs
    // browser -> aliapp
    // engine
    // engine -> trident
    // engine -> webkit
    // engine -> gecko
    // engine -> presto
    

    var CheckMap = {
        "os": {
            "windows": [
                "Windows NT (\\d+)\\.(\\d+)",
                "Windows (\\d+)"
            ],
            "osx": "Mac OS X (\\d+)_(\\d+)(_(\\d+))?",
            "android": "Android (\\d+)\\.(\\d+)\\.(\\d+)",
            "ios": [
                "iPhone;.+OS (\\d+)_(\\d+)(_(\\d+))?",
                "iPad;.+OS (\\d+)_(\\d+)(_(\\d+))?",
                "iPod;.+OS (\\d+)_(\\d+)(_(\\d+))?"
            ],
            "iphone": "iPhone;.+OS (\\d+)_(\\d+)(_(\\d+))?",
            "ipad": "iPad;.+OS (\\d+)_(\\d+)(_(\\d+))?",
            "ipod": "iPod;.+OS (\\d+)_(\\d+)(_(\\d+))?",
            "windowsphone": [
                "Windows Phone OS (\\d+)\\.(\\d+)",
                "Windows Phone (\\d+)"
            ],
            "blackberry": "BlackBerry (\\d+)",
            "symbian": "SymbianOS/(\\d+)\\.(\\d+)"
        },
        "browser": {
            "ie": "MSIE (\\d+)\\.(\\d+)",
            "edge": "Edge/(\\d+)\\.(\\d+)",
            "iemobile": "IEMobile[/ ](\\d+)\\.(\\d+)",
            "chrome": "Chrome/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
            "safari": "Version/(\\d+)\\.(\\d+)(\\.(\\d+))?.+Safari",
            "firefox": "Firefox/(\\d+)\\.(\\d+)",
            "opera": [
                "Opera (\\d+)\\.(\\d+)",
                "Opera/.+ Version/(\\d+)\\.(\\d+)"
            ],
            "operamini": "Opera Mini/(\\d+)\\.(\\d+)",
            "operamobile": "Opera Mobi/.+ Version/(\\d+)\\.(\\d+)",
            "ucbrowser": [
                "UC Browser[ /]?(\\d+)\\.(\\d+)\\.(\\d+)",
                "UCBrowser/(\\d+)\\.(\\d+)\\.(\\d+)"
            ],
            "qqbrowser": " QQBrowser/(\\d+)\\.(\\d+)",
            "mqqbrowser": " MQQBrowser/(\\d+)\\.(\\d+)",
            "blackberry": "BlackBerry.+ Version/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
            "mqq": "SQ_[^/]+ QQ/(\\d+)\\.(\\d+)\\.(\\d+)",
            "qq": "QQ/(\\d+)\\.(\\d+)\\.(\\d+)",
            "wechat": "MicroMessenger/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
            "tbs": "TBS/(\\d+)",
            "aliapp": "AliApp\\(AP/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)"
        },
        engine: {
            "trident": "Trident/(\\d+)\\.(\\d+)",
            "webkit": "WebKit/(\\d+)\\.(\\d+)",
            "gecko": "Gecko/(\\d+)",
            "presto": "Presto/(\\d+)\\.(\\d+)\\.(\\d+)"
        }
    };

    var __check = function(ua, reg){
        var result = {
            "major": -1,
            "minor": -1,
            "patch": -1,
            "build": -1,
            "short": -1,
            "version": ""
        };

        var pattern = new RegExp(reg);
        var matcher = null;

        pattern.lastIndex = 0;

        if(null != (matcher = pattern.exec(ua))){
            var tmp = [];
            var r = 0;
            var l = 0;

            for(var i = 1; i < matcher.length; i++){
                r = matcher[i];

                if(/^[\d]+$/.test(r)){
                    tmp.push(Number(r));
                }
            }

            l = tmp.length;

            result.major = l > 0 ? tmp[0] : -1;
            result.minor = l > 1 ? tmp[1] : -1;
            result.patch = l > 2 ? tmp[2] : -1;
            result.build = l > 3 ? tmp[3] : -1;
            result.short = Number(result.major > -1 ? result.major + (result.minor > -1 ? "." + result.minor : ".0") : -1);
            result.version = tmp.join(".");
        }

        return result;
    };

    var __exec = function(ua, conf){
        var item = null;
        var result = {};

        for(var key in conf){
            if(conf.hasOwnProperty(key)){
                item = conf[key];

                if(Object.prototype.toString.call(item) == "[object Array]"){
                    for(var i = 0; i < item.length; i++){
                        result[key] = __check(ua, item[i]);

                        if(result[key].version && result[key].major > -1){
                            break;
                        }
                    }
                }else{
                    result[key] = __check(ua, item);
                }
            }
        }

        return result;
    };

    var __parse = function(ua){
        var regexps = CheckMap;
        var result = {
            "os": __exec(ua, regexps["os"]),
            "browser": __exec(ua, regexps["browser"]),
            "engine": __exec(ua, regexps["engine"])
        };

        return result;
    };

    module.exports = {
        "version": "R16B0420",
        "parse": __parse,
        "env": __parse(_ua)
    };
});