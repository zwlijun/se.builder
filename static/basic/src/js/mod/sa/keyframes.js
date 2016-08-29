/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * keyframes
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.9
 */
;define(function (require, exports, module){
    var Style         = require("mod/se/css");

    var _KeyFrames = function(name){
        this.name = name;
        this.frames = [];
        this.size = 0;
    };
    
    _KeyFrames.prototype = {
        isKeyFrame: function(frame){
            var p = /^(from|to|([0-9]*(\.?[0-9]+)%))$/i;
            var ret = p.test(frame);

            p = null;

            return ret;
        },
        clear: function(){
            this.frames = [];
            this.frames.length = 0;
            this.size = 0;
        },
        push : function(frame, properties){
            var list = [];
            var p = "";
            var v = "";
            var transform = [];

            for(var key in properties){
                if(properties.hasOwnProperty(key)){
                    v = properties[key];

                    if(Style.isTransformMethod(key)){
                        transform.push(key + "(" + v + ")");
                    }else{
                        // p = Style.getRealPropertyName(key);
                        
                        // list.push(p + ": " + v);
                        list.push(Style.getVendorStyles(key, v).join("\n"))
                    }
                }
            }

            if(transform.length > 0){
                // list.push(Style.getRealPropertyName("transform") + ": " + transform.join(" "));
                list.push(Style.getVendorStyles("transform", transform.join(" ")).join("\n"));
            }

            if(this.isKeyFrame(frame)){
                this.frames.push(frame + " {" + list.join("\n") + "}");
                this.size = this.frames.length;
            }
        },
        getKeyFrameRules: function(){
            var frames = this.frames.join("\n");

            var key = "keyframes";
            var name = this.name;
            var hack = Style.getVendorHackKey("transform") + key;
            var str = " " + name + " {\n" + frames + "\n}\n";
            var keyframes = [];

            if(hack != key){
                keyframes.push("@" + hack + str);
            }
            keyframes.push("@" + key + str);

            return keyframes;
        },
        print : function(update){
            if(this.existed()){
                if(true === update){
                    this.update()
                }
                return 0;
            }
            var name = this.name;
            var keyframes = this.getKeyFrameRules();

            var str = '<style type="text/css" id="' + name + '">\n' 
                    + keyframes.join("\n")
                    + '</style>';

            $("head").append(str);
        },
        update: function(){
            var styleNode = $("#" + this.name);

            styleNode.remove();
            this.print();
        },
        existed: function(){
            var styleNode = $("#" + this.name);

            return (styleNode.length > 0);
        },
        hasKeyFrame: function(){
            return this.size > 0;
        },
        destroy: function(){
            var styleNode = $("#" + this.name);

            styleNode.remove();

            this.clear();
        }
    };

    _KeyFrames.CachePool = {};

    module.exports = {
        "version": "R15B1106",
        "createKeyFrames": function(name){
            var kf = _KeyFrames.CachePool[name] || (_KeyFrames.CachePool[name] = new _KeyFrames(name));

            return kf;
        }
    }
});