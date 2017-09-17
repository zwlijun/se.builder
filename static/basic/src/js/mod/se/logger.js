/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Logger
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2017.5
 */
;define(function Logger(require, exports, module){
    var DetectUtil      = require("mod/se/detect");

    var Env = DetectUtil.env;
    var console = window.console;

    var LoggerDataSet = function(valueSeparator){
        this.dataSet = {};
        this.valueSeparator = valueSeparator || "|";
    };

    LoggerDataSet.prototype = {
        clear: function(){
            this.dataSet = null;
            this.dataSet = {};

            return this;
        },
        put: function(key, value){
            if(!(key in this.dataSet)){
                this.dataSet[key] = [];
            }

            this.dataSet[key].push(encodeURIComponent(value));

            return this;
        },
        get: function(key){
            if(key in this.dataSet){
                return this.dataSet[key];
            }

            return null;
        },
        remove: function(key){
            if(key in this.dataSet){
                this.dataSet[key] = null;

                delete this.dataSet[key];
            }

            return this;
        },
        toJSON: function(){
            var tmp = {};

            for(var key in this.dataSet){
                if(this.dataSet.hasOwnProperty(key)){
                    tmp[key] = this.dataSet[key].join(this.valueSeparator);
                }
            }

            return tmp;
        },
        toString: function(){
            var tmp = [];

            for(var key in this.dataSet){
                if(this.dataSet.hasOwnProperty(key)){
                    tmp.push(key + "=" + this.dataSet[key].join(this.valueSeparator));
                }
            }

            return tmp.length > 0 ? tmp.join("&") : "";
        }
    };

    var LoggerCore = function(dataset, url){
        this._dataset = dataset;
        this._url = url;
    };

    LoggerCore.prototype = {
        dataset: function(){
            return this._dataset;
        },
        os: function(){
            var os = Env.os;

            var name = "other";
            var ver = "-1";
            var tmp = null;
            var matcher = {};
            var matched = false;

            for(var tmp in os){
                if(os.hasOwnProperty(tmp)){
                    if((tmp in os) && os[tmp].major > -1){
                        name = os[tmp].name;
                        ver  = os[tmp].version;

                        matcher[name] = ver;
                        matched = true;
                    }
                }
            }

            if(false === matched){
                matcher[name] = ver;
            }

            return JSON.stringify(matcher);
        },
        browser: function(){
            var browser = Env.browser;
            
            var name = "other";
            var ver = "-1";
            var tmp = null;
            var matcher = {};
            var matched = false;

            for(var tmp in browser){
                if(browser.hasOwnProperty(tmp)){
                    if((tmp in browser) && browser[tmp].major > -1){
                        name = browser[tmp].name;
                        ver  = browser[tmp].version;

                        matcher[name] = ver;
                        matched = true;
                    }
                }
            }

            if(false === matched){
                matcher[name] = ver;
            }

            return JSON.stringify(matcher);
        },
        engine: function(){
            var engine = Env.engine;
            
            var name = "other";
            var ver = "-1";
            var tmp = null;
            var matcher = {};
            var matched = false;

            for(var tmp in engine){
                if(engine.hasOwnProperty(tmp)){
                    if((tmp in engine) && engine[tmp].major > -1){
                        name = engine[tmp].name;
                        ver  = engine[tmp].version;
                        
                        matcher[name] = ver;
                        matched = true;
                    }
                }
            }

            if(false === matched){
                matcher[name] = ver;
            }

            return JSON.stringify(matcher);
        },
        collect: function(clear){
            var url = this._url;
            var dataset = this.dataset();
            var data = dataset.toString();

            if(data){
                var img = new Image();
                img.src = (url.indexOf("?") == -1) ? (url + "?" + data) : (url + "&" + data);

                if(false !== clear){
                    dataset.clear();
                }
            }
        }
    };

    LoggerCore.Cache = {};

    var Logger = {
        "version": "R17B0503",
        "out": {
            invoke: function(){
                var args = Array.prototype.slice.call(arguments);
                var type = args[0] + "";
                var inArgs = args.slice(1);

                if(console && (type in console)){
                    console[type].apply(console, inArgs);
                }
            }
        },
        getLogger: function(name, url, valueSeparator){
            var loggerCore = LoggerCore.Cache[name] || (LoggerCore.Cache[name] = new LoggerCore(new LoggerDataSet(valueSeparator), url));

            return loggerCore;
        }
    };

    module.exports = Logger;
});