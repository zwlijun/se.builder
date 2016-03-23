/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/*! John Resig - http://ejohn.org/ - MIT Licensed */

/**
 * 模板
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2015.10
 */
;define(function(require, exports, module){
    var Util = require("mod/se/util");

    //options::start 启始标签
    //options::close 结束标签
    //options::handle 渲染后回调函数
    //options::root 模板渲染时的本地对象空间
    var _Template = function(name, options){
        this.name = name;
        this.options = options; 
        this.start = options.start || "<%";
        this.close = options.close || "%>";
        this.handle = options.handle || null;
        this.root = options.root || "obj";
    };

    _Template.TPLCache = {};
    _Template.Cache = {};

    _Template.prototype = {
        /**
         * 模板渲染
         * @param boolean isDirect 是否为直接量，true: tplId为模板片断, false: tplId为模板容器ID
         * @param String tplId 模板或模板容器ID
         * @param Object metaData 模板数据
         * @param Object handle 渲染回调
         * @return Object ret {Object global, Object local}
         */
        render: function(isDirect, tplId, metaData, handle){
            var tpl = (true === isDirect ? tplId : (_Template.TPLCache[tplId] || (_Template.TPLCache[tplId] = $("#" + tplId).html())));

            return (function(_t, str, data, callback){
                // Generate a reusable function that will serve as a template
                // generator (and which will be cached).
                var startTime = Util.getTime();
                var chr = function(str){
                    var tmp = "";
                    for(var i = 0, size = str.length; i < size; i++){
                        tmp += "\\" + str.charAt(i);
                    }

                    return tmp;
                };
                var template = str;
                var fn = new Function(
                    _t.root,
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +

                    // Introduce the data as local variables using with(){}
                    "with(" + _t.root + "){p.push('" +
                    //------------------------------------
                        // Convert the template into pure JavaScript
                        str
                            .replace(/[\r\t\n]/g, " ")
                            .split(_t.start).join("\t")
                            .replace(new RegExp("((^|" + chr(_t.close) + ")[^\\t]*)'", "g"), "$1\r")
                            .replace(new RegExp("\\t=(.*?)" + chr(_t.close), "g"), "',$1,'")
                            .split("\t").join("');")
                            .split(_t.close).join("p.push('")
                            .split("\r").join("\\'")
                    //------------------------------------    
                    + "');}return p.join('');"
                );

                // Provide some basic currying to the user
                var result =  data ? fn( data ) : str;
                var endTime = Util.getTime();
                var elapsedTime = endTime - startTime;
                var o = {
                    "result": result,
                    "elapsedTime": elapsedTime,
                    "template": template,
                    "metaData": metaData
                };
                var ret = {
                    "global": undefined,
                    "local": undefined
                };

                if(_t.handle){
                    ret["global"] = Util.execAfterMergerHandler(_t.handle, [o]); //全局
                }
                if(callback){
                    ret["local"] = Util.execAfterMergerHandler(callback, [o]);  //局部
                }

                return ret;
            })(this, tpl, metaData, handle);
        }
    };

    module.exports = {
        "version": "R15B1208",
        getTemplate: function(name, options){
            var _t = _Template.Cache[name] || (_Template.Cache[name] = new _Template(name, options || {}));

            return {
                render: function(isDirect, tplId, metaData, handle){
                    var ret = _t.render(isDirect, tplId, metaData, handle || null);
                    var eng = this;

                    eng["global"] = ret["global"];
                    eng["local"] = ret["local"];

                    return eng;
                }
            }
        }
    };
});