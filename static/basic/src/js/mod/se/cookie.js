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
        ipv4: function(domain){
            var pattern = /^[\d]+(\.[\d]+){3}$/;
            pattern.lastIndex = 0;

            return pattern.test(domain);
        },
        ipv6: function(domain){
            var pattern = /^[\da-f]{1,4}(\:[\da-f]{1,4}){7}$/i;
            pattern.lastIndex = 0;

            return pattern.test(domain);
        },
        domain: function(isFullDomain){
            var domain = document.domain;

            if(true === isFullDomain){
                return domain;
            }

            var items = domain.split(".");
            var size = items.length;

            if(size > 2 && !Cookie.ipv4(domain) && !Cookie.ipv6(domain)){
                domain = items.slice(size - 2).join(".");
            }

            return domain;
        },
        path: function(isFullPath){
            if(true === isFullPath){
                var path = location.pathname || "/";

                path = path.replace(/\/[^\/]+$/g, "/");
            }else{
                path = "/";
            }

            return path;
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

            if(opts.expires){
                str += '; expires=' + opts.expires.toUTCString();
            }
            if(opts.secure){
                str += '; secure';
            }

            if(!opts.path){
                opts.path = Cookie.path();
            }
            str += '; path=' + opts.path;

            if(!opts.domain){
                opts.domain = Cookie.domain();
            }
            str += '; domain=' + opts.domain;

            document.cookie = str;
        },
        get: function(name){
            var cookies = Cookie.parse();

            return cookies[name] || "";
        },
        remove: function(name){
            var value = Cookie.get(name);

            if(!!value){
                Cookie.set(name, value, {
                    "maxage": -10000
                });
            }
        }
    };

    module.exports = Cookie;
});