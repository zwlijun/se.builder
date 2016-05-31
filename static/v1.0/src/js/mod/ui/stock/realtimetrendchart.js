/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 股票分时图
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.5
 */
;define(function(require, exports, module){
    var DateUtil = require("mod/se/dateutil");
    var DataType = require("mod/se/datatype");
    //分时图
    //options -> render         图表渲染区域
    //options -> timeRange      时间区间， 0: 9:30|11:30/13:00|15:00  1: 9:00|9:30|12:00/13:00|16:00 默认为0 
    //options -> volume         是否显示成交量，true/false
    //options -> percentage     是否显示百分率，true/false
    //options -> rangeSelect    是否启用范围选择
    //options -> rangeVisible   是否显示范围选择
    //options -> selectedIndex  默认选择范围
    //options -> selectorHeight 范围选择高度
    //options -> tickAmount     刻度数量，默认为5
    //options -> width          宽度
    //options -> height         高度
    //options -> floating       浮动，默认true
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
    //options -> todayOpen      今开
    //options -> yesterdayClose 昨收
    //options -> dataDefine     数据项字义，["x","y","average","volume","open","close","high","low"]
    var GetDefaultOptions = function(){
        var options = {
            render: null,
            timeRange: 0,
            volume: true,
            percentage: true,
            rangeSelect: false,
            rangeVisible: true,
            selectedIndex: 5,
            selectorHeight: 35,
            tickAmount: 5,
            width: null,
            height: null,
            floating: true,
            colors: {
                line: "#187cf3",                    //#187cf3
                fill: "rgba(24, 124, 243, 0.15)",   //#187cf3|0.05
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
            todayOpen: 0.00,
            yesterdayClose: 0.00,
            dataDefine: [
                RealTimeTrendChart.DataItem.X, 
                RealTimeTrendChart.DataItem.Y,
                RealTimeTrendChart.DataItem.AVERAGE,
                RealTimeTrendChart.DataItem.VOLUME
            ]
        };

        return options;
    };
    var RealTimeTrendChart = function(name, highStock, options){
        this.name = name;
        this.highStock = highStock;
        this.opts = $.extend(true, GetDefaultOptions(), options);
    };

    RealTimeTrendChart.prototype = {
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
        getTimeRange: function(utc){
            var timeRange = this.options("timeRange");
            var localDate = DateUtil.toLocalDate(utc);

            var year = localDate.getFullYear();
            var month = localDate.getMonth();
            var date = localDate.getDate();

            var am = {
                start: {
                    hours: 9,
                    minutes: 30,
                    seconds: 0,
                    millisecs: 0
                },
                end: {
                    hours: 11,
                    minutes: 30,
                    seconds: 0,
                    millisecs: 0
                }
            };
            var pm = {
                start: {
                    hours: 13,
                    minutes: 0,
                    seconds: 0,
                    millisecs: 0
                },
                end: {
                    hours: 15,
                    minutes: 0,
                    seconds: 0,
                    millisecs: 0
                }
            };

            if(1 === timeRange){ //H股
                am = {
                    start: {
                        hours: 9,
                        minutes: 30,
                        seconds: 0,
                        millisecs: 0
                    },
                    end: {
                        hours: 12,
                        minutes: 0,
                        seconds: 0,
                        millisecs: 0
                    }
                };
                pm = {
                    start: {
                        hours: 13,
                        minutes: 0,
                        seconds: 0,
                        millisecs: 0
                    },
                    end: {
                        hours: 16,
                        minutes: 0,
                        seconds: 0,
                        millisecs: 0
                    }
                };
            }

            var TimeRange = {
                AM: {
                    Start: Date.UTC(
                        year, 
                        month, 
                        date, 
                        am.start.hours, 
                        am.start.minutes, 
                        am.start.seconds, 
                        am.start.millisecs
                    ),
                    End: Date.UTC(
                        year, 
                        month, 
                        date, 
                        am.end.hours, 
                        am.end.minutes, 
                        am.end.seconds, 
                        am.end.millisecs
                    )
                },
                PM: {
                    Start: Date.UTC(
                        year, 
                        month, 
                        date, 
                        pm.start.hours, 
                        pm.start.minutes, 
                        pm.start.seconds, 
                        pm.start.millisecs
                    ),
                    End: Date.UTC(
                        year, 
                        month, 
                        date, 
                        pm.end.hours, 
                        pm.end.minutes, 
                        pm.end.seconds, 
                        pm.end.millisecs
                    )
                }
            };

            return TimeRange;
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

                if(defineDataKey === RealTimeTrendChart.DataItem.X){ // X轴，限定为时间
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
            var dateKey = RealTimeTrendChart.DataItem.X;
            var lastUTCDate = lastData ? lastData[dateKey] : DateUtil.toUTC(new Date());
            var TimeRange = this.getTimeRange(lastUTCDate);

            var filterList = dataList.filter(function(data){
                var utcDate = data[dateKey];

                if(
                    (utcDate >= TimeRange.AM.Start && utcDate <= TimeRange.AM.End) 
                    || 
                    (utcDate >= TimeRange.PM.Start && utcDate <= TimeRange.PM.End)
                ){
                    return true;
                }
                return false;
            });

            //fill data
            var finalDataList = this.fillData(filterList, TimeRange, dateKey);
            
            return finalDataList;
        },
        fillData: function(filterList, TimeRange, dateKey){
            var filterSize = filterList.length;
            var lastFilter = filterSize > 0 ? filterList[filterSize - 1] : null;
            var lastUTC = lastFilter ? lastFilter[dateKey] : 0;
            var data = null;

            var step = 1 * 60 * 1000; //1 minute

            var ams = TimeRange.AM.Start;
            var ame = TimeRange.AM.End;
            var pms = TimeRange.PM.Start;
            var pme = TimeRange.PM.End;

            if(0 === filterSize){
                for(var i = ams; i <= ame; i += step){
                    data = {};
                    data[dateKey] = i;
                    filterList.push(data);
                }
                for(var i = pms; i <= pme; i += step){
                    data = {};
                    data[dateKey] = i;
                    filterList.push(data);
                }

                return filterList;
            }

            if(lastUTC < ame){
                if(lastUTC < ams){
                    lastUTC = ams;
                }else{
                    lastUTC += step;
                }

                for(var i = lastUTC; i <= ame; i += step){
                    data = {};
                    data[dateKey] = i;
                    filterList.push(data);
                }

                if(i < ame){
                    data = {};
                    data[dateKey] = ame;
                    filterList.push(data);
                }

                for(var i = pms; i <= pme; i += step){
                    data = {};
                    data[dateKey] = i;
                    filterList.push(data);
                }
            }else if(lastUTC < pme){
                if(lastUTC < pms){
                    lastUTC = pms;
                }else{
                    lastUTC += step;
                }

                for(var i = lastUTC; i <= pme; i += step){
                    data = {};
                    data[dateKey] = i;
                    filterList.push(data);
                }

                if(i < pme){
                    data = {};
                    data[dateKey] = pme;
                    filterList.push(data);
                }
            }

            var lastData = filterList[filterList.length - 1];
            var prevLastData = filterList[filterList.length - 2];
            var priceKey = RealTimeTrendChart.DataItem.Y;

            if(undefined !== prevLastData[priceKey]){
                if(undefined === lastData[priceKey]){
                    filterList[filterList.length - 1][priceKey] = prevLastData[priceKey];
                }
            }

            return filterList;
        },
        process: function(dataList){
            var size = dataList.length;
            var open = Number(this.options("todayOpen") || "0");
            var close = Number(this.options("yesterdayClose") || "0");
            var trends = [];
            var volumes = [];
            var prevPrice = close;
            var data = null;
            var price = 0;
            var utc = 0;
            var avg = 0;
            var vol = 0;
            var priceKey = RealTimeTrendChart.DataItem.Y;
            var dateKey = RealTimeTrendChart.DataItem.X;
            var averageKey = RealTimeTrendChart.DataItem.AVERAGE;
            var volumeKey = RealTimeTrendChart.DataItem.VOLUME;
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
                price = data[priceKey];
                avg = data[averageKey] || 0;
                vol = data[volumeKey] || 0;

                color = red;
                if(undefined !== price){
                    if(0 === i){
                        if(open < close){
                            color = green;
                        }

                        price = price || open;

                        min.average = avg;
                        min.price = price;
                        min.volume = vol;
                        min.percentage = (price / close - 1) * 100;

                        max.average = avg;
                        max.price = price;
                        max.volume = vol;
                        max.percentage = (price / close - 1) * 100;
                    }else{
                        diff = price - prevPrice;

                        if(diff < 0){
                            color = green;
                        }
                    }

                    prevPrice = price;

                    min.average = Math.min(min.average, avg);
                    min.volume = Math.min(min.volume, vol);
                    min.price = Math.min(min.price, price);
                    min.percentage = Math.min(min.percentage, (price / close - 1) * 100);

                    max.average = Math.max(max.average, avg);
                    max.volume = Math.max(max.volume, vol);
                    max.price = Math.max(max.price, price);
                    max.percentage = Math.max(max.percentage, (price / close - 1) * 100);
                }

                trends.push({
                    "x": utc,
                    "y": price
                });
                volumes.push({
                    "x": utc,
                    "y": vol,
                    "color": color
                });
            }

            return {
                "trends": trends,
                "volumes": volumes,
                "min": min,
                "max": max
            };
        },
        buildStockOptions: function(dataList){
            var data = this.process(dataList); //最终数据
            var TimeRange = this.getTimeRange(data.trends[data.trends.length - 1][RealTimeTrendChart.DataItem.X]);
            var timeRangeType = this.options("timeRange");
            var colors = this.options("colors");
            var yesterdayClose = this.options("yesterdayClose");
            var _HighStock = this.highStock;
            var positions = [];
            var floating = this.options("floating");
            var tickAmount = this.options("tickAmount");
            var stockOptions = {
                chart: {
                    spacingTop: 12,
                    width: this.options("width") || null,
                    height: this.options("height") || null
                },
                animation: this.options("animation"),
                navigator: {
                    enabled: this.options("navigator"),
                    series: {
                        data: data.trends
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
                            type: 'minute',
                            count: 5,
                            text: '5分钟'
                        },
                        {
                            type: 'minute',
                            count: 15,
                            text: '15钟'
                        },
                        {
                            type: 'minute',
                            count: 30,
                            text: '30分钟'
                        },
                        {
                            type: 'minute',
                            count: 60,
                            text: '1小时'
                        },
                        {
                            type: 'minute',
                            count: 180,
                            text: '3小时'
                        },
                        {
                            type: 'all',
                            text: '所有'
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
                plotOptions: {
                    areaspline: {
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
                series: [],
                xAxis: [],
                yAxis: []
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
                        var returnTime = _HighStock.dateFormat('%H:%M', this.value);

                        if(1 == timeRangeType){
                            if(returnTime=="12:00") {
                                return "12:00/13:00";
                            }
                        }else{
                            if(returnTime=="11:30") {
                                return "11:30/13:00";
                            }
                        }

                        // if(returnTime == "13:00"){
                        //     return "";
                        // }

                        return returnTime;
                    }
                },
                tickPositioner: function(){
                    var positions = [TimeRange.AM.Start, TimeRange.AM.End, /*TimeRange.PM.Start, */TimeRange.PM.End];
                    return positions;
                }
            };
            var PriceAxis = {
                opposite: false,
                labels: {
                    style: {
                        font: "normal 8px"
                    },
                    overflow: 'justify',
                    align: 'left',
                    x: 2,
                    y: -2,
                    formatter:function(){
                        return (this.value).toFixed(2);
                    }
                },
                top:'0%',
                height: (true === this.options("volume") ? '75%' : '100%'),
                offset: 0,
                lineWidth: 0.5,
                gridLineColor: colors.grid,
                gridLineWidth: 0.2,
                showFirstLabel: true,
                showLastLabel: true,
                tickPositioner: function(){
                    positions = [];

                    var min = data.min;
                    var max = data.max;
                    
                    var increment = 0;
                    var tick = 0;
                    var middle = yesterdayClose;
                    var maxPrice = max.price + max.price * 0.05;
                    var minPrice = min.price - min.price * 0.05;
                    var xinc = 0;
                    var ninc = 0;
                    var tickNum = tickAmount;
                    var tickHalf = Math.floor(tickNum / 2);

                    if(true !== floating){
                        increment = (maxPrice - minPrice) / tickNum;   

                        if(maxPrice - middle > 0 && minPrice - middle < 0){
                            xinc = (maxPrice - middle) / tickHalf;
                            ninc = (middle - minPrice) / tickHalf;

                            increment = Math.max(xinc, ninc);
                            // console.info("A: " + increment)
                        }else if(maxPrice - middle > 0 && minPrice - middle > 0){
                            increment = (maxPrice - middle) / tickHalf;
                            // console.info("B: " + increment)
                        }else if(maxPrice - middle < 0 && minPrice - middle < 0){
                            increment = (middle - minPrice) / tickHalf;
                            // console.info("C: " + increment)
                        }
                    }else{
                        var x = Math.abs(max.price - middle);
                        var n = Math.abs(min.price - middle);
                        var d = Math.max(x, n);
                        var m = (d / middle) * 1.05;
                        var k = middle * m;
                        
                        increment = k / tickHalf;
                    }

                    tick = middle;
                    for(var i = 0; i < tickHalf; i++){
                        positions.unshift(tick -= increment);
                    }

                    positions.push(middle);


                    tick = middle;
                    for(var i = 0; i < tickHalf; i++){
                        positions.push(tick += increment);
                    }
                    
                    return positions;
                },
                plotLines: [{
                    value: Number(yesterdayClose),
                    color: colors.orange,
                    width: 1,
                    dashStyle: 'dash',
                    zIndex: 4
                }]
            };
            var PercentageAxis = {
                opposite: true,
                labels: {
                    style: {
                        font: "normal 8px"
                    },
                    overflow: 'justify',
                    align: 'right',
                    x: -2,
                    y: -2,
                    formatter:function(){
                        return (100 * (this.value / yesterdayClose - 1)).toFixed(2)+"%";
                    }
                },
                offset: 0,
                lineWidth: 0.5,
                top:'0%',
                height: (true === this.options("volume") ? '75%' : '100%'),
                gridLineWidth: 0,
                showFirstLabel: true,
                showLastLabel: true,
                tickPositioner:function(){
                    return positions;
                }
            };
            var TrendPriceSeries = {
                name: "分时图/价格",
                data: data.trends,
                type: "areaspline",
                animation: this.options("animation"),
                tooltip : {
                    valueDecimals : 3,
                    pointFormatter: function(){
                        return '<span>价　格：' + (Number(this.y)).toFixed(2) + '</span><br/>';
                    }
                },
                lineWidth: 0.5,
                lineColor: colors.line,
                fillColor: colors.fill,
                gapSize: 0,
                xAxis: 0,
                yAxis: 0
            };
            var PercentageSeries = {
                name: "分时图/涨幅",
                data: data.trends,
                type: "areaspline",
                animation: this.options("animation"),
                tooltip : {
                    valueDecimals : 3,
                    pointFormatter: function(){
                        return '<span>涨　幅：' + (Number((this.y / yesterdayClose - 1) * 100)).toFixed(2) + '%</span><br/>';
                    }
                },
                lineWidth: 0.5,
                lineColor: "transparent",
                fillColor: "transparent",
                gapSize: 0,
                yAxis: 1,
                zIndex: -1000
            };

            stockOptions.xAxis.push(DateTimeAxis);
            stockOptions.yAxis.push(PriceAxis);
            stockOptions.series.push(TrendPriceSeries);

            if(true === this.options("percentage")){
                stockOptions.yAxis.push(PercentageAxis);
                stockOptions.series.push(PercentageSeries);
            }

            if(true === this.options("volume")){
                var VolumAxis = {
                    opposite: false,
                    labels: {
                        style: {
                            font: "normal 12px"
                        },
                        overflow: 'justify',
                        align: 'left',
                        x: 2,
                        y: 12,
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
                                      '<span>成交量：' + this.y + '</span><br>' +
                                      '';

                            return tmp;
                        }
                    },
                    dataGrouping: {
                        enabled: false,
                        forced: true
                    },
                    yAxis:2,
                    zIndex:-1000
                };

                stockOptions.yAxis.push(VolumAxis);

                VolumSeries.yAxis = stockOptions.yAxis.length - 1;
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

    RealTimeTrendChart.type = "trend";
    RealTimeTrendChart.version = "R16B0428";
    RealTimeTrendChart.DataItem = {
        "X": "x",
        "Y": "y",
        "AVERAGE": "average",
        "VOLUME": "volume",
        "OPEN": "open",
        "CLOSE": "close",
        "HIGH": "high",
        "LOW": "low"
    };
    RealTimeTrendChart.Charts = {};

    RealTimeTrendChart.getRealTimeTrendChart = function(name, highStock, options){
        if(!name){
            console.error("`name` is required");
            return null;
        }

        if(!highStock){
            console.error("`highStock` is required");
            return null;
        }

        var key = RealTimeTrendChart.type + "_" + name;

        var chart = RealTimeTrendChart.Charts[key];

        if(!chart){
            var rtt = new RealTimeTrendChart(name, highStock, options || {});

            chart = {
                render: function(data){
                    return rtt.render(data);
                },
                options: function(){
                    return rtt.options.apply(rtt, arguments);
                },
                getTimeRange: function(utc){
                    return rtt.getTimeRange(utc);
                }
            };

            RealTimeTrendChart.Charts[key] = chart;
        }

        return chart;
    };

    module.exports = {
        type: RealTimeTrendChart.type,
        version: RealTimeTrendChart.version,
        DataItem: RealTimeTrendChart.DataItem,
        getRealTimeTrendChart: function(name, highStock, options){
            return RealTimeTrendChart.getRealTimeTrendChart(name, highStock, options);
        }
    }
});