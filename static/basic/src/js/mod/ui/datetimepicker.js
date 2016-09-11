/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 日期/日间选择模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.5
 */
;define(function DateTimePicker(require, exports, module){
    var Util             = require("mod/se/util");
    var DateUtil         = require("mod/se/dateutil");
    var TemplateEngine   = require("mod/se/template");
    var DataType         = require("mod/se/datatype");

    var DATETIME_PICKER = TemplateEngine.getTemplate("mod_datetimepicker", {
        "root": "dtp"
    });

    var _html_structs = ''
                      + '<div class="mod-datetime-picker-frame hide<%=dtp.options.time ? "" : " notime"%><%=dtp.options.mode == 1 ? " year-month" : ""%>" data-datepicker="<%=dtp.identity%>" data-action-mousedown="dtp://picker/bubbles">'
                      + '</div>'
                      + '';
    var _core_structs = ''
                      + '  <div class="mod-datetime-picker-body clearfix">'
                      + '    <div class="mod-datetime-picker-datebox">'
                      + '      <h6 class="mod-dtp-year clearfix">'
                      + '        <sup class="icofont prev" title="上一月" data-action-click="dtp://picker/month/prev#<%=dtp.identity%>,<%=dtp.name%>"></sup>'
                      + '        <em title="点击选择年份" data-action-click="dtp://picker/year/panel#<%=dtp.identity%>,<%=dtp.name%>"><%=dtp.fmt.year%></em>'
                      + '        <span>/</span>'
                      + '        <cite title="点击选择月份" data-action-click="dtp://picker/month/panel#<%=dtp.identity%>,<%=dtp.name%>"><%=dtp.fmt.month%></cite>'
                      + '        <span>/</span>'
                      + '        <i><%=dtp.fmt.date%></i>'
                      + '        <sub class="icofont next" title="下一月" data-action-click="dtp://picker/month/next#<%=dtp.identity%>,<%=dtp.name%>"></sub>'
                      + '      </h6>'
                      + '      <div class="mod-dtp-date">'
                      + '        <ul class="mod-dtp-weeks clearfix">'
                      + '          <li>日</li>'
                      + '          <li>一</li>'
                      + '          <li>二</li>'
                      + '          <li>三</li>'
                      + '          <li>四</li>'
                      + '          <li>五</li>'
                      + '          <li>六</li>'
                      + '        </ul>'
                      + '        <ul class="mod-dtp-days clearfix">'
                      + '        <%'
                      + '        var prev = dtp.prev;'
                      + '        var next = dtp.next;'
                      + '        var first = dtp.first;'
                      + '        var today = dtp.today;'
                      + '        var prevDays = prev.leapYear.monthDays;'
                      + '        var nextDays = next.leapYear.monthDays;'
                      + '        var currentDays = dtp.leapYear.monthDays;'
                      + '        var firstDay = first.day;'
                      + '        %>'
                      + '        <%for(var i = firstDay; i > 0; i--){%>'
                      + '          <li class="ligthgray<%=dtp.options.todayOnly ? " disabled" : ""%>" data-action-click="dtp://picker/date/set#<%=dtp.identity%>,<%=dtp.name%>,<%=prev.fmt.year%>,<%=prev.fmt.month%>,<%=(prevDays - i)%>"><%=(prevDays - i)%></li>'
                      + '        <%}%>'
                      + '        <%for(var j = 1; j <= currentDays; j++){%>'
                      + '        <%if(j === today.date && dtp.year === today.year && dtp.month === today.month){%>'
                      + '          <li class="cur" data-action-click="dtp://picker/date/set#<%=dtp.identity%>,<%=dtp.name%>,<%=dtp.fmt.year%>,<%=dtp.fmt.month%>,<%=j%>"><%=j%></li>'
                      + '        <%}else if(j == dtp.date){%>'
                      + '          <li class="on" data-action-click="dtp://picker/date/set#<%=dtp.identity%>,<%=dtp.name%>,<%=dtp.fmt.year%>,<%=dtp.fmt.month%>,<%=j%>"><%=j%></li>'
                      + '        <%}else{%>'
                      + '          <li class="" data-action-click="dtp://picker/date/set#<%=dtp.identity%>,<%=dtp.name%>,<%=dtp.fmt.year%>,<%=dtp.fmt.month%>,<%=j%>"><%=j%></li>'
                      + '        <%}%>'
                      + '        <%}%>'
                      + '        <%for(var k = j, m = 1; k <= (42 - firstDay); k++, m++){%>'
                      + '          <li class="ligthgray<%=dtp.options.todayOnly ? " disabled" : ""%>" data-action-click="dtp://picker/date/set#<%=dtp.identity%>,<%=dtp.name%>,<%=next.fmt.year%>,<%=next.fmt.month%>,<%=m%>"><%=m%></li>'
                      + '        <%}%>'
                      + '        </ul>'
                      + '      </div>'
                      + '      <div class="mod-dtp-year-month">'
                      + '        <div class="mod-dtp-years clearfix">'
                      + '          <sup class="icofont prev" title="上一年" data-action-click="dtp://picker/year/prev#<%=dtp.identity%>,<%=dtp.name%>"></sup>'
                      + '          <strong><%=dtp.fmt.year%></strong>'
                      + '          <sub class="icofont next" title="下一年" data-action-click="dtp://picker/year/next#<%=dtp.identity%>,<%=dtp.name%>"></sub>'
                      + '        </div>'
                      + '        <div class="mod-dtp-months clearfix">'
                      + '          <em class="<%=dtp.fmt.month == "01" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,0">01月</em>'
                      + '          <em class="<%=dtp.fmt.month == "02" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,1">02月</em>'
                      + '          <em class="<%=dtp.fmt.month == "03" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,2">03月</em>'
                      + '          <em class="<%=dtp.fmt.month == "04" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,3">04月</em>'
                      + '          <em class="<%=dtp.fmt.month == "05" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,4">05月</em>'
                      + '          <em class="<%=dtp.fmt.month == "06" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,5">06月</em>'
                      + '          <em class="<%=dtp.fmt.month == "07" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,6">07月</em>'
                      + '          <em class="<%=dtp.fmt.month == "08" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,7">08月</em>'
                      + '          <em class="<%=dtp.fmt.month == "09" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,8">09月</em>'
                      + '          <em class="<%=dtp.fmt.month == "10" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,9">10月</em>'
                      + '          <em class="<%=dtp.fmt.month == "11" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,10">11月</em>'
                      + '          <em class="<%=dtp.fmt.month == "12" ? "on" : ""%>" data-action-click="dtp://picker/month/set#<%=dtp.identity%>,<%=dtp.name%>,11">12月</em>'
                      + '        </div>'
                      + '      </div>'
                      + '    </div>'
                      + '    <div class="mod-datetime-picker-timebox">'
                      + '      <ul class="mod-dtp-time-view clearfix">'
                      + '        <li class="mod-dtp-view-hour"><%=dtp.fmt.hours%></li>'
                      + '        <li class="mod-dtp-view-minute"><%=dtp.fmt.minutes%></li>'
                      + '        <li class="mod-dtp-view-second"><%=dtp.fmt.seconds%></li>'
                      + '      </ul>'
                      + '      <div class="mod-dtp-time-picker clearfix">'
                      + '        <div class="mod-dtp-hours">'
                      + '          <sup class="icofont prev" data-action-click="dtp://picker/hour/prev#<%=dtp.identity%>,<%=dtp.name%>"></sup>'
                      + '          <div class="mod-time-chooser">'
                      + '            <ul class="hours">'
                      + '              <%for(var i = 0; i < 24; i++){%>'
                      + '              <%var ts = (i < 10 ? "0" + i : i);%>'
                      + '              <%if(i == dtp.hours){%>'
                      + '              <li class="on"><%=ts%></li>'
                      + '              <%}else{%>'
                      + '              <li><%=ts%></li>'
                      + '              <%}%>'
                      + '              <%}%>'
                      + '            </ul>'
                      + '          </div>'
                      + '          <sub class="icofont next" data-action-click="dtp://picker/hour/next#<%=dtp.identity%>,<%=dtp.name%>"></sub>'
                      + '        </div>'
                      + '        <div class="mod-dtp-minutes">'
                      + '          <sup class="icofont prev" data-action-click="dtp://picker/minute/prev#<%=dtp.identity%>,<%=dtp.name%>"></sup>'
                      + '          <div class="mod-time-chooser">'
                      + '            <ul class="minutes">'
                      + '              <%for(var i = 0; i < 60; i++){%>'
                      + '              <%var ts = (i < 10 ? "0" + i : i);%>'
                      + '              <%if(i == dtp.minutes){%>'
                      + '              <li class="on"><%=ts%></li>'
                      + '              <%}else{%>'
                      + '              <li><%=ts%></li>'
                      + '              <%}%>'
                      + '              <%}%>'
                      + '            </ul>'
                      + '          </div>'
                      + '          <sub class="icofont next" data-action-click="dtp://picker/minute/next#<%=dtp.identity%>,<%=dtp.name%>"></sub>'
                      + '        </div>'
                      + '        <div class="mod-dtp-seconds">'
                      + '          <sup class="icofont prev" data-action-click="dtp://picker/second/prev#<%=dtp.identity%>,<%=dtp.name%>"></sup>'
                      + '          <div class="mod-time-chooser">'
                      + '            <ul class="seconds">'
                      + '              <%for(var i = 0; i < 60; i++){%>'
                      + '              <%var ts = (i < 10 ? "0" + i : i);%>'
                      + '              <%if(i == dtp.seconds){%>'
                      + '              <li class="on"><%=ts%></li>'
                      + '              <%}else{%>'
                      + '              <li><%=ts%></li>'
                      + '              <%}%>'
                      + '              <%}%>'
                      + '            </ul>'
                      + '          </div>'
                      + '          <sub class="icofont next" data-action-click="dtp://picker/second/next#<%=dtp.identity%>,<%=dtp.name%>"></sub>'
                      + '        </div>'
                      + '        <div class="mod-dtp-time-selected"></div>'
                      + '      </div>'
                      + '    </div>'
                      + '  </div>'
                      + '  <div class="mod-datetime-picker-footer clearfix">'
                      + '    <button type="button" data-action-click="dtp://picker/today#<%=dtp.identity%>,<%=dtp.name%>">今天</button>'
                      + '    <button type="submit" data-action-click="dtp://picker/done#<%=dtp.identity%>,<%=dtp.name%>">完成</button>'
                      + '  </div>'
                      + '';

    var FillZero = function(str, len){
        str = "" + str;

        var zero = len - str.length;

        var tmp = "";
        for(var i = 0; i < zero; i++){
            tmp += "0";
        }

        return tmp + str;
    };
    var DateTimePickerProtocol = {
        schema: "dtp",
        picker: {
            bubbles: function(data, node, e, type){
                e.stopPropagation();
            },
            call: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];

                var options = DateTimePicker.getPluginOptions(node);
                var picker = DateTimePicker.createDateTimePicker(options.name);

                picker.options(options);

                if(options.value){
                    picker.update(picker.parse(options.value));
                }

                picker.render().show(false).position(node[0]);
            },
            year: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var dt = dtp.getDateTime();
                    var year = dt.getFullYear();

                    dt.setFullYear(year - 1);

                    dtp.update(dt);
                    dtp.print(dtp.serialized(dt));
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var dt = dtp.getDateTime();
                    var year = dt.getFullYear();

                    dt.setFullYear(year + 1);
                    
                    dtp.update(dt);
                    dtp.print(dtp.serialized(dt));
                },
                panel: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var frame = dtp.getDateTimePickerFrame();

                    dtp.mode(frame.hasClass("year-month") ? 0 : 1);
                }
            },
            month: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var serializedData = dtp.serialized();
                    var dt = serializedData.prev.datetime;

                    dtp.update(dt);
                    dtp.print(dtp.serialized(dt));
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var serializedData = dtp.serialized();
                    var dt = serializedData.next.datetime;

                    dtp.update(dt);
                    dtp.print(dtp.serialized(dt));
                },
                set: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];
                    var month = Number(args[2]);

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var dt = dtp.getDateTime();

                    dt.setMonth(month);

                    dtp.update(dt);
                    dtp.print(dtp.serialized(dt));
                    // dtp.mode(0);
                },
                panel: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var frame = dtp.getDateTimePickerFrame();

                    dtp.mode(frame.hasClass("year-month") ? 0 : 1);
                }
            },
            date: {
                set: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];
                    var year = args[2];
                    var month = args[3];
                    var date = args[4];

                    if(node.hasClass("disabled")){
                        return ;
                    }

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var frame = $('[data-datepicker="' + identity + '"]');

                    var hoursView = frame.find(".mod-dtp-view-hour");
                    var minutesView = frame.find(".mod-dtp-view-minute");
                    var secondsView = frame.find(".mod-dtp-view-second");

                    var iYear = parseInt(year, 10);
                    var iMonth = parseInt(month, 10) - 1;
                    var iDate = parseInt(date, 10);
                    var iHours = parseInt(hoursView.html(), 0);
                    var iMinutes = parseInt(minutesView.html(), 0);
                    var iSeconds = parseInt(secondsView.html(), 0);

                    var dt = new Date(iYear, iMonth, iDate, iHours, iMinutes, iSeconds);

                    dtp.update(dt);
                    dtp.print(dtp.serialized(dt));
                }
            },
            hour: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var frame = dtp.getDateTimePickerFrame();
                    var panel = node.prev(".mod-time-chooser").find("ul");
                    var hoursView = frame.find(".mod-dtp-view-hour");
                    var minutesView = frame.find(".mod-dtp-view-minute");
                    var secondsView = frame.find(".mod-dtp-view-second");
                    
                    var hours = parseInt(hoursView.html(), 0);
                    var minutes = parseInt(minutesView.html(), 0);
                    var seconds = parseInt(secondsView.html(), 0);

                    hours = hours - 1;
                    hours = hours < 0 ? 23 : hours;

                    hoursView.html(FillZero(hours, 2));

                    dtp.time(hours, minutes, seconds);
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var frame = dtp.getDateTimePickerFrame();
                    var panel = node.prev(".mod-time-chooser").find("ul");
                    var hoursView = frame.find(".mod-dtp-view-hour");
                    var minutesView = frame.find(".mod-dtp-view-minute");
                    var secondsView = frame.find(".mod-dtp-view-second");

                    var hours = parseInt(hoursView.html(), 0);
                    var minutes = parseInt(minutesView.html(), 0);
                    var seconds = parseInt(secondsView.html(), 0);

                    hours = hours + 1;
                    hours = hours > 23 ? 0 : hours;

                    hoursView.html(FillZero(hours, 2));

                    dtp.time(hours, minutes, seconds);
                }
            },
            minute: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var frame = dtp.getDateTimePickerFrame();
                    var panel = node.prev(".mod-time-chooser").find("ul");
                    var hoursView = frame.find(".mod-dtp-view-hour");
                    var minutesView = frame.find(".mod-dtp-view-minute");
                    var secondsView = frame.find(".mod-dtp-view-second");

                    var hours = parseInt(hoursView.html(), 0);
                    var minutes = parseInt(minutesView.html(), 0);
                    var seconds = parseInt(secondsView.html(), 0);

                    minutes = minutes - 1;
                    minutes = minutes < 0 ? 59 : minutes;

                    minutesView.html(FillZero(minutes, 2));
                    
                    dtp.time(hours, minutes, seconds);
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var frame = dtp.getDateTimePickerFrame();
                    var panel = node.prev(".mod-time-chooser").find("ul");
                    var hoursView = frame.find(".mod-dtp-view-hour");
                    var minutesView = frame.find(".mod-dtp-view-minute");
                    var secondsView = frame.find(".mod-dtp-view-second");

                    var hours = parseInt(hoursView.html(), 0);
                    var minutes = parseInt(minutesView.html(), 0);
                    var seconds = parseInt(secondsView.html(), 0);

                    minutes = minutes + 1;
                    minutes = minutes > 59 ? 0 : minutes;

                    minutesView.html(FillZero(minutes, 2));
                    
                    dtp.time(hours, minutes, seconds);
                }
            },
            second: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var frame = dtp.getDateTimePickerFrame();
                    var panel = node.prev(".mod-time-chooser").find("ul");
                    var hoursView = frame.find(".mod-dtp-view-hour");
                    var minutesView = frame.find(".mod-dtp-view-minute");
                    var secondsView = frame.find(".mod-dtp-view-second");

                    var hours = parseInt(hoursView.html(), 0);
                    var minutes = parseInt(minutesView.html(), 0);
                    var seconds = parseInt(secondsView.html(), 0);

                    seconds = seconds - 1;
                    seconds = seconds < 0 ? 59 : seconds;

                    secondsView.html(FillZero(seconds, 2));
                    
                    dtp.time(hours, minutes, seconds);
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var identity = args[0];
                    var name = args[1];

                    var dtp = DateTimePicker.getDateTimePicker(name);
                    var frame = dtp.getDateTimePickerFrame();
                    var panel = node.prev(".mod-time-chooser").find("ul");
                    var hoursView = frame.find(".mod-dtp-view-hour");
                    var minutesView = frame.find(".mod-dtp-view-minute");
                    var secondsView = frame.find(".mod-dtp-view-second");

                    var hours = parseInt(hoursView.html(), 0);
                    var minutes = parseInt(minutesView.html(), 0);
                    var seconds = parseInt(secondsView.html(), 0);

                    seconds = seconds + 1;
                    seconds = seconds > 59 ? 0 : seconds;

                    secondsView.html(FillZero(seconds, 2));
                    
                    dtp.time(hours, minutes, seconds);
                }
            },
            today: function(data, node, e, type){
                var args = (data || "").split(",");
                var identity = args[0];
                var name = args[1];

                var dtp = DateTimePicker.getDateTimePicker(name);

                dtp.today();
            },
            done: function(data, node, e, type){
                var args = (data || "").split(",");
                var identity = args[0];
                var name = args[1];

                var dtp = DateTimePicker.getDateTimePicker(name);

                dtp.done();
            }
        }
    };

    var GetDefaultOptions = function(){
        return {
            time: false,
            todayOnly: false,
            format: "%y-%M-%d",
            schema: null,
            mode: 0,
            range: {
                start: null,
                end: null
            }
        };
    };

    var DateTimePicker = function(name){
        this.namespace = "dtp";
        this.name = name;
        this.identity = this.namespace + "." + this.name;

        this.opts = GetDefaultOptions();

        this.datetime = new Date();
        this.serializedData = null;
    };

    DateTimePicker.prototype = {
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
        parse: function(datetimeString){
            var format = this.options("format");
            var ret = DateUtil.parse(datetimeString, format);

            return ret.date;
        },
        format: function(datetime){
            var format = this.options("format");
            var ret = DateUtil.format(datetime, format, true);

            return ret;
        },
        mode: function(mode){
            this.options({
                "mode": mode
            });

            var frame = this.getDateTimePickerFrame();

            if(1 === mode){
                frame.addClass("year-month");
            }else{
                frame.removeClass("year-month");
            }
        },
        getFormatInfo: function(datetime){
            var fmt = DateUtil.format(datetime, "%y%M%d%h%m%s%i", true);
            var fyear = fmt.substr(0, 4);
            var fmonth = fmt.substr(4, 2);
            var fdate = fmt.substr(6, 2);
            var fhours = fmt.substr(8, 2);
            var fminutes = fmt.substr(10, 2);
            var fseconds = fmt.substr(12, 2);
            var fmillisecs = fmt.substr(14);

            return {
                "year": fyear,
                "month": fmonth,
                "date": fdate,
                "hours": fhours,
                "minutes": fminutes,
                "seconds": fseconds,
                "millisecs": fmillisecs,
            };
        },
        serialized: function(dt){
            if(!dt && !DataType.isDate(dt)){
                return this.serializedData;
            }

            var year = dt.getFullYear();
            var month = dt.getMonth();
            var date = dt.getDate();
            var day = dt.getDay();
            var hours = dt.getHours();
            var minutes = dt.getMinutes();
            var seconds = dt.getSeconds();
            var millisecs = dt.getMilliseconds();

            var currentFirstDatetime = new Date(year, month, 1, hours, minutes, seconds, millisecs);

            var prevDatetime = new Date(year, month, 1, hours, minutes, seconds, millisecs);
            prevDatetime.setMonth(month - 1);

            var nextDatetime = new Date(year, month, 1, hours, minutes, seconds, millisecs);
            nextDatetime.setMonth(month + 1);

            var today = new Date();

            var data = this.serializedData = {
                "namespace": this.namespace,
                "name": this.name,
                "identity": this.identity,
                "options": this.options(),
                ///////////////////////////////////////////////
                "datetime": dt,
                "leapYear": DateUtil.leapYear(dt),
                "year": year,
                "month": month,
                "date": date,
                "day": day,
                "hours": hours,
                "minutes": minutes,
                "seconds": seconds,
                "millisecs": millisecs,
                "today": {
                    "year": today.getFullYear(),
                    "month": today.getMonth(),
                    "date": today.getDate(),
                    "hours": today.getHours(),
                    "minutes": today.getMinutes(),
                    "seconds": today.getSeconds(),
                    "millisecs": today.getMilliseconds(),
                    "fmt": this.getFormatInfo(today)
                },
                "first": {
                    "datetime": currentFirstDatetime,
                    "leapYear": DateUtil.leapYear(currentFirstDatetime),
                    "day": currentFirstDatetime.getDay(),
                    "fmt": this.getFormatInfo(currentFirstDatetime)
                },
                "prev": {
                    "datetime": prevDatetime,
                    "leapYear": DateUtil.leapYear(prevDatetime),
                    "fmt": this.getFormatInfo(prevDatetime)
                },
                "next": {
                    "datetime": nextDatetime,
                    "leapYear": DateUtil.leapYear(nextDatetime),
                    "fmt": this.getFormatInfo(nextDatetime)
                },
                "fmt": this.getFormatInfo(dt)
            };

            return data;
        },
        getDateTimePickerFrame: function(){
            var frame = $('[data-datepicker="' + this.identity + '"]');

            return frame;
        },
        time: function(hours, minutes, seconds){
            var frame = this.getDateTimePickerFrame();
            var item = frame.find(".mod-time-chooser li")[0];
            var itemHeight = Util.getBoundingClientRect(item).height;
            var offsetItemHeight = 2 * itemHeight;
            var hoursPanel = frame.find(".mod-time-chooser ul.hours");
            var minutesPanel = frame.find(".mod-time-chooser ul.minutes");
            var secondsPanel = frame.find(".mod-time-chooser ul.seconds");

            var dt = this.datetime;

            dt.setHours(hours);
            dt.setMinutes(minutes);
            dt.setSeconds(seconds);

            this.update(dt);
            this.serialized(dt);

            hoursPanel.css({
                "marginTop": -((hours * itemHeight) - offsetItemHeight) + "px"
            });

            minutesPanel.css({
                "marginTop": -((minutes * itemHeight) - offsetItemHeight) + "px"
            });

            secondsPanel.css({
                "marginTop": -((seconds * itemHeight) - offsetItemHeight) + "px"
            });
        },
        print: function(renderData){
            DATETIME_PICKER.render(true, _core_structs, renderData, {
                callback: function(ret){
                    var frame = this.getDateTimePickerFrame();
                    var data = ret.metaData;

                    frame.html(ret.result);
                    this.time(data.hours, data.minutes, data.seconds);
                },
                args: [],
                context: this
            });
        },
        render: function(target){
            var renderData = this.serialized(this.datetime);

            var picker = this.getDateTimePickerFrame();

            if(picker.length === 0){
                DATETIME_PICKER.render(true, _html_structs, renderData, {
                    callback: function(ret, _target){
                        $(_target).append(ret.result);

                        Util.watchAction(_target, [
                            {type: "click", mapping: null, compatible: null},
                            {type: "mousedown", mapping: null, compatible: null}
                        ], null);

                        Util.source(DateTimePickerProtocol);

                        this.print(ret.metaData);
                    },
                    args: [target || document.body],
                    context: this
                });
            }else{
                this.print(renderData);
            }
        },
        update: function(datetime){
            this.datetime = datetime;
        },
        getDateTime: function(){
            return this.datetime;
        },
        today: function(){
            var date = new Date();

            Util.requestExternal(this.options("schema"), [date, this.format(date)]);
            this.hide();
        },
        done: function(){
            var serializedData = this.serialized();

            Util.requestExternal(this.options("schema"), [serializedData.datetime, this.format(serializedData.datetime)]);
            this.hide();
        },
        position: function(target, offsetScrollDOM){
            var picker = this.getDateTimePickerFrame();
            var pickerRect = Util.getBoundingClientRect(picker[0]);
            var rect = Util.getBoundingClientRect(target, offsetScrollDOM || document.body);

            var clientWidth = Math.max(
                document.documentElement.clientWidth, 
                document.body.clientWidth, 
                window.innerWidth || 0
            );
            var clientHeight = Math.max(
                document.documentElement.clientHeight, 
                document.body.clientHeight, 
                window.innerHeight || 0
            );

            var left = rect.left;
            var top = rect.top + rect.height + 2 + rect.localScrollY;

            if(rect.left + pickerRect.width > clientWidth){
                var offsetClientWidth = clientWidth - (rect.left + rect.width);

                left = clientWidth - pickerRect.width - offsetClientWidth;

                if(left < 0){
                    left = rect.left;
                }
            }

            if(rect.top + rect.height + 2 + pickerRect.height > clientHeight){
                top = rect.top - pickerRect.height - 2;

                if(top < 0){
                    top = rect.top + rect.height + 2;
                }
            }


            picker.removeClass("hidden")
                  .css({
                    "left": left + "px",
                    "top": top + "px"
                  });
        },
        show: function(visible){
            var picker = this.getDateTimePickerFrame();

            if(false === visible){
                picker.addClass("hidden");
            }

            picker.removeClass("hide");

            var data = this.serialized();

            if(true == data.options.time){
                this.time(data.hours, data.minutes, data.seconds);
            }
        },
        hide: function(){
            var picker = this.getDateTimePickerFrame();
            picker.addClass("hide");
        }
    };

    DateTimePicker.Cache = {};

    DateTimePicker.createDateTimePicker = function(name){
        var dtp = DateTimePicker.Cache[name] || (DateTimePicker.Cache[name] = new DateTimePicker(name));

        return {
            options: function(){
                return dtp.options.apply(dtp, arguments);
            },
            getDateTimePickerFrame: function(){
                return dtp.getDateTimePickerFrame();
            },
            parse: function(datetimeString){
                return dtp.parse(datetimeString);
            },
            format: function(datatime){
                return dtp.format(datetime);
            },
            getDateTime: function(){
                return dtp.getDateTime();
            },
            mode: function(mode){
                dtp.mode(mode);

                return this;
            },
            serialized: function(datetime){
                return dtp.serialized(datetime);
            },
            print: function(serializedData){
                dtp.print(serializedData);

                return this;
            },
            render: function(target){
                dtp.render(target);

                return this;
            },
            update: function(datetime){
                dtp.update(datetime);

                return this;
            },
            time: function(hours, minutes, seconds){
                dtp.time(hours, minutes, seconds);

                return this;
            },
            today: function(){
                dtp.today();

                return this;
            },
            done: function(){
                dtp.done();

                return this;
            },
            position: function(target){
                dtp.position(target);

                return this;
            },
            show: function(visible){
                dtp.show(visible);

                return this;
            },
            hide: function(){
                dtp.hide();

                return this;
            }
        };
    };

    DateTimePicker.getDateTimePicker = function(name){
        var cache = DateTimePicker.Cache;

        if(name in cache){
            return DateTimePicker.createDateTimePicker(name);
        }

        return null
    };

    DateTimePicker.getPluginOptions = function(plugin){
        var keys = [
            {"attr": "name", "name": "name", "dataType": "string"},
            {"attr": "value", "name": "value", "dataType": "string"},
            {"attr": "time", "name": "time", "dataType": "boolean"},
            {"attr": "today-only", "name": "todayOnly", "dataType": "boolean"},
            {"attr": "format", "name": "format", "dataType": "string"},
            {"attr": "range-start", "name": "range.start", "dataType": "date"},
            {"attr": "range-end", "name": "range.end", "dataType": "date"},
            {"attr": "schema", "name": "schema", "dataType": "string"},
            {"attr": "mode", "name": "mode", "dataType": "number"}
        ];
        var key = null;
        var value = null;
        var opts = {};
        var node = $(plugin);
        var name = null;

        for(var i = 0; i < keys.length; i++){
            key = keys[i];

            if("name" == key.attr){
                value = node.attr(key.attr) || node.attr("data-datetimepicker-" + key.attr) || "default";
            }else if("value" == key.attr){
                value = node.val() || node.attr("data-datetimepicker-" + key.attr);
            }else{
                value = node.attr("data-datetimepicker-" + key.attr);
            }


            if(!value){
                continue;
            }

            name = key.name;

            if("boolean" == key.dataType){
                value = "1" === value;
            }else if("number" == key.dataType){
                value = Number(value);

                if(isNaN(value)){
                    continue;
                }
            }else if("date" == key.dataType){
                var d = DateUtil.parse(value, opts["format"] || "%y-%M-%d");

                if(!d.ok){
                    continue;
                }

                value = d.date;
            }

            if(name.indexOf(".") != -1){
                var tmp = (key.name).split(".");
                var tmpKey = tmp[0];
                var tmpField = tmp[1];

                if(tmpKey in opts){
                    opts[tmpKey][tmpField] = value;
                }else{
                    opts[tmpKey] = {};
                    opts[tmpKey][tmpField] = value;
                }
            }else{
                opts[name] = value;
            }
        }

        return opts;
    };

    DateTimePicker.lookup = function(){
        var plugins = $('[data-plugin="datatimepicker"]');
        var size = plugins.length;
        var plugin = null;
        var options = null;
        var picker = null;

        for(var i = 0; i < size; i++){
            plugin = plugins[i];

            options = DateTimePicker.getPluginOptions(plugin);
            picker = DateTimePicker.createDateTimePicker(options.name);

            picker.options(options);

            if(options.value){
                picker.update(picker.parse(options.value));
            }

            picker.render().hide()

            $(plugin).attr("data-action-click", "dtp://picker/call");
        }
    };

    (function(){
        $(document).on("mousedown.datatimepicker", function(e){
            for(var name in DateTimePicker.Cache){
                DateTimePicker.Cache[name].hide();
            }
        })
    })()

    module.exports = {
        version: "R16B0520",
        create: DateTimePicker.createDateTimePicker,
        lookup: DateTimePicker.lookup,
        getDateTimePicker: DateTimePicker.getDateTimePicker
    };
});