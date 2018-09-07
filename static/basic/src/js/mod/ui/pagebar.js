/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 分页栏
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.08
 */
;define(function(require, exports, module){
    var Util        = require("mod/se/util");
    var DateType    = require("mod/se/datatype");

    var PageBarSchema = {
        "schema": "pagebar",
        "goto": function(data, node, e, type){
            var args = (data || "").split(",");
            var name = args[0];
            var page = Number(args[1]);

            var pb = PageBar.getPageBar(name);

            if(pb){
                pb.setPage(page);

                Util.execHandler(pb.getGotoHandler(), [name]);
            }
        }
    };

    var GetDefaultOptions = function(){
        return {
            "className": "",
            "prefixSummary": "",
            "suffixSummary": "",
            "onlyPage": false,
            "nextPage": "下一页",
            "prevPage": "上一页"
        }
    };

    var PageBar = function(name){
        //----------------------------------------------
        this.recordSize = 0;
        this.pageSize = 20;
        this.defSize = 9;
        this.viewSize = this.defSize;
        this.radius = (this.viewSize - 1) / 2;
        this.offset = 1;
        this.totalPage = 0;
        //---------------------------------------------- 
        this.firstPage = 0;       
        this.page = 0;
        this.name = name;
        this.gotoHandler = null;
        this.opts = GetDefaultOptions();
    };

    PageBar.prototype = {
        //opts::{}
        //opts.className -> string
        //opts.prefixSummary -> string
        //opts.suffixSummary -> string
        //opts.onlyPage -> boolean
        options: function(){
            var args = arguments;
            var size = args.length;

            if(0 === size){
                return this.opts;
            }

            if(1 === size){
                if(DateType.isObject(args[0])){
                    this.opts = $.extend(true, {}, this.opts, args[0]);

                    return this;
                }
                return this.opts[args[0]];
            }

            if(2 === size){
                var tmp = args[2];
                if(DateType.isObject(args[1])){
                    tmp = $.extend(true, {}, this.opts[0], tmp);
                }

                this.opts[args[0]] = tmp;
            }

            return this;
        },
        setFirstPage: function(firstPage){
            this.firstPage = firstPage;
        },
        setPage: function(page){
            this.page = page;
        },
        getPage: function(){
            return this.page || this.firstPage;
        },
        getPageSize: function(){
            return this.pageSize;
        },
        getRecordSize: function(){
            return this.recordSize;
        },
        getTotalPage: function(){
            return this.totalPage;
        },
        setGotoHandler: function(handler){
            this.gotoHandler = handler;
        },
        getGotoHandler: function(handler){
            return this.gotoHandler;
        },
        getSelected: function(page, currentPage){
            var cls = "";
            if (page == currentPage) {
                cls = " on";
            }
            return cls;
        },
        getPageItem: function(page, index){
            return "<li class=\"page" + this.getSelected(page, index) + "\" data-action-click=\"pagebar://goto#" + this.name + "," + index + "\">" + index + "</li>";
        },
        available: function(size){
            if(size < 5){
                return false;
            }
            
            if(size % 2 == 0){
                return false;
            }
            
            return true;
        },
        getPageBarNode: function(){
            return $('[data-pagebar="' + this.name + '"].dataset-pagebar');
        },
        getPageBarItems: function(){
            var node = this.getPageBarNode();

            return node.find(".page");
        },
        setDefaultViewSize: function(size){
            this.defSize = this.available(size) ? size : defSize;
        },
        setViewSize: function(size){
            this.viewSize = this.available(size) ? size : viewSize;
            this.radius = (this.viewSize - 1) / 2;
        },
        format: function(str){
            str = str.replace(/(<page>)/gi, "<em class=\"data-page\">" + this.page + "</em>");
            str = str.replace(/(<recordsize>)/gi, "<em class=\"data-recordsize\">" + this.recordSize + "</em>");
            str = str.replace(/(<totalpage>)/gi, "<em class=\"data-totalpage\">" + this.totalPage + "</em>");
            str = str.replace(/(<pagesize>)/gi, "<em class=\"data-pagesize\">" + this.pageSize + "</em>");

            return str;
        },
        output: function(recordSize, pageSize) {
            this.recordSize = recordSize;
            this.pageSize = pageSize;
            this.totalPage = Math.ceil(this.recordSize / this.pageSize);

            var opts = this.options();
            var totalPage = this.totalPage;
            var page = this.getPage();
            var defSize = this.defSize;
            var viewSize = this.viewSize;
            var offset = this.offset;
            var radius = this.radius;


            var className = opts.className;
            var prefixSummary = opts.prefixSummary;
            var suffixSummary = opts.suffixSummary;
            var onlyPage = opts.onlyPage;

            if(totalPage <= 1){
                return "";
            }
            
            if(page <= 0){
                page = 1;
            }
            
            if(page > totalPage){
                page = totalPage;
            }
            
            if(className){
                className = " " + className;
            }

            var buf = [];

            buf.push("<div class=\"dataset-pagebar" + className + "\" data-pagebar=\"" + this.name + "\">");
            
            if(prefixSummary){
                buf.push("<cite class=\"page-summary-prefix\">" + this.format(prefixSummary) + "</cite>");
            }
            
            buf.push("<ul class=\"pagebar flexbox\">");
            
            if(!onlyPage){
                var prevPage = Math.max(page - 1, 1);
                
                buf.push("<li class=\"pre-page\" data-action-click=\"pagebar://goto#" + this.name + "," + prevPage + "\">" + opts.prevPage + "</li>");
            }
            
            if (totalPage <= defSize + 1) {
                for (var i = 1; i <= totalPage; i++) {
                    buf.push(this.getPageItem(page, i));
                }
            } else {
                if (page >= viewSize) {
                    for (var i = 1; i <= offset; i++) {
                        buf.push(this.getPageItem(page, i));
                    }
                    buf.push("<li class=\"ellipsis\">...</li>");

                    if (totalPage - defSize > 0 && totalPage - defSize <= offset) {
                        for (var i = totalPage - defSize + offset; i <= totalPage; i++) {
                            buf.push(this.getPageItem(page, i));
                        }
                    } else {
                        if (totalPage - page <= radius) {
                            for (var i = totalPage - viewSize; i <= totalPage; i++) {
                                buf.push(this.getPageItem(page, i));
                            }
                        } else {
                            for (var i = page - radius; i <= page + radius; i++) {
                                buf.push(this.getPageItem(page, i));
                            }
                            buf.push("<li class=\"ellipsis\">...</li>");
                            for (var i = totalPage; i <= totalPage; i++) {
                                buf.push(this.getPageItem(page, i));
                            }
                        }
                    }
                } else {
                    for (var i = 1; i <= viewSize; i++) {
                        buf.push(this.getPageItem(page, i));
                    }
                    buf.push("<li class=\"ellipsis\">...</li>");

                    for (var i = totalPage; i <= totalPage; i++) {
                        buf.push(this.getPageItem(page, i));
                    }
                }
            }
            
            if(!onlyPage){
                var nextPage = Math.min(page + 1, totalPage);
                
                buf.push("<li class=\"next-page\" data-action-click=\"pagebar://goto#" + this.name + "," + nextPage + "\">" + opts.nextPage + "</li>");
            }

            buf.push("</ul>");

            if(suffixSummary){
                buf.push("<cite class=\"page-summary-suffix\">" + this.format(suffixSummary) + "</cite>");
            }

            buf.push("</div>");

            return buf.join("");
        }
    };

    (function(){
        Util.source(PageBarSchema);
    })();

    PageBar.Cache = {};
    PageBar.createPageBar = function(name){
        var pb = PageBar.Cache[name] || (PageBar.Cache[name] = new PageBar(name));

        var pub = {
            "options": function(){
                return pb.options.apply(pb, Array.prototype.slice.call(arguments)) || this;
            },
            "setFirstPage": function(page){
                pb.setFirstPage(page);

                return this;
            },
            "setPage": function(page){
                pb.setPage(page);

                return this;
            },
            "getPage": function(){
                return pb.getPage();
            },
            "getPageSize": function(){
                return pb.getPageSize();
            },
            "getRecordSize": function(){
                return pb.getRecordSize();
            },
            "getTotalPage": function(){
                return pb.getTotalPage();
            },
            "setGotoHandler": function(handler){
                pb.setGotoHandler(handler);

                return this;
            },
            "getGotoHandler": function(){
                return pb.getGotoHandler();
            },
            "getPageBarNode": function(){
                return pb.getPageBarNode();
            },
            "getPageBarItems": function(){
                return pb.getPageBarItems();
            },
            "setDefaultViewSize": function(size){
                pb.setDefaultViewSize(size);

                return this;
            },
            "setViewSize": function(size){
                pb.setViewSize(size);

                return this;
            },
            "output": function(recordSize, pageSize){
                return pb.output(recordSize, pageSize);
            }
        };

        return pub;
    };
    PageBar.getPageBar = function(name){
        if(name in PageBar.Cache){
            return PageBar.createPageBar(name) || null;
        }

        return null;
    };

    module.exports = {
        "version": "R18B0808",
        "createPageBar": PageBar.createPageBar,
        "getPageBar": PageBar.getPageBar
    };
});