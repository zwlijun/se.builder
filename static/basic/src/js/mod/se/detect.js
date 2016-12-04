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
                {
                    "pattern": "Windows NT (\\d+)\\.(\\d+)",
                    "alias": "WindowsNT"
                },
                {
                    "pattern": "Windows (\\d+)",
                    "alias": "Windows"
                }
            ],
            "osx": {
                "pattern": "Mac OS X (\\d+)_(\\d+)(_(\\d+))?",
                "alias": "OSX"
            },
            "android": {
                "pattern": "Android (\\d+)\\.(\\d+)\\.(\\d+)",
                "alias": "Android"
            },
            "ios": [
                {
                    "pattern": "iPhone;.+OS (\\d+)_(\\d+)(_(\\d+))?",
                    "alias": "iOS"
                },
                {
                    "pattern": "iPad;.+OS (\\d+)_(\\d+)(_(\\d+))?",
                    "alias": "iOS"
                },
                {
                    "pattern": "iPod;.+OS (\\d+)_(\\d+)(_(\\d+))?",
                    "alias": "iOS"
                }
            ],
            "iphone": {
                "pattern": "iPhone;.+OS (\\d+)_(\\d+)(_(\\d+))?",
                "alias": "iPhone"
            },
            "ipad": {
                "pattern": "iPad;.+OS (\\d+)_(\\d+)(_(\\d+))?",
                "alias": "iPad"
            },
            "ipod": {
                "pattern": "iPod;.+OS (\\d+)_(\\d+)(_(\\d+))?",
                "alias": "iPod"
            },
            "windowsphone": [
                {
                    "pattern": "Windows Phone OS (\\d+)\\.(\\d+)",
                    "alias": "WindowsPhone"
                },
                {
                    "pattern": "Windows Phone (\\d+)",
                    "alias": "WindowsPhone"
                }
            ],
            "blackberry": {
                "pattern": "BlackBerry (\\d+)",
                "alias": "BlackBerry"
            },
            "symbian": {
                "pattern": "SymbianOS/(\\d+)\\.(\\d+)",
                "alias": "SymbianOS"
            }
        },
        "browser": {
            "ie": {
                "pattern": "MSIE (\\d+)\\.(\\d+)",
                "alias": "MSIE"
            },
            "edge": {
                "pattern": "Edge/(\\d+)\\.(\\d+)",
                "alias": "Edge"
            },
            "iemobile": {
                "pattern": "IEMobile[/ ](\\d+)\\.(\\d+)",
                "alias": "IEMobile"
            },
            "chrome": {
                "pattern": "Chrome/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
                "alias": "Chrome"
            },
            "safari": {
                "pattern": "Version/(\\d+)\\.(\\d+)(\\.(\\d+))?.+Safari",
                "alias": "Safari"
            },
            "firefox": {
                "pattern": "Firefox/(\\d+)\\.(\\d+)",
                "alias": "Firefox"
            },
            "opera": [
                {
                    "pattern": "Opera (\\d+)\\.(\\d+)",
                    "alias": "Opera"
                },
                {
                    "pattern": "Opera/.+ Version/(\\d+)\\.(\\d+)",
                    "alias": "Opera"
                }
            ],
            "operamini": {
                "pattern": "Opera Mini/(\\d+)\\.(\\d+)",
                "alias": "OperaMini"
            },
            "operamobile": {
                "pattern": "Opera Mobi/.+ Version/(\\d+)\\.(\\d+)",
                "alias": "OperaMobile"
            },
            "ucbrowser": [
                {
                    "pattern": "UC Browser[ /]?(\\d+)\\.(\\d+)\\.(\\d+)",
                    "alias": "UCBrowser"
                },
                {
                    "pattern": "UCBrowser/(\\d+)\\.(\\d+)\\.(\\d+)",
                    "alias": "UCBrowser"
                }
            ],
            "qqbrowser": {
                "pattern": " QQBrowser/(\\d+)\\.(\\d+)",
                "alias": "QQBrowser"
            },
            "mqqbrowser": {
                "pattern": " MQQBrowser/(\\d+)\\.(\\d+)",
                "alias": "MQQBrowser"
            },
            "blackberry": {
                "pattern": "BlackBerry.+ Version/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
                "alias": "BlackBerry"
            },
            "mqq": {
                "pattern": "SQ_[^/]+ QQ/(\\d+)\\.(\\d+)\\.(\\d+)",
                "alias": "MQQ"
            },
            "qq": {
                "pattern": "QQ/(\\d+)\\.(\\d+)\\.(\\d+)",
                "alias": "QQ"
            },
            "wechat": {
                "pattern": "MicroMessenger/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
                "alias": "WeChat"
            },
            "tbs": {
                "pattern": "TBS/(\\d+)",
                "alias": "TBS"
            },
            "aliapp": {
                "pattern": "AliApp\\(AP/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
                "alias": "AliApp"
            }
        },
        "engine": {
            "trident": {
                "pattern": "Trident/(\\d+)\\.(\\d+)",
                "alias": "Trident"
            },
            "webkit": {
                "pattern": "WebKit/(\\d+)\\.(\\d+)",
                "alias": "WebKit"
            },
            "gecko": {
                "pattern": "Gecko/(\\d+)",
                "alias": "Gecko"
            },
            "presto": {
                "pattern": "Presto/(\\d+)\\.(\\d+)\\.(\\d+)",
                "alias": "Presto"
            }
        }
    };

    var __check = function(ua, reg){
        var result = {
            "major": -1,
            "minor": -1,
            "patch": -1,
            "build": -1,
            "short": -1,
            "version": "",
            "name": ""
        };

        var pattern = new RegExp(reg.pattern);
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
            result.name = reg.alias;
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
        "version": "R16B1204",
        "parse": __parse,
        "env": __parse(_ua)
    };
});