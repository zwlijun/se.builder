/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * SVG#Path
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.3
 * @see https://www.w3.org/TR/2011/REC-SVG11-20110816/paths.html#PathData
 */
;define(function (require, exports, module){
    var MovePath = function(x, y, relative){
        this.name = "moveTo";
        this.relative = relative || false;
        this.command = this.relative ? "m" : "M";
        this.x = x;
        this.y = y;
    };
    MovePath.prototype = {
        toString: function(nocommand){
            var tmp = [];

            if(true !== nocommand){
                tmp.push(this.command);
            }
            tmp.push(this.x);
            tmp.push(this.y);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var LinePath = function(x, y, relative){
        this.name = "lineTo";
        this.relative = relative || false;
        this.command = this.relative ? "l" : "L";
        this.x = x;
        this.y = y;
    };
    LinePath.prototype = {
        toString: function(nocommand){
            var tmp = [];

            if(true !== nocommand){
                tmp.push(this.command);
            }
            tmp.push(this.x);
            tmp.push(this.y);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var HorizontalLinePath = function(x, relative){
        this.name = "horizontalLineTo";
        this.relative = relative || false;
        this.command = this.relative ? "h" : "H";
        this.x = x;
    };
    HorizontalLinePath.prototype = {
        toString: function(nocommand){
            var tmp = [];

            if(true !== nocommand){
                tmp.push(this.command);
            }
            tmp.push(this.x);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var VerticleLinePath = function(y, relative){
        this.name = "verticalLineTo";
        this.relative = relative || false;
        this.command = this.relative ? "v" : "V";
        this.y = y;
    };
    VerticleLinePath.prototype = {
        toString: function(nocommand){
            var tmp = [];

            if(true !== nocommand){
                tmp.push(this.command);
            }
            tmp.push(this.y);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var CurvePath = function(x1, y1, x2, y2, finalX, finalY, relative){
        this.name = "curveTo";
        this.relative = relative || false;
        this.command = this.relative ? "c" : "C";
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.finalX = finalX;
        this.finalY = finalY;
    };
    CurvePath.prototype = {
        toString: function(nocommand){
            var tmp = [];

            if(true !== nocommand){
                tmp.push(this.command);
            }
            tmp.push(this.x1);
            tmp.push(this.y1);
            tmp.push(this.x2);
            tmp.push(this.y2);
            tmp.push(this.finalX);
            tmp.push(this.finalY);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var SmoothCurvePath = function(x2, y2, finalX, finalY, relative){
        this.name = "smoothCurveTo";
        this.relative = relative || false;
        this.command = this.relative ? "s" : "S";
        this.x2 = x2;
        this.y2 = y2;
        this.finalX = finalX;
        this.finalY = finalY;
    };
    SmoothCurvePath.prototype = {
        toString: function(nocommand){
            var tmp = [];

            if(true !== nocommand){
                tmp.push(this.command);
            }
            tmp.push(this.x2);
            tmp.push(this.y2);
            tmp.push(this.finalX);
            tmp.push(this.finalY);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var QuadraticBelzierCurvePath = function(x1, y1, finalX, finalY, relative){
        this.name = "quadraticBelzierCurveTo";
        this.relative = relative || false;
        this.command = this.relative ? "q" : "Q";
        this.x1 = x1;
        this.y1 = y1;
        this.finalX = finalX;
        this.finalY = finalY;
    };
    QuadraticBelzierCurvePath.prototype = {
        toString: function(nocommand){
            var tmp = [];

            if(true !== nocommand){
                tmp.push(this.command);
            }
            tmp.push(this.x1);
            tmp.push(this.y1);
            tmp.push(this.finalX);
            tmp.push(this.finalY);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var SmoothQuadraticBelzierCurvePath = function(finalX, finalY, relative){
        this.name = "smoothQuadraticBelzierCurveTo"
        this.relative = relative || false;
        this.command = this.relative ? "t" : "T";
        this.finalX = finalX;
        this.finalY = finalY;
    };
    SmoothQuadraticBelzierCurvePath.prototype = {
        toString: function(nocommand){
            var tmp = [];

            if(true !== nocommand){
                tmp.push(this.command);
            }
            tmp.push(this.finalX);
            tmp.push(this.finalY);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var EllipticalArcCurvePath = function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y, relative){
        this.name = "ellipticalArc";
        this.relative = relative || false;
        this.command = this.relative ? "a" : "A";
        this.rx = rx;
        this.ry = ry;
        this.xAxisRotation = xAxisRotation;
        this.largeArcFlag = largeArcFlag;
        this.sweepFlag = sweepFlag;
        this.x = x;
        this.y = y;
    };
    EllipticalArcCurvePath.prototype = {
        toString: function(nocommand){
            var tmp = [];

            if(true !== nocommand){
                tmp.push(this.command);
            }
            tmp.push(this.rx);
            tmp.push(this.ry);
            tmp.push(this.xAxisRotation);
            tmp.push(this.largeArcFlag);
            tmp.push(this.sweepFlag);
            tmp.push(this.x);
            tmp.push(this.y);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var ClosePath = function(relative){
        this.name = "closePath";
        this.relative = relative || false;
        this.command = this.relative ? "z" : "Z";
    };
    ClosePath.prototype = {
        toString: function(){
            var tmp = [];

            tmp.push(this.command);

            return tmp.join(" ");
        },
        equals: function(object){
            return object.toString() == this.toString();
        },
        equalsIgnoreCase: function(object){
            var s1 = object.toString();
            var s2 = this.toString();

            return s1.toUpperCase() == s2.toUpperCase();
        }
    };

    var _SVGPathFactory = {
        createPath: function(command, args){
            var upperCommand = command.toUpperCase();
            var path = null;
            var relative = (command !== upperCommand)

            switch(upperCommand){
                case "M":
                    path = new MovePath(args[0], args[1], relative);
                break;
                case "L":
                    path = new LinePath(args[0], args[1], relative);
                break;
                case "H":
                    path = new HorizontalLinePath(args[0], relative);
                break;
                case "V":
                    path = new VerticleLinePath(args[0], relative);
                break;
                case "C":
                    path = new CurvePath(args[0], args[1], args[2], args[3], args[4], args[5], relative);
                break;
                case "S":
                    path = new SmoothCurvePath(args[0], args[1], args[2], args[3], relative);
                break;
                case "Q":
                    path = new QuadraticBelzierCurvePath(args[0], args[1], args[2], args[3], relative);
                break;
                case "T":
                    path = new SmoothQuadraticBelzierCurvePath(args[0], args[1], relative);
                break;
                case "A":
                    path = new EllipticalArcCurvePath(args[0], args[1], args[2], args[3], args[4], args[5], args[6], relative);
                break;
                case "Z":
                    path = new ClosePath(relative);
                break;
                default:
                    throw new Error("unknown path command(" + command + ")");
                break;
            }

            return path;
        },
        gen: function(length, command, numberList){
            var size = numberList.length;
            var paths = [];
            var num = null;

            if(size > length){
                var args = [];

                for(var i = 0; i < size; i += length){
                    num = numberList[i];

                    args.length = 0;
                    args = [];
                    for(var j = 0; j < length; j++){
                        args.push(num[i + j]);
                    }

                    paths.push(_SVGPathFactory.createPath(command, args))
                }
            }else{
                paths.push(_SVGPathFactory.createPath(command, numberList))
            }

            return paths;
        },
        _parser: {
            "M": function(command, numberList){
                return _SVGPathFactory.gen(2, command, numberList);
            },
            "L": function(command, numberList){
                return _SVGPathFactory.gen(2, command, numberList);
            },
            "H": function(command, numberList){
                return _SVGPathFactory.gen(1, command, numberList);
            },
            "V": function(command, numberList){
                return _SVGPathFactory.gen(1, command, numberList);
            },
            "C": function(command, numberList){
                return _SVGPathFactory.gen(6, command, numberList);
            },
            "S": function(command, numberList){
                return _SVGPathFactory.gen(4, command, numberList);
            },
            "Q": function(command, numberList){
                return _SVGPathFactory.gen(4, command, numberList);
            },
            "T": function(command, numberList){
                return _SVGPathFactory.gen(2, command, numberList);
            },
            "A": function(command, numberList){
                return _SVGPathFactory.gen(7, command, numberList);
            },
            "Z": function(command, numberList){
                return _SVGPathFactory.gen(0, command, numberList);
            },
            parse: function(command, data){
                var upperCommand = command.toUpperCase();
                var _parser = _SVGPathFactory._parser;
                var numberList = [];

                var pattern = /(\-?[0-9\.]+)/g;
                var matcher = null;
                pattern.lastIndex = 0;

                while(null !== (matcher = pattern.exec(data))){
                    numberList.push(matcher[1]);
                }

                if(upperCommand in _parser){
                    return _parser[upperCommand].apply(_parser, [command, numberList]);
                }

                return [];
            }
        }
    };

    var _SVGPath = function(){
        this.paths = [];
        this.size = 0;
    };

    _SVGPath.prototype = {
        add: function(command, args){
            var path = _SVGPathFactory.createPath(command, args);

            this.paths.push(path);
            this.size = this.paths.length;
        },
        insert: function(index, command, args){
            var path = _SVGPathFactory.createPath(command, args);

            this.paths.splice(index, 0, path);
            this.size = this.paths.length;
        },
        replace: function(index, command, args){
            var path = _SVGPathFactory.createPath(command, args);

            this.paths.splice(index, 1, path);
            this.size = this.paths.length;
        },
        remove: function(index){
            this.paths.splice(index, 1);
            this.size = this.paths.length;
        },
        clear: function(){
            this.paths.length = 0;
            this.paths = [];
            this.size = 0;
        },
        get: function(index){
            return this.paths[index];
        },
        indexOf: function(pathData){
            var paths = _SVGPath.parse(pathData);
            var size = paths.length;
            var path = null;
            var iLen = this.getPathDataLength();
            var iPath = null;
            var index = -1;

            // console.info("size: " + size)

            for(var i = 0; i < size; i++){
                path = paths[i];

                // console.info("i: " + i);
                for(var j = 0; j < iLen; j++){
                    iPath = this.get(j);

                    // console.info("j: " + j);
                    if(iPath.equals(path)){
                        index = j;

                        // console.info("index: " + index);
                        for(var k = j + 1; k < (j + size); k++){
                            // console.info("k: " + k, (j + size));
                            iPath = this.get(k);

                            if(!iPath.equals(paths[++i])){
                                return -1;
                            }
                        }
                        return index;
                    }
                }
            }

            return index;
        },
        cover: function(paths){
            this.paths = paths;
            this.size = this.paths.length;
        },
        getPathData: function(){
            return this.paths;
        },
        getPathDataLength: function(){
            return this.size;
        },
        stringify: function(){
            return _SVGPath.stringify(this.getPathData())
        }
    };

    _SVGPath.stringify = function(paths){
        paths = paths || [];

        var size = paths.length;
        var path = null;
        var prev = null;
        var nocommand = false;

        var tmp = [];

        for(var i = 0; i < size; i++){
            path = paths[i];
            nocommand = false;

            if(prev && path.command == prev.command){
                nocommand = true;
            }

            tmp.push(path.toString(nocommand));

            prev = path;
        }

        return tmp.join(" ");
    };

    _SVGPath.parse = function(pathData){
        var pattern = /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gmi;
        var matcher = null;
        var command = null;
        var pathInfo = null;
        var parser = _SVGPathFactory._parser;
        var paths = [];
        var _path = null;
        var _size = 0;

        pattern.lastIndex = 0;

        while(null != (matcher = pattern.exec(pathData))){
            command = matcher[1];
            pathInfo = matcher[2];

            _path = parser.parse(command, pathInfo);
            _size = _path.length;

            if(_size > 1){
                paths.push(_path[0]);
            }else{
                for(var i = 0; i < _size; i++){
                    paths.push(_path[i]);
                }
            }
        }

        return paths;
    };

    _SVGPath.version = "R16B0324";

    module.exports = _SVGPath;
});