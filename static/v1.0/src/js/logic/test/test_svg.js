define(function(require, exports, module){
	var SVGShape = require("mod/svg/shape");
	var SVGPath  = require("mod/svg/path");

	var _svg = null;
	var _paint = null;
	var _shape = null;

	var rectShape = SVGShape.createRect(0, 0, 240, 80);
	_svg = rectShape.svg;
	_paint = rectShape.paint;
	_shape = _paint.element;

	_paint.fill("#ff0000");
	_paint.fillOpacity(0.3);
	_svg.appendTo("#svg_box");

	var circleShape = SVGShape.createCircle(50, 50, 50);

	_svg = circleShape.svg;
	_paint = circleShape.paint;
	_shape = _paint.element;

	_paint.fill("#00ff00");
	_svg.appendTo("#svg_box");

	var ellipseShape = SVGShape.createEllipse(50, 100, 50, 100);

	_svg = ellipseShape.svg;
	_paint = ellipseShape.paint;
	_shape = _paint.element;

	_paint.fill("#00ff00");
	_svg.appendTo("#svg_box");

	var lineShape = SVGShape.createLine(0, 0, 300, 0);

	_svg = lineShape.svg;
	_paint = lineShape.paint;
	_shape = _paint.element;

	_paint.stroke("#ff0000");
	_paint.strokeWidth(8);
	_svg.setAttribute("width", 500);
	_svg.appendTo("#svg_box");

	var polygonPoints = new SVGShape.Points();
	polygonPoints.add(0, 0)
				 .add(100, 210)
				 .add(210, 300);

	var polygonShape = SVGShape.createPolygon(polygonPoints);

	_svg = polygonShape.svg;
	_paint = polygonShape.paint;
	_shape = _paint.element;

	_paint.fill("#ff0000");
	_svg.setAttribute("width", 500);
	_svg.appendTo("#svg_box");

	var svgPath = new SVGPath();

	console.log(svgPath);

	var pathData = 'M59.1,23.9c0-0.1,0-0.2,0-0.3c0-4.9-4-8.9-9-8.9c-1.5,0-2.8,0.4-4,1C44.3,8.2,37.5,2.6,29.4,2.6\
                    c-9.5,0-17.2,7.7-17.2,17.1c0,0.6,0,1.3,0.1,1.9h-0.1c-6.1,0-11,5.8-11,12.9s5,12.9,11,12.9c0.1,0,0.1,0,0.2,0l0,0H59\
                    c5.6-0.3,9.9-5.8,9.9-12C68.9,29.2,64.6,24.3,59.1,23.9L59.1,23.9L59.1,23.9z';

    var paths = SVGPath.parse(pathData);

    svgPath.cover(paths);

    console.log(paths);
	console.log(SVGPath.stringify(paths));
	console.log(svgPath.indexOf("c-9.5,0-17.2,7.7-17.2,17.1c0,0.6,0,1.3,0.1,1.9h-0.1c-6.1,0-11,5.8-11,12.9"))
});