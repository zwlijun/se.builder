/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 对象跳径查找
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.5
 */
;define(function(require, exports, module){
    var oPaths = {
        "version": "R18B0516",
        find: function(obj, paths){
            var items = paths.split("/");
            var size = items.length;
            var o = undefined;
            var key = null;

            var tmp = obj;
            for(var i = 0; i < size; i++){
                key = items[i];

                if(!key){
                    continue;
                }

                if(key.indexOf("[") !== -1 && key.indexOf("]") !== -1){
                    var s1 = key.substring(0, key.indexOf("["));
                    var s2 = Number(key.substring(key.indexOf("[") + 1, key.indexOf("]")));

                    tmp = tmp[s1][s2];
                }else{
                    tmp = tmp[key];
                }
            }

            o = tmp;

            return o;
        }
    };

    module.exports = oPaths;
});