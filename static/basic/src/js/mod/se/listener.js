/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 监听器模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.4
 */
;define(function Listener(require, exports, module){
    /**
     * 监听
     * @param Object options 回调配置，
     *        如：new Listener({"onbefore":{Function callback, Array args, Object context, Boolean returnValue}})
     * @param Listener.HandleStack handleStack 扩展回调堆栈
     */
    var Listener = function(options, handleStack){
        this.version = "B15R0612",
        this.options = options || {};
        this.HandleStack = handleStack || null;
    };

    Listener.prototype = {
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            var key = "on" + type;
            var cfg = this.options;
            var opt = option || {};
            var callback = opt.callback || null;
            var args = opt.args || [];
            var context = opt.context || window;
            var returnValue = opt.returnValue;

            returnValue = (typeof(returnValue) == "boolean" ? returnValue : false);

            if(key in cfg){
                if(callback && (callback instanceof Function) && callback.apply){
                    this.options[key] = {
                        "callback" : callback,
                        "args" : args,
                        "context" : context,
                        "returnValue" : returnValue
                    };
                }else{
                    this.options[key] = null;
                }
            }
            
            opt = null; cfg = null;
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.options["on" + type] = null;
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            var key = "on" + type;
            var o = this.options;

            if(key in o){
                return o[key];
            }
            
            o = null;
            return null;
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            for(var key in this.options){
                if(this.options.hasOwnProperty(key)){
                    this.options[key] = null;
                }
            }
        },
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            var o = this.get(type);
            var m = args || [];
            var a = [].concat(m);
            var result = undefined;
            var handle = this.HandleStack;

            if(o && o.callback && o.callback.apply){
                a = a.concat(o.args||[]);

                if(true === o.returnValue){
                    result = o.callback.apply(o.context, a);
                }else{
                    o.callback.apply(o.context, a);
                }
            }
            m = null; a = null;

            if(handle && (type in handle.stack)){
                result = handle.exec(type, args, -1);
            }

            return result;
        }
    };

    //Listener HandleStack
    Listener.HandleStack = function(){
        this.stack = {};
    };
    Listener.HandleStack.prototype = {
        /**
         * 添加一个事件回调
         * @param Object event {String type, Object data}
         */
        add: function(event){
            var check = this.compare(event);
            var type = event.type;

            if(-2 === check){
                this.stack[type] = [];
                this.stack[type].push(event);
            }else if(-1 === check){
                this.stack[type].push(event);
            }
        },
        get: function(type, index){
            var stack = this.stack;
            var list = [];
            var size = 0;

            if(type in stack){
                list = stack[type];
                size = list.length;

                if(index >= 0 && index < size){
                    list = [list[index]];
                }
            }

            return list;
        },
        remove: function(event){
            var check = this.compare(event);

            if(check >= 0){
                this.stack[event.type].splice(check, 1);
            }
        },
        removeAll: function(type){
            if(type){
                if(type in this.stack){
                    this.stack[type] = undefined;

                    delete this.stack[type];
                }
            }else{
                this.stack = undefined;
                this.stack = {};
            }
        },
        exec: function(type, args, index){
            var list = this.get(type, index);
            var size = list.length;
            var m = args || [];
            var a = [].concat(m);
            var event = null;
            var data = null;
            var result = undefined;

            for(var i = 0; i < size; i++){
                event = list[i];
                data = event.data;

                if(data && data.callback && data.callback.apply){
                    var a1 = a.concat(data.args || []);
                    var ctx = data.context;

                    if(true === data.returnValue){
                        if(false === result){
                            data.callback.apply(ctx, a1);
                        }else{
                            result = data.callback.apply(ctx, a1);
                        }
                    }else{
                        data.callback.apply(ctx, a1);
                    }
                }
            }

            return result;
        },
        compare: function(event){
            var handleList = this.get(event.type);
            var size = handleList.length;
            var handle = null;
            var newHandle = event.data;

            if(0 === size){
                return -2;
            }

            var formatFunction = function(func){
                var str = func.toString();
                var lines = str.split(/\n/);
                var size = lines.length;
                var tmp = [];
                var regexp = /^([\s ]+)|([\s ]+)$/;

                for(var i = 0; i < size; i++){
                    tmp.push(lines[i].replace(regexp, ""));
                }

                regexp = null;
                lines = null;

                return tmp.join("");
            }

            for(var i = 0; i < size; i++){
                handle = handleList[i].data;

                // console.info("-------------------------------------")
                // console.log(handle);
                // console.log(newHandle);
                // console.info(formatFunction(handle.callback));
                // console.info(formatFunction(handle.callback) === formatFunction(newHandle.callback));
                // console.info(handle.context === newHandle.context);
                // console.info(handle.args.toString() === newHandle.args.toString());
                // console.info(handle.returnValue === newHandle.returnValue);
                // console.info("-------------------------------------");

                if(formatFunction(handle.callback) == formatFunction(newHandle.callback) &&
                    handle.context === newHandle.context &&
                        handle.args.toString() == newHandle.args.toString() &&
                            handle.returnValue == newHandle.returnValue){
                    return i;
                }
            }

            return -1;
        }
    };

    module.exports = Listener;
});