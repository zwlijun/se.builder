/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 颜色选择器
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.10
 */
;define(function(require, exports, module){
    var Util            = require("mod/se/util");
    var Timer           = require("mod/se/timer");
    var Listener        = require("mod/se/listener");
    var Colors          = require("mod/ui/colors");
    var HandleStack     = Listener.HandleStack;

    var HTML_PICKER = ''
                    + '<div class="colorpicker-frame hide" id="${key}">\n'
                    + '  <div class="colorpicker clearfix basic">\n'
                    + '    <div class="color-squares clearfix">\n'
                    + '      <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div class="color-transparent"></div>\n'
                    + '    </div>\n'
                    + '    <div class="color-advanced-switch">\n'
                    + '      <div></div>\n'
                    + '    </div>\n'
                    + '  </div>\n'
                    + '  <div class="colorpicker clearfix advanced hide">\n'
                    + '    <div class="color-patchs">\n'
                    + '      <div class="color-contrast-patch">.</div>\n'
                    + '      <div class="color-color-patch">.</div>\n'
                    + '      <div class="color-clear-patch color-transparent"></div>\n'
                    + '    </div>\n'
                    + '    <div id="sliders_${key}" class="color-sliders">\n'
                    + '      <div data-color-type="rgb" data-color-mode="r" class="color-rgb-r" title="按下拖动"><div></div></div>\n'
                    + '      <div data-color-type="rgb" data-color-mode="g" class="color-rgb-g" title="按下拖动"><div></div></div>\n'
                    + '      <div data-color-type="rgb" data-color-mode="b" class="color-rgb-b" title="按下拖动"><div></div></div>\n'
                    + '      <div data-color-type="rgb" data-color-mode="a" class="color-rgb-a" title="按下拖动"><div></div></div>\n'
                    + '    </div>\n'
                    + '    <div class="hsv-map-line"></div>\n'
                    + '    <div id="hsv_map_${key}" class="hsv-map">\n'
                    + '      <canvas id="surface_${key}" class="surface" width="200" height="200"></canvas>\n'
                    + '      <div class="cover"></div>\n'
                    + '      <div class="hsv-cursor"></div>\n'
                    + '      <div class="bar-bg"></div>\n'
                    + '      <div class="bar-white"></div>\n'
                    + '      <canvas id="luminance_bar_${key}" class="luminance-bar" width="25" height="200"></canvas>\n'
                    + '      <div id="hsv_cursors_${key}" class="hsv-barcursors">\n'
                    + '        <div class="hsv-barcursor-l"></div>\n'
                    + '        <div class="hsv-barcursor-r"></div>\n'
                    + '      </div>\n'
                    + '    </div>\n'
                    + '  </div>\n'
                    + '</div>\n'
                    + '';

    var SQUARES_RGB = [
        //L1:
        {r: 255, g: 255, b: 255, a: 1},
        {r: 221, g: 221, b: 221, a: 1},
        {r: 204, g: 204, b: 204, a: 1},
        {r: 170, g: 170, b: 170, a: 1},
        {r: 153, g: 153, b: 153, a: 1},
        {r: 128, g: 128, b: 128, a: 1},
        {r: 102, g: 102, b: 102, a: 1},
        {r: 85, g: 85, b: 85, a: 1},
        {r: 51, g: 51, b: 51, a: 1},
        {r: 34, g: 34, b: 34, a: 1},
        {r: 0, g: 0, b: 0, a: 1},

        //L2:
        {r: 0, g: 255, b: 255, a: 1},
        {r: 0, g: 204, b: 255, a: 1},
        {r: 0, g: 153, b: 255, a: 1},
        {r: 0, g: 102, b: 255, a: 1},
        {r: 0, g: 51, b: 255, a: 1},
        {r: 0, g: 0, b: 255, a: 1},
        {r: 0, g: 102, b: 204, a: 1},
        {r: 0, g: 51, b: 204, a: 1},
        {r: 0, g: 0, b: 204, a: 1},
        {r: 0, g: 51, b: 153, a: 1},
        {r: 0, g: 0, b: 153, a: 1},

        //L3:
        {r: 0, g: 255, b: 204, a: 1},
        {r: 0, g: 255, b: 153, a: 1},
        {r: 0, g: 255, b: 102, a: 1},
        {r: 0, g: 255, b: 51, a: 1},
        {r: 0, g: 255, b: 0, a: 1},
        {r: 0, g: 204, b: 51, a: 1},
        {r: 0, g: 204, b: 0, a: 1},
        {r: 0, g: 153, b: 51, a: 1},
        {r: 0, g: 153, b: 0, a: 1},
        {r: 0, g: 102, b: 51, a: 1},
        {r: 0, g: 102, b: 0, a: 1},

        //L4:
        {r: 255, g: 0, b: 153, a: 1},
        {r: 255, g: 0, b: 102, a: 1},
        {r: 255, g: 0, b: 51, a: 1},
        {r: 255, g: 0, b: 0, a: 1},
        {r: 204, g: 0, b: 51, a: 1},
        {r: 204, g: 0, b: 0, a: 1},
        {r: 153, g: 0, b: 51, a: 1},
        {r: 153, g: 0, b: 0, a: 1},
        {r: 102, g: 0, b: 51, a: 1},
        {r: 102, g: 0, b: 0, a: 1},
        {r: 51, g: 0, b: 0, a: 1},

        //L5:
        {r: 255, g: 204, b: 255, a: 1},
        {r: 255, g: 153, b: 255, a: 1},
        {r: 255, g: 102, b: 255, a: 1},
        {r: 255, g: 102, b: 204, a: 1},
        {r: 204, g: 102, b: 255, a: 1},
        {r: 204, g: 102, b: 204, a: 1},
        {r: 204, g: 102, b: 153, a: 1},
        {r: 204, g: 51, b: 204, a: 1},
        {r: 204, g: 51, b: 153, a: 1},
        {r: 255, g: 0, b: 255, a: 1},
        {r: 153, g: 102, b: 204, a: 1},

        //L6:
        {r: 255, g: 255, b: 204, a: 1},
        {r: 255, g: 255, b: 153, a: 1},
        {r: 255, g: 255, b: 102, a: 1},
        {r: 255, g: 255, b: 51, a: 1},
        {r: 255, g: 255, b: 0, a: 1},
        {r: 255, g: 204, b: 102, a: 1},
        {r: 255, g: 204, b: 0, a: 1},
        {r: 255, g: 153, b: 102, a: 1},
        {r: 255, g: 153, b: 0, a: 1},
        {r: 255, g: 102, b: 102, a: 1},
        {r: 255, g: 51, b: 0, a: 1},
        
        //L7:
        {r: 204, g: 255, b: 204, a: 1},
        {r: 204, g: 255, b: 153, a: 1},
        {r: 204, g: 255, b: 102, a: 1},
        {r: 102, g: 204, b: 255, a: 1},
        {r: 102, g: 153, b: 255, a: 1},
        {r: 102, g: 102, b: 255, a: 1},
        {r: 255, g: 153, b: 153, a: 1},
        {r: 255, g: 102, b: 204, a: 1},
        {r: 255, g: 102, b: 153, a: 1},
        {r: 255, g: 102, b: 51, a: 1},
        {r: 0, g: 0, b: 0, a: 0}
    ];

    var DEFAULT_COLORS = {
        color: "rgba(255, 255, 255, 1)"
    };

    var Tools = {
        getOrigin: function(elm){
            var box = (elm.getBoundingClientRect) ? elm.getBoundingClientRect() : {top: 0, left: 0},
                doc = elm && elm.ownerDocument,
                body = doc.body,
                win = doc.defaultView || doc.parentWindow || window,
                docElem = doc.documentElement || body.parentNode,
                clientTop  = docElem.clientTop  || body.clientTop  || 0, // border on html or body or both
                clientLeft =  docElem.clientLeft || body.clientLeft || 0;

            return {
                left: box.left + (win.pageXOffset || docElem.scrollLeft) - clientLeft,
                top:  box.top  + (win.pageYOffset || docElem.scrollTop)  - clientTop
            };
        }
    };

    var _ColorPatch = function(picker){
        this.picker = picker;
        this.patch = picker.nodes.colorPatch;
    };

    _ColorPatch.prototype = {
        render: function(color){
            this.patch.html("#" + color.HEX);
        }
    };

    var _ContrastPatch = function(picker){
        this.picker = picker;
        this.patch = picker.nodes.contrastPatch;
    };

    _ContrastPatch.prototype = {
        render: function(color){
            var RGB = color.RND.rgb;

            this.patch.html('rgba(' + RGB.r + ',' + RGB.g + ',' + RGB.b + ',' + color.alpha + ')');
        }
    };

    var _ClearPatch = function(picker){
        this.picker = picker;
        this.patch = picker.nodes.clearPatch;
    };

    _ClearPatch.prototype = {
        render: function(){
            this.patch.on("click", this, function(e){
                var data = e.data;

                data.picker.exec("render", [null, null, null, null]);
            });
        }
    };

    var _ColorSlider = function(picker){
        this.picker = picker;
        this.sliders = picker.nodes.sliders;
        this.items = this.sliders.find('div[data-color-type]');
        this.type = undefined;
        this.mode = undefined;
        this.alpha = 1;
        this.max = {
            rgb:  {r: 255, g: 255, b: 255},
            hsl:  {h: 360, s: 100, l: 100},
            cmy:  {c: 100, m: 100, y: 100}
        };

        this.startPoint = 0;
        this.width = 0;

        this.listen();
    };

    _ColorSlider.prototype = {
        render: function(color){
            var sliderChildren = this.items;
            var child = null;
            var type = null;
            var mode = null;

            for (var n = sliderChildren.length; n--; ) {
                child = sliderChildren[n];

                type = (child.getAttribute("data-color-type")).toLowerCase();
                mode = (child.getAttribute("data-color-mode")).toLowerCase();

                if("a" == mode){
                    var rgb = color.RND.rgb;

                    child.children[0].style.width = (color.alpha * 100) + '%';
                    child.children[0].style.backgroundColor = "transparent";
                    child.children[0].parentNode.style.backgroundColor = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + color.alpha + ')';
                }else{
                    child.children[0].style.width = (color.RND[type][mode] / this.max[type][mode] * 100) + '%';
                }
            }
        },
        sliderDown: function(e){
            e.preventDefault();

            var data = e.data;
            var picker = data.picker;
            var colors = picker.colors;
            var target = e.currentTarget;

            data.type = (target.getAttribute("data-color-type")).toLowerCase();
            data.mode = (target.getAttribute("data-color-mode")).toLowerCase();

            data.alpha = colors.colors.alpha;
            data.startPoint = Tools.getOrigin(target);
            data.width = target.offsetWidth;

            data.sliderMove(e);

            $(window).on("mousemove", data, data.sliderMove)
                     .on("mouseup", picker, function(e){
                            $(e.currentTarget).off("mousemove mouseup");

                            e.data.colorRender.stop();
                     });

            picker.colorRender.start();

        },
        sliderMove: function(e){
            e.preventDefault();

            var data = e.data;
            var picker = data.picker;
            var colors = picker.colors;
            var newColor = {};

            if("a" == data.mode){
                newColor = colors.colors.RND[data.type];
                data.alpha = ((e.clientX - data.startPoint.left) / data.width * 1).toFixed(2);
            }else{
                newColor[data.mode] = (e.clientX - data.startPoint.left) / data.width * data.max[data.type][data.mode];
            }
            
            colors.setColor(newColor, data.type, data.alpha);
        },
        listen: function(){
            this.sliders.on("mousedown", "div[data-color-type]", this, this.sliderDown);
        }
    };

    var _ColorSquares = function(picker){
        this.picker = picker;
        this.squares = this.picker.nodes.squares;
        this.size = this.squares.length;
    };

    _ColorSquares.prototype = {
        render: function(){
            var n = this.size;
            var rgb = null;
            var r = 0;
            var g = 0;
            var b = 0;
            var a = 1;
            var i = n - 1;

            for ( ; n--; ) {
                rgb = SQUARES_RGB[i];
                r = rgb.r;
                g = rgb.g;
                b = rgb.b;
                a = rgb.a;

                if(0 === a){
                    this.squares[n].style.backgroundColor = 'rgba(' + r + ',' + g + ',' + b +', ' + a + ')';
                }else{
                    this.squares[n].style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
                }
                i--;

                this.listen(this.squares[n]);
            }
        },
        listen: function(node){
            $(node).on("click", this, function(e){
                e.preventDefault();

                var data = e.data;
                var picker = data.picker;
                var colors = picker.colors;
                var target = e.currentTarget;

                if($(target).hasClass("color-transparent")){
                    picker.exec("render", [null, null, null, null]);
                }else{
                    colors.setColor(target.style.backgroundColor, "rgb", colors.colors.alpha);
                    picker.colorRender.start(true);
                }
            });
        }
    };

    var _HSVMap = function(picker){
        this.picker = picker;
        
        this.startPoint = 0;
        this.width = 0;
        this.height = 0;
        this.currentTarget = null;

        this.update();

        this.listen();
    };

    _HSVMap.prototype = {
        update: function(){
            var picker = this.picker;

            this.hsvMap = picker.nodes.hsvMap;
            this.hsvMapCover = picker.nodes.hsvMapCover;
            this.hsvMapCursor = picker.nodes.hsvMapCursor;
            this.hsvBarBackgroundLayer = picker.nodes.hsvBarBackgroundLayer;
            this.hsvBarWhiteLayer = picker.nodes.hsvBarWhiteLayer;
            this.hsvBarCursors = picker.nodes.hsvBarCursors;
            this.hsvBarCursorsClassName = picker.nodes.hsvBarCursorsClassName;
            this.hsvBarLCursor = picker.nodes.hsvBarLCursor;
            this.hsvBarRCursor = picker.nodes.hsvBarRCursor;
            this.colorDisc = picker.nodes.colorDisc;
            this.luminanceBar = picker.nodes.luminanceBar;
            this.colorDiscRadius = this.colorDisc[0].offsetHeight / 2;

            this.draw();
        },
        render: function(color){
            var pi2 = Math.PI * 2,
                colorDiscRadius = this.colorDiscRadius,
                x = Math.cos(pi2 - color.hsv.h * pi2),
                y = Math.sin(pi2 - color.hsv.h * pi2),
                r = color.hsv.s * (this.colorDiscRadius - 5),
                hsv_mapCover = this.hsvMapCover[0],
                hsv_barWhiteLayer = this.hsvBarWhiteLayer[0],
                hsv_barBGLayer = this.hsvBarBackgroundLayer[0],
                hsv_mapCursor = this.hsvMapCursor[0],
                hsv_barCursors = this.hsvBarCursors[0],
                hsv_Leftcursor = this.hsvBarLCursor[0],
                hsv_Rightcursor = this.hsvBarRCursor[0],
                hsv_barCursorsCln = this.hsvBarCursorsClassName;

            hsv_mapCover.style.opacity = 1 - color.hsv.v;

            // this is the faster version...
            hsv_barWhiteLayer.style.opacity = 1 - color.hsv.s;
            hsv_barBGLayer.style.backgroundColor = 'rgb(' +
                color.hueRGB.r + ',' +
                color.hueRGB.g + ',' +
                color.hueRGB.b + ')';

            hsv_mapCursor.style.cssText =
                'left: ' + (x * r + colorDiscRadius) + 'px;' + 
                'top: ' + (y * r + colorDiscRadius) + 'px;' +
                // maybe change className of hsv_map to change colors of all cursors...
                'border-color: ' + (color.RGBLuminance > 0.22 ? '#333;' : '#ddd');
            hsv_barCursors.className = color.RGBLuminance > 0.22 ? hsv_barCursorsCln + ' dark' : hsv_barCursorsCln;

            if (hsv_Leftcursor) {
                hsv_Leftcursor.style.top = hsv_Rightcursor.style.top = ((1 - color.hsv.v) * colorDiscRadius * 2) + 'px';
            }
        },
        hsvDown: function(e){
            e.preventDefault();

            var data = e.data;
            var picker = data.picker;
            var colors = picker.colors;
            var target = e.target || e.srcElement;
            var currentTarget = target.id ? target : target.parentNode;

            data.currentTarget = currentTarget;
            data.startPoint = Tools.getOrigin(currentTarget);
            data.width = currentTarget.offsetWidth;
            data.height = currentTarget.offsetHeight;

            data.hsvMove(e);

            picker.nodes.hsvMap[0].className = 'hsv-map no-cursor';

            $(window).on("mousemove", data, data.hsvMove)
                     .on("mouseup", picker, function(e){
                            $(e.currentTarget).off("mousemove mouseup");

                            e.data.colorRender.stop();
                            picker.nodes.hsvMap[0].className = 'hsv-map'; 
                     });

            picker.colorRender.start();

        },
        hsvMove: function(e){
            e.preventDefault();

            var data = e.data;
            var picker = data.picker;
            var colors = picker.colors;
            var newColor = null;
            var r, x, y, h, s;
            var currentTarget = data.currentTarget;

            if(currentTarget === picker.nodes.hsvMap[0]) { // the circle
                r = data.height / 2,
                x = e.clientX - data.startPoint.left - r,
                y = e.clientY - data.startPoint.top - r,
                h = 360 - ((Math.atan2(y, x) * 180 / Math.PI) + (y < 0 ? 360 : 0)),
                s = (Math.sqrt((x * x) + (y * y)) / r) * 100;

                colors.setColor({h: h, s: s}, 'hsv');
            } else if (currentTarget === picker.nodes.hsvBarCursors[0]) { // the luminanceBar
                colors.setColor({
                    v: (data.height - (e.clientY - data.startPoint.top)) / data.height * 100
                }, 'hsv');
            }
        },
        listen: function(){
            this.hsvMap.on("mousedown", this, this.hsvDown);
        },
        draw: function(){
            var drawDisk = function(ctx, coords, radius, steps, colorCallback) {
                var x = coords[0] || coords, // coordinate on x-axis
                    y = coords[1] || coords, // coordinate on y-axis
                    a = radius[0] || radius, // radius on x-axis
                    b = radius[1] || radius, // radius on y-axis
                    angle = 360,
                    rotate = 0, coef = Math.PI / 180;

                ctx.save();
                ctx.translate(x - a, y - b);
                ctx.scale(a, b);

                steps = (angle / steps) || 360;

                for (; angle > 0 ; angle -= steps){
                    ctx.beginPath();
                    if (steps !== 360) ctx.moveTo(1, 1); // stroke
                    ctx.arc(1, 1, 1,
                        (angle - (steps / 2) - 1) * coef,
                        (angle + (steps  / 2) + 1) * coef);

                    if (colorCallback) {
                        colorCallback(ctx, angle);
                    } else {
                        ctx.fillStyle = 'black';
                        ctx.fill();
                    }
                }
                ctx.restore();
            };

            var drawCircle = function(ctx, coords, radius, color, width) { // uses drawDisk
                width = width || 1;
                radius = [
                    (radius[0] || radius) - width / 2,
                    (radius[1] || radius) - width / 2
                ];
                drawDisk(ctx, coords, radius, 1, function(ctx, angle){
                    ctx.restore();
                    ctx.lineWidth = width;
                    ctx.strokeStyle = color || '#000';
                    ctx.stroke();
                });
            };

            var colorDisc = this.colorDisc[0];
            var luminanceBar = this.luminanceBar[0];

            if (colorDisc.getContext) {
                drawDisk( // HSV color wheel with white center
                    colorDisc.getContext("2d"),
                    [colorDisc.width / 2, colorDisc.height / 2],
                    [colorDisc.width / 2 - 1, colorDisc.height / 2 - 1],
                    360,
                    function(ctx, angle) {
                        var gradient = ctx.createRadialGradient(1, 1, 1, 1, 1, 0);
                        gradient.addColorStop(0, 'hsl(' + (360 - angle + 0) + ', 100%, 50%)');
                        gradient.addColorStop(1, "#FFFFFF");

                        ctx.fillStyle = gradient;
                        ctx.fill();
                    }
                );
                drawCircle( // gray border
                    colorDisc.getContext("2d"),
                    [colorDisc.width / 2, colorDisc.height / 2],
                    [colorDisc.width / 2, colorDisc.height / 2],
                    '#ddd',
                    1
                );
                // draw the luminanceBar bar
                var ctx = luminanceBar.getContext("2d"),
                    gradient = ctx.createLinearGradient(0, 0, 0, 200);

                gradient.addColorStop(0,"transparent");
                gradient.addColorStop(1,"black");

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 30, 200);
            }
        }
    };

    var _AdvancedSwitchButton = function(picker){
        this.picker = picker;
        this.button = picker.nodes.advancedSwitch;

        this.listen();
    };

    _AdvancedSwitchButton.prototype = {
        listen: function(){
            this.button.on("click", this, function(e){
                e.preventDefault();

                var data = e.data;
                var picker = data.picker;
                var button = data.button;

                if(button.hasClass("on")){
                    button.removeClass("on");
                    picker.nodes.advanced.addClass("hide");
                    picker.colorPickerUI.render();
                }else{
                    button.addClass("on");
                    picker.nodes.advanced.removeClass("hide");
                    picker.hsvMapRender.update();
                    picker.hsvMapRender.render(picker.colors.colors);
                    picker.colorPickerUI.render();
                }

            })
        }
    };

    var _ColorRender = function(picker){
        this.picker = picker;
        this.renderTimer = Timer.getTimer(picker.key, 60, null);
    };

    _ColorRender.prototype = {
        getRenderColor: function(type){
            var color = this.picker.colors.colors;
            var RGB = color.RND.rgb;
            var bgColor = 'rgba(' + RGB.r + ',' + RGB.g + ',' + RGB.b + ',' + color.alpha + ')';
            var textColor = color.rgbaMixBlack.luminance > 0.22 ? '#222' : '#ddd';

            var result = {
                "color": color,
                "hex": "#" + color.HEX,
                "bgColor": bgColor,
                "textColor": textColor
            };

            return (type && (type in result)) ? result[type] : result;
        },
        update: function(color){
            var picker = this.picker;

            color = color || picker.colors.colors;

            picker.colorPatch.render(color);
            picker.contrastPatch.render(color);
            picker.colorSlider.render(color);
            picker.hsvMapRender.render(color);

            var render = this.getRenderColor();

            var RGB = color.RND.rgb;
            var bgColor = render.bgColor;
            var textColor = render.textColor;

            return {
                "color": color,
                "hex": "#" + color.HEX,
                "bgColor": bgColor,
                "textColor": textColor
            };
        },
        render: function(color){
            var picker = this.picker;
            var update = this.update(color);

            picker.exec("render", [color, update.hex, update.bgColor, update.textColor]);
        },
        start: function(once){
            this.renderTimer.setTimerHandler({
                callback: function(_timer, _once){
                    this.render(this.picker.colors.colors);

                    if(true === _once){
                        _timer.stop();
                    }
                },
                args: [once],
                context: this
            });

            this.renderTimer.start();
        },
        stop: function(){
            this.renderTimer.stop();
        }
    };

    var _ColorPickerUI = function(picker){
        this.colorPicker = picker;
        this.listenKey = '[data-plugin="' + picker.name + '.' + picker.identity + '"]';
        this.currentTarget = null;

        this.colorPicker.picker.on("mousedown", false);
        this.listen();
    };

    _ColorPickerUI.prototype = {
        listen: function(){
            var flag = null;
            var items = $(this.listenKey);
            var o = null;

            console.info("colorpicker.ui.listen#" + items.length + ": " + this.listenKey);

            for(var i = 0, size = items.length; i < size; i++){
                o = $(items[i]);

                flag = o.attr("data-coloricker-listen");

                if("1" != flag){
                    o.attr("data-coloricker-listen", "1");

                    o.on("click", this, function(e){
                        e.preventDefault();
                        e.stopPropagation();

                        var data = e.data;
                        var currentTarget = $(e.currentTarget);

                        data.display(currentTarget);
                    });              
                }
            }
        },
        display: function(renderTarget){
            if(this.currentTarget && (renderTarget[0] != this.currentTarget[0])){
                _ColorPicker.HiddenOthers();
            }

            this.currentTarget = this.colorPicker.renderTarget = renderTarget;

            var target = renderTarget;
            var colorPicker = this.colorPicker;
            var picker = colorPicker.picker;
            

            if(picker.hasClass("hide")){
                picker.css("visibility", "hidden").removeClass("hide");

                colorPicker.exec("visible", [colorPicker.colors.colors]);

                this.render();

                picker.css("visibility", "visible");
                //----------------------------------------------------
                target.one("mousedown", false);

                $(document).one("mousedown", picker, function(e){
                    var data = e.data;

                    data.addClass("hide");

                    colorPicker.nodes.advancedSwitch.removeClass("on");
                    colorPicker.nodes.advanced.addClass("hide");

                    $(window).trigger("mouseup");
                });
            }else{
                picker.addClass("hide");
                colorPicker.nodes.advancedSwitch.removeClass("on");
                colorPicker.nodes.advanced.addClass("hide");

                $(window).trigger("mouseup");
            }
        },
        render: function(){
            var target = this.currentTarget;
            var colorPicker = this.colorPicker;
            var picker = colorPicker.picker;

            if(!target || (target && target.length == 0)){
                return 0;
            }

            _ColorPicker.HiddenOthers(this.colorPicker.identity);

            colorPicker.width = picker.width();
            colorPicker.height = picker.height();

            var targetOffset = target.offset();
            var targetLeft = targetOffset.left;
            var targetTop = targetOffset.top;
            var targetWidth = target.width();
            var targetHeight = target.height();

            var pickerOffset = picker.offset();
            var pickerLeft = pickerOffset.left;
            var pickerTop = pickerOffset.top;
            var pickerWidth = colorPicker.width;
            var pickerHeight = colorPicker.height;

            var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
            var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);

            var o = 10;
            var s = 5;
            var x = 0;
            var y = 0;

            if(targetLeft + pickerWidth + o > viewportWidth){ // x轴定位到触发的右边对齐
                x = viewportWidth - pickerWidth - (viewportWidth - (targetLeft + targetWidth));
            }else{
                x = targetLeft;
            }

            if(targetTop + targetHeight + pickerHeight + s + o > viewportHeight){
                y = viewportHeight - pickerHeight - o;
            }else{
                y = targetTop + targetHeight + s;
            }

            picker.css({
                "left": x + "px",
                "top": y + "px"
            });
        },
        setColor: function(target){
            var picker = this.colorPicker;
            var colors = picker.colors;

            target = $(target);

            picker.renderTarget = target;

            if(target.hasClass("color-transparent")){
                picker.exec("render", [null, null, null, null]);
            }else{
                colors.setColor(target[0].style.backgroundColor, "rgb", colors.colors.alpha);
                picker.colorRender.start(true);
            }
        },
        getRenderTarget: function(){
            var renderTarget = this.colorPicker.renderTarget;
            var render = null;
            var items = [];

            if(renderTarget && renderTarget.length > 0){
                render = (renderTarget.attr("data-colorender") || "self").split("|");

                for(var i = 0, size = render.length; i < size; i++){
                    if("self" == render[i]){
                        items.push(renderTarget);
                    }else{
                        items.push($(render[i]));
                    }
                }
            }

            return items;
        }
    };

    var _ColorPicker = function(identity, colors){
        this.name = "colorpicker";
        this.identity = identity;
        this.key = this.name + "_" + this.identity;
        this.target = $("body");
        this.picker = null;

        this.width = 0;
        this.height = 0;

        this.colors = new Colors(colors || DEFAULT_COLORS);

        this.colorRender = null;
        this.colorPatch = null;
        this.contrastPatch = null;
        this.clearPatch = null;
        this.colorSlider = null;
        this.colorSquares = null;
        this.hsvMapRender = null;
        this.advancedSwitchButton = null;
        this.colorPickerUI = null;

        this.renderTarget = null;

        this.nodes = {
            baisc: null,
            advanced: null,
            squares: null,
            contrastPatch: null,
            colorPatch: null,
            clearPatch: null,
            sliders: null,
            hsvMap: null,
            hsvMapCover: null,
            hsvMapCursor: null,
            hsvBarBackgroundLayer: null,
            hsvBarWhiteLayer: null,
            hsvBarCursors: null,
            hsvBarCursorsClassName: null,
            hsvBarLCursor: null,
            hsvBarRCursor: null,
            colorDisc: null,
            luminanceBar: null,
            advancedSwitch: null
        };

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onvisible: null,
            onrender: null
        }, this.handleStack);

        //-----------------------
        this.render();
    };

    _ColorPicker.prototype = {
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
        find: function(selector){
            if(this.picker && this.picker.length > 0){
                return this.picker.find(selector);
            }

            return $.find();
        },
        render: function(){
            var tpl = Util.formatData(HTML_PICKER, {"key": this.key});

            this.target.append(tpl);

            this.picker = $("#" + this.key);

            this.nodes = {
                baisc: this.find(".colorpicker.baisc"),
                advanced: this.find(".colorpicker.advanced"),
                squares: this.find(".color-squares > div"),
                contrastPatch: this.find(".color-contrast-patch"),
                colorPatch: this.find(".color-color-patch"),
                clearPatch: this.find(".color-transparent"),
                sliders: this.find(".color-sliders"),
                hsvMap: this.find(".hsv-map"),
                hsvMapCover: this.find(".hsv-map .cover"),
                hsvMapCursor: this.find(".hsv-map .hsv-cursor"),
                hsvBarBackgroundLayer: this.find(".hsv-map .bar-bg"),
                hsvBarWhiteLayer: this.find(".hsv-map .bar-white"),
                hsvBarCursors: this.find(".hsv-map .hsv-barcursors"),
                hsvBarCursorsClassName: this.find(".hsv-map .hsv-barcursors")[0].className,
                hsvBarLCursor: this.find(".hsv-map .hsv-barcursor-l"),
                hsvBarRCursor: this.find(".hsv-map .hsv-barcursor-r"),
                colorDisc: this.find(".hsv-map canvas.surface"),
                luminanceBar: this.find(".hsv-map canvas.luminance-bar"),
                advancedSwitch: this.find(".color-advanced-switch")
            };

            this.colorRender = new _ColorRender(this);
            this.colorPatch = new _ColorPatch(this);
            this.contrastPatch = new _ContrastPatch(this);
            this.clearPatch = new _ClearPatch(this);
            this.colorSlider = new _ColorSlider(this);
            this.colorSquares = new _ColorSquares(this);
            this.hsvMapRender = new _HSVMap(this);
            this.advancedSwitchButton = new _AdvancedSwitchButton(this);
            this.colorPickerUI = new _ColorPickerUI(this);

            this.clearPatch.render();
            this.colorSquares.render();
            this.colorRender.render(this.colors.colors);
        }
    };

    _ColorPicker.HiddenOthers = function(filter){
        var picker = null;
        var cache = _ColorPicker.Cache;

        for(var key in cache){
            if(cache.hasOwnProperty(key)){
                picker = cache[key];

                if(filter && filter === key){
                    continue;
                }

                picker.picker.addClass("hide");
                picker.nodes.advancedSwitch.removeClass("on");
                picker.nodes.advanced.addClass("hide");
            }
        }

        $(window).trigger("mouseup");
    };

    _ColorPicker.Cache = {};

    module.exports = {
        "version": "R17B0425",
        createColorPicker: function(identity, colors){
            var cp = _ColorPicker.Cache[identity] || (_ColorPicker.Cache[identity] = new _ColorPicker(identity, colors));

            var _pub = {
                "exec" : function(type, args){
                    cp.exec(type, args);

                    return _pub;
                },
                "set" : function(type, option){
                    cp.set(type, option);

                    return _pub;
                },
                "remove" : function(type){
                    cp.remove(type);

                    return _pub;
                },
                "get" : function(type){
                    return cp.get(type);
                },
                "clear" : function(){
                    cp.clear();

                    return _pub;
                },
                "getHandleStack" : function(){
                    return cp.getHandleStack();
                },
                "listen": function(){
                    cp.colorPickerUI.listen();

                    return _pub;
                },
                "setColor": function(target){
                    cp.colorPickerUI.setColor(target);

                    return _pub;
                },
                "getRenderTarget": function(){
                    return cp.colorPickerUI.getRenderTarget();
                },
                "getRenderColor": function(type){
                    return cp.colorRender.getRenderColor(type);
                },
                "update": function(color){
                    return cp.colorRender.update(color);
                },
                "display": function(renderTarget){
                    cp.colorPickerUI.display(renderTarget);

                    return _pub;
                },
                "hidden": function(filter){
                    _ColorPicker.HiddenOthers(filter);

                    return _pub;
                },
                "color": {
                    "set": function(newColor, type, alpha){
                        cp.colors.setColor(newColor, type, alpha);

                        return _pub;
                    },
                    "get": function(type){
                        return cp.colors.getColor(type);
                    },
                    "convert": function(color, type){
                        return cp.colors.convertColor(color, type);
                    }
                }
            };

            return _pub;
        }
    };
});