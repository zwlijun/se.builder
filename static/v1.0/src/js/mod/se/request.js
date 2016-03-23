/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 请求模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.4
 */
;define(function Request(require, exports, module){  
    $.Util = require("mod/se/util");   

    /**
     * HEAD请求回调
     * @param Object handler 回调句柄
     * @param Array args 返回的参数，将置于回调函数本身参数之前
     * @param Object runtime 运行期异常回调句柄
     */
    var HeadCallback = function(handler, args, runtime){
        try{
            $.Util.execAfterMergerHandler(handler, args);
        }catch(e){          
            try{
                $.Util.execAfterMergerHandler(runtime, ["parsererror"].concat(args[1]));
            }catch(e){                
                throw new Error("the runtime handler parse error. " + e.message);
            }
        }
    };

    module.exports = {   
        /**
         * 过滤XSS的非法字符
         * @param String str 需要进行过滤的字符串
         */
        filterScript: function(str){
            var text = document.createTextNode(str);
            var parser = document.createElement("div");
            var value = "";

            parser.appendChild(text);

            value = parser.innerHTML;
            
            text = null; parser = null;

            return value;
        },         
        /**
         * 获取url中的参数信息
         * @param String key 参数名
         * @param String querystring 查询串
         * @return String key所对应的值，如果不存在返回null
         */
        getParameter:function(key, querystring){
            var search = (querystring || document.location.search);
            var pattern = new RegExp("[\?&]"+key+"\=([^&#\?]*)", "g");
            var matcher = pattern.exec(search);
            var items = null;
            
            if(null != matcher){
                items = matcher[1];
            }

            if(null != items){
                items = this.filterScript(items);
            }

            pattern = null;

            return items;
        },
        /**
         * 解析URL
         * @method parseURL
         * @param String url 需要解析的URL
         * @return Object items {String url, String protocol, String host, String port, String pathname, String search, String hash, String user, String password, String filename}
         */
        parseURL : function(url){
            var p = /^([^\:\/\?&\#]+\:)\/\/(([\w\W]+)(\:([\w\W]+)\@))?([^\:\/\?&\#]+)(\:([\d]+))?(\/?[^\?&\#\:]*\/)?([^\/&\#\?\:]+)?(\?[^\?#]+)?(\#[\w\W]*)?$/;
            //[
            // 0: "ftp://carlli:123@ftp.domain.com:21000/www/test/a?sss=123&t=123&o=000#!asd=123",  //原串
            // 1: "ftp:",                    //protocol
            // 2: "carlli:123@",             //auth info
            // 3: "carlli",                  //user
            // 4: ":123",                    //password
            // 5: "123",                     //password
            // 6: "ftp.domain.com",          //host
            // 7: ":21000",                  //port
            // 8: "21000",                   //port
            // 9: "/www/test/",              //pathname
            // 10: "a",                      //filename
            // 11:"?sss=123&t=123&o=000",    //search
            // 12:"#!asd=123"                //hash
            //]
            var loc = url || document.URL;
            var r0 = p.exec(loc)||[];
            
            var path = r0[9] || "";
            var file = r0[10] || "";

            var o = {
                url:       (r0[0] || ""),            
                protocol:  (r0[1] || ""),
                user:      (r0[3] || ""),
                password:  (r0[5] || ""),
                host:      (r0[6] || ""),
                port:      (r0[8] || ""),
                search:    (r0[11] || ""),
                hash:      (r0[12] || ""),
                pathname:  path + file,
                filename:  file
            };
            p = null;
            r0 = null;

            return o;
        },
        append : function(url, data){
            return url += (url.indexOf("?") == -1 ? ("?" + data) : ("&" + data));
        },
        /**
         * 将querystring转换成map对象
         * @param String qs URL查询串
         * @return Object items
         */
        serialized : function(qs){
            qs = (qs || "");
            
            var ch = qs.substring(0, 1);
            var search = (("?&".indexOf(ch) == -1) ? "?" + qs : qs);
            var s = (search || location.search);
            var pattern = /[\?&]([^\?&=#]+)=([^&#\?]*)/g;
            var matcher = null;
            var items = {};
            var key = null;
            var value = null;
            var tmp = null;

            while(null != (matcher = pattern.exec(s))){
                key = matcher[1];
                value = decodeURIComponent(this.filterScript(matcher[2]));
                
                if(key in items){
                    if(items[key] instanceof Array  && items[key].constructor == Array){ //数组
                        items[key].push(value);
                    }else{
                        tmp = items[key];
                        items[key] = [tmp].concat(value);
                    }
                }else{
                    items[key] = value;
                }
            }
            pattern = null; matcher = null;

            return items;
        },
        /**
         * 将paramters还原成querystring
         * @param Object o URL查询串MAP对象
         * @return String str
         */
        stringify : function(o){
            var tmp = [];
            var str = "";
            var items = null;
            
            for(var name in o){
                if(o.hasOwnProperty(name)){
                    items = o[name];
                    
                    if(items instanceof Array && items.constructor == Array){ //数组
                        for(var i = 0, j = items.length; i < j; i++){
                            tmp.push(name + "=" + encodeURIComponent(items[i]));
                        }
                    }else{
                        tmp.push(name + "=" + encodeURIComponent(o[name]));
                    }
                }
            }

            str = tmp.join("&");
            tmp = null; o = null;
            return str;
        },
        /**
         * HEAD请求
         * @param Object options {
         *     String url 请求的URL
         *     Boolean crossdomain 跨域调用  
         *     int delay 超时时长（毫秒）
         *     Array heads [{String name, String value}]需要发送的HTTP头
         *     Object before {Function callback, Array args, Object context} 发送请求前回调句柄
         *     Object success {Function callback, Array args, Object context} 成功回调句柄
         *     Object error {Function callback, Array args, Object context} 网络异常回调句柄
         *     Object timeout {Function callback, Array args, Object context} 请求超时回调句柄
         *     Object runtime {Function callback, Array args, Object context} 运行期异常回调句柄
         *     Object complete {Function callback, Array args, Object context} 请求完成回调句柄
         * }
         */
        head : function(options){
            var url = options.url;
            var crossdomain = options.crossdomain || false;
            var delay = options.delay || 0;
            var heads = options.heads || [];
            var before = options.before || null;
            var success = options.success || null;
            var error = options.error || null;
            var timeout = options.timeout || null;
            var runtime = options.runtime || null;
            var complete = options.complete || null;
            var head = null;
            var timer = null;

            var xhr = new XMLHttpRequest();

            xhr.open("HEAD", url, true);

            HeadCallback(before, ["before", xhr], runtime);

            for(var i = 0, size = heads.length; i < size; i++){
                head = heads[i];
                xhr.setRequestHeader(head.name, head.value);
            }

            xhr.setRequestHeader("No-Cache","1");
            xhr.setRequestHeader("Pragma","no-cache");
            xhr.setRequestHeader("Cache-Control","no-cache, no-store");
            xhr.setRequestHeader("Expires","0");
            xhr.setRequestHeader("Last-Modified","Thu, 1 Jan 1970 00:00:00 GMT");
            xhr.setRequestHeader("If-Modified-Since","-1");

            xhr.onreadystatechange = function(){
                var xmlHttp = this;

                if(xmlHttp.HEADERS_RECEIVED == xmlHttp.readyState){
                    //var value = xmlHttp.getResponseHeader("X-Encrypt-" + key);
                    if(null != timer){
                        clearTimeout(timer);
                        timer = null;
                    }

                    var status = xmlHttp.status;

                    var headMap = (function(resp){
                        var items = resp.split("\r\n");
                        var size = items.length;
                        var item = null;
                        var name = null;
                        var value = null;
                        var index = 0;
                        var map = {};

                        for(var i = 0; i < size; i++){
                            item = items[i];
                            if(-1 != (index = item.indexOf(": "))){
                                name = item.substring(0, index);
                                value = item.substring(name.length + 2);
                                map[name] = value;
                            }
                        }

                        return map;
                    })(xmlHttp.getAllResponseHeaders());

                    if(200 === status){
                        HeadCallback(success, [status, headMap], runtime);
                    }else{
                        HeadCallback(error, [status, headMap], runtime);
                    }

                    HeadCallback(complete, [status, headMap], runtime);                    
                    xmlHttp = null;
                    xhr = null;
                }
            }

            xhr.send();

            if(delay && delay > 0){
                timer = setTimeout(function(){
                    if(xhr && null != timer){
                        xhr.abort();
                        timer = null;

                        HeadCallback(timeout, ["timeout", {}], runtime);
                        HeadCallback(complete, ["timeout", {}], runtime);
                    }    
                });
            }
        }
    }
});