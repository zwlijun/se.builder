/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 版本比较
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.07
 */
;define(function (require, exports, module){
    var VersionUtil = {
        encode: function(versionString){
            var s = versionString.split(".");

            if(s.length < 4){
                for(var i = s.length; i < 4; i++){
                    s.push("0");
                }
            }

            var tmp = 0;
            var size = s.length - 1;
            var result = 0;
            for(var j = size; j >= 0; j--){
                tmp = parseInt(s[size - j], 10);
                result |= tmp << (j * 8);
            }

            return result;
        },
        decode: function(version){
            var buf = [];

            for(var i = 0; i < 4; i++){
                buf.unshift(version & 0xff);

                if(i < 3){
                    buf.unshift(".");
                }

                version = version >> 8;
            }

            return buf.join("");
        },
        compare: function(targetVersionString, currentVersionString){
            var targetVersion = this.encode(targetVersionString);
            var currentVersion = this.encode(currentVersionString);

            return currentVersion > targetVersion;
        }
    };

    module.exports = VersionUtil;
});