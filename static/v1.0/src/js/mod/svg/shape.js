/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * SVG#Shape
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.3
 */
;define(function (require, exports, module){
    var SVGUtil = require("mod/svg/svg");

    var args2arr = function(args){
        return Array.prototype.slice.call(args);
    };

    var _Shape = function(){
        
    };

    _Shape.render = function(svg, width, height){
        width = width || 80;
        height = height || 80;

        svg.create();
        svg.setAttribute("x", 0);
        svg.setAttribute("y", 0);
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        svg.setAttribute("viewBox", {
            "x": 0,
            "y": 0,
            "width": width,
            "height": height
        });

        return svg;
    };

    _Shape.Points = function(){
        this.points = [];
        this.size = 0;
    };
    _Shape.Points.prototype = {
        add: function(x, y){
            this.points.push({
                "x": x,
                "y": y
            });

            this.size = this.points.length;

            return this;
        },
        remove: function(index){
            this.points.splice(index, 1);
            this.size = this.points.length;

            return this;
        },
        clear: function(){
            this.points.length = 0;
            this.points = [];
            this.size = 0;

            return this;
        },
        get: function(index){
            return this.points[index] || null;
        },
        toString: function(){
            var points = this.points;
            var size = this.size;
            var point = null;
            var tmp = [];

            for(var i = 0; i < size; i++){
                point = points[i];

                tmp.push(point.x + "," + point.y);
            }

            return tmp.join(" ");
        }
    };

    _Shape.Paint = function(element){
        this.element = element;
    };
    _Shape.Paint.prototype = {
        attr: function(){
            var args = arguments;
            var size = args.length;
            var el = this.element;

            if(1 == size){
                return el.getAttribute(args[0]);
            }

            if(2 == size){
                el.setAttribute(args[0], args[1]);
            }

            return undefined;
        },
        fill: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["fill"].concat(args)); //<paint>
        },
        fillOpacity: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["fill-opacity"].concat(args)); //<opacity-value> | inherit
        },
        fillRule: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["fill-rule"].concat(args)); //nonzero | evenodd | inherit
        },
        stroke: function(value){
            var args = args2arr(arguments);
            this.attr.apply(this, ["stroke"].concat(args)); //<paint>
        },
        strokeOpacity: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["stroke-opacity"].concat(args)); //<opacity-value> | inherit
        },
        strokeWidth: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["stroke-width"].concat(args)); //<length> | <percentage> | inherit
        },
        strokeLinecap: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["stroke-linecap"].concat(args)); //butt | round | square | inherit
        },
        strokeLinejoin: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["stroke-linejoin"].concat(args)); //miter | round | bevel | inherit
        },
        strokeDasharray: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["stroke-dasharray"].concat(args)); //none | <dasharray> | inherit
        },
        strokeDashoffset: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["stroke-dashoffset"].concat(args)); //<percentage> | <length> | inherit
        },
        strokeMiterlimit: function(){
            var args = args2arr(arguments);
            this.attr.apply(this, ["stroke-miterlimit"].concat(args)); //<miterlimit> | inherit
        }
    };

    _Shape.Rect = function(svg){
        this.svg = svg;
    };
    _Shape.Rect.prototype = {
        create: function(x, y, width, height){
            var svg = _Shape.render(this.svg, width, height);
            var rect = document.createElementNS(svg.xmlns, "rect");
            
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);

            svg.append(rect);

            return {
                "svg": svg,
                "paint": new _Shape.Paint(rect)
            };
        }
    };
    _Shape.Circle = function(svg){
        this.svg = svg;
    };
    _Shape.Circle.prototype = {
        create: function(x, y, radius){
            var width = radius * 2;
            var height = radius * 2;
            var svg = _Shape.render(this.svg, width, height);
            var circle = document.createElementNS(svg.xmlns, "circle"); 

            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", radius);

            svg.append(circle);

            return {
                "svg": svg,
                "paint": new _Shape.Paint(circle)
            };
        }
    };
    _Shape.Ellipse = function(svg){
        this.svg = svg;
    };
    _Shape.Ellipse.prototype = {
        create: function(x, y, radiusX, radiusY){
            var width = radiusX * 2;
            var height = radiusY * 2;
            var svg = _Shape.render(this.svg, width, height);
            var ellipse = document.createElementNS(svg.xmlns, "ellipse");

            ellipse.setAttribute("cx", x);
            ellipse.setAttribute("cy", y);
            ellipse.setAttribute("rx", radiusX);
            ellipse.setAttribute("ry", radiusY);

            svg.append(ellipse);

            return {
                "svg": svg,
                "paint": new _Shape.Paint(ellipse)
            };
        }
    };
    _Shape.Line = function(svg){
        this.svg = svg;
    };
    _Shape.Line.prototype = {
        create: function(x1, y1, x2, y2){
            var svg = _Shape.render(this.svg);
            var line = document.createElementNS(svg.xmlns, "line");

            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);

            svg.append(line);

            return {
                "svg": svg,
                "paint": new _Shape.Paint(line)
            };
        }
    };
    _Shape.Polygon = function(svg){
        this.svg = svg;
    };
    _Shape.Polygon.prototype = {
        create: function(points){
            var svg = _Shape.render(this.svg);
            var polygon = document.createElementNS(svg.xmlns, "polygon");

            polygon.setAttribute("points", points.toString());

            svg.append(polygon);

            return {
                "svg": svg,
                "paint": new _Shape.Paint(polygon)
            };
        }
    };
    _Shape.Polyline = function(svg){
        this.svg = svg;
    };
    _Shape.Polyline.prototype = {
        create: function(points){
            var svg = _Shape.render(this.svg);
            var polyline = document.createElementNS(svg.xmlns, "polyline");

            polyline.setAttribute("points", points.toString());

            svg.append(polyline);

            return {
                "svg": svg,
                "paint": new _Shape.Paint(polyline)
            };
        }
    };

    _Shape.Path = function(svg){
        this.svg = svg;
    };
    _Shape.Path.prototype = {
        create: function(paths){
            var svg = _Shape.render(this.svg);
            var path = document.createElementNS(svg.xmlns, "path");

            path.setAttribute("d", paths.toString());

            svg.append(path);

            return {
                "svg": svg,
                "paint": new _Shape.Paint(path)
            };
        }
    };

    _Shape.createRect = function(x, y, width, height){
        var svg = SVGUtil.SVG();
        var rect = new _Shape.Rect(svg);
        
        return rect.create(x, y, width, height);
    };

    _Shape.createCircle = function(x, y, radius){
        var svg = SVGUtil.SVG();
        var circle = new _Shape.Circle(svg);
        
        return circle.create(x, y, radius);
    };

    _Shape.createEllipse = function(x, y, radiusX, radiusY){
        var svg = SVGUtil.SVG();
        var ellipse = new _Shape.Ellipse(svg);
        
        return ellipse.create(x, y, radiusX, radiusY);
    };

    _Shape.createLine = function(x1, y1, x2, y2){
        var svg = SVGUtil.SVG();
        var line = new _Shape.Line(svg);
        
        return line.create(x1, y1, x2, y2);
    };

    _Shape.createPolygon = function(points){
        var svg = SVGUtil.SVG();
        var polygon = new _Shape.Polygon(svg);
        
        return polygon.create(points);
    };

    _Shape.createPolyline = function(points){
        var svg = SVGUtil.SVG();
        var polyline = new _Shape.Polyline(svg);
        
        return polyline.create(points);
    };

    _Shape.createPath = function(paths){
        var svg = SVGUtil.SVG();
        var path = new _Shape.Path(svg);
        
        return path.create(paths);
    };

    _Shape.version = "R16B0324";

    module.exports = _Shape;
});