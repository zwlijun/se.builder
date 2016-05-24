;define(function(require, exports, module){
    var DateUtil = require("mod/se/dateutil");
    var DataType = require("mod/se/datatype");
    //分时图
    //options -> render         图表渲染区域
    //options -> dataRange      数据范围， {start: StartUTC, end: EndUTC}，默认: {start: 0, end: Number.MAX_VALUE}
    //options -> volume         是否显示成交量，true/false
    //options -> rangeSelect    是否启用范围选择
    //options -> rangeVisible   是否显示范围选择
    //options -> selectorHeight 范围选择高度
    //options -> selectedIndex  默认选择范围
    //options -> width          宽度
    //options -> height         高度
    //options -> colors         颜色配置
    //           colors -> line     线条颜色，默认值为：rgba(24, 124, 243, 1)
    //           colors -> fill     填充颜色，默认值为：rgba(24, 124, 243, 0.05)
    //           colors -> red      红色，默认值为：#ff3e3e
    //           colors -> green    绿色，默认值为：#1dc83d
    //           colors -> blue     蓝色，默认值为：#187cf3
    //           colors -> orange   橙色，默认值为：#ff8000
    //           colors -> grid     栅格颜色，默认值为：#e0e0e0
    //           colors -> white    白色，默认值为：#ffffff
    //           colors -> black    黑色，默认值为：#222222
    //options -> animation      是否启用动画， true/false
    //options -> scrollbar      是否启用滚动条，true/false
    //options -> navigator      是否启动导航栏，true/false
    //options -> reverse        是否将数据逆排，true/false
    //options -> tooltip        是否显示tooltips，true/false
    //options -> dataDefine     数据项字义，["x","y","average","volume","open","close","high","low"]
    var GetDefaultOptions = function(){
        var options = {
            render: null,
            dataRange: {
                start: 0, 
                end: Number.MAX_VALUE
            },
            volume: true,
            rangeSelect: true,
            rangeVisible: true,
            selectedIndex: 1,
            selectorHeight: 35,
            width: null,
            height: null,
            colors: {
                line: "#187cf3",                    //#187cf3
                fill: "rgba(24, 124, 243, 0.05)",   //#187cf3|0.05
                red: "#ff3e3e",                     //#ff3e3e
                green: "#1dc83d",                   //#1dc83d
                blue: "#187cf3",                    //#187cf3
                orange: "#ff8000",                  //#ff8000
                grid: "#e0e0e0",                    //#e0e0e0
                white: "#ffffff",
                black: "#222222"
            },
            animation: false,
            scrollbar: false,
            navigator: false,
            reverse: true,
            tooltip: false,
            dataDefine: [
                KLineChart.DataItem.X, 
                KLineChart.DataItem.OPEN,
                KLineChart.DataItem.CLOSE,
                KLineChart.DataItem.HIGH,
                KLineChart.DataItem.LOW,
                KLineChart.DataItem.VOLUME
            ]
        };

        return options;
    };
    //K线图
    var KLineChart = function(name, highStock, options){
        this.name = name;
        this.highStock = highStock;
        this.opts = $.extend(true, GetDefaultOptions(), options);
    };

    KLineChart.prototype = {
        options: function(){
            var args = arguments;
            var size = args.length;

            if(0 === size){
                return this.opts;
            }

            if(1 === size){
                if(DataType.isString(args[0])){
                    return this.opts[args[0]];
                }

                this.opts = $.extend(true, this.opts, args[0]);
            }
        },
        parseDateTime: function(value){
            //1461898630908
            //2016-04-29 10:57:30
            //2016-04-29 10:57
            //2016-04-29 10
            //2016-04-29
            value = value.replace(/^([\s]+)([\s]+)$/, "");

            if(/^[0-9]{13}$/.test(value)){
                return DateUtil.toUTC(Number(value));
            }
            //[
            //  0 -> "2016-04-29 10:57:30", 
            //  1 -> "2016", 
            //  2 -> "04", 
            //  3 -> "29", 
            //  4 -> " 10:57:30", 
            //  5 -> "10", 
            //  6 -> ":57", 
            //  7 -> "57", 
            //  8 -> ":30", 
            //  9 -> "30"
            //]
            var pattern = /^([0-9]{4})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{1,2})([\s]([0-9]{1,2})(:([0-9]{1,2}))?(:([0-9]{1,2}))?)?$/;
            var matcher = pattern.exec(value);

            if(null !== matcher){
                var year = Number(matcher[1]);
                var month = Number(matcher[2]) - 1;
                var date = Number(matcher[3]);
                var hours = Number(matcher[5] || 0);
                var minutes = Number(matcher[7] || 0);
                var seconds = Number(matcher[9] || 0);

                return Date.UTC(year, month, date, hours, minutes, seconds, 0);
            }

            throw new Error("parseDateTime() -> 不支持的数格式(" + value + ")");
        },
        defineData: function(items){
            var dataItemDefine = this.options("dataDefine");
            var defineSize = dataItemDefine.length;
            var itemSize = items.length;
            var tmp = {};
            var defineDataKey = null;

            if(itemSize !== defineSize){
                console.log("定义的数据格式长度与传入的数据长度不一致(" + defineSize + ", " + itemSize + ")");
            }

            for(var i = 0; i < defineSize; i++){
                defineDataKey = dataItemDefine[i];

                if(defineDataKey === KLineChart.DataItem.X){ // X轴，限定为时间
                    tmp[defineDataKey] = this.parseDateTime(items[i]);
                }else{
                    var value = items[i];

                    if(DataType.isUndefined(value)){
                        tmp[defineDataKey] = value;
                    }else{
                        value = Number(value);

                        tmp[defineDataKey] = isNaN(value) ? undefined : value;
                    }
                    
                }
            }

            return tmp;
        },
        parseDateItems: function(data){
            var dataItems = null;
            var dataItem = null;
            
            if(DataType.isString(data)){
                dataItems = data.split(",");
                dataItem = this.defineData(dataItems);
            }else if(DataType.isArray(data)){
                dataItems = data;
                dataItem = this.defineData(dataItems);
            }else if(DataType.isObject(data)){
                dataItem = data;
            }

            if(!dataItem){
                throw new Error("parseDateItems() -> 不支持的数格式(" + DataType.typeof(data) + ")，数据格式为字符串(多条数据由’,‘隔开)、数组类型或对象");
            }

            return dataItem;
        },
        parseData: function(data){
            var dataList = null;

            if(!DataType.isEmptyString(data)){
                dataList = data.split("|");
            }else if(DataType.isArray(data)){
                dataList = data;
            }else{
                dataList = [];
            }

            var size = dataList.length;
            var dataItem = null;
            var list = [];

            for(var i = 0; i < size; i++){
                dataItem = this.parseDateItems(dataList[i]);

                list.push(dataItem);
            }

            if(true === this.options("reverse")){
                list.reverse();
            }

            return this.filterData(list);
        },
        filterData: function(dataList){
            var size = dataList.length;
            var lastData = size > 0 ? dataList[size - 1] : null;
            var dateKey = KLineChart.DataItem.X;
            var lastUTCDate = lastData ? lastData[dateKey] : DateUtil.toUTC(new Date());
            var DataRange = this.options("dataRange");

            var filterList = dataList.filter(function(data){
                var utcDate = data[dateKey];

                if(utcDate >= DataRange.start && utcDate <= DataRange.end){
                    return true;
                }
                return false;
            });
            
            return filterList;
        },
        process: function(dataList){
            var size = dataList.length;
            var ohlc = [];
            var volumes = [];
            var data = null;
            var utc = 0;
            var open = 0;
            var high = 0;
            var low = 0;
            var close = 0;
            var vol = 0;

            var preOHLC = null;
            var _ohlc = null;

            var dateKey = KLineChart.DataItem.X;
            var openKey = KLineChart.DataItem.OPEN;
            var highKey = KLineChart.DataItem.HIGH;
            var lowKey = KLineChart.DataItem.LOW;
            var closeKey = KLineChart.DataItem.CLOSE;
            var volumeKey = KLineChart.DataItem.VOLUME;

            var diff = 0;
            var colors = this.options("colors");
            var red = colors.red;
            var green = colors.green;
            var color = red;

            var min = {
                average: 0,
                volume: 0,
                percentage: 0.00,
                price: 0
            };
            var max = {
                average: 0,
                volume: 0,
                percentage: 0.00,
                price: 0
            };

            for(var i = 0; i < size; i++){
                data = dataList[i];

                utc = data[dateKey];
                open = data[openKey] || 0;
                high = data[highKey] || 0;
                low = data[lowKey] || 0;
                close = data[closeKey] || 0;
                vol = data[volumeKey] || 0;

                _ohlc = {
                    "x": utc,
                    "open": open,
                    "high": high,
                    "low": low,
                    "close": close
                };

                color = open < close ? red : green;

                min.average = Math.min(min.average, (high - low) / 2);
                min.volume = Math.min(min.volume, vol);
                min.price = Math.min(min.price, low);

                max.average = Math.max(max.average, (high - low) / 2);
                max.volume = Math.max(max.volume, vol);
                max.price = Math.max(max.high, high);

                if(preOHLC){
                    min.percentage = Math.min(min.percentage, (100 * (_ohlc.close / preOHLC.close - 1)));
                    max.percentage = Math.max(max.percentage, (100 * (_ohlc.close / preOHLC.close - 1)));
                }else{
                    min.percentage = Math.min(min.percentage, 0);
                    max.percentage = Math.max(max.percentage, 0);
                }

                ohlc.push(_ohlc);

                volumes.push({
                    "x": utc,
                    "y": vol,
                    "color": color
                });

                preOHLC = _ohlc;
            }

            return {
                "ohlc": ohlc,
                "volumes": volumes,
                "min": min,
                "max": max
            };
        },
        buildStockOptions: function(dataList){
            var data = this.process(dataList); //最终数据
            var colors = this.options("colors");
            var _HighStock = this.highStock;

            var stockOptions = {
                chart: {
                    spacingTop: 12,
                    width: this.options("width") || null,
                    height: this.options("height") || null
                },
                navigator: {
                    enabled: this.options("navigator"),
                    series: {
                        data: data.volumes
                    },
                    xAxis: {
                        labels: {
                            enabled: false
                        }
                    }
                },
                scrollbar: {
                    enabled: this.options("scrollbar")
                },
                rangeSelector: {
                    enabled: this.options("rangeSelect"),
                    selected: this.options("selectedIndex"),
                    inputEnabled: false,
                    height: this.options("selectorHeight"),
                    buttons: [
                        {
                            type: 'month',
                            count: 1,
                            text: ' 1个月 '
                        },
                        {
                            type: 'month',
                            count: 3,
                            text: ' 3个月 '
                        },
                        {
                            type: 'month',
                            count: 6,
                            text: ' 半年 '
                        },
                        {
                            type: 'year',
                            count: 1,
                            text: ' 1年 '
                        },
                        {
                            type: 'year',
                            count: 3,
                            text: ' 3年 '
                        },
                        {
                            type: 'all',
                            text: ' 所有 '
                        }
                    ],
                    labelStyle: {
                        display: this.options("rangeVisible") ? "inherit" : "none"
                    },
                    buttonTheme: {
                        "fill": colors.grid,
                        "stroke": 'none',
                        "stroke-width": 0,
                        "r": 3,
                        "width": 42,
                        "style": {
                            color: colors.black,
                            display: this.options("rangeVisible") ? "inherit" : "none"
                        },
                        states: {
                            hover: {

                            },
                            select: {
                                fill: colors.blue,
                                style: {
                                    color: colors.white
                                }
                            }
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                xAxis: [],
                yAxis: [],
                plotOptions: {
                    candlestick: {
                        upColor: colors.red,              
                        upLineColor: colors.red,
                        color: colors.green,
                        lineColor: colors.green,
                        dataGrouping: {
                            dateTimeLabelFormats: {
                                millisecond: ['%Y-%b-%e(%A) %H:%M:%S.%L', '%Y-%b-%e(%A) %H:%M:%S.%L', '-%H:%M:%S.%L'],
                                second: ['%Y-%b-%e(%A) %H:%M:%S', '%Y-%b-%e(%A) %H:%M:%S', '-%H:%M:%S'],
                                minute: ['%Y-%b-%e(%A) %H:%M', '%Y-%b-%e(%A) %H:%M', '-%H:%M'],
                                hour: ['%Y-%b-%e(%A) %H:%M', '%Y-%b-%e(%A) %H:%M', '-%H:%M'],
                                day: ['%Y-%b-%e(%A)', '%Y-%b-%e(%A)', '-%Y-%b-%e(%A)'],
                                week: ['起始于(周)：%Y-%b-%e, %A', '%b-%e, %A', '-%Y-%b-%e, %A'],
                                month: ['%Y-%b', '%B', '-%Y-%b'],
                                year: ['%Y', '%Y', '-%Y']
                            }
                        }
                    }
                },
                series: []
            };

            _HighStock.setOptions({
                "tooltip": {
                    "enabled": true === this.options("tooltip")
                }
            });

            var DateTimeAxis = {
                labels: {
                    style: {
                        font: "normal 8px"
                    },
                    formatter:function(){
                        var returnTime = _HighStock.dateFormat('%Y-%m-%d', this.value);

                        return returnTime;
                    }
                }
            };
            var PriceAxis = {
                opposite: true,
                labels: {
                    style: {
                        font: "normal 8px"
                    },
                    overflow: 'justify',
                    align: 'left',
                    x: 2,
                    y: 4,
                    formatter:function(){
                        return (this.value).toFixed(2);
                    }
                },
                top:'0%',
                height: (true === this.options("volume") ? '75%' : '100%'),
                lineWidth: 0.5,
                gridLineColor: colors.grid,
                gridLineWidth: 0.2,
                showFirstLabel: true,
                showLastLabel: true
            };
            var PriceSeries = {
                name: "OHLC",
                data: data.ohlc,
                type: "candlestick",
                animation: this.options("animation"),
                tooltip : {
                    valueDecimals : 3,
                    pointFormatter: function(){
                        var tmp = '' +
                                  '<span>开　盘：'  + this.open + '</span><br>' +
                                  '<span>最　高：'  + this.high + '</span><br>' +
                                  '<span>最　低：'  + this.low + '</span><br>' +
                                  '<span>收　盘：'  + this.close + '</span><br>' +
                                  '';

                        return tmp;
                    }
                },
                xAxis: 0,
                yAxis: 0
            };

            stockOptions.xAxis.push(DateTimeAxis);
            stockOptions.yAxis.push(PriceAxis);
            stockOptions.series.push(PriceSeries);

            if(true === this.options("volume")){
                var VolumAxis = {
                    opposite: true,
                    labels: {
                        style: {
                            font: "normal 12px"
                        },
                        overflow: 'justify',
                        align: 'left',
                        x: 2,
                        y: 10,
                        formatter:function(){
                            var units = ["", "万", "亿"];
                            var base = 0;
                            var size = units.length;
                            var unit = "";

                            for(var i = units.length - 1; i >= 0; i--){
                                base = Math.pow(10, i * 4);
                                unit = units[i];

                                if(this.value >= base){
                                    var div = Number((this.value / base).toFixed(2));
                                    var fdiv = Math.floor(div);

                                    return (div - fdiv == 0 ? fdiv : div) + unit;
                                }
                            }
                        }
                    },
                    top: '80%',
                    height: '20%',
                    offset: -1,
                    lineWidth: 0.5,
                    gridLineColor: colors.grid,
                    gridLineWidth: 0.2,
                    showFirstLabel: false,
                    showLastLabel: true,
                    tickPositioner: function(){
                        var positions = [];

                        var max = data.max;
                        var maxTick = max.volume;

                        positions.push(0)
                        positions.push(maxTick);

                        return positions;
                    }
                };
                var VolumSeries = {
                    type: 'column',
                    name: '成交量',
                    data: data.volumes,
                    animation: this.options("animation"),
                    tooltip: {
                        pointFormatter: function(){
                            var tmp = '' +
                                      '<span>成交量：'  + this.y + '</span><br>' +
                                      '';

                            return tmp;
                        }
                    },
                    dataGrouping: {
                        enabled: false,
                        forced: true
                    },
                    yAxis: 1
                };

                stockOptions.yAxis.push(VolumAxis);
                stockOptions.series.push(VolumSeries);
            }

            return stockOptions;
        },
        render: function(data){
            var _HighStock = this.highStock;
            var stockOptions = this.buildStockOptions(this.parseData(data));
            var _charts = new _HighStock.StockChart(this.options("render"), stockOptions);

            return _charts;
        }
    };

    KLineChart.type = "kline";
    KLineChart.version = "R16B0428";
    KLineChart.DataItem = {
        "X": "x",
        "Y": "y",
        "AVERAGE": "average",
        "VOLUME": "volume",
        "OPEN": "open",
        "CLOSE": "close",
        "HIGH": "high",
        "LOW": "low"
    };
    KLineChart.Charts = {};

    KLineChart.getKLineChart = function(name, highStock, options){
        if(!name){
            console.error("`name` is required");
            return null;
        }

        if(!highStock){
            console.error("`highStock` is required");
            return null;
        }

        var key = KLineChart.type + "_" + name;

        var chart = KLineChart.Charts[key];

        if(!chart){
            var kl = new KLineChart(name, highStock, options || {});

            chart = {
                render: function(data){
                    return kl.render(data);
                },
                options: function(){
                    return kl.options.apply(kl, arguments);
                }
            };

            KLineChart.Charts[key] = chart;
        }

        return chart;
    };

    module.exports = {
        type: KLineChart.type,
        version: KLineChart.version,
        DataItem: KLineChart.DataItem,
        getKLineChart: function(name, highStock, options){
            return KLineChart.getKLineChart(name, highStock, options);
        }
    }
});