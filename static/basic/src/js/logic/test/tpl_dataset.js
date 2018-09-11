;define(function(require, exports, module){
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
             *         "names"          : [Required] Array 请求参数列表
             *         "pageKey"        : [Required] String 页码参数名
             *         "url"            : [Required] String 数据请求接口
             *         "paths"          : [Required] String 基于返回对象时的数据列表对象的路径
             *         "params"         : [AutoFix] Object 会根据 names 和 data-request-* 填充，不需要传
             *         "external"       : [Optional] String 虚拟schema回调地址
             *         "startPage"      : [Optional] Number 启始页面码
             *         "pageSize"       : [Optional] Number 每页加载的数据数
             *         "name"           : [AutoFix] String requestName
             *         "showLoading"    : [Optional] Boolean 是否显示loading
             *         "loadingText"    : [Optional] String loading显示的文案
             *         "dataRendering"  : [Optional] String 数据渲染方式，[append|replace]，默认为append
             *         "pageStyle"      : [Optional] String 翻页方式，[loadmore|pagebar|pulldown]，默认为pagebar,
             *         "page"           : [Optional] Number 初始页面
             *     }
             * }
             */
            more: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];
                var request = SEApp.DataSetUtil.getRequestMoreConf(name);

                var requestName = null;
                for(var i = 0; i < request.names.length; i++){
                    requestName = request.names[i];

                    if(!requestName){
                        continue;
                    }

                    request.params = SEApp.Util.createObject(request.params, requestName.split("-"), node.attr("data-request-" + requestName));
                }
                node.addClass("loading");

                Logic.requestMore(request, node);
            },
            /**
             * 加载更多数据(数据分页)
             * @param  {String} data [参数]
             * @param  {Object} node [jQuery/zepto节点对象，或null]
             * @param  {Event}  e    [事件对象，或null]
             * @param  {String} type [事件类型]
             * @return {[type]}      [description]
             * 示例
             * se://dataset/page#requestName
             * DOM配置示例
             * data-action-tap="se://dataset/page#newslist"
             * data-request-* 请求参数
             * @requests配置项示例
             * "requests": {
             *     "requestName": {
             *         "names"          : [Required] Array 请求参数列表
             *         "pageKey"        : [Required] String 页码参数名
             *         "url"            : [Required] String 数据请求接口
             *         "paths"          : [Required] String 基于返回对象时的数据列表对象的路径
             *         "params"         : [AutoFix] Object 会根据 names 和 data-request-* 填充，不需要传
             *         "external"       : [Optional] String 虚拟schema回调地址
             *         "startPage"      : [Optional] Number 启始页面码
             *         "pageSize"       : [Optional] Number 每页加载的数据数
             *         "name"           : [AutoFix] String requestName
             *         "showLoading"    : [Optional] Boolean 是否显示loading
             *         "loadingText"    : [Optional] String loading显示的文案
             *         "dataRendering"  : [Optional] String 数据渲染方式，[append|replace]，默认为append
             *         "pageStyle"      : [Optional] String 翻页方式，[loadmore|pagebar|pulldown]，默认为pagebar,
             *         "page"           : [Optional] Number 初始页面
             *     }
             * }
             */
            page: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];
                var request = SEApp.DataSetUtil.getRequestPageConf(name);

                var requestName = null;
                for(var i = 0; i < request.names.length; i++){
                    requestName = request.names[i];

                    if(!requestName){
                        continue;
                    }

                    request.params = SEApp.Util.createObject(request.params, requestName.split("-"), node.attr("data-request-" + requestName));
                }
                node.addClass("loading");

                Logic.requestMore(request, node);
            }
        }
    };

    //数据模板引擎
    var DatasetTemplateEngine = null;

    var RequestExtraData = {
        Data: {
            "test": {
                callback: function(name, page){
                    return null;
                }
            }
        },
        exec: function(name, page){
            if(name in RequestExtraData.Data){
                return SEApp.Util.execHandler(RequestExtraData.Data[name], [name, page]);
            }

            return null;
        }
    };

    /**
     * 业务处理
     * @type {Object}
     */
    var Logic = {
        /**
         * 请求数据
         * @param  {Object} request  [请求配置]
         * @param  {Node}   triggerNode [触发的节点]
         * @return {[type]}          [description]
         */
        requestMore: function(request, triggerNode){
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
                "data": SEApp.Request.stringify(request.params)
            };

            SEApp.CMD.injectCommands(_command);

            SEApp.CMD.exec("request.dataset." + request.name, param, {
                "context": {
                    "showLoading": request.showLoading === true,
                    "loadingText": request.loadingText || "处理中，请稍候...",
                    "request": request,
                    "triggerNode": triggerNode
                },
                "complete": function(xhr, status){
                    var req = this.request;
                    var triggerNode = this.triggerNode;

                    if(triggerNode){
                        if("loadmore" === req.pageStyle){
                            triggerNode.removeClass("loading");
                        }
                    }
                },
                "success": function(data, status, xhr){
                    SEApp.ResponseProxy.json(this, SEApp.DataSetUtil.dataTransform(data), {
                        "callback": function(ctx, resp, msg){
                            var extra = ctx.request;
                            var paths = extra.paths;
                            // var dataList = resp.dataList || [];
                            var dataList = SEApp.ObjectPath.find(resp, paths) || [];
                            var size = dataList.length;

                            var render = $("#render_" + extra.name);
                            var triggerNode = ctx.triggerNode;

                            var reqParams = extra.params;

                            var respParams = resp.param || {};
                            var currenPage = Number(reqParams[extra.pageKey]);
                            var pageSize = Number(respParams.pageSize || extra.pageSize || "10");

                            if("loadmore" === extra.pageStyle){
                                if(size == 0){
                                    triggerNode.addClass("hide");
                                    return;
                                }

                                if(size < pageSize){
                                    triggerNode.addClass("hide");
                                }else{
                                    triggerNode.removeClass("hide");
                                }

                                triggerNode.attr("data-request-" + extra.pageKey, currenPage + 1);
                            }

                            if("pagebar" === extra.pageStyle){
                                var pb = PageBar.createPageBar(extra.name);

                                pb.options({
                                    "className": "flexbox middle center",
                                    "nextPage": SEApp.conf("nextPage"),
                                    "prevPage": SEApp.conf("prevPage")
                                });
                                pb.setGotoHandler({
                                    callback: function(name, oo, rs, ps){
                                        var _this = this;
                                        oo.parents(".dataset").find(".dataset-pagebar").replaceWith(_this.output(rs, ps));

                                        Logic.requestMore(SEApp.DataSetUtil.getRequestPageConf(
                                            extra.name, 
                                            RequestExtraData.exec(extra.name, _this.getPage()), null)
                                        );
                                    },
                                    context: pb,
                                    args: [render, resp.recordSize, resp.pageSize]
                                });
                                pb.setFirstPage(1);

                                var str = pb.output(resp.recordSize, resp.pageSize);

                                render.parents(".dataset").find(".dataset-pagebar").replaceWith(str);
                            }

                            DatasetTemplateEngine.render(false, "tpl_" + extra.name, dataList, {
                                callback: function(ret, page, req, _node){
                                    var start = req.start;
                                    var external = req.external;
                                    var dataRendering = req.dataRendering;
                                    var pageStyle = req.pageStyle;

                                    if(page === start || "replace" === dataRendering){
                                        this.html(ret.result);
                                    }else{
                                        this.append(ret.result);
                                    }

                                    if(external){
                                        SEApp.Util.requestExternal(external, [page]);
                                    }
                                },
                                "args": [currenPage, extra, triggerNode],
                                "context": render
                            });
                        }
                    }, {
                        tips: false,
                        handle: {
                            callback: function(ctx, code, msg, resp){
                                SEApp.Toast.text(msg || "加载失败", SEApp.Toast.MIDDLE_CENTER, 3000);
                            }
                        }
                    });
                },
                error: function(xhr, errorType, error){
                    var err = SEApp.CMD.RequestStatus[errorType];

                    SEApp.Toast.text(err.text, SEApp.Toast.MIDDLE_CENTER, 3000);
                }
            });
        },
        /**
         * 初始化，业务文件加载时会自动调用
         * @return {[type]} [description]
         */
        init: function(){
            SEApp.Util.source(SESchema);

            //初始化数据模板引擎
            DatasetTemplateEngine = SEApp.TemplateEngine.getTemplate("tpl_dataset", {
                start: "<~",
                close: "~>",
                root: "ds"
            });
        }
    };

    var Bridge = {
        connect: function(target){
            //业务初始化入口
            Logic.init();
        }
    };

    module.exports = {
        "version": "R18B0322",
        "connect": Bridge.connect
    }
});