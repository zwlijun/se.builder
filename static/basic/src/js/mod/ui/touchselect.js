/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * TouchSelect模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2017.6
 */
;define(function TouchSelect(require, exports, module){
    var Util            = require("mod/se/util");
    var ActionSheet     = require("mod/ui/actionsheet");
    var DataType        = require("mod/se/datatype");
    var TemplateEngine  = require("mod/se/template");
    var CMD             = require("mod/se/cmd");
    var Style           = require("mod/se/css");
    var Listener        = require("mod/se/listener");
    var HandleStack     = Listener.HandleStack; 

    var TouchSelectTemplate = TemplateEngine.getTemplate("mod_touchselect", {
        "root": "ts"
    });

    var __SUPPORT_TOUCH = ("ontouchstart" in window);

    var __START_EVENT_PREFIX = __SUPPORT_TOUCH ? "touchstart.touchselect" : "mousedown.touchselect";
    var __END_EVENT_PREFIX   = __SUPPORT_TOUCH ? "touchend.touchselect"   : "mouseup.touchselect";
    var __MOVE_EVENT_PREFIX  = __SUPPORT_TOUCH ? "touchmove.touchselect"  : "mousemove.touchselect"; 

    var _HTML_STRING = ''
                     + '<div class="mod-actionsheet mod-actionsheet-mask exit" data-actionsheet="<%=ts.name%>"></div>'
                     + '<div class="mod-actionsheet mod-actionsheet-panel exit touchselect <%=ts.type%> <%=ts.skin%>" data-actionsheet="<%=ts.name%>">'
                     + '  <h1 class="flexbox middle justify touchselect-header">'
                     + '    <var class="touchselect-cancel" data-action-<%=ts.action%>="ts://cancel#<%=ts.name%>"><%=ts.labels.cancel%></var>'
                     + '    <span class="touchselect-title ellipsis"><%=ts.title%></span>'
                     + '    <var class="touchselect-confirm" data-action-<%=ts.action%>="ts://confirm#<%=ts.name%>"><%=ts.labels.confirm%></var>'
                     + '  </h1>'
                     + '  <div class="touchselect-box flexbox top center">'
                     + '    <%=ts.columns%>'
                     + '  </div>'
                     + '</div>'
                     + '';
    var _HTML_DATA = ''
                   + '<div class="flexbox top center touchselect-column column<%=ts.index%>" data-column="<%=ts.index%>">'
                   + '  <div class="touchselect-items">'
                   + '    <%'
                   + '    var offset = 0;'
                   + '    if(ts.label){'
                   + '        offset = 1;'
                   + '        ts.setSelectedOption(ts.name, ts.index, 0, ts.label);'
                   + '    %>'
                   + '    <div class="touchselect-item ellipsis" data-index="0" data-value="<%=ts.label.value%>" data-linkedvalue=""><%=ts.label.text%></div>'
                   + '    <%}%>'
                   + '    <%'
                   + '    var options = ts.options;'
                   + '    var size = options.length;'
                   + '    var option = null;'
                   + '    var cls = "";'
                   + '    var defaultOption = ts.defaultOption;'
                   + '    var firstOption = null;'
                   + '    for(var i = 0; i < ts.options.length; i++){'
                   + '    option = options[i];'
                   + '    if(0 === i){firstOption = option;}'
                   + '    if(defaultOption && (String(defaultOption.value) === String(option.value))){'
                   + '        cls = " selected";'
                   + '        ts.setSelectedOption(ts.name, ts.index, i + offset, option);'
                   + '    }'
                   + '    %>'
                   + '    <div class="touchselect-item ellipsis" '
                   + '         data-index="<%=i + offset%>" '
                   + '         data-value="<%=option.value%>" '
                   + '         data-linkedvalue="<%=option.linkedvalue%>" '
                   + '         data-external="<%=option.external%>"><%=option.text%></div>'
                   + '    <%}%>'
                   + '    <%'
                   + '    if(!ts.label && "" == cls){'
                   + '        ts.setSelectedOption(ts.name, ts.index, offset, firstOption);'
                   + '    }'
                   + '    %>'
                   + '  </div>'
                   + '</div>'
                   + '';
    var _HTML_SELECTED = '<div class="touchselect-selected-line"></div>';
    
    var TouchSelectSchema = {
        schema: "ts",
        "callout": function(data, node, e, type){
            var args = (data || "").split(",");
            var name = args[0];

            Util.requestExternal("actionsheet://show#" + name, [node, e, type]);

            var ts = TouchSelect.getTouchSelect(name);
            if(ts){
                ts.exec("callout", [name]);
            }
        },
        "cancel": function(data, node, e, type){
            var args = (data || "").split(",");
            var name = args[0];

            Util.requestExternal("actionsheet://hide#" + name, [node, e, type]);

            var ts = TouchSelect.getTouchSelect(name);
            if(ts){
                ts.exec("cancel", [name]);
            }
        },
        "confirm": function(data, node, e, type){
            var args = (data || "").split(",");
            var name = args[0];

            Util.requestExternal("actionsheet://hide#" + name, [node, e, type]);

            var ts = TouchSelect.getTouchSelect(name);
            if(ts){
                ts.exec("confirm", [name]);
            }
        }
    };

    var GetDefaultOptions = function(){
        var opts = {
            "name": "se_touchselect",
            "type": "default",
            "callout": "body",
            "action": "tap",
            "title": "",
            "skin": "",
            "labels": {
                "cancel": "取消",
                "confirm": "确定"
            },
            "data": {
                "linked": false,
                "dynamic": false,
                "list": [
                    // {
                    //     "label": {"value": "", "text": "请选择"},
                    //     "options": [
                    //         {"value": "", "text": "", "linkedvalue": "", "external": ""}
                    //     ]
                    // }
                ]
            },
            "defaultOptions": [] //默认选择的值，对应data的数据组长度
        };

        return opts;
    };

    var TouchSelect = function(){
        this.opts = GetDefaultOptions();

        this.selectedOptions = [
            // {
            //     "index": 0,
            //     "value": "",
            //     "text": "",
            //     "linkedvalue": ""
            // }
        ];
        this.actionSheet = null;

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            oncallout: null, //[name]
            onchange: null, //[name, columnIndex]
            oncancel: null, //[name]
            onconfirm: null, //[name]
            onselected: null, //[name, columnIndex]
            onchangebefore: null //[name, columnIndex]
        }, this.handleStack);
    };

    TouchSelect.prototype = {
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listener.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listener.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listener.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listener.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listener.clear();
        },
        getHandleStack : function(){
            return this.handleStack;
        },
        options: function(){
            var args = arguments;
            var size = args.length;
            var opts = this.opts;

            if(0 === size){
                return opts;
            }else if(1 === size){
                if(DataType.isObject(args[0])){
                    this.opts = $.extend(true, {}, opts, args[0]);
                }else{
                    return opts[args[0]];
                }
            }else if(2 === size){
                var key = args[0];
                var value = args[1];

                if(key in opts){
                    if(DataType.isObject(value)){
                        this.opts[key] = $.extend({}, opts[key], value);
                    }else{
                        this.opts[key] = value;
                    }
                }
            }
        },
        getTouchSelectName: function(){
            return this.options("name");
        },
        getTouchSelectMask: function(){
            var name = this.getTouchSelectName();

            return $('[data-actionsheet="' + name + '"].mod-actionsheet-mask');
        },
        getTouchSelectPanel: function(){
            var name = this.getTouchSelectName();

            return $('[data-actionsheet="' + name + '"].mod-actionsheet-panel');
        },
        getTouchSelectBox: function(){
            var panel = this.getTouchSelectPanel();

            return panel.find(".touchselect-box");
        },
        getTouchSelectColumns: function(){
            var box = this.getTouchSelectBox();

            return box.find(".touchselect-column");
        },
        getTouchSelectColumn: function(index){
            var columns = this.getTouchSelectColumns();
            var size = columns.length;

            if(index < 0){
                index = 0;
            }else if(index >= size){
                index = size - 1;
            }

            return $(columns.get(index));
        },
        getTouchSelectColumnWrapper: function(index){
            var column = this.getTouchSelectColumn(index);

            return column.find(".touchselect-items");
        },
        getTouchSelectColumnWrapperItems: function(index){
            var wrapper = this.getTouchSelectColumnWrapper(index);

            return wrapper.find(".touchselect-item");
        },
        getTouchSelectSelectedLine: function(){
            var box = this.getTouchSelectBox();

            return box.find(".touchselect-selected-line");
        },
        existed: function(){
            var panel = this.getTouchSelectPanel();

            return panel.length > 0;
        },
        initSelectedOptions: function(size){
            this.selectedOptions.length = 0;
            this.selectedOptions = null;
            this.selectedOptions = new Array(size);
        },
        getSelectedOptions: function(){
            return [].concat(this.selectedOptions);
        },
        setSelectedOption: function(columnIndex, selectedIndex, option){
            var data = this.options("data");
            var list = data.list;
            var selected = list[columnIndex];
            var label = selected.label;
            var options = selected.options;
            var size = options.length;

            this.selectedOptions[columnIndex] = {
                "columnIndex": columnIndex,
                "selectedIndex": selectedIndex,
                "size": size,
                "hasLabel": !!label,
                "value": option.value,
                "text": option.text,
                "linkedvalue": option.linkedvalue,
                "external": option.external,
                "linked": data.linked,
                "dynamic": data.dynamic
            };
        },
        getSelectedOption: function(columnIndex){
            var options = this.getSelectedOptions();

            return options[columnIndex] || null;
        },
        filterColumnItems: function(index, options){
            var prevIndex = index - 1;

            if(prevIndex < 0){
                return options;
            }

            var selectedOption = this.getSelectedOption(prevIndex);
            var newOptions = [];
            var size = options.length;
            var option = null;
            var selectedValue = selectedOption ? selectedOption.value : "";

            if(!selectedOption){
                return newOptions;
            }

            for(var i = 0; i < size; i++){
                option = options[i];

                if(selectedValue === option.linkedvalue){
                    newOptions.push(option);
                }
            }

            return newOptions;
        },
        writeColumn: function(index, linked, label, options, defaultOptions){
            var defaultOption = (defaultOptions || [])[index] || null;

            if(true === linked){
                options = this.filterColumnItems(index, options);
            }

            var metaData = {
                "name": this.getTouchSelectName(),
                "index": index,
                "label": label,
                "defaultOption": defaultOption,
                "options": options,
                "setSelectedOption": function(name, index, selectedIndex, option){
                    if(!option){
                        return ;
                    }
                    var ts = TouchSelect.getTouchSelect(name);
                    ts.setSelectedOption(index, selectedIndex, option);
                }
            };

            return TouchSelectTemplate.render(true, _HTML_DATA, metaData, {
                callback: function(ret){
                    return ret.result;
                },
                context: this
            }).local;
        },
        writeColumns: function(linked, dataList, defaultOptions){
            var size = dataList.length;

            if(0 === size){
                return _HTML_SELECTED;
            }

            var data = null;
            var label = null;
            var options = null;

            // {
            //     "label": {"value": "", "text": "请选择"},
            //     "options": [
            //         {"value": "", "text": "", "linkedvalue": ""}
            //     ]
            // }

            var columns = [];
            this.initSelectedOptions(size);

            for(var i = 0; i < size; i++){
                data = dataList[i];

                label = data.label;
                options = data.options;

                columns.push(this.writeColumn(i, linked, label, options, defaultOptions))
            }

            columns.push(_HTML_SELECTED);

            return columns.join("");
        },
        renderColumns: function(){
            var data = this.options("data");
            var defaultOptions = this.options("defaultOptions");

            var linked = data.linked;
            var dataList = data.list;
            
            return this.writeColumns(linked, dataList, defaultOptions);
        },
        replaceColumns: function(onlySelf, startColumnIndex, linked, dataList, defaultOptions){
            var size = dataList.length;
            var data = null;
            var label = null;
            var options = null;

            // {
            //     "label": {"value": "", "text": "请选择"},
            //     "options": [
            //         {"value": "", "text": "", "linkedvalue": ""}
            //     ]
            // }

            var columns = [];

            for(var i = 0; i < size; i++){
                data = dataList[i];

                label = data.label;
                options = data.options;

                columns.push(this.writeColumn(i, linked, label, options, defaultOptions))
            }

            var columnNode = null;

            if(true === onlySelf){
                columnNode = this.getTouchSelectColumn(startColumnIndex);
                columnNode.replaceWith(columns[startColumnIndex]);
            }else{
                for(var i = startColumnIndex; i < size; i++){
                    columnNode = this.getTouchSelectColumn(i);

                    columnNode.replaceWith(columns[i]);
                }
            }
        },
        update: function(startColumnIndex, onlySelf){
            var data = this.options("data");
            var defaultOptions = this.options("defaultOptions");

            var linked = data.linked;
            var dataList = data.list;

            this.replaceColumns(onlySelf, startColumnIndex, linked, dataList, defaultOptions);
            this.scrollToSelected(startColumnIndex);
            this.bindEvents();
        },
        callout: function(){
            var name = this.getTouchSelectName();

            ActionSheet.show(name);
            this.exec("callout", [name]);
        },
        cancel: function(){
            var name = this.getTouchSelectName();

            ActionSheet.hide();
            ts.exec("cancel", [name]);
            
        },
        confirm: function(){
            var name = this.getTouchSelectName();

            ActionSheet.hide();
            ts.exec("confirm", [name]);
        },
        render: function(visible){
            var data = this.options("data");
            var dataList = data.list;

            this.initSelectedOptions(dataList.length);
            this.actionSheet = ActionSheet.createActionSheet(this.getTouchSelectName());

            this.actionSheet.set("show", {
                callback: function(name){
                    $(document).on("touchmove." + name, function(e){
                        e.preventDefault();
                    });
                },
                args: []
            });

            this.actionSheet.set("hide", {
                callback: function(name){
                    $(document).off("touchmove." + name);
                },
                args: []
            });

            if(this.existed()){
                var box = this.getTouchSelectBox();

                box.html(this.renderColumns());

                this.scrollToSelected();
                this.bindEvents();

                if(true === visible){
                    this.callout();
                }
            }else{
                var metaData = {
                    "name": this.getTouchSelectName(),
                    "type": this.options("type"),
                    "action": this.options("action"),
                    "title": this.options("title"),
                    "skin": this.options("skin") || "",
                    "labels": this.options("labels"),
                    "columns": this.renderColumns()
                };
                TouchSelectTemplate.render(true, _HTML_STRING, metaData, {
                    callback: function(ret){
                        $("body").append(ret.result);

                        var callout = this.options("callout");
                        var action = this.options("action");

                        $(callout).attr("data-action-" + action, "ts://callout#" + this.getTouchSelectName());

                        this.scrollToSelected();
                        this.bindEvents();

                        if(true === visible){
                            this.callout();
                        }
                    },
                    context: this
                });
            }
        },
        updateColumnData: function(columnIndex, newData){
            var data = this.options("data");

            data.list[columnIndex] = newData;

            this.options("data", data);
        },
        updateColumnDataOptions: function(columnIndex, newDataList){
            var data = this.options("data");

            data.list[columnIndex].options = newDataList;

            this.options("data", data);
        },
        scrollToSelected: function(startColumnIndex){
            var startIndex = startColumnIndex || 0;
            var selectedOptions = this.getSelectedOptions();
            var size = selectedOptions.length;

            for(var i = startIndex; i < size; i++){
                this.scrollTo(selectedOptions[i], true);
            }
        },
        scrollTo: function(option, isChanged){
            if(!option){
                return ;
            }
            // columnIndex
            // selectedIndex
            // value
            // text
            // linkedvalue
            var line = this.getTouchSelectSelectedLine();
            var box = this.getTouchSelectBox();
            var wrapper = this.getTouchSelectColumnWrapper(option.columnIndex);
            var items = this.getTouchSelectColumnWrapperItems(option.columnIndex);
            var size = items.length;
            var even = size % 2 == 0;
            var selected = items.get(option.selectedIndex);
            var node = $(selected);

            var boxRect = Util.getBoundingClientRect(box[0]);
            var lineRect = Util.getBoundingClientRect(line[0]);
            var itemRect = Util.getBoundingClientRect(selected);

            items.removeClass("selected");
            node.addClass("selected");

            var height = itemRect.height;
            var start = lineRect.top - boxRect.top;
            var y = start - option.selectedIndex * height;

            var matrix = "matrix(1, 0, 0, 1, 0, " + y + ")";

            wrapper.attr("data-position", y)
                   .attr("data-itemHeight", itemRect.height)
                   .attr("data-selectedIndex", option.selectedIndex);
            Style.css(wrapper, "transform", matrix);

            // console.warn("isChanged", isChanged, option.external, option)

            if(isChanged){
                if(option.external){
                    Util.requestExternal(option.external, [option])
                }

                this.exec("change", [this.getTouchSelectName(), option.columnIndex]);
            }
        },
        removeEvents: function(){
            var columns = this.getTouchSelectColumns();
            var name = this.getTouchSelectName();

            columns.off(__START_EVENT_PREFIX + "_" + name);

            this.removeDocumentEvents();
        },
        removeDocumentEvents: function(){
            var name = this.getTouchSelectName();

            $(document).off(__MOVE_EVENT_PREFIX + "_" + name)
                       .off(__END_EVENT_PREFIX + "_" + name);
        },
        bindEvents: function(){
            var columns = this.getTouchSelectColumns();
            var name = this.getTouchSelectName();

            var data = {
                "touchselect": this,
            };

            this.removeEvents();
            columns.on(__START_EVENT_PREFIX + "_" + name, "", data, this.touchStart);
        },
        touchStart: function(e){
            var pointer = (function(e){
                if(window.jQuery && (e instanceof jQuery.Event)){
                    e = e.originalEvent;
                }
                return ("changedTouches" in e) ? e.changedTouches[0] : e
            })(e);
            var now = Util.getTime();
            var data = e.data;
            var ts = data.touchselect;
            var name = ts.getTouchSelectName();
            var columnIndex = Number($(e.currentTarget).attr("data-column"));

            var _data = {
                "touchselect": ts,
                "columnIndex": columnIndex
            };

            TouchSelect.TouchEvent.lastPosition = pointer.pageY;
            TouchSelect.TouchEvent.startPosition = pointer.pageY;
            TouchSelect.TouchEvent.dir = 0;

            $(document).on(__MOVE_EVENT_PREFIX + "_" + name, "", _data, ts.touchMove)
                       .on(__END_EVENT_PREFIX + "_" + name, "", _data, ts.touchEnd);
        },
        touchMove: function(e){
            var pointer = (function(e){
                if(window.jQuery && (e instanceof jQuery.Event)){
                    e = e.originalEvent;
                }
                return ("changedTouches" in e) ? e.changedTouches[0] : e
            })(e);

            var data = e.data;
            var ts = data.touchselect;
            var columnIndex = data.columnIndex;

            var now = Util.getTime();

            var wrapper = ts.getTouchSelectColumnWrapper(columnIndex);
            var wrapperPosition = Number(wrapper.attr("data-position"));

            var shift = pointer.pageY - TouchSelect.TouchEvent.lastPosition;
            var moveY = shift + wrapperPosition;
            var matrix = "matrix(1, 0, 0, 1, 0, " + moveY + ")";

            TouchSelect.TouchEvent.dir = shift < 0 ? 1 : (shift > 0 ? -1 : 0);
            
            Style.css(wrapper, "transform", matrix);
        },
        touchEnd: function(e){
            var pointer = (function(e){
                if(window.jQuery && (e instanceof jQuery.Event)){
                    e = e.originalEvent;
                }
                return ("changedTouches" in e) ? e.changedTouches[0] : e
            })(e);

            var data = e.data;
            var ts = data.touchselect;
            var columnIndex = data.columnIndex;

            var now = Util.getTime();

            var wrapper = ts.getTouchSelectColumnWrapper(columnIndex);
            var wrapperPosition = Number(wrapper.attr("data-position"));
            var itemHeight = Number(wrapper.attr("data-itemHeight"));
            var selectedIndex = Number(wrapper.attr("data-selectedIndex"));
            var items = ts.getTouchSelectColumnWrapperItems(columnIndex);
            var size = items.length;

            var shift = pointer.pageY - TouchSelect.TouchEvent.lastPosition;
            var moveY = shift + wrapperPosition;

            var absShift = Math.abs(shift);
            var scrolling = Math.round(absShift / itemHeight);
            var targetIndex = shift < 0 ? selectedIndex + scrolling : selectedIndex - scrolling;
            
            targetIndex = targetIndex < 0 ? 0 : (targetIndex >= size ? size - 1 : targetIndex);
            
            var target = $(items.get(targetIndex));
            var option = {
                "index": Number(target.attr("data-index")),
                "value": target.attr("data-value"),
                "linkedvalue": target.attr("data-linkedvalue") || "",
                "text": target.html(),
                "external": target.attr("data-external") || ""
            };

            var prevSelectedOption = ts.getSelectedOption(columnIndex);
            var isChanged = (prevSelectedOption && prevSelectedOption.selectedIndex !== targetIndex);

            ts.exec("changebefore", [ts.getTouchSelectName(), columnIndex]);

            ts.setSelectedOption(columnIndex, targetIndex, option);
            ts.scrollTo(ts.getSelectedOption(columnIndex), isChanged);

            if(isChanged && ts.options("data").linked){
                ts.options("defaultOptions", ts.getSelectedOptions());

                ts.update(columnIndex + 1, false);
                // if(0 === columnIndex){
                //     ts.render();
                // }else{
                //     ts.update(columnIndex + 1);
                // }
            }

            ts.exec("selected", [ts.getTouchSelectName(), columnIndex]);

            ts.removeDocumentEvents();
        },
        destory: function(){
            var mask = this.getTouchSelectMask();
            var panel = this.getTouchSelectPanel();

            this.removeEvents();

            mask.remove();
            panel.remove();
        }
    };

    TouchSelect.TouchEvent = {
        "startPosition": 0,
        "lastPosition": 0,
        "dir": 0
    };

    TouchSelect.Cache = {};

    TouchSelect.newTouchSelect = function(name){
        var ts = (TouchSelect.Cache[name] || (TouchSelect.Cache[name] = new TouchSelect()));

        var _public = {
            exec: function(type, args){
                return ts.exec(type, args);
            },
            remove: function(type){
                ts.remove(type);

                return this;
            },
            get: function(type){
                return ts.get(type);
            },
            clear: function(){
                ts.clear();

                return this;
            },
            set: function(type, option){
                ts.set(type, option);

                return this;
            },
            getHandleStack: function(){
                return ts.getHandleStack();
            },
            options: function(){
                return ts.options.apply(ts, arguments);
            },
            getTouchSelectName: function(){
                return ts.getTouchSelectName();
            },
            getTouchSelectMask: function(){
                return ts.getTouchSelectMask();
            },
            getTouchSelectPanel: function(){
                return ts.getTouchSelectPanel();
            },
            getTouchSelectBox: function(){
                return ts.getTouchSelectBox();
            },
            getTouchSelectColumns: function(){
                return ts.getTouchSelectColumns();
            },
            getTouchSelectColumn: function(index){
                return ts.getTouchSelectColumn(index);
            },
            getTouchSelectColumnWrapper: function(index){
                return ts.getTouchSelectColumnWrapper(index);
            },
            getTouchSelectColumnWrapperItems: function(index){
                return ts.getTouchSelectColumnWrapperItems(index);
            },
            getTouchSelectSelectedLine: function(){
                return ts.getTouchSelectSelectedLine();
            },
            getSelectedOptions: function(){
                return ts.getSelectedOptions();
            },
            setSelectedOption: function(columnIndex, selectedIndex, option){
                return ts.setSelectedOption(columnIndex, selectedIndex, option);
            },
            getSelectedOption: function(columnIndex){
                return ts.getSelectedOption(columnIndex);
            },
            render: function(visible){
                ts.render(visible);

                return this;
            },
            callout: function(){
                ts.callout();

                return this;
            },
            cancel: function(){
                ts.cancel();

                return this;
            },
            confirm: function(){
                ts.confirm();

                return this;
            },
            update: function(columnIndex, onlySelf){
                ts.update(columnIndex, onlySelf);

                return this;
            },
            updateColumnData: function(columnIndex, data){
                ts.updateColumnData(columnIndex, data);

                return this;
            },
            updateColumnDataOptions: function(columnIndex, dataList){
                ts.updateColumnDataOptions(columnIndex, dataList);

                return this;
            },
            destory: function(){
                ts.destory();

                return this;
            }
        };

        return _public;
    };

    TouchSelect.getTouchSelect = function(name){
        if(name in TouchSelect.Cache){
            return TouchSelect.newTouchSelect(name);
        }

        return null;
    };

    (function(){
        Util.source(TouchSelectSchema);
    })();

    module.exports = {
        "version": "R17B0817",
        newTouchSelect: function(name){
            return TouchSelect.newTouchSelect(name);
        },
        getTouchSelect: function(name){
            return TouchSelect.getTouchSelect(name);
        }
    }
});