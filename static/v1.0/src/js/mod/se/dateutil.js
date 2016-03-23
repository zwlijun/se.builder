/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 日期工具模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.4
 */
;define(function DateUtil(require, exports, module) {

    module.exports = {
        /**
         * 解析   
         * @param String str 需要校验的字符串
         * @param String fmt 日期格式
         * @return Object 结果 {boolean ok, Date date}
         */
        parse: function(str, fmt) {
            var tmp = "";
            fmt = fmt || "%y%M%d%h%m%s";
            tmp = fmt;
            fmt = fmt.replace("%y", "(\\d{4})");
            fmt = fmt.replace("%M", "(\\d{1,2})");
            fmt = fmt.replace("%d", "(\\d{1,2})");
            fmt = fmt.replace("%h", "(\\d{1,2})");
            fmt = fmt.replace("%m", "(\\d{1,2})");
            fmt = fmt.replace("%s", "(\\d{1,2})");
            fmt = fmt.replace("%i", "(\\d{1,3})");
            fmt = fmt.replace("%w", "(星期[日|一|二|三|四|五|六])");
            fmt = fmt.replace("%W", "(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)");
            fmt = fmt.replace("%a", "(日|一|二|三|四|五|六)");
            fmt = fmt.replace("%A", "(Sun\\.|Mon\\.|Tues\\.|Wed\\.|Thur\\.|Fri\\.|Sat\\.)");
            var regExp = new RegExp("^" + fmt + "$");
            var group = regExp.exec(str);
            var _year, _month, _date, _hour, _minute, _second, _millisecond;
            var yIndex = getIndex("y", tmp);
            var MIndex = getIndex("M", tmp);
            var dIndex = getIndex("d", tmp);
            var hIndex = getIndex("h", tmp);
            var mIndex = getIndex("m", tmp);
            var sIndex = getIndex("s", tmp);
            var iIndex = getIndex("i", tmp);
            var isUndefined = (undefined === yIndex
                            && undefined === MIndex
                            && undefined === dIndex
                            && undefined === hIndex
                            && undefined === mIndex
                            && undefined === sIndex
                            && undefined === iIndex);
            var _is = false;
            var d = new Date();

            if (null != group){
                group.shift();
                _year = undefined === yIndex ? d.getFullYear() : parse(group[yIndex]);
                _month = undefined === MIndex ? d.getMonth() : parse(group[MIndex])-1;
                _date = undefined === dIndex ? d.getDate() : parse(group[dIndex]);
                _hour = undefined === hIndex ? d.getHours() : parse(group[hIndex]);
                _minute = undefined === mIndex ? d.getMinutes() : parse(group[mIndex]);
                _second = undefined === sIndex ? d.getSeconds() : parse(group[sIndex]);
                _millisecond = undefined === iIndex ? d.getMilliseconds() : parse(group[iIndex]);
                d = new Date(_year, _month, _date, _hour, _minute, _second, _millisecond);
                _is = (false === isUndefined) && ((d.getFullYear()===_year)
                    && (d.getMonth() === _month)
                    && (d.getDate() === _date)
                    && (d.getHours() === _hour)
                    && (d.getMinutes() === _minute)
                    && (d.getSeconds() === _second)
                    && (d.getMilliseconds() === _millisecond));
            }
            function parse(v){
                return typeof(v) == "undefined" ? 0 : parseInt(v, 10);
            }
            function getIndex(flag, fmt){
                var tmp = fmt.replace(/[^%yMdhmsi]+/g, "");
                var arr = tmp.split("%");
                var size = arr.length;
                for(var i = 1; i < size; i++){
                    if(arr[i] == flag){
                        return (i - 1);
                    }
                }
                return undefined;
            }
            return {ok : _is, date : d};
        },
        
        /**
         * 格式化日期为指定的格式
         * @param Date indate 日期
         * @param String fmt 格式 %y%M%d%h%m%s%i[%w%W%a%A]
         * @param Boolean isFill 不足位数补0
         * @return String
         */
        format: function(indate, fmt, isFill) {
            var year = indate.getFullYear();
            var month = (indate.getMonth() + 1);
            var date = indate.getDate();
            var hour = indate.getHours();
            var minute = indate.getMinutes();
            var second = indate.getSeconds();
            var miSec = indate.getMilliseconds();
            var day = indate.getDay();
            var cn_weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            var cn_weeks_abbr = ["日", "一", "二", "三", "四", "五", "六"];
            var en_weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var en_weeks_abbr = ["Sun.", "Mon.", "Tues.", "Wed.", "Thur.", "Fri.", "Sat."];

            isFill = typeof(isFill) == "boolean" ? isFill : true;
            fmt = fmt || "%y%M%d%h%m%s%i %w";
            fmt = fmt.replace("%y", year);
            fmt = fmt.replace("%M", isFill ? (month < 10 ? "0" + month : month) : month);
            fmt = fmt.replace("%d", isFill ? (date < 10 ? "0" + date : date) : date);
            fmt = fmt.replace("%h", isFill ? (hour < 10 ? "0" + hour : hour) : hour);
            fmt = fmt.replace("%m", isFill ? (minute < 10 ? "0" + minute : minute) : minute);
            fmt = fmt.replace("%s", isFill ? (second < 10 ? "0" + second : second) : second);
            fmt = fmt.replace("%i", isFill ? (miSec < 100 ? (miSec < 10 ? "00" + miSec : "0" + miSec) : miSec) : miSec);
            fmt = fmt.replace("%w", cn_weeks[day]);
            fmt = fmt.replace("%W", en_weeks[day]);
            fmt = fmt.replace("%a", cn_weeks_abbr[day]);
            fmt = fmt.replace("%A", en_weeks_abbr[day]);

            return fmt;
        },
        
        /**
         * 日期比较(compareDate - firstDate)
         * @param String interval 间隔参数
         *        y 年
         *        q 季度
         *        n 月
         *        d 日
         *        w 周
         *        h 小时
         *        m 分钟
         *        s 秒
         *        i 毫秒
         * @param Date firstDate 基准日期
         * @param Date compareDate 比较日期
         * @return float 差值
         */
        dateDiff: function(interval, firstDate, compareDate) {
            var diff = 0;
            switch(interval){
                case 'y':
                    diff = compareDate.getFullYear() - firstDate.getFullYear();
                    break;
                case 'q':
                    diff = ((compareDate.getMonth() + 1) + ((compareDate.getFullYear() - firstDate.getFullYear()) * 12) - (firstDate.getMonth() + 1)) / 3;
                    break;
                case 'n':
                    diff = (compareDate.getMonth() + 1) + ((compareDate.getFullYear() - firstDate.getFullYear()) * 12) - (firstDate.getMonth() + 1);
                    break;
                case 'd':
                    diff = (compareDate - firstDate) / 86400000;
                    break;
                case 'w':
                    diff = (compareDate - firstDate) / (86400000 * 7);
                    break;
                case 'h':
                    diff = (compareDate - firstDate) / 3600000;
                    break;
                case 'm':
                    diff = (compareDate - firstDate) / 60000;
                    break;
                case 's':
                    diff = (compareDate - firstDate) / 1000;
                    break;
                case 'i':
                    diff = compareDate.getTime() - firstDate.getTime();
                    break;
                default:
                    diff = compareDate.getTime() - firstDate.getTime();
                    break;
            }
            return diff;
        },
        /**
         * 日期相加
         *
         * @method dateAdd
         * @param char interval 间隔参数
         *        y 年
         *        q 季度
         *        n 月
         *        d 日
         *        w 周
         *        h 小时
         *        m 分钟
         *        s 秒
         *        i 毫秒
         * @param Date indate 输入的日期
         * @param Number offset 差值
         * @return Date date 相加后的日期
         */
        dateAdd : function(interval, indate, offset){
            switch(interval){
                case 'y':
                    indate.setFullYear(indate.getFullYear() + offset);
                    break;
                case 'q':
                    indate.setMonth(indate.getMonth() + (offset * 3));
                    break;
                case 'n':
                    indate.setMonth(indate.getMonth() + offset);
                    break;
                case 'd':
                    indate.setDate(indate.getDate() + offset);
                    break;
                case 'w':
                    indate.setDate(indate.getDate() + (offset * 7));
                    break;
                case 'h':
                    indate.setHours(indate.getHours() + offset);
                    break;
                case 'm':
                    indate.setMinutes(indate.getMinutes() + offset);
                    break;
                case 's':
                    indate.setSeconds(indate.getSeconds() + offset);
                    break;
                case 'i':
                    indate.setMilliseconds(indate.getMilliseconds() + offset);
                    break;
                default:
                    indate.setMilliseconds(indate.getMilliseconds() + offset);
                    break;
            }
            return indate;
        },
         /**
         * 判断是否是闰年
         *
         * @method leapYear
         * @param Date indate 输入的日期
         * @return Object 对象(是否是闰年，各月份的天数集，当前月的天数)
         */
        leapYear : function(indate){
            var _days = [31,28,31,30,31,30,31,31,30,31,30,31];
            var _is = false;
            var _d = 365;

            if ((indate.getFullYear() % 4 === 0 && indate.getFullYear() % 100 !== 0) || indate.getFullYear() % 400 === 0){
                _days.splice(1,1,29);
                _is = true;
                _d = 366;
            }else{
                _days.splice(1,1,28);
                _is = false;
                _d = 365;
            }
            return {isLeapYear:_is, days:_days, yearDays:_d, monthDays:_days[indate.getMonth()]};
        }
    };
});