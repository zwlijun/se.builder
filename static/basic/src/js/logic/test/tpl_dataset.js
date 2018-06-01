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
                var name = args[0];

                var plugin = Bridge.plugin;
                var requests = plugin.conf("requests") || {};
                var request = requests[name] || {
                    "names": [],
                    "params": {},
                    "pageKey": "page",
                    "startPage": 1,
                    "pageSize": 10,
                    "url": "/datalist",
                    "name": name,
                    "paths": "dataList",
                    "showLoading": false,
                    "loadingText": "处理中，请稍候..."
                };

                var requestName = null;
                for(var i = 0; i < request.names.length; i++){
                    requestName = request.names[i];

                    if(!requestName){
                        continue;
                    }

                    request.params[requestName] = node.attr("data-request-" + requestName);
                }
                node.addClass("loading");

                Logic.requestMore(request, node);
            }
        }
    };

    var DatasetTemplateEngine = null;

    var Logic = {
        requestMore: function(request, moreNode){
            var _command = {
                "request": {
                    "dataset": {}
                }
            };

            _command["request"]["dataset"][request.name] = {
                "url": request.url,
                "data": "${data}"
            };

            var param = {
                "data": Request.stringify(request.params)
            };

            CMD.injectCommands(_command);

            CMD.exec("request.dataset." + request.name, param, {
                "context": {
                    "showLoading": request.showLoading === true,
                    "loadingText": request.loadingText || "处理中，请稍候...",
                    "request": request,
                    "moreNode": moreNode
                },
                "complete": function(xhr, status){
                    var moreNode = this.moreNode;

                    moreNode.removeClass("loading");
                },
                "success": function(data, status, xhr){
                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            var extra = ctx.request;
                            // {
                            //     "names": [],
                            //     "params": {},
                            //     "pageKey": "page",
                            //     "startPage": 1,
                            //     "pageSize": 10,
                            //     "url": "/datalist",
                            //     "name": name,
                            //     "paths": "dataList",
                            //     "showLoading": false,
                            //     "loadingText": "处理中，请稍候..."
                            // }

                            var paths = extra.paths;
                            // var dataList = resp.dataList || [];
                            var dataList = oPaths.find(resp, paths) || [];
                            var size = dataList.length;

                            var render = $("#render_" + extra.name);
                            var moreNode = ctx.moreNode;

                            var reqParams = extra.params;

                            var respParams = resp.param || {};
                            var currenPage = Number(reqParams[extra.pageKey]);
                            var pageSize = Number(respParams.pageSize || extra.pageSize || "10");

                            if(size == 0){
                                moreNode.addClass("hide");
                                return;
                            }

                            if(size < pageSize){
                                moreNode.addClass("hide");
                            }else{
                                moreNode.removeClass("hide");
                            }

                            moreNode.attr("data-request-" + extra.pageKey, currenPage + 1);

                            DatasetTemplateEngine.render(false, "tpl_" + extra.name, dataList, {
                                callback: function(ret, page, start){
                                    if(page === start){
                                        this.html(ret.result);
                                    }else{
                                        this.append(ret.result);
                                    }
                                },
                                "args": [currenPage, extra.startPage] 
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
                    var plugin = Bridge.plugin;
                    var requestStatus = plugin.conf("requestStatus") || {};

                    var err = requestStatus[errorType] || CMD.RequestStatus[errorType];

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