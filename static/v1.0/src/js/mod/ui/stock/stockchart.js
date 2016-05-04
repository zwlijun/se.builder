;define(function(require, exports, module){
    var HighStock           = require("lib/extra/highcharts/r4.2.3/highstock");
    var RealTimeTrendChart  = require("mod/ui/stock/realtimetrendchart");
    var KLineChart          = require("mod/ui/stock/klinechart");
    

    //全局配置
    HighStock.setOptions({
        global : {  
            useUTC : true  
        },
        lang: { 
            loading:'加载中...',
            months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月','8月', '9月', '10月', '11月', '12月'],
            shortMonths: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        },
        tooltip: {
            enabled: true,
            dateTimeLabelFormats: {
                millisecond: '%Y-%b-%e(%A) %H:%M:%S.%L',
                second: '%Y-%b-%e(%A) %H:%M:%S',
                minute: '%Y-%b-%e(%A) %H:%M',
                hour: '%Y-%b-%e(%A) %H',
                day: '%Y-%b-%e(%A)',
                week: '%Y-%b-%e(%A)',
                month: '%Y-%b',
                year: '%Y'
            }
        },
        title: null,
        subtitle: null
    });

    //股票图表
    var StockChart = function(){

    };

    StockChart.Types = {
        "RT_TREND": "trend",
        "KLINE": "kline"
    };
    StockChart.create = function(type, name, options){
        if(StockChart.Types.RT_TREND == type){
            return RealTimeTrendChart.getRealTimeTrendChart(name, HighStock, options);
        }

        if(StockChart.Types.KLINE == type){
            return KLineChart.getKLineChart(name, HighStock, options);
        }

        console.error("unknown chart type(" + type + ")");

        return null;
    }

    module.exports = {
        version: "R16B0428",
        "Types": StockChart.Types,
        create: function(type, name, options){
            return StockChart.create(type, name, options);
        }
    }
});