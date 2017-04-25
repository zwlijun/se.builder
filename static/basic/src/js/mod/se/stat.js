/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 数据统计
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.7
 */
;define(function(require, exports, module){
    var Detect  = require("mod/se/detect");
    var Storage = require("mod/se/storage");
    var Request = require("mod/se/request");
    var Util    = require("mod/se/util");

    var Util         = $.Util;
    var Session      = Storage.Session;
    var Persistent   = Storage.Persistent;
    var env          = Detect.env;

    var Types = {
        "CLICK": {
            "API": "${api}?pvId=${pvId}" +
                         "&uvId=${uvId}" +
                         "&sourceId=${sourceId}" +
                         "&sourceType=${sourceType}"
        },
        "SHARE": {
            "API": "${api}?pvId=${pvId}" +
                         "&uvId=${uvId}" +
                         "&sourceId=${sourceId}" +
                         "&sourceType=${sourceType}"
        },
        "PV": {
            "API": "${api}?pvId=${pvId}" +
                         "&uvId=${uvId}" +
                         "&siteId=${siteId}" + 
                         "&memberId=${memberId}" + 
                         "&sourceId=${sourceId}" +
                         "&sourceType=${sourceType}" +
                         "&networkType=${network}" +
                         "&fromType=${from}" +
                         "&osType=${os}" +
                         "&osVersion=${osv}" +
                         "&resolution=${screen}"
        }
    };
    var NetworkType = {
        "2g": "04",
        "3g": "01",
        "4g": "02",
        "wifi": "03",
        "unknown": "04"
    };
    var FromType = {
        "timeline": "02",     //微信朋友圈
        "groupmessage": "03", //微信群
        "singlemessage": "01",//微信好友
        "qq": "04",           //QQ
        "unknown": "05"       //其它
    };

    var Stat = {
        GUID: function(){
            return Util.GUID();
        },
        getPageId: function(){
            return Stat.GUID();
        },
        getUserId: function(){
            var userId = Persistent.get("st_uin");

            if(!userId){
                userId = Stat.GUID();

                Persistent.set("st_uin", userId, 0);
            }

            return userId;
        },
        setNetwork: function(type){
            Stat.network = type || "unknown";
        },
        getNetwork: function(){
            return Stat.network || "unknown";
        },
        getNetworkType: function(){
            var network = Stat.getNetwork();

            return NetworkType[network] || NetworkType["unknown"];
        },
        getFromType: function(){
            var stag = Request.getParameter("stag");
            var from = Request.getParameter("from") + "";
            var type = "unknown";

            type = stag || FromType[from] || FromType["unknown"];

            return type;
        },
        getPlatform: function(){
            var os = [
                {"alias": "ios", "name": "iOS"},
                {"alias": "android", "name": "Android"}, 
                {"alias": "windowsphone", "name": "WindowsPhone"},
                {"alias": "osx", "name": "OSX"},
                {"alias": "windows", "name": "Windows"}
            ];
            var size = os.length;
            var name = "other";
            var version = "0";
            var tmp = null;
            var item = null;

            for(var i = 0; i < size; i++){
                tmp = os[i];
                item = env.os[tmp.alias];

                if(item.major > 0){
                    name = tmp.name;
                    version = item.short;
                    break;
                }
            }

            return {
                "name": name,
                "version": version
            };
        },
        getMetaData: function(name){
            var meta = $('meta[name="' + name + '"]');
            var data = meta.attr("content") || "";

            return data;
        },
        configure: function(){
            var pid = Stat.getPageId();
            var uid = Stat.getUserId();
            var ntype = Stat.getNetworkType();
            var ftype = Stat.getFromType();
            var platform = Stat.getPlatform();
            var os = platform.name;
            var osv = platform.version;
            var click = Stat.getMetaData("stat_click");
            var share = Stat.getMetaData("stat_share");
            var pv = Stat.getMetaData("stat_pv");
            var clickSource = Stat.getMetaData("stat_source_click");
            var shareSource = Stat.getMetaData("stat_source_share");
            var pvSource = Stat.getMetaData("stat_source_pv");
            var source = Stat.getMetaData("stat_source");
            var siteId = Stat.getMetaData("stat_siteId");
            var memberId = Stat.getMetaData("stat_memberId");
            var screen = window.screen;
            var width = screen.width;
            var height = screen.height;
            var size = width > height ? height + "x" + width : width + "x" + height;

            return {
                "pvId": pid,
                "uvId": uid,
                "siteId": siteId,
                "memberId": memberId,
                "network": ntype,
                "from": ftype,
                "os": os,
                "osv": osv,
                "screen": size,
                "clickAPI": click,
                "shareAPI": share,
                "pvAPI": pv,
                "clickSourceType": clickSource,
                "shareSourceType": shareSource,
                "pvSourceType": pvSource,
                "source": source
            };
        },
        send: function(type, sid, stype){
            var open = Stat.getMetaData("stat_open");

            if("1" != open){
                return 0;
            }

            var conf = Stat.configure();
            var api = "";
            var _type = type.toUpperCase();
            var data = $.extend(conf, {
                "api": conf[type + "API"],
                "sourceId": (sid || conf["source"]),
                "sourceType": (stype || conf[type + "SourceType"])
            });

            if(_type in Types){
                api = Types[_type]["API"];
            }

            api = Util.formatData(api, data);

            var img = new Image();
            img.src = api;

            return 1;
        }
    };

    module.exports = {
        "version": "R17B0425",
        "setNetwork": Stat.setNetwork,
        "send": Stat.send
    };
});