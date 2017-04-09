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

    var _html_picker_frame = ''
                           + '<div class="flexbox top justify mod-dtpicker-frame mode <%=dtp.mode.name%> <%=dtp.options.theme%> hide" data-datepicker="<%=dtp.identity%>" data-action-mousedown="dtp://picker/bubbles">'
                           + '  <figure class="mod-dtpicker-datebox"></figure>'
                           + '  <figure class="mod-dtpicker-timebox"></figure>'
                           + '</div>'
                           + '';

    var _html_picker_datebox = ''
                             + '  <figcaption class="mod-dtpicker-date-choosen flexbox middle justify">'
                             + '    <sup class="icofont prev" title="上一月" data-action-click="dtp://datetime/month/prev#<%=dtp.name%>"></sup>'
                             + '    <span class="select-year" data-action-click="dtp://panel/swap#<%=dtp.name%>"><%=dtp.fmt.year%></span>'
                             + '    <em class="separator ym" data-action-click="dtp://panel/swap#<%=dtp.name%>">/</em>'
                             + '    <span class="select-month" data-action-click="dtp://panel/swap#<%=dtp.name%>"><%=dtp.fmt.month%></span>'
                             + '    <em class="separator md" data-action-click="dtp://panel/swap#<%=dtp.name%>">/</em>'
                             + '    <span class="select-date" data-action-click="dtp://panel/swap#<%=dtp.name%>"><%=dtp.fmt.date%></span>'
                             + '    <sub class="icofont next" title="下一月" data-action-click="dtp://datetime/month/next#<%=dtp.name%>"></sub>'
                             + '  </figcaption>'
                             + '  <ul class="mod-dtpicker-weeks flexbox middle left">'
                             + '    <li>日</li>'
                             + '    <li>一</li>'
                             + '    <li>二</li>'
                             + '    <li>三</li>'
                             + '    <li>四</li>'
                             + '    <li>五</li>'
                             + '    <li>六</li>'
                             + '  </ul>'
                             + '  <ul class="mod-dtpicker-date-panel flexbox middle left wrap">'
                             + '    <%'
                             + '    var prev = dtp.prev;'
                             + '    var next = dtp.next;'
                             + '    var first = dtp.first;'
                             + '    var prevDatetime = prev.datetime;'
                             + '    var nextDatetime = next.datetime;'
                             + '    var today = dtp.today;'
                             + '    var prevDays = prev.leapYear.monthDays;'
                             + '    var nextDays = next.leapYear.monthDays;'
                             + '    var currentDays = dtp.leapYear.monthDays;'
                             + '    var firstDay = first.day;'
                             + '    var cls = "";'
                             + '    %>'
                             + '    <%for(var i = firstDay - 1; i >= 0; i--){%>'
                             + '    <%'
                             + '    cls = dtp.range.dateRange(dtp.options, prevDatetime.getFullYear() + "-" + (prevDatetime.getMonth() + 1) + "-" + (prevDays - i)).className;'
                             + '    cls = cls ? " " + cls : "";'
                             + '    %>'
                             + '    <li class="gray<%=cls%>" data-action-click="dtp://datetime/date/set#<%=dtp.name%>,prev,<%=(prevDays - i)%>"><%=(prevDays - i)%></li>'
                             + '    <%}%>'
                             + '    <%for(var j = 1; j <= currentDays; j++){%>'
                             + '    <%'
                             + '    cls = dtp.range.dateRange(dtp.options, dtp.year + "-" + (dtp.month + 1) + "-" + j).className;'
                             + '    cls = cls ? " " + cls : "";'
                             + '    %>'
                             + '      <%if(j === today.date && dtp.year === today.year && dtp.month === today.month){%>'
                             + '        <li class="today<%=cls%>" data-action-click="dtp://datetime/date/set#<%=dtp.name%>,cur,<%=j%>"><%=j%></li>'
                             + '      <%}else if(j === dtp.date){%>'
                             + '        <li class="cur<%=cls%>" data-action-click="dtp://datetime/date/set#<%=dtp.name%>,cur,<%=j%>"><%=j%></li>'
                             + '      <%}else{%>'
                             + '        <li class="<%=cls%>" data-action-click="dtp://datetime/date/set#<%=dtp.name%>,cur,<%=j%>"><%=j%></li>'
                             + '      <%}%>'
                             + '    <%}%>'
                             + '    <%for(var k = 1; k <= (42 - currentDays - firstDay); k++){%>'
                             + '    <%'
                             + '    cls = dtp.range.dateRange(dtp.options, nextDatetime.getFullYear() + "-" + (nextDatetime.getMonth() + 1) + "-" + k).className;'
                             + '    cls = cls ? " " + cls : "";'
                             + '    %>'
                             + '    <li class="gray<%=cls%>" data-action-click="dtp://datetime/date/set#<%=dtp.name%>,next,<%=k%>"><%=k%></li>'
                             + '    <%}%>'
                             + '  </ul>'
                             + '  <div class="mod-dtpicker-year-month<%=(3 === dtp.mode.value ? "" : " hide")%>">'
                             + '    <div class="mod-dtpicker-years flexbox middle justify">'
                             + '      <sup class="icofont prev" title="上一年" data-action-click="dtp://datetime/year/prev#<%=dtp.name%>"></sup>'
                             + '      <strong><%=dtp.fmt.year%></strong>'
                             + '      <sub class="icofont next" title="下一年" data-action-click="dtp://datetime/year/next#<%=dtp.name%>"></sub>'
                             + '    </div>'
                             + '    <div class="mod-dtpicker-months flexbox middle left wrap">'
                             + '      <em class="<%=dtp.fmt.month == "01" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,0">01月</em>'
                             + '      <em class="<%=dtp.fmt.month == "02" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,1">02月</em>'
                             + '      <em class="<%=dtp.fmt.month == "03" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,2">03月</em>'
                             + '      <em class="<%=dtp.fmt.month == "04" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,3">04月</em>'
                             + '      <em class="<%=dtp.fmt.month == "05" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,4">05月</em>'
                             + '      <em class="<%=dtp.fmt.month == "06" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,5">06月</em>'
                             + '      <em class="<%=dtp.fmt.month == "07" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,6">07月</em>'
                             + '      <em class="<%=dtp.fmt.month == "08" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,7">08月</em>'
                             + '      <em class="<%=dtp.fmt.month == "09" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,8">09月</em>'
                             + '      <em class="<%=dtp.fmt.month == "10" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,9">10月</em>'
                             + '      <em class="<%=dtp.fmt.month == "11" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,10">11月</em>'
                             + '      <em class="<%=dtp.fmt.month == "12" ? "on" : ""%>" data-action-click="dtp://datetime/month/set#<%=dtp.name%>,11">12月</em>'
                             + '    </div>'
                             + '  </div>'
                             + '';

    var _html_picker_timebox = ''
                             + '  <figcaption class="mod-dtpicker-time-choosen flexbox middle center">'
                             + '    <span class="select-hour"><%=dtp.fmt.hours%></span>'
                             + '    <em class="separator hm">:</em>'
                             + '    <span class="select-minute"><%=dtp.fmt.minutes%></span>'
                             + '    <em class="separator ms">:</em>'
                             + '    <span class="select-second"><%=dtp.fmt.seconds%></span>'
                             + '  </figcaption>'
                             + '  <div class="mod-dtpicker-time-panel flexbox middle justify">'
                             + '    <div class="mod-dtpicker-time-options hours">'
                             + '      <div class="icofont prev" data-action-click="dtp://datetime/hour/prev#<%=dtp.name%>"></div>'
                             + '      <div class="mod-dtpicker-time-values">'
                             + '        <ul>'
                             + '          <li class="empty"></li>'
                             + '          <li class="empty"></li>'
                             + '          <%'
                             + '          var step = dtp.options.step.hour;'
                             + '          step = Math.min(Math.max(1, step), 23);'
                             + '          %>'
                             + '          <%for(var i = 0; i < 24; i+=step){%>'
                             + '          <%if(!dtp.range.hoursRange(dtp.options, i).inRange){continue;}%>'
                             + '          <li<%=(i === dtp.hours ? " class=\\"on\\"" : "")%> data-action-click="dtp://datetime/hour/set#<%=dtp.name%>,<%=i%>"><%=(i < 10 ? "0" + i : i)%></li>'
                             + '          <%}%>'
                             + '          <li class="empty"></li>'
                             + '          <li class="empty"></li>'
                             + '        </ul>'
                             + '      </div>'
                             + '      <div class="icofont next" data-action-click="dtp://datetime/hour/next#<%=dtp.name%>"></div>'
                             + '    </div>'
                             + '    <div class="mod-dtpicker-time-options minutes">'
                             + '      <div class="icofont prev" data-action-click="dtp://datetime/minute/prev#<%=dtp.name%>"></div>'
                             + '      <div class="mod-dtpicker-time-values">'
                             + '        <ul>'
                             + '          <li class="empty"></li>'
                             + '          <li class="empty"></li>'
                             + '          <%'
                             + '          var step = dtp.options.step.minute;'
                             + '          step = Math.min(Math.max(1, step), 59);'
                             + '          %>'
                             + '          <%for(var i = 0; i < 60; i+=step){%>'
                             + '          <%if(!dtp.range.minutesRange(dtp.options, i).inRange){continue;}%>'
                             + '          <li<%=(i === dtp.minutes ? " class=\\"on\\"" : "")%> data-action-click="dtp://datetime/minute/set#<%=dtp.name%>,<%=i%>"><%=(i < 10 ? "0" + i : i)%></li>'
                             + '          <%}%>'
                             + '          <li class="empty"></li>'
                             + '          <li class="empty"></li>'
                             + '        </ul>'
                             + '      </div>'
                             + '      <div class="icofont next" data-action-click="dtp://datetime/minute/next#<%=dtp.name%>"></div>'
                             + '    </div>'
                             + '    <div class="mod-dtpicker-time-options seconds">'
                             + '      <div class="icofont prev" data-action-click="dtp://datetime/second/prev#<%=dtp.name%>"></div>'
                             + '      <div class="mod-dtpicker-time-values">'
                             + '        <ul>'
                             + '          <li class="empty"></li>'
                             + '          <li class="empty"></li>'
                             + '          <%'
                             + '          var step = dtp.options.step.second;'
                             + '          step = Math.min(Math.max(1, step), 59);'
                             + '          %>'
                             + '          <%for(var i = 0; i < 60; i+=step){%>'
                             + '          <%if(!dtp.range.secondsRange(dtp.options, i).inRange){continue;}%>'
                             + '          <li<%=(i === dtp.seconds ? " class=\\"on\\"" : "")%> data-action-click="dtp://datetime/second/set#<%=dtp.name%>,<%=i%>"><%=(i < 10 ? "0" + i : i)%></li>'
                             + '          <%}%>'
                             + '          <li class="empty"></li>'
                             + '          <li class="empty"></li>'
                             + '        </ul>'
                             + '      </div>'
                             + '      <div class="icofont next" data-action-click="dtp://datetime/second/next#<%=dtp.name%>"></div>'
                             + '    </div>'
                             + '    <div class="mod-dtpicker-time-options fixed-time">'
                             + '      <div class="icofont prev" data-action-click="dtp://datetime/time/prev#<%=dtp.name%>"></div>'
                             + '      <div class="mod-dtpicker-time-values">'
                             + '        <ul>'
                             + '          <li class="empty"></li>'
                             + '          <li class="empty"></li>'
                             + '          <%'
                             + '          var hourStep = dtp.options.step.hour;'
                             + '              hourStep = Math.min(Math.max(1, hourStep), 23);'
                             + '          var minuteStep = dtp.options.step.minute;'
                             + '              minuteStep = Math.min(Math.max(1, minuteStep), 59);'
                             + '          var arr = [];'
                             + '          var timeString = "";'
                             + '          for(var h = 0; h < 24; h+= hourStep){'
                             + '              for(var m = 0; m < 60; m+= minuteStep){'
                             + '                  timeString = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);'
                             + '                  if(dtp.range.timeRange(dtp.options, timeString).inRange){'
                             + '                      arr.push(timeString);'
                             + '                  }'
                             + '              }'
                             + '          }'
                             + '          for(var a = 0; a < arr.length; a++){'
                             + '          %>'
                             + '          <%if((dtp.fmt.hours + ":" + dtp.fmt.minutes) == arr[a]){%>'
                             + '          <li class="on" data-action-click="dtp://datetime/time/set#<%=dtp.name%>,<%=arr[a]%>"><%=arr[a]%></li>'
                             + '          <%}else{%>'
                             + '          <li data-action-click="dtp://datetime/time/set#<%=dtp.name%>,<%=arr[a]%>"><%=arr[a]%></li>'
                             + '          <%}%>'
                             + '          <%}%>'
                             + '          <li class="empty"></li>'
                             + '          <li class="empty"></li>'
                             + '        </ul>'
                             + '      </div>'
                             + '      <div class="icofont next" data-action-click="dtp://datetime/time/next#<%=dtp.name%>"></div>'
                             + '    </div>'
                             + '    <div class="mod-dtpicker-time-selected"></div>'
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
                var options = Util.parsePluginOptions(node, "dtpicker", GetOptionDataStruct(), GetDefaultOptions());
                var picker = DateTimePicker.getDateTimePicker(options.name);

                picker.options(options);

                if(options.value){
                    picker.update(
                        picker.parse(options.value)
                    );
                }

                picker.render().show(false).position(node[0]);
            }
        },
        panel: {
            swap: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];

                var picker = DateTimePicker.getDateTimePicker(name);
                var panel = picker.getDateTimePickerYearMonthPanel();
                var mode = picker.mode();

                if(DateTimePicker.MODE.YEAR_MONTH.VALUE === mode.value){
                    return ;
                }

                panel.toggleClass("hide");
            }
        },
        datetime: {
            month: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    choosenDate.setMonth(choosenDate.getMonth() - 1);

                    picker.update(choosenDate)
                          .renderDateBox(picker.serialized(choosenDate), DateTimePicker.Parser.Range.dateRange(picker.options(), choosenDate).inRange);
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    choosenDate.setMonth(choosenDate.getMonth() + 1);

                    picker.update(choosenDate)
                          .renderDateBox(picker.serialized(choosenDate), DateTimePicker.Parser.Range.dateRange(picker.options(), choosenDate).inRange);
                },
                set: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];
                    var month = Number(args[1]);

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    choosenDate.setMonth(month);

                    picker.update(choosenDate)
                          .renderDateBox(picker.serialized(choosenDate), DateTimePicker.Parser.Range.dateRange(picker.options(), choosenDate).inRange)
                          .getDateTimePickerYearMonthPanel()
                          .removeClass("hide");;
                }
            },
            year: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    choosenDate.setFullYear(choosenDate.getFullYear() - 1);

                    picker.update(choosenDate)
                          .renderDateBox(picker.serialized(choosenDate), DateTimePicker.Parser.Range.dateRange(picker.options(), choosenDate).inRange)
                          .getDateTimePickerYearMonthPanel()
                          .removeClass("hide");
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    choosenDate.setFullYear(choosenDate.getFullYear() + 1);

                    picker.update(choosenDate)
                          .renderDateBox(picker.serialized(choosenDate), DateTimePicker.Parser.Range.dateRange(picker.options(), choosenDate).inRange)
                          .getDateTimePickerYearMonthPanel()
                          .removeClass("hide");
                }
            },
            date: {
                set: function(data, node, e, type){
                    if(node && node.hasClass("disabled")){
                        return ;
                    }

                    var args = (data || "").split(",");
                    var name = args[0];
                    var type = args[1];
                    var value = Number(args[2]);

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    if("prev" == type){
                        choosenDate.setMonth(choosenDate.getMonth() - 1);
                    }else if("next" == type){
                        choosenDate.setMonth(choosenDate.getMonth() + 1);
                    }

                    choosenDate.setDate(value);

                    picker.update(choosenDate)
                          .renderDateBox(picker.serialized(choosenDate), true);
                }
            },
            hour: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    var timeOptions = picker.getDateTimePickerTimeOptions("hours");
                    var size = timeOptions.length;
                    var timeOption = null;
                    var currentIndex = 0;
                    var prevIndex = 0;
                    var prevTimeOption = null;

                    for(var i = 0; i < size; i++){
                        timeOption = $(timeOptions[i]);

                        if(timeOption.hasClass("on")){
                            currentIndex = i;
                            break;
                        }
                    }

                    if(0 === currentIndex){
                        prevIndex = size - 1;
                    }else{
                        prevIndex = currentIndex - 1;
                    }

                    prevTimeOption = $(timeOptions[prevIndex]);

                    var hours = Number(prevTimeOption.html());

                    choosenDate.setHours(hours);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    var timeOptions = picker.getDateTimePickerTimeOptions("hours");
                    var size = timeOptions.length;
                    var timeOption = null;
                    var currentIndex = 0;
                    var nextIndex = 0;
                    var nextTimeOption = null;

                    for(var i = 0; i < size; i++){
                        timeOption = $(timeOptions[i]);

                        if(timeOption.hasClass("on")){
                            currentIndex = i;
                            break;
                        }
                    }

                    if(size - 1 === currentIndex){
                        nextIndex = 0;
                    }else{
                        nextIndex = currentIndex + 1;
                    }

                    nextTimeOption = $(timeOptions[nextIndex]);

                    var hours = Number(nextTimeOption.html());

                    choosenDate.setHours(hours);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                },
                set: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];
                    var value = Number(args[1]);

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    choosenDate.setHours(value);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                }
            },
            minute: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    var timeOptions = picker.getDateTimePickerTimeOptions("minutes");
                    var size = timeOptions.length;
                    var timeOption = null;
                    var currentIndex = 0;
                    var prevIndex = 0;
                    var prevTimeOption = null;

                    for(var i = 0; i < size; i++){
                        timeOption = $(timeOptions[i]);

                        if(timeOption.hasClass("on")){
                            currentIndex = i;
                            break;
                        }
                    }

                    if(0 === currentIndex){
                        prevIndex = size - 1;
                    }else{
                        prevIndex = currentIndex - 1;
                    }

                    prevTimeOption = $(timeOptions[prevIndex]);

                    var minutes = Number(prevTimeOption.html());

                    choosenDate.setMinutes(minutes);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    var timeOptions = picker.getDateTimePickerTimeOptions("minutes");
                    var size = timeOptions.length;
                    var timeOption = null;
                    var currentIndex = 0;
                    var nextIndex = 0;
                    var nextTimeOption = null;

                    for(var i = 0; i < size; i++){
                        timeOption = $(timeOptions[i]);

                        if(timeOption.hasClass("on")){
                            currentIndex = i;
                            break;
                        }
                    }

                    if(size - 1 === currentIndex){
                        nextIndex = 0;
                    }else{
                        nextIndex = currentIndex + 1;
                    }

                    nextTimeOption = $(timeOptions[nextIndex]);

                    var minutes = Number(nextTimeOption.html());

                    choosenDate.setMinutes(minutes);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                },
                set: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];
                    var value = Number(args[1]);

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    choosenDate.setMinutes(value);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                }
            },
            second: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    var timeOptions = picker.getDateTimePickerTimeOptions("seconds");
                    var size = timeOptions.length;
                    var timeOption = null;
                    var currentIndex = 0;
                    var prevIndex = 0;
                    var prevTimeOption = null;

                    for(var i = 0; i < size; i++){
                        timeOption = $(timeOptions[i]);

                        if(timeOption.hasClass("on")){
                            currentIndex = i;
                            break;
                        }
                    }

                    if(0 === currentIndex){
                        prevIndex = size - 1;
                    }else{
                        prevIndex = currentIndex - 1;
                    }

                    prevTimeOption = $(timeOptions[prevIndex]);

                    var seconds = Number(prevTimeOption.html());

                    choosenDate.setSeconds(seconds);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    var timeOptions = picker.getDateTimePickerTimeOptions("seconds");
                    var size = timeOptions.length;
                    var timeOption = null;
                    var currentIndex = 0;
                    var nextIndex = 0;
                    var nextTimeOption = null;

                    for(var i = 0; i < size; i++){
                        timeOption = $(timeOptions[i]);

                        if(timeOption.hasClass("on")){
                            currentIndex = i;
                            break;
                        }
                    }

                    if(size - 1 === currentIndex){
                        nextIndex = 0;
                    }else{
                        nextIndex = currentIndex + 1;
                    }

                    nextTimeOption = $(timeOptions[nextIndex]);

                    var seconds = Number(nextTimeOption.html());

                    choosenDate.setSeconds(seconds);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                },
                set: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];
                    var value = Number(args[1]);

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    choosenDate.setSeconds(value);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                }
            },
            time: {
                prev: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);

                    var timeOptions = picker.getDateTimePickerTimeOptions("fixed-time");
                    var size = timeOptions.length;
                    var timeOption = null;
                    var currentIndex = 0;
                    var prevIndex = 0;
                    var prevTimeOption = null;

                    for(var i = 0; i < size; i++){
                        timeOption = $(timeOptions[i]);

                        if(timeOption.hasClass("on")){
                            currentIndex = i;
                            break;
                        }
                    }

                    if(0 === currentIndex){
                        prevIndex = size - 1;
                    }else{
                        prevIndex = currentIndex - 1;
                    }

                    prevTimeOption = $(timeOptions[prevIndex]);

                    Util.requestExternal("dtp://datetime/time/set#" + name + "," + prevTimeOption.html(), [node, e, type]);
                },
                next: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];

                    var picker = DateTimePicker.getDateTimePicker(name);

                    var timeOptions = picker.getDateTimePickerTimeOptions("fixed-time");
                    var size = timeOptions.length;
                    var timeOption = null;
                    var currentIndex = 0;
                    var nextIndex = 0;
                    var nextTimeOption = null;

                    for(var i = 0; i < size; i++){
                        timeOption = $(timeOptions[i]);

                        if(timeOption.hasClass("on")){
                            currentIndex = i;
                            break;
                        }
                    }

                    if(size - 1 === currentIndex){
                        nextIndex = 0;
                    }else{
                        nextIndex = currentIndex + 1;
                    }

                    nextTimeOption = $(timeOptions[nextIndex]);

                    Util.requestExternal("dtp://datetime/time/set#" + name + "," + nextTimeOption.html(), [node, e, type]);
                },
                set: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var name = args[0];
                    var time = args[1];
                    var items = time.split(":");
                    var hours = Number(items[0]);
                    var minutes = Number(items[1]); 

                    var picker = DateTimePicker.getDateTimePicker(name);
                    var choosen = picker.getDateTimePickerChoosenValue();
                    var choosenDate = choosen.dateValue;

                    choosenDate.setHours(hours);
                    choosenDate.setMinutes(minutes);

                    picker.update(choosenDate)
                          .renderTimeBox(picker.serialized(choosenDate), true);
                }
            }
        },
        sync: function(data, date, formatDate, plugin){
            //data::  input|inputName1^inputName2,html|select
            
            var _target = (function(_data){
                var group = _data.split(",");
                var size = group.length;
                var value = null;
                var items = null;

                var map = {};

                for(var i = 0; i < size; i++){
                    value = group[i];

                    if(!value){
                        continue;
                    }

                    items = value.split("|");

                    map[items[0]] = (function(str){
                        return str.split("^");
                    })(items[1]);
                }

                return map;
            })(data || "");

            var processor = {
                input: function(names, date, formatDate){
                    for(var i = 0; i < names.length; i++){
                        $('input[name="' + names[i] + '"]').val(formatDate);
                    }
                },
                html: function(names, date, formatDate){
                    for(var i = 0; i < names.length; i++){
                        $(names[i]).val(formatDate);
                    }
                }
            };

            if(plugin && plugin.length > 0){
                var dom = plugin[0];
                var tagName = (dom.tagName).toUpperCase();

                switch(tagName){
                    case "INPUT":
                    case "TEXTAREA":
                        plugin.val(formatDate);
                        break;
                    default:
                        plugin.html(formatDate);
                        break;
                }
            }

            for(var type in _target){
                if(_target.hasOwnProperty(type)){
                    if(type in processor){
                        processor[type].apply(null, [_target[type], date, formatDate]);
                    }
                }
            }
        }
    };

    /**
     
     <element 
        data-plugin="dtpicker[.name]"
        data-dtpicker-mode="[0|1|2|3|4|5|6|7]" 
        data-dtpicker-theme="" 
        data-dtpicker-format="%y-%M-%d"
        data-dtpicker-value="" 
        data-dtpicker-sync="dtp://picker/sync" 
        data-dtpicker-range-date-format="" 
        data-dtpicker-range-date-start="" 
        data-dtpicker-range-date-end="" 
        data-dtpicker-range-time-start="" 
        data-dtpicker-range-time-end="" 
        data-dtpicker-range-hours-start="" 
        data-dtpicker-range-hours-end="" 
        data-dtpicker-range-minutes-start="" 
        data-dtpicker-range-minutes-end="" 
        data-dtpicker-range-seconds-start="" 
        data-dtpicker-range-seconds-end="" 
        data-dtpicker-filter-years="" 
        data-dtpicker-filter-months="" 
        data-dtpicker-filter-dates="" 
        data-dtpicker-filter-hours="" 
        data-dtpicker-filter-minutes="" 
        data-dtpicker-filter-seconds="" 
        data-dtpicker-filter-weekends="0" 
        data-dtpicker-filter-weekdays="0" 
        data-dtpicker-step-hour="0"
        data-dtpicker-step-minute="0"
        data-dtpicker-step-second="0"
     ></element>

     */

    var GetDefaultOptions = function(){
        return {
            mode: 0,  //控件模式
            theme: "",  //外观样式
            value: "",  //初始值
            sync: "dtp://sync", //选择后自动同步显示到指定的位置
            format: "%y-%M-%d", //格式化
            range: { //范围选择
                date: {
                    format: "%y-%M-%d",
                    start: null, //2016-01-01
                    end: null    //2016-12-31
                },
                time: {
                    start: null,    //06:30:00
                    end: null       //21:00:00
                },
                hours: {
                    start: 0,
                    end: 23
                },
                minutes: {
                    start: 0,
                    end: 59
                },
                seconds: {
                    start: 0,
                    end: 59
                }
            },
            filter: {   //过滤器，筛选掉设置中的值
                years: [],
                months: [],
                dates: [],
                hours: [],
                minutes: [],
                seconds: [],
                weekends: false,
                weekdays: false
            },
            step: {     //计步器
                hour: 0,
                minute: 0,
                second: 0
            }
        };
    };

    var GetOptionDataStruct = function(){
        var dataStruct = [
            {"property": "mode", "dataType": "number"},
            {"property": "theme", "dataType": "string"},
            {"property": "format", "dataType": "string"},
            {"property": "value", "dataType": "string"},
            {"property": "sync", "dataType": "string"},
            {"property": "range-date-format", "dataType": "string"},
            {"property": "range-date-start", "dataType": "string"},
            {"property": "range-date-end", "dataType": "string"},
            {"property": "range-time-format", "dataType": "string"},
            {"property": "range-time-start", "dataType": "string"},
            {"property": "range-time-end", "dataType": "string"},
            {"property": "range-hours-start", "dataType": "number"},
            {"property": "range-hours-end", "dataType": "number"},
            {"property": "range-minutes-start", "dataType": "number"},
            {"property": "range-minutes-end", "dataType": "number"},
            {"property": "range-seconds-start", "dataType": "number"},
            {"property": "range-seconds-end", "dataType": "number"},
            {"property": "filter-years", "dataType": "array"},
            {"property": "filter-months", "dataType": "array"},
            {"property": "filter-dates", "dataType": "array"},
            {"property": "filter-hours", "dataType": "array"},
            {"property": "filter-minutes", "dataType": "array"},
            {"property": "filter-seconds", "dataType": "array"},
            {"property": "filter-weekends", "dataType": "boolean"},
            {"property": "filter-weekdays", "dataType": "boolean"},
            {"property": "step-hour", "dataType": "number"},
            {"property": "step-minute", "dataType": "number"},
            {"property": "step-second", "dataType": "number"}
        ];

        return dataStruct;
    };

    var DateTimePicker = function(){
        this.namespace = "dtp";
        this.name = null;
        this.identity = null;

        this.opts = GetDefaultOptions();

        this.currentDatetime = new Date();
        this.serializedData = null;
    };

    DateTimePicker.MODE = {
        "DATETIME": {
            "VALUE": 0, 
            "NAME": "datetime"
        },       
        "DATE": {
            "VALUE": 1,   
            "NAME": "date"
        },       
        "TIME": {
            "VALUE": 2,
            "NAME": "time"
        },
        "YEAR_MONTH":{
            "VALUE": 3,
            "NAME": "year-month"
        },
        "HOUR_MINUTE": {
            "VALUE": 4,
            "NAME": "hour-minute"
        },
        "SHORT_DATETIME": {
            "VALUE": 5,
            "NAME": "short-datetime"
        },
        "FIXED_DATATIME": {
            "VALUE": 6,
            "NAME": "fixed-datetime"
        },
        "FIXED_TIME": {
            "VALUE": 7,
            "NAME": "fixed-time"
        }
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
            var conf = DateTimePicker.MODE;
            var tmp = null;
            var clsList = [];

            mode = mode || this.options("mode");

            for(type in conf){
                if(conf.hasOwnProperty(type)){
                    clsList.push(conf[type].NAME);

                    if(mode === conf[type].VALUE){
                        tmp = conf[type];
                    }
                }
            }

            if(!tmp){
                return null;
            }

            this.options({
                "mode": mode
            });

            var frame = this.getDateTimePickerFrame();
            
            frame.removeClass(clsList.join(" "))
                 .addClass(tmp.NAME);

            return {
                "value": tmp.VALUE,
                "name": tmp.NAME
            };
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

            var mode = this.mode();

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
                "mode": mode,
                ///////////////////////////////////////////////
                "range": DateTimePicker.Parser.Range,
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
        getDateTimePickerDateBox: function(){
            var frame = this.getDateTimePickerFrame();
            var box = frame.find(".mod-dtpicker-datebox");

            return box;
        },
        getDateTimePickerTimeBox: function(){
            var frame = this.getDateTimePickerFrame();
            var box = frame.find(".mod-dtpicker-timebox");

            return box;
        },
        getDateTimePickerYearMonthPanel: function(){
            var box = this.getDateTimePickerDateBox();
            var panel = box.find(".mod-dtpicker-year-month");

            return panel;
        },
        getDateTimePickerChoosenYearNode: function(){
            var box = this.getDateTimePickerDateBox();
            var node = box.find(".select-year");

            return node;
        },
        getDateTimePickerChoosenMonthNode: function(){
            var box = this.getDateTimePickerDateBox();
            var node = box.find(".select-month");

            return node;
        },
        getDateTimePickerChoosenDateNode: function(){
            var box = this.getDateTimePickerDateBox();
            var node = box.find(".select-date");

            return node;
        },
        getDateTimePickerChoosenHourNode: function(){
            var box = this.getDateTimePickerTimeBox();
            var node = box.find(".select-hour");

            return node;
        },
        getDateTimePickerChoosenMinuteNode: function(){
            var box = this.getDateTimePickerTimeBox();
            var node = box.find(".select-minute");

            return node;
        },
        getDateTimePickerChoosenSecondNode: function(){
            var box = this.getDateTimePickerTimeBox();
            var node = box.find(".select-second");

            return node;
        },
        getDateTimePickerChoosenValue: function(){
            var yearNode = this.getDateTimePickerChoosenYearNode();
            var monthNode = this.getDateTimePickerChoosenMonthNode();
            var dateNode = this.getDateTimePickerChoosenDateNode();
            var hourNode = this.getDateTimePickerChoosenHourNode();
            var minuteNode = this.getDateTimePickerChoosenMinuteNode();
            var secondNode = this.getDateTimePickerChoosenSecondNode();

            var year = yearNode.html();
            var month = monthNode.html();
            var date = dateNode.html();
            var hour = hourNode.html();
            var minute = minuteNode.html();
            var second = secondNode.html();

            var iYear = Number(year);
            var iMonth = Number(month) - 1;
            var iDate = Number(date);
            var iHour = Number(hour);
            var iMinute = Number(minute);
            var iSecond = Number(second);

            var d = new Date(iYear, iMonth, iDate, iHour, iMinute, iSecond);
            var format = this.options("format");
            var dateString = DateUtil.format(d, format);

            return {
                "year": iYear,
                "month": iMonth,
                "date": iDate,
                "hours": iHour,
                "minutes": iMinute,
                "seconds": iSecond,
                "formatValue": dateString,
                "dateValue": d
            };
        },
        getDateTimePickerTimeOptions: function(type){
            var box = this.getDateTimePickerTimeBox();
            var options = box.find(".mod-dtpicker-time-options." + type + " .mod-dtpicker-time-values li:not(.empty)");

            return options;
        },
        render: function(target, isSetInputValue){
            var renderData = this.serialized(this.currentDatetime);
            var picker = this.getDateTimePickerFrame();

            if(picker.length === 0){
                DATETIME_PICKER.render(true, _html_picker_frame, renderData, {
                    callback: function(ret, _target, isSet){
                        $(_target).append(ret.result);

                        Util.watchAction(_target, [
                            {type: "click", mapping: null, compatible: null},
                            {type: "mousedown", mapping: null, compatible: null}
                        ], null);

                        Util.source(DateTimePickerProtocol);
                        this.core(ret.metaData, isSet);
                    },
                    args: [target || document.body, isSetInputValue],
                    context: this
                });
            }else{
                this.core(renderData, isSetInputValue);
            }
        },
        renderDateBox: function(renderData, isSetInputValue){
            DATETIME_PICKER.render(true, _html_picker_datebox, renderData, {
                callback: function(ret, isSet){
                    var dateBox = this.getDateTimePickerDateBox();

                    dateBox.html(ret.result);

                    var metaData = ret.metaData;
                    var plugin = $('[data-plugin="dtpicker.' + this.name + '"]');

                    plugin.attr("data-dtpicker-value", this.format(metaData.datetime));

                    if(true === isSet){
                        Util.requestExternal(this.options("sync"), [metaData.datetime, this.format(metaData.datetime), plugin]);
                    }
                },
                args: [isSetInputValue],
                context: this
            });
        },
        renderTimeBox: function(renderData, isSetInputValue){
            DATETIME_PICKER.render(true, _html_picker_timebox, renderData, {
                callback: function(ret, isSet){
                    var timeBox = this.getDateTimePickerTimeBox();
                    
                    timeBox.html(ret.result);
                    this.locate("hours")
                        .locate("minutes")
                        .locate("seconds")
                        .locate("fixed-time");

                    var metaData = ret.metaData;
                    var plugin = $('[data-plugin="dtpicker.' + this.name + '"]');

                    plugin.attr("data-dtpicker-value", this.format(metaData.datetime));

                    if(true === isSet){
                        Util.requestExternal(this.options("sync"), [metaData.datetime, this.format(metaData.datetime), plugin]);
                    }
                },
                args: [isSetInputValue],
                context: this
            });
        },
        core: function(renderData, isSetInputValue){
            this.renderDateBox(renderData, isSetInputValue);
            this.renderTimeBox(renderData, isSetInputValue);
        },
        update: function(datetime){
            this.currentDatetime = datetime;
        },
        getCurrentDateTime: function(){
            return this.currentDatetime;
        },
        locate: function(type){
            var timeOptions = this.getDateTimePickerTimeOptions(type);
            var size = timeOptions.length;
            var timeOption = null;
            var currentIndex = 0;

            for(var i = 0; i < size; i++){
                timeOption = $(timeOptions[i]);

                if(timeOption.hasClass("on")){
                    currentIndex = i;
                    break;
                }
            }

            var option = timeOptions[currentIndex];
            var optionHeight = Util.getBoundingClientRect(option).height;
            var parent = option.parentNode.parentNode;

            parent.scrollTop = optionHeight * currentIndex;

            return this;
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

            var offsetTop = Math.max(rect.globalScrollY, rect.localScrollY); //IE: globalScrollY  Other: localScrollY
            var left = rect.left;
            var top = rect.top + rect.height + 2 + offsetTop;

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

            this.locate("hours")
                .locate("minutes")
                .locate("seconds")
                .locate("fixed-time");
        },
        hide: function(){
            var picker = this.getDateTimePickerFrame();
            picker.addClass("hide");
        }
    };

    DateTimePicker.Cache = {};

    DateTimePicker.createDateTimePicker = function(name){
        var dtp = DateTimePicker.Cache[name] || (DateTimePicker.Cache[name] = new DateTimePicker());

        dtp.name = name;
        dtp.identity = dtp.namespace + "." + name;

        return {
            options: function(){
                return dtp.options.apply(dtp, arguments);
            },
            parse: function(datetimeString){
                return dtp.parse(datetimeString);
            },
            format: function(datetime){
                return dtp.format(datetime);
            },
            mode: function(mode){
                return dtp.mode(mode);
            },
            serialized: function(datetime){
                return dtp.serialized(datetime);
            },
            getDateTimePickerFrame: function(){
                return dtp.getDateTimePickerFrame();
            },
            getDateTimePickerDateBox: function(){
                return dtp.getDateTimePickerDateBox();
            },
            getDateTimePickerTimeBox: function(){
                return dtp.getDateTimePickerTimeBox();
            },
            getDateTimePickerYearMonthPanel: function(){
                return dtp.getDateTimePickerYearMonthPanel();
            },
            getDateTimePickerChoosenValue: function(){
                return dtp.getDateTimePickerChoosenValue();
            },
            getDateTimePickerTimeOptions: function(type){
                return dtp.getDateTimePickerTimeOptions(type);
            },
            render: function(target, isSetInputValue){
                dtp.render(target, isSetInputValue);

                return this;
            },
            renderDateBox: function(renderData, isSetInputValue){
                dtp.renderDateBox(renderData, isSetInputValue);

                return this;
            },
            renderTimeBox: function(renderData, isSetInputValue){
                dtp.renderTimeBox(renderData, isSetInputValue);

                return this;
            },
            core: function(renderData, isSetInputValue){
                dtp.core(renderData, isSetInputValue);

                return this;
            },
            update: function(datetime){
                dtp.update(datetime);

                return this;
            },
            getCurrentDateTime: function(){
                return dtp.getCurrentDateTime();
            },
            position: function(target, offsetScrollDOM){
                dtp.position(target, offsetScrollDOM);

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

    DateTimePicker.lookup = function(){
        var plugins = $('[data-plugin^="dtpicker"]');
        var size = plugins.length;
        var plugin = null;
        var options = null;
        var picker = null;

        for(var i = 0; i < size; i++){
            plugin = plugins[i];

            options = Util.parsePluginOptions($(plugin), "dtpicker", GetOptionDataStruct(), GetDefaultOptions());
            picker = DateTimePicker.createDateTimePicker(options.name);

            picker.options(options);

            if(options.value){
                picker.update(
                    picker.parse(options.value)
                );
            }

            picker.render().hide();

            $(plugin).attr("data-action-click", "dtp://picker/call");
        }
    };

    DateTimePicker.Parser = {
        Range: {
            dateRange: function(options, checkValue){
                var range = options.range.date;
                var filter = options.filter;
                var format = range.format;
                var start = range.start || null;
                var end = range.end || null;
                var startRangeDate = start ? DateUtil.parse(start, format) : null;
                var endRangeDate = end ? DateUtil.parse(end, format) : null;
                var checkDate = DataType.isDate(checkValue) ? checkValue : DateUtil.parse(checkValue, "%y-%M-%d").date;

                var inRange = true;

                startRangeDate = ((startRangeDate && startRangeDate.ok) ? startRangeDate.date : null);
                if(startRangeDate){
                    startRangeDate = new Date(startRangeDate.getFullYear(), startRangeDate.getMonth(), startRangeDate.getDate(), 0, 0, 0).getTime();
                }

                endRangeDate = ((endRangeDate && endRangeDate.ok) ? endRangeDate.date : null);
                if(endRangeDate){
                    endRangeDate = new Date(endRangeDate.getFullYear(), endRangeDate.getMonth(), endRangeDate.getDate(), 0, 0, 0).getTime();
                }

                checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), 0, 0, 0);
                checkDate = DateTimePicker.Parser.filter("date", filter, checkDate);

                if(checkDate){
                    checkDate = checkDate.getTime();

                    inRange = ((false === !!startRangeDate || startRangeDate <= checkDate) && (false === !!endRangeDate || checkDate <= endRangeDate));
                }else{
                    inRange = false;
                }

                var ret = {
                    "inRange": inRange,
                    "className": (inRange ? "" : "disabled")
                };

                return ret;
            },
            timeRange: function(options, checkValue){
                var range = options.range.time;
                var filter = options.filter;
                var start = range.start || null;
                var end = range.end || null;
                var check = null;

                var now = new Date();
                var inRange = true;

                var parse = function(value){
                    var items = value.split(":");
                    var hours = parseInt(items[0] || 0, 10);
                    var minutes = parseInt(items[1] || 0, 10);
                    var seconds = parseInt(items[2] || 0, 10);

                    return {
                        "hours": hours,
                        "minutes": minutes,
                        "seconds": seconds
                    };
                };

                if(start){
                    start = parse(start);
                    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), start.hours, start.minutes, start.seconds).getTime();
                }

                if(end){
                    end = parse(end);
                    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), end.hours, end.minutes, end.seconds).getTime();
                }

                check = parse(checkValue);
                check = new Date(now.getFullYear(), now.getMonth(), now.getDate(), check.hours, check.minutes, check.seconds);

                check = DateTimePicker.Parser.filter("time", filter, check);

                if(check){
                    check = check.getTime();

                    inRange = ((false === !!start || start <= check) && (false === !!end || check <= end));
                }else{
                    inRange = false;
                }

                var ret = {
                    "inRange": inRange,
                    "className": (inRange ? "" : "disabled")
                };

                return ret;
            },
            hoursRange: function(options, checkValue){
                var range = options.range.hours;
                var start = range.start;
                var end = range.end;
                var filter = options.filter;
                var inRange = (start <= checkValue && checkValue <= end);

                var compare = function(items, value){
                    var size = items.length;

                    for(var i = 0; i < size; i++){
                        if(parseInt(items[i], 10) === value){
                            return true;
                        }
                    }

                    return false;
                };

                if(true === compare(filter.hours || [], checkValue)){
                    inRange = false;
                }

                var ret = {
                    "inRange": inRange,
                    "className": (inRange ? "" : "disabled")
                };

                return ret;
            },
            minutesRange: function(options, checkValue){
                var range = options.range.minutes;
                var start = range.start;
                var end = range.end;
                var filter = options.filter;
                var inRange = (start <= checkValue && checkValue <= end);

                var compare = function(items, value){
                    var size = items.length;

                    for(var i = 0; i < size; i++){
                        if(parseInt(items[i], 10) === value){
                            return true;
                        }
                    }

                    return false;
                };

                if(true === compare(filter.minutes || [], checkValue)){
                    inRange = false;
                }

                var ret = {
                    "inRange": inRange,
                    "className": (inRange ? "" : "disabled")
                };

                return ret;
            },
            secondsRange: function(options, checkValue){
                var range = options.range.seconds;
                var start = range.start;
                var end = range.end;
                var filter = options.filter;
                var inRange = (start <= checkValue && checkValue <= end);

                var compare = function(items, value){
                    var size = items.length;

                    for(var i = 0; i < size; i++){
                        if(parseInt(items[i], 10) === value){
                            return true;
                        }
                    }

                    return false;
                };

                if(true === compare(filter.seconds || [], checkValue)){
                    inRange = false;
                }

                var ret = {
                    "inRange": inRange,
                    "className": (inRange ? "" : "disabled")
                };

                return ret;
            }
        },
        filter: function(type, filter, datetime){
            var filterYears = filter.years || [];
            var filterMonths = filter.months || [];
            var filterDates = filter.dates || [];
            var filterHours = filter.hours || [];
            var filterMinutes = filter.minutes || [];
            var filterSeconds = filter.seconds || [];
            var filterWeekends = filter.weekends;
            var filterWeekdays = filter.weekdays;

            var year = datetime.getFullYear();
            var month = datetime.getMonth() + 1;
            var date = datetime.getDate();
            var day = datetime.getDay();
            var hours = datetime.getHours();
            var minutes = datetime.getMinutes();
            var seconds = datetime.getSeconds();

            var compare = function(items, value){
                var size = items.length;

                for(var i = 0; i < size; i++){
                    if(parseInt(items[i], 10) === value){
                        return true;
                    }
                }

                return false;
            };

            if("date" == type){
                if(true === compare(filterYears, year)){
                    return null;
                }

                if(true === compare(filterMonths, month)){
                    return null;
                }

                if(true === compare(filterDates, date)){
                    return null;
                }

                if(true === filterWeekends && (0 === day || 6 === day)){
                    return null;
                }

                if(true === filterWeekdays && (day > 0 && day < 6)){
                    return null;
                }
            }

            if("time" == type){
                if(true === compare(filterHours, hours)){
                    return null;
                }

                if(true === compare(filterMinutes, minutes)){
                    return null;
                }

                if(true === compare(filterSeconds, seconds)){
                    return null;
                }
            }

            return datetime;
        }
    };

    (function(){
        $(document).on("mousedown.datetimepicker", function(e){
            for(var name in DateTimePicker.Cache){
                if(DateTimePicker.Cache.hasOwnProperty(name)){
                    DateTimePicker.Cache[name].hide();
                }
            }
        });
    })()

    module.exports = {
        version: "R17B0409",
        MODE: DateTimePicker.MODE,
        create: DateTimePicker.createDateTimePicker,
        lookup: DateTimePicker.lookup,
        getDateTimePicker: DateTimePicker.getDateTimePicker
    };
});