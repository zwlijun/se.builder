/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 图片浏览器模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2017.1
 */
;define(function ImageViewer(require, exports, module){
    var Util            = require("mod/se/util");
    var Swiper          = require("mod/se/swiper");
    var TemplateEngine  = require("mod/se/template");
    var DataType        = require("mod/se/datatype");

    var ImageViewerTemplate = TemplateEngine.getTemplate("mod_imageviewer", {
        "root": "viewer"
    }); 

    var _HTML_STRUCT = ''
                     + '<div class="mod-imageviewer-mask flexbox middle center hide" id="imageviewer_<%=viewer.name%>">'
                     + '  <div class="mod-imageviewer-box">'
                     + '    <div class="mod-imageviewer-master">'
                     + '      <div class="mod-imageviewer-slider">'
                     + '        <div class="mod-swiper" data-swiper="<%=viewer.name%>">'  
                     + '          <div class="mod-swiper-body">'
                     + '            <%'
                     + '            for(var i = 0; i < viewer.size; i++){'
                     + '            var ds = viewer.dataset[i];'
                     + '            %>'
                     + '            <div class="mod-swiper-item '
                     + '            <%if(i === viewer.currentIndex){%>'
                     + '            current'
                     + '            <%}else if(i === viewer.nextIndex){%>'
                     + '            maybe after'
                     + '            <%}else if(i === viewer.prevIndex){%>'
                     + '            maybe before'
                     + '            <%}else{%>'
                     + '            impossible'
                     + '            <%}%>'
                     + '            " style="background-image: url(<%=ds.source%>)">'
                     + '              <%if(ds.subject){%>'
                     + '              <div class="mod-swiper-subject"><%=ds.subject%></div>'
                     + '              <%}%>'
                     + '              <%if(ds.desc){%>'
                     + '              <div class="mod-swiper-desc"><%=ds.desc%></div>'
                     + '              <%}%>'
                     + '            </div>'
                     + '            <%}%>'
                     + '          </div>'
                     + '        </div>'     
                     + '      </div>'
                     + '      <div class="mod-imageviewer-slider-prev icofont" data-action-click="swiper://navigator/prev#<%=viewer.name%>"></div>'
                     + '      <div class="mod-imageviewer-slider-next icofont" data-action-click="swiper://navigator/next#<%=viewer.name%>"></div>'
                     + '    </div>'
                     + '    <div class="mod-imageviewer-thumbnail flexbox middle justify">'
                     + '      <div class="mod-imageviewer-thumbnail-prev icofont flexbox middle center" data-action-click="swiper://navigator/prev#<%=viewer.name%>"></div>'
                     + '      <div class="mod-imageviewer-thumbnails">'
                     + '        <ul class="mod-imageviewer-thumbnails-viewer clearfix" style="width: <%=viewer.thumbnailWidth%>px;">'
                     + '          <%'
                     + '          for(var i = 0; i < viewer.size; i++){'
                     + '          var ds = viewer.dataset[i];'
                     + '          %>'
                     + '          <li class="mod-imageviewer-thumbnails-item <%=(i === viewer.currentIndex ? "on": "")%>" '
                     + '              style="background-image: url(<%=ds.thumbnail || ds.source%>)" '
                     + '              data-action-click="swiper://navigator/go#<%=viewer.name%>,<%=i%>"></li>'
                     + '          <%}%>'
                     + '        </ul>'
                     + '      </div>'
                     + '      <div class="mod-imageviewer-thumbnail-next icofont flexbox middle center" data-action-click="swiper://navigator/next#<%=viewer.name%>"></div>'
                     + '    </div>'
                     + '  </div>'
                     + '</div>'
                     + '';

    //TOTO
    
    var ImageViewer = function(name){
        this.name = name;
        this.swiper = null;
        this.opts = {
            "type": "slider",
            "mode": "x",
            "distance": 50,
            "dots": "none",
            "control": "none",
            "width": -1,
            "height": -1,
            "autoplay": false,
            "loop": true,
            "interval": 4000,
            "duration": .4,
            "timing": "ease",
            "delay": 0,
            "unit": "px",
            "current": 0,
            "thumbnailWidth": 172
        };
        this.dst = [
            // {
            //     "source": "",
            //     "thumbnail": "",
            //     "subject": ""
            //     "desc": ""
            // }
        ];
        this.size = 0;
    };

    ImageViewer.prototype = {
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
        dataset: function(){
            var args = arguments;
            var size = args.length;

            if(0 === size){
                return [].concat(this.dst);
            }else{
                this.dst = [].concat(args[0] || []);
                this.size = this.dst.length;
            }
        },
        getImageViewerMask: function(){
            return $("#imageviewer_" + this.name);
        },
        existed: function(){
            var viewer = this.getImageViewerMask();

            return (viewer.length > 0)
        },
        setThumbnailViewPosition: function(index){
            var viewer = this.getImageViewerMask();
            var thumbnailView = viewer.find(".mod-imageviewer-thumbnails")[0];
            var thumbnailItems = viewer.find(".mod-imageviewer-thumbnails-item");
            var thumbnailWidth = this.options("thumbnailWidth");
            var rect = Util.getBoundingClientRect(thumbnailView);
            var viewWidth = rect.width;
            var visibleSize = Math.floor(viewWidth / thumbnailWidth) - 1;

            $(thumbnailItems.removeClass("on")[index]).addClass("on");

            thumbnailView.scrollLeft = Math.max((index - visibleSize) * thumbnailWidth, 0);
        },
        render: function(){
            if(!this.existed()){
                var opts = this.options();
                var dts = this.dataset();

                var size = this.size;
                var lastIndex = Math.max(size - 1, 0);
                var currentIndex = opts.current || 0;
                var nextIndex = currentIndex + 1;
                var prevIndex = currentIndex - 1;

                if(nextIndex > lastIndex){
                    nextIndex = 0;
                }

                if(prevIndex < 0){
                    prevIndex = lastIndex;
                }

                var metaData = {
                    "opts": opts,
                    "dataset": dts,
                    "size": size,
                    "currentIndex": currentIndex,
                    "nextIndex": nextIndex,
                    "prevIndex": prevIndex,
                    "lastIndex": lastIndex,
                    "thumbnailWidth": (size * opts.thumbnailWidth),
                    "name": this.name
                };

                ImageViewerTemplate.render(true, _HTML_STRUCT, metaData, {
                    callback: function(ret){
                        $("body").append(ret.result);
                        var viewer = this.getImageViewerMask();

                        this.swiper = Swiper.createSwiper(this.name, ret.metaData.opts);
                        this.swiper.set("end", {
                            callback: function(target){
                                var _index = this.swiper.getIndex();
                                this.setThumbnailViewPosition(_index);
                            },
                            context: this,
                            args: []
                        }).set("init", {
                            callback: function(currentIndex){
                                this.swiper.setIndex(currentIndex);
                                this.setThumbnailViewPosition(currentIndex);
                            },
                            context: this,
                            args: [ret.metaData.currentIndex]
                        });

                        this.swiper.create();

                        (function(){
                            Util.watchAction(viewer, [
                                {type: "tap", mapping: "click", compatible: null},
                                {type: "click", mapping: null, compatible: null},
                                {type: "mouseover", mapping: null, compatible: null},
                                {type: "mouseout", mapping: null, compatible: null}
                            ], null);
                        })();
                    },
                    context: this
                });
            }
        },
        show: function(){
            var viewer = this.getImageViewerMask();

            viewer.removeClass("hide");
        },
        hide: function(){
            var viewer = this.getImageViewerMask();

            viewer.addClass("hide");
        },
        destroy: function(){
            if(this.swiper){
                this.swiper.destroy();
                this.swiper = null;
            }
            if(this.existed()){
                this.getImageViewerMask().remove();
            }
        }
    };

    ImageViewer.Cache = {};

    ImageViewer.createImageViewer = function(name){
        if(!(name in ImageViewer.Cache)){
            ImageViewer.Cache[name] = new ImageViewer(name);
        }

        return ImageViewer.getImageViewer(name);
    };

    ImageViewer.getImageViewer = function(name){
        var viewer = ImageViewer.Cache[name] || null;

        if(!viewer){
            return null;
        }

        return {
            "options": function(){
                return viewer.options.apply(viewer, arguments);
            },
            "dataset": function(){
                return viewer.dataset.apply(viewer, arguments);
            },
            "render": function(){
                viewer.render();

                return this;
            },
            "getSwiper": function(){
                return viewer.swiper || null;
            },
            "show": function(){
                viewer.show();

                return this;
            },
            "hide": function(){
                viewer.hide();

                return this;
            },
            "setThumbnailViewPosition": function(index){
                viewer.setThumbnailViewPosition(index);

                return this;
            },
            "destroy": function(){
                viewer.destroy();

                ImageViewer.Cache[name] = null;
                delete ImageViewer.Cache[name];

                return this;
            }
        };
    };

    module.exports = {
        "version": "R17B0425",
        "createImageViewer": ImageViewer.createImageViewer,
        "getImageViewer": ImageViewer.getImageViewer
    };
});