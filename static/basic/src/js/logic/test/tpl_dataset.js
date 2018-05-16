;define(function(require, exports, module){
    var oPaths           = require("mod/se/opaths");


    var ErrorTypes = null;
    var RespTypes = null;
    var ResponseProxy = null;
    var DataCache =  null;
    var CMD = null;
    var Util = null;
    var DataType = null;
    var TemplateEngine = null;
    var Request = null;
    var Persistent = null;
    var Session = null;
    var Toast = null;
    
    var SESchema = {
        "schema": "se",
        "dataset": {
            more: function(data, node, e, type){
                var args = (data || "").split(",");
                var requestNames = (args[0] || "").split("|");
                var requestSize = requestNames.length;
                var requestPageKey = args[1] || "page";
                var requestRenderName = args[2] || "datalist";
                var requestAPIURL = args[3] || "/datalist";
                var requestDataListPath = args[4] || "dataList";
                var requestShowLoading = "1" === args[5];
                var requestLoadingText = args[6] || "处理中，请稍候...";
                var requestParams = {};
                var requestName = null;

                for(var i = 0; i < requestSize; i++){
                    requestName = requestNames[i];

                    if(!requestName){
                        continue;
                    }

                    requestParams[requestName] = node.attr("data-request-" + requestName);
                }
                node.addClass("loading");

                Logic.requestMore(requestParams, node, {
                    "pageKey": requestPageKey,
                    "api": requestAPIURL,
                    "command": requestRenderName,
                    "showLoading": requestShowLoading,
                    "loadingText": requestLoadingText,
                    "paths": requestDataListPath
                });
            }
        }
    };

    var DatasetTemplateEngine = null;

    var Logic = {
        requestMore: function(params, moreNode, requestExtra){
            var _command = {
                "request": {
                    "dataset": {}
                }
            };

            _command["request"]["dataset"][requestExtra.command] = {
                "url": requestExtra.api,
                "data": "${data}"
            };

            var param = {
                "data": Request.stringify(params)
            };

            CMD.injectCommands(_command);

            CMD.exec("request.dataset." + requestExtra.command, param, {
                "context": {
                    "showLoading": requestExtra.showLoading,
                    "loadingText": requestExtra.loadingText,
                    "params": params,
                    "moreNode": moreNode,
                    "requestExtra": requestExtra
                },
                "complete": function(xhr, status){
                    var moreNode = this.moreNode;

                    moreNode.removeClass("loading");
                },
                "success": function(data, status, xhr){
                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            var extra = ctx.requestExtra;

                            var paths = extra.paths;
                            // var dataList = resp.dataList || [];
                            var dataList = oPaths.find(resp, paths) || [];
                            var size = dataList.length;

                            var render = $("#render_" + extra.command);
                            var moreNode = ctx.moreNode;

                            var reqParams = ctx.params;

                            var respParams = resp.param || {};
                            var pageSize = Number(respParams.pageSize || "10");

                            if(size == 0){
                                moreNode.addClass("hide");
                                return;
                            }

                            if(size < pageSize){
                                moreNode.addClass("hide");
                            }else{
                                moreNode.removeClass("hide");
                            }

                            moreNode.attr("data-request-" + extra.pageKey, Number(reqParams[extra.pageKey]) + 1);

                            DatasetTemplateEngine.render(false, "tpl_" + extra.command, dataList, {
                                callback: function(ret){
                                    this.append(ret.result);
                                },
                                "context": render
                            });
                        }
                    }, {
                        tips: false,
                        handle: {
                            callback: function(ctx, code, msg, resp){
                                Toast.text(msg || "加载失败", Toast.MIDDLE_CENTER, 3000);
                            }
                        }
                    });
                },
                error: function(xhr, errorType, error){
                    var err = CMD.RequestStatus[errorType];

                    Toast.text(err.text, Toast.MIDDLE_CENTER, 3000);
                }
            });
        },
        init: function(){
            Util.source(SESchema);

            DatasetTemplateEngine = TemplateEngine.getTemplate("tpl_dataset", {
                start: "<~",
                close: "~>",
                root: "ds"
            });
        }
    };

    var Bridge = {
        plugin: null,
        connect: function(target){
            Bridge.plugin = target;

            var expando = target.expando;

            ErrorTypes      = expando["errors"];
            RespTypes       = expando["types"];
            Request         = expando["request"];
            ResponseProxy   = expando["response"];
            DataCache       = expando["cache"];
            CMD             = expando["cmd"];
            Util            = expando["util"];
            DataType        = expando["typeof"];
            TemplateEngine  = expando["template"];
            Persistent      = expando["persistent"];
            Session         = expando["session"];
            Toast           = expando["toast"];

            //业务初始化入口
            Logic.init();
        }
    };

    module.exports = {
        "version": "R18B0322",
        "connect": Bridge.connect
    }
});