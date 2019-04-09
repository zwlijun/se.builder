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
            var pattern = /^[\d]{1,3}(\.[\d]{1,3}){3}$/; //d.d.d.d
            pattern.lastIndex = 0;

            return pattern.test(domain);
        },
        ipv6: function(domain){
            var patterns = [
                /^[\da-f]{1,4}(:[\da-f]{1,4}){7}$/i,  //IPv6全地址 X:X:X:X:X:X:X:X
                /^::$/,  //X:X:X:X:X:X:X:X
                /^::[\da-f]{1,4}(:[\da-f]{1,4})*$/i,  //::X:X, ::X
                /^([\da-f]{1,4}:)*([\da-f]{1,4})::$/i,  //X::, X:X::
                /^([\da-f]{1,4}:)*([\da-f]{1,4})::([\da-f]{1,4})(:[\da-f]{1,4})*$/i,  //X:X::X:X, X::X, X::X:X, X:X::X
                /^[\da-f]{1,4}(:[\da-f]{1,4}){5}:[\d]{1,3}(\.[\d]{1,3}){3}$/i, //X:X:X:X:X:X:d.d.d.d
                /^::[\d]{1,3}(\.[\d]{1,3}){3}$/i, //::d.d.d.d
                /^::[\da-f]{1,4}(:[\da-f]{1,4})*:[\d]{1,3}(\.[\d]{1,3}){3}$/i, //::X:X:d.d.d.d, ::X:d.d.d.d
                /^([\da-f]{1,4}:)*([\da-f]{1,4})::[\d]{1,3}(\.[\d]{1,3}){3}$/i,  //X::d.d.d.d, X:X::d.d.d.d
                /^([\da-f]{1,4}:)*([\da-f]{1,4})::([\da-f]{1,4})(:[\da-f]{1,4})*:[\d]{1,3}(\.[\d]{1,3}){3}$/i  //X:X::X:X:d.d.d.d, X::X:d.d.d.d, X::X:X:d.d.d.d, X:X::X:d.d.d.d
            ];

            for(var i = 0; i < patterns.length; i++){
                pattern = patterns[i];
                pattern.lastIndex = 0;

                if(pattern.test(domain)){
                    return true;
                }
            }

            return false;
        },
        domain: function(isFullDomain){
            var domain = document.domain;

            if(true === isFullDomain){
                return domain;
            }

            var items = domain.split(".");
            var size = items.length;

            if(!Cookie.ipv4(domain) && !Cookie.ipv6(domain)){
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