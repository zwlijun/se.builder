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
        /**
         * 数据集
         */
        "dataset": {
            /**
             * 加载更多数据(数据分页)
             * @param  {String} data [参数]
             * @param  {Object} node [jQuery/zepto节点对象，或null]
             * @param  {Event}  e    [事件对象，或null]
             * @param  {String} type [事件类型]
             * @return {[type]}      [description]
             * 示例
             * se://dataset/more#requestName
             * DOM配置示例
             * data-action-tap="se://dataset/more#newslist"
             * data-request-* 请求参数
             * @requests配置项示例
             * "requests": {
             *     "requestName": {
             *         "names"      : [Required] Array 请求参数列表
             *         "pageKey"    : [Required] String 页码参数名
             *         "url"        : [Required] String 数据请求接口
             *         "paths"      : [Required] String 基于返回对象时的数据列表对象的路径
             *         "params"     : [AutoFix] Object 会根据 names 和 data-request-* 填充，不需要传
             *         "external"   : [Optional] String 虚拟schema回调地址
             *         "startPage"  : [Optional] Number 启始页面码
             *         "pageSize"   : [Optional] Number 每页加载的数据数
             *         "name"       : [AutoFix] String requestName
             *         "showLoading": [Optional] Boolean 是否显示loading
             *         "loadingText": [Optional] String loading显示的文案
             *     }
             * }
             */
            more: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];

                var plugin = Bridge.plugin;
                var requests = plugin.conf("requests") || {};
                var request = $.extend({}, {
                    "names": [],
                    "pageKey": "page",
                    "params": {},
                    "url": "/datalist",
                    "paths": "dataList",
                    /* 以下是可选项 */
                    "external": null,
                    "startPage": 1,
                    "pageSize": 10,
                    "name": name,
                    "showLoading": false,
                    "loadingText": "处理中，请稍候..."
                }, requests[name]);

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

    //数据模板引擎
    var DatasetTemplateEngine = null;

    /**
     * 业务处理
     * @type {Object}
     */
    var Logic = {
        /**
         * 请求数据
         * @param  {Object} request  [请求配置]
         * @param  {Node}   moreNode [触发的节点]
         * @return {[type]}          [description]
         */
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
                                callback: function(ret, page, start, external){
                                    if(page === start){
                                        this.html(ret.result);
                                    }else{
                                        this.append(ret.result);
                                    }

                                    if(external){
                                        Util.requestExternal(external, [page]);
                                    }
                                },
                                "args": [currenPage, extra.startPage, extra.external],
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
        /**
         * 初始化，业务文件加载时会自动调用
         * @return {[type]} [description]
         */
        init: function(){
            Util.source(SESchema);

            //初始化数据模板引擎
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