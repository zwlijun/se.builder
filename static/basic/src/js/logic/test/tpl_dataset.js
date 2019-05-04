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
             *         "pageStyle"      : [Optional] String 翻页方式，[loadmore|pagebar|autoload]，默认为pagebar,
             *         "autoload"       : [Optional] String 自动加载回调处理，如果为autoload模式必传
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
             *         "pageStyle"      : [Optional] String 翻页方式，[loadmore|pagebar|autoload]，默认为pagebar,
             *         "autoload"       : [Optional] String 自动加载回调处理，如果为autoload模式必传
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
            },
            /**
             * 加载更多数据(自动加载)
             * @param  {String} name [request name]
             * @param  {String} lazyLoadName [lazyloader 实例名]
             * @param  {Object} node    [jQuery/zepto节点对象，或null]
             * @return {[type]}      [description]
             * 示例
             * se://dataset/auto#requestName
             * DOM配置示例
             * data-lazysrc="schema@se://dataset/auto#newslist"
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
             *         "pageStyle"      : [Optional] String 翻页方式，[loadmore|pagebar|autoload]，默认为pagebar,
             *         "autoload"       : [Required] String 自动加载回调处理，如果为autoload模式必传
             *         "page"           : [Optional] Number 初始页面
             *     }
             * }
             */
            auto: function(name, lazyLoadName, node){
                var request = SEApp.DataSetUtil.getRequestAutoLoadConf(name);
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
        lazyLoader: null,
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
                        if("loadmore" === req.pageStyle || "autoload" === req.pageStyle){
                            triggerNode.removeClass("loading");
                        }
                    }
                },
                "success": function(data, status, xhr){
                    SEApp.ResponseProxy.json(this, SEApp.DataSetUtil.dataTransform(data), {
                        "callback": function(ctx, resp, msg){
                            var _data = resp || {};
                            var extra = ctx.request;
                            var paths = extra.paths;
                            // var dataList = resp.dataList || [];
                            var dataList = SEApp.ObjectPath.find(_data, paths) || [];
                            var size = dataList.length;

                            var render = $("#render_" + extra.name);
                            var triggerNode = ctx.triggerNode;
                            var nodataNode = render.siblings(".dataset-nodata");

                            var reqParams = extra.params;

                            var respParams = resp.param || {};
                            var currenPage = Number(SEApp.ObjectPath.find(reqParams, extra.pageKey, "-") || 1);
                            var pageSize = Number(respParams.pageSize || extra.pageSize || "10");

                            if(nodataNode.length > 0){
                                if(currenPage === extra.startPage && size == 0){
                                    nodataNode.removeClass("hide");
                                }else{
                                    nodataNode.addClass("hide");
                                }
                            }

                            if("loadmore" === extra.pageStyle || "autoload" === extra.pageStyle){
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
                            }else if("pagebar" === extra.pageStyle){
                                var pb = PageBar.createPageBar(extra.name);

                                pb.options({
                                    "className": "flexbox middle center",
                                    "nextPage": SEApp.conf("nextPage"),
                                    "prevPage": SEApp.conf("prevPage")
                                });
                                pb.setGotoHandler({
                                    callback: function(name, oo, rs, ps){
                                        var _this = this;
                                        var str = _this.output(rs, ps);

                                        if(oo.parents(".dataset").find(".dataset-pagebar").length > 0){
                                            oo.parents(".dataset").find(".dataset-pagebar").replaceWith(str);
                                        }else{
                                            oo.parents(".dataset").append(str);
                                        }

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

                                if(render.parents(".dataset").find(".dataset-pagebar").length > 0){
                                    render.parents(".dataset").find(".dataset-pagebar").replaceWith(str);
                                }else{
                                    render.parents(".dataset").append(str);
                                }
                            }

                            DatasetTemplateEngine.render(false, "tpl_" + extra.name, true === extra.rootRender ? _data : dataList, {
                                callback: function(ret, page, req, _node){
                                    var start = req.startPage;
                                    var external = req.external;
                                    var dataRendering = req.dataRendering;
                                    var pageStyle = req.pageStyle;

                                    if(page === start || "replace" === dataRendering){
                                        this.html(ret.result);
                                    }else{
                                        this.append(ret.result);
                                    }

                                    if("autoload" === pageStyle){
                                        _node.attr("data-lazysrc", req.autoload);
                                        Logic.lazyLoader && Logic.lazyLoader.filter();
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

            Logic.lazyLoader = SEApp.LazyLoader.newInstance("dataset_autoload");
            Logic.lazyLoader.options({
                "threshold": [0.0]
            }).watch().filter()
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