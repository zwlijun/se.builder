/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 数据集封装
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.09
 */
;define(function (require, exports, module){
    var Request             = require("mod/se/request");
    var CMD                 = require("mod/se/cmd");
    var DataProxy           = require("mod/se/dataproxy");
    var Util                = require("mod/se/util");
    var TemplateEngine      = require("mod/se/template");

    var ErrorTypes      = CMD.ErrorTypes;
    var RespTypes       = CMD.ResponseTypes;
    var ResponseProxy   = DataProxy.ResponseProxy;
    var DataCache       = DataProxy.DataCache;

    var DataSetTemplate = TemplateEngine.getTemplate("tpl_sp_dataset", {
        start: "<~",
        close: "~>",
        root: "ds"
    });

    var DataSetSchema = {
        schema: "dataset",
        request: function(data, node, e, type){
            var args = (data || "").split(",");
            var type = args[0];

            var dsf = GetDataSetConfigure(type);
            var fields = dsf.fields;
            var size = fields.length;

            var prefix = "data-request-";
            var attr = null;

            var params = {

            };

            var sourceData = {
                "data": data,
                "node": node,
                "event": e,
                "type": type
            };

            for(var i = 0; i < size; i++){
                attr = node.attr(prefix + fields[i]) || "";

                params[fields[i]] = attr;
            }

            DataSet.request(type, params, sourceData, Array.prototype.slice.call(arguments, 4));
        },
        more: function(data, node, e, type){
            node.addClass("loading");

            Util.requestExternal("dataset://request#" + data, [node, e, type]);
        }
    };

    var DataSet = {
        request: function(type, param, sourceData, extra){
            var dsf = GetDataSetConfigure(type);

            if(!dsf.request){
                throw new Error("DataSet configuration \"request\" attribute is missing.");
            }

            CMD.exec(dsf.request.name, param, {
                context: {
                    showLoading: dsf.loading.show,
                    loadingText: dsf.loading.text,
                    type: type,
                    param: param,
                    source: sourceData,
                    extra: extra
                },
                success: function(data, status, xhr){
                    var dsf = GetDataSetConfigure(this.type);
                    var proxy = dsf.proxy || {};

                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            var dsf = GetDataSetConfigure(ctx.type);
                            var proc = dsf.processor;

                            proc.apply(null, [
                                ctx, 
                                dsf.format(resp), 
                                msg
                            ]);
                        }
                    }, proxy.exception, proxy.conf);
                }
            })
        }
    };

    /**
     * 配置
     * @param {Object} conf 配置项
     * {
     *      "[key]": {
     *          "request": {
     *              "name": "mod_name.request_type.request_name",
     *              "command": {
     *                  "mod_name": {
     *                      "request_type": {
     *                          "request_name": {
     *                              "url":"", 
                                    "data":""
     *                          }
     *                      }
     *                  }
     *              }
     *          },
     *          "loading": {
     *              "show": [true|false],
     *              "text": "加载中，请稍候..."
     *          },
     *          "processor": function(ctx, resp, msg){
     *              //@todo
     *          },
     *          "format": function(resp){
     *              //@todo
     *          },
     *          "proxy": {
     *              "exception": {
     *                  errorMap: {
     *                      "[retcode]": Handler
     *                  },
     *                  tips: true|false,
     *                  handle: Handler
     *              },
     *              "conf": {
     *                  "code": "retCode",
     *                  "msg": "retMsg",
     *                  "success": 0,
     *                  "errorHandler": CMD.errorHandler
     *              }
     *          },
     *          "fields": ["key1", "key2"],
     *          "response": "list",
     *          "append": true|false,
     *          "pagebar": true|false
     *      }
     * }
     */
    var _DataSetConf = {};
    var Configure = function(conf){
        Register((_DataSetConf = $.extend(true, {}, _DataSetConf, conf || null)));
    };

    var Register = function(conf){
        var _c = null;
        var _req = null;
        var _commands = {};

        for(var key in conf){
            if(conf.hasOwnProperty(key)){
                _c = conf[key];
                _req = _c.request || null;

                if(_req){
                    _commands = $.extend(true, {}, _commands, _req.command);
                }else{
                    console.warn("Register::DataSet configuration \"request\" attribute is missing.");
                }
            }
        }

        CMD.injectCommands(_commands);
    };

    var GetDefaultConfigure = function(key){
        var DEFAULT_LOADING_CONF = {
            "show": false,
            "text": "数据加载中，请稍候..."
        };

        var DEFAULT_PROXY_CONF = {
            "exception": {
                tips: false
            },
            "conf": null
        };

        var DEFAULT_FORMAT_CONF = function(resp){
            return resp || {};
        };

        var DEFAULT_PROCESSOR_CONF = function(ctx, resp, msg){
            var dsf = GetDataSetConfigure(ctx.type);
            var dataSet = resp[dsf.response] || [];

            var renderNode = $("#render_" + ctx.type);
            var tplId = "tpl_" + ctx.type;

            var noData = renderNode.siblings(".dataset-nodata");
            var moreData = renderNode.siblings(".dataset-pagebar");
            var pageIndex = Number(ctx.param.page || ctx.param.pageIndex || ctx.param.nowPage);
            var pageSize = Number(resp.pageSize || 20);
            var pageKey = "page";

            noData.addClass("hide");

            if("pageIndex" in ctx.param){
                pageKey = "pageIndex";
            }else if("nowPage" in ctx.param){
                pageKey = "nowPage";
            }else{
                pageKey = "page";
            }


            if(moreData.length == 0){
                moreData = renderNode.siblings(".dataset-moredata");
            }

            if(true !== dsf.pagebar){
                moreData.addClass("hide");
                moreData.removeClass("loading");
            }

            if(dataSet && dataSet.length > 0){
                if(dataSet.length >= pageSize){
                    moreData.removeClass("hide");
                }

                DataSetTemplate.render(false, tplId, dataSet, {
                    callback: function(ret, _node, _more, _pageIndex, _dsf, _pageKey){
                        if(_pageIndex <= 1 || false === _dsf.append){
                            _node.html("");
                        }
                        _node.append(ret.result);

                        _more.attr("data-request-" + _pageKey, _pageIndex + 1);
                        //----------------------------------------------------------------------------------
                        if(true === _dsf.pagebar){
                            _more.find(".page").removeClass("on");
                            _more.find('[data-page="' + _pageIndex + '"]').addClass("on");
                        }
                    },
                    args: [renderNode, moreData, pageIndex, dsf, pageKey]
                })
            }else{
                if(pageIndex <= 1){
                    noData.removeClass("hide");
                }
            }
        };

        var conf = {
            "loading": DEFAULT_LOADING_CONF,
            "proxy": DEFAULT_PROXY_CONF,
            "format": DEFAULT_FORMAT_CONF,
            "processor": DEFAULT_PROCESSOR_CONF
        };

        if(key in conf){
            return conf[key];
        }

        return conf;
    };

    var GetDataSetConfigure = function(key){
        var conf = _DataSetConf;

        var DEFAULT_LOADING_CONF = GetDefaultConfigure("loading");
        var DEFAULT_PROXY_CONF = GetDefaultConfigure("proxy");
        var DEFAULT_FORMAT_CONF = GetDefaultConfigure("format");
        var DEFAULT_PROCESSOR_CONF = GetDefaultConfigure("processor");

        if(key in conf){
            var _dsf = conf[key];
            var req = _dsf.request || null;
            var loading = _dsf.loading || DEFAULT_LOADING_CONF;
            var proc = _dsf.processor || DEFAULT_PROCESSOR_CONF;
            var proxy = _dsf.proxy || DEFAULT_PROXY_CONF;
            var format = _dsf.format || DEFAULT_FORMAT_CONF;
            var fields = _dsf.fields || [];
            var response = _dsf.response || "dataset";
            var append = ("append" in _dsf) ? _dsf.append : true;
            var pagebar = ("pagebar" in _dsf) ? _dsf.pagebar : false;

            return {
                "request": req,
                "loading": loading,
                "processor": proc,
                "proxy": proxy,
                "format": format,
                "fields": fields,
                "response": response,
                "append": append,
                "pagebar": pagebar
            }
        }

        return null;
    };

    (function main(){
        Util.source(DataSetSchema);
    })();

    module.exports = {
        "version": "R17B0817",
        configure: function(conf){
            Configure(conf);
        },
        template: function(){
            return DataSetTemplate;
        },
        getDataSetConfigure: function(key){
            return GetDataSetConfigure(key);
        },
        getDefaultConfigure: function(key){
            return GetDefaultConfigure(key);
        }
    }
});