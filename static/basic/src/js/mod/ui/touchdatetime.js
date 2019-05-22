/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * TouchDatetime模块 extends TouchSelect
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2017.6
 */
;define(function TouchSelect(require, exports, module){
    var DateUtil          = require("mod/se/dateutil");
    var TouchSelect       = require("mod/ui/touchselect");

    var GetDefaultDataRange = function(){
        return {
            "year": {
                "start": 1949,
                "end": 2050,
                "step": 1,
                "reverse": false,
                "label": {"value": "", "text": "年", "linkedvalue": ""}
            },
            "month": {
                "start": 1,
                "end": 12,
                "step": 1,
                "reverse": false,
                "label": {"value": "", "text": "月", "linkedvalue": ""}
            },
            "date": {
                "start": 1,
                "end": 31,
                "step": 1,
                "reverse": false,
                "label": {"value": "", "text": "日", "linkedvalue": ""}
            },
            "hours": {
                "start": 0,
                "end": 23,
                "step": 1,
                "reverse": false,
                "label": {"value": "", "text": "时", "linkedvalue": ""}
            },
            "minutes": {
                "start": 0,
                "end": 59,
                "step": 1,
                "reverse": false,
                "label": {"value": "", "text": "分", "linkedvalue": ""}
            },
            "seconds": {
                "start": 0,
                "end": 59,
                "step": 1,
                "reverse": false,
                "label": {"value": "", "text": "秒", "linkedvalue": ""}
            }
        };
    };

    var TouchDatetime = function(name){
        this.dataRange = GetDefaultDataRange();
        this.yearDataMap = {};
        this.monthDataMap = {};
        this.dateDataMap = {};
        this.hoursDataMap = {};
        this.minutesDataMap = {};
        this.secondsDataMap = {};

        this.format = TouchDatetime.FORMAT.DATETIME;
        this.needUpdate = true;
        this.prevSelectedOptions = [];
        this.generateData();

        this.ts = TouchSelect.newTouchSelect(name);
        this.ts.options({
            "name": name,
            "type": "touchdatetime",
            "title": "请选择",
            "action": "tap",
            "data": null,
            "defaultOptions": []
        });
    };

    TouchDatetime.prototype = {
        set: function(type, option){
            this.ts.set(type, option);
        },
        resetDataList: function(){
            this.yearDataMap = {};
            this.monthDataMap = {};
            this.dateDataMap = {};
            this.hoursDataMap = {};
            this.minutesDataMap = {};
            this.secondsDataMap = {};
        },
        parseDateOptions: function(dataOptions){
            var format = this.format;
            var ts = this.ts;
            var d0 = new Date();
            var year = undefined;
            var month = undefined;
            var yearOption = null;
            var monthOption = null;

            switch(format){
                case TouchDatetime.FORMAT.DATETIME:
                case TouchDatetime.FORMAT.SHORT_DATETIME:
                case TouchDatetime.FORMAT.SHORT_DATETIME_HOUR:
                case TouchDatetime.FORMAT.DATE:
                    yearOption = dataOptions[0];
                    monthOption = dataOptions[1];

                    if(yearOption && yearOption.value){
                        year = yearOption.value;
                    }
                    if(monthOption && monthOption.value){
                        month = monthOption.value;
                    }
                break;
                case TouchDatetime.FORMAT.MONTH_DATE:
                    monthOption = dataOptions[0];

                    year = d0.getFullYear();

                    if(monthOption && monthOption.value){
                        month = monthOption.value;
                    }
                break;
            }

            if(!year || !month){
                return null;
            }

            var d = new Date(year, month - 1, 1);
            var o = DateUtil.leapYear(d);

            var dataRange = this.dataRange;
            var range = dataRange.date;

            var days = o.monthDays;
            var dateOption = null;
            var options = [];

            for(var i = range.start; i <= range.end && i <= days; i += range.step){
                dateOption = {"value": i, "text": (i < 10 ? "0" + i : "" + i), "linkedvalue": ""};

                options.push(dateOption);
            }

            if(true === range.reverse){
                options["options"].reverse();
            }

            return options
        },
        updateDateOptions: function(options){
            var dateOptions = this.parseDateOptions(options);

            if(dateOptions){
                this.dateDataMap["options"] = dateOptions;
                this.ts.options("defaultOptions", options);
                this.ts.updateColumnData(2, this.dateDataMap).update(2, true);
            }
        },
        generateData: function(range){
            this.resetDataList();

            var dataRange = range ? (this.dataRange = $.extend(true, GetDefaultDataRange(), range)) : this.dataRange;

            var year = dataRange.year;
            var month = dataRange.month;
            var date = dataRange.date;
            var hours = dataRange.hours;
            var minutes = dataRange.minutes;
            var seconds = dataRange.seconds;

            var yearOption = null;
            var monthOption = null;
            var dateOption = null;
            var hoursOption = null;
            var minutesOption = null;
            var secondsOption = null;

            this.yearDataMap["label"] = year.label;
            this.yearDataMap["options"] = [];

            this.monthDataMap["label"] = month.label;
            this.monthDataMap["options"] = [];

            this.dateDataMap["label"] = date.label;
            this.dateDataMap["options"] = [];

            this.hoursDataMap["label"] = hours.label;
            this.hoursDataMap["options"] = [];

            this.minutesDataMap["label"] = minutes.label;
            this.minutesDataMap["options"] = [];

            this.secondsDataMap["label"] = seconds.label;
            this.secondsDataMap["options"] = [];

            for(var i = year.start; i <= year.end; i += year.step){
                yearOption = {"value": i, "text": "" + i, "linkedvalue": ""};
                this.yearDataMap["options"].push(yearOption);
            }

            if(true === year.reverse){
                this.yearDataMap["options"].reverse();
            }

            for(var j = month.start; j <= month.end; j += month.step){
                monthOption = {"value": j, "text": (j < 10 ? "0" + j : "" + j), "linkedvalue": ""};
                this.monthDataMap["options"].push(monthOption);
            }

            if(true === month.reverse){
                this.monthDataMap["options"].reverse();
            }

            for(var j = date.start; j <= date.end; j += date.step){
                dateOption = {"value": j, "text": (j < 10 ? "0" + j : "" + j), "linkedvalue": ""};
                this.dateDataMap["options"].push(dateOption);
            }

            if(true === date.reverse){
                this.dateDataMap["options"].reverse();
            }

            for(var h = hours.start; h <= hours.end; h += hours.step){
                hoursOption = {"value": h, "text": (h < 10 ? "0" + h : "" + h), "linkedvalue": ""};
                this.hoursDataMap["options"].push(hoursOption);
            }

            if(true === hours.reverse){
                this.hoursDataMap["options"].reverse();
            }

            for(var m = minutes.start; m <= minutes.end; m += minutes.step){
                minutesOption = {"value": m, "text": (m < 10 ? "0" + m : "" + m), "linkedvalue": ""};
                this.minutesDataMap["options"].push(minutesOption);
            }

            if(true === minutes.reverse){
                this.minutesDataMap["options"].reverse();
            }

            for(var s = seconds.start; s <= seconds.end; s += seconds.step){
                secondsOption = {"value": s, "text": (s < 10 ? "0" + s : "" + s), "linkedvalue": ""};
                this.secondsDataMap["options"].push(secondsOption);
            }

            if(true === seconds.reverse){
                this.secondsDataMap["options"].reverse();
            }
        },
        render: function(format, opts){
            var ts = this.ts;

            opts = opts || {};
            
            opts.data = {
                "linked": false,
                "list": []
            };

            this.format = format;

            switch(format){
                case TouchDatetime.FORMAT.SHORT_DATETIME:
                    opts.data.list.push(this.yearDataMap);
                    opts.data.list.push(this.monthDataMap);
                    opts.data.list.push(this.dateDataMap);
                    opts.data.list.push(this.hoursDataMap);
                    opts.data.list.push(this.minutesDataMap);
                break;
                case TouchDatetime.FORMAT.SHORT_DATETIME_HOUR:
                    opts.data.list.push(this.yearDataMap);
                    opts.data.list.push(this.monthDataMap);
                    opts.data.list.push(this.dateDataMap);
                    opts.data.list.push(this.hoursDataMap);
                break;
                case TouchDatetime.FORMAT.DATE:
                    opts.data.list.push(this.yearDataMap);
                    opts.data.list.push(this.monthDataMap);
                    opts.data.list.push(this.dateDataMap);
                break;
                case TouchDatetime.FORMAT.SHORT_DATE:
                    opts.data.list.push(this.yearDataMap);
                    opts.data.list.push(this.monthDataMap);
                break;
                case TouchDatetime.FORMAT.MONTH_DATE:
                    opts.data.list.push(this.monthDataMap);
                    opts.data.list.push(this.dateDataMap);
                break;
                case TouchDatetime.FORMAT.YEAR:
                    opts.data.list.push(this.yearDataMap);
                break;
                case TouchDatetime.FORMAT.TIME:
                    opts.data.list.push(this.hoursDataMap);
                    opts.data.list.push(this.minutesDataMap);
                    opts.data.list.push(this.secondsDataMap);
                break;
                case TouchDatetime.FORMAT.SHORT_TIME:
                    opts.data.list.push(this.hoursDataMap);
                    opts.data.list.push(this.minutesDataMap);
                break;
                case TouchDatetime.FORMAT.MINUTES_SECONDS:
                    opts.data.list.push(this.minutesDataMap);
                    opts.data.list.push(this.secondsDataMap);
                break;
                default:
                    opts.data.list.push(this.yearDataMap);
                    opts.data.list.push(this.monthDataMap);
                    opts.data.list.push(this.dateDataMap);
                    opts.data.list.push(this.hoursDataMap);
                    opts.data.list.push(this.minutesDataMap);
                    opts.data.list.push(this.secondsDataMap);

                    this.format = TouchDatetime.FORMAT.DATETIME;
                break;
            };

            var stack = ts.getHandleStack();

            stack.add({
                "type": "selected",
                "data": {
                    callback: function(name, columnIndex){
                        var selectedOptions = this.ts.getSelectedOptions();
                        var prevSelectedOptions = this.prevSelectedOptions;
                        var size = prevSelectedOptions.length;

                        var yearOption = null;
                        var monthOption = null;

                        var prevYearOption = null;
                        var prevMonthOption = null;

                        var format = this.format;

                        this.needUpdate = true;

                        if(size > 0){
                            switch(format){
                                case TouchDatetime.FORMAT.DATETIME:
                                case TouchDatetime.FORMAT.SHORT_DATETIME:
                                case TouchDatetime.FORMAT.SHORT_DATETIME_HOUR:
                                case TouchDatetime.FORMAT.DATE:
                                    yearOption = selectedOptions[0];
                                    monthOption = selectedOptions[1];

                                    prevYearOption = prevSelectedOptions[0];
                                    prevMonthOption = prevSelectedOptions[1];

                                    var d0 = DateUtil.leapYear(new Date(Number(yearOption.value), Number(monthOption.value) - 1, 1));
                                    var d1 = DateUtil.leapYear(new Date(Number(prevYearOption.value), Number(prevMonthOption.value) - 1, 1));
                                    
                                    // console.log(d0.monthDays, d1.monthDays);

                                    this.needUpdate = d0.monthDays !== d1.monthDays;
                                break;
                                case TouchDatetime.FORMAT.MONTH_DATE:
                                    var d = new Date();
                                    year = d0.getFullYear();

                                    monthOption = selectedOptions[1];
                                    prevMonthOption = prevSelectedOptions[1];

                                    var d0 = DateUtil.leapYear(new Date(year, Number(monthOption.value) - 1, 1));
                                    var d1 = DateUtil.leapYear(new Date(year, Number(prevMonthOption.value) - 1, 1));

                                    // console.log(d0.monthDays, d1.monthDays);

                                    this.needUpdate = d0.monthDays !== d1.monthDays;
                                break;
                            }
                        }

                        // console.log("selected......")
                        // console.log(selectedOptions);
                        // console.log(prevSelectedOptions);
                        // console.log("...................")

                        if(this.needUpdate){
                            this.updateDateOptions(selectedOptions);
                        }
                    },
                    context: this
                }
            });

            stack.add({
                "type": "changebefore",
                "data": {
                    callback: function(name){
                        var selectedOptions = this.ts.getSelectedOptions();
                        this.prevSelectedOptions = selectedOptions;
                    },
                    context: this
                }
            });

            ts.options(opts);

            var defaultOptions = ts.options("defaultOptions");
            
            this.updateDateOptions(defaultOptions);

            ts.render();
        }
    };

    TouchDatetime.YEAR = (1 << 0);
    TouchDatetime.MONTH = (1 << 1);
    TouchDatetime.DATE = (1 << 2);
    TouchDatetime.HOURS = (1 << 3);
    TouchDatetime.MINUTES = (1 << 4);
    TouchDatetime.SECONDS = (1 << 5);

    TouchDatetime.FORMAT = {
        "YEAR": TouchDatetime.YEAR, //年
        "DATETIME": TouchDatetime.YEAR | TouchDatetime.MONTH | TouchDatetime.DATE | TouchDatetime.HOURS | TouchDatetime.MINUTES | TouchDatetime.SECONDS, //年月日时分秒
        "SHORT_DATETIME": TouchDatetime.YEAR | TouchDatetime.MONTH | TouchDatetime.DATE | TouchDatetime.HOURS | TouchDatetime.MINUTES, //年月日时分
        "SHORT_DATETIME_HOUR": TouchDatetime.YEAR | TouchDatetime.MONTH | TouchDatetime.DATE | TouchDatetime.HOURS, //年月日时
        "DATE": TouchDatetime.YEAR | TouchDatetime.MONTH | TouchDatetime.DATE, //年月日
        "SHORT_DATE": TouchDatetime.YEAR | TouchDatetime.MONTH, //年月
        "MONTH_DATE": TouchDatetime.MONTH | TouchDatetime.DATE, //月日
        "TIME": TouchDatetime.HOURS | TouchDatetime.MINUTES | TouchDatetime.SECONDS, //时分秒
        "SHORT_TIME": TouchDatetime.MINUTES | TouchDatetime.SECONDS, //时分
        "MINUTES_SECONDS": TouchDatetime.MINUTES | TouchDatetime.SECONDS //分秒
    };

    TouchDatetime.Cache = {};

    TouchDatetime.newTouchDatetime = function(name){
        var tc = TouchDatetime.Cache[name] || (TouchDatetime.Cache[name] = new TouchDatetime(name));

        return {
            "touchselect": tc.ts,
            set: function(type, option){
                tc.set(type, option);

                return this;
            },
            define: function(range){
                tc.generateData(range);

                return this;
            }, 
            render: function(format, opts){
                tc.render(format, opts);

                return this;
            }
        };
    };

    TouchDatetime.getTouchDatetime = function(name){
        if(name in TouchDatetime.Cache){
            return TouchDatetime.newTouchDatetime(name);
        }

        return null;
    };

    module.exports = {
        "version": "R18B1206",
        "FORMAT": TouchDatetime.FORMAT,
        newTouchDatetime: function(name){
            return TouchDatetime.newTouchDatetime(name);
        },
        getTouchDatetime: function(name){
            return TouchDatetime.getTouchDatetime(name);
        }
    };
});