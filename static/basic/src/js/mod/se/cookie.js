/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Cookie模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.12
 */
;define(function(require, exports, module){
    var Cookie = {
        "version": "R16B1205",
        encode: function(str){
            return encodeURIComponent(str);
        },
        decode: function(str){
            return decodeURIComponent(str);
        },
        parse: function(){
            var items = {};

            try{
                var cookie = document.cookie || "";
                var pairs = cookie.split(/ *; */);
                var size = pairs.length;
                var item = null;
                var kv = null;

                for(var i = 0; i < size; i++){
                    item = pairs[i];

                    if(!item){
                        continue;
                    }

                    kv = item.split("=");

                    items[Cookie.decode(kv[0])] = Cookie.decode(kv[1] || "");
                }
            }catch(e){
                items = {};
            }finally{
                return items;
            }
        },
        set: function(name, value, options){
            var opts = options || {};
            var str = Cookie.encode(name) + '=' + Cookie.encode("" + value);

            if(null === value || undefined === value){
                opts.maxage = -10000;
            }

            if(opts.maxage){
                opts.expires = new Date(+new Date + opts.maxage);
            }

            if(opts.path){
                str += '; path=' + opts.path;
            }
            if(opts.domain){
                str += '; domain=' + opts.domain;
            }
            if(opts.expires){
                str += '; expires=' + opts.expires.toUTCString();
            }
            if(opts.secure){
                str += '; secure';
            }

            document.cookie = str;
        },
        get: function(name){
            var cookies = Cookie.parse();

            return cookies[name] || "";
        },
        remove: function(name){
            Cookie.set(name, null);
        }
    };

    module.exports = Cookie;
});