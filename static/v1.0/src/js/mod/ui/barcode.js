/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 条形生成器，支持CODE128-A/B/C/AUTO, EAN128
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.04
 */
;define(function(require, exports, module){
    var BarCode = (function(){
        var G_CONST_CODE_TABLE = [
            //ID, CODE128A, CODE128B, CODE128C, BANDCODE,   ENCODE
            [0, "SP", "SP", "00", "212222", "11011001100"],
            [1, "!", "!", "01", "222122", "11001101100"],
            [2, "\"", "\"", "02", "222221", "11001100110"],
            [3, "#", "#", "03", "121223", "10010011000"],
            [4, "$", "$", "04", "121322", "10010001100"],
            [5, "%", "%", "05", "131222", "10001001100"],
            [6, "&", "&", "06", "122213", "10011001000"],
            [7, "'", "'", "07", "122312", "10011000100"],
            [8, "(", "(", "08", "132212", "10001100100"],
            [9, ")", ")", "09", "221213", "11001001000"],
            [10, "*", "*", "10", "221312", "11001000100"],
            [11, "+", "+", "11", "231212", "11000100100"],
            [12, ",", ",", "12", "112232", "10110011100"],
            [13, "-", "-", "13", "122132", "10011011100"],
            [14, ".", ".", "14", "122231", "10011001110"],
            [15, "/", "/", "15", "113222", "10111001100"],
            [16, "0", "0", "16", "123122", "10011101100"],
            [17, "1", "1", "17", "123221", "10011100110"],
            [18, "2", "2", "18", "223211", "11001110010"],
            [19, "3", "3", "19", "221132", "11001011100"],
            [20, "4", "4", "20", "221231", "11001001110"],
            [21, "5", "5", "21", "213212", "11011100100"],
            [22, "6", "6", "22", "223112", "11001110100"],
            [23, "7", "7", "23", "312131", "11101101110"],
            [24, "8", "8", "24", "311222", "11101001100"],
            [25, "9", "9", "25", "321122", "11100101100"],
            [26, ":", ":", "26", "321221", "11100100110"],
            [27, ";", ";", "27", "312212", "11101100100"],
            [28, "<", "<", "28", "322112", "11100110100"],
            [29, "=", "=", "29", "322211", "11100110010"],
            [30, ">", ">", "30", "212123", "11011011000"],
            [31, "?", "?", "31", "212321", "11011000110"],
            [32, "@", "@", "32", "232121", "11000110110"],
            [33, "A", "A", "33", "111323", "10100011000"],
            [34, "B", "B", "34", "131123", "10001011000"],
            [35, "C", "C", "35", "131321", "10001000110"],
            [36, "D", "D", "36", "112313", "10110001000"],
            [37, "E", "E", "37", "132113", "10001101000"],
            [38, "F", "F", "38", "132311", "10001100010"],
            [39, "G", "G", "39", "211313", "11010001000"],
            [40, "H", "H", "40", "231113", "11000101000"],
            [41, "I", "I", "41", "231311", "11000100010"],
            [42, "J", "J", "42", "112133", "10110111000"],
            [43, "K", "K", "43", "112331", "10110001110"],
            [44, "L", "L", "44", "132131", "10001101110"],
            [45, "M", "M", "45", "113123", "10111011000"],
            [46, "N", "N", "46", "113321", "10111000110"],
            [47, "O", "O", "47", "133121", "10001110110"],
            [48, "P", "P", "48", "313121", "11101110110"],
            [49, "Q", "Q", "49", "211331", "11010001110"],
            [50, "R", "R", "50", "231131", "11000101110"],
            [51, "S", "S", "51", "213113", "11011101000"],
            [52, "T", "T", "52", "213311", "11011100010"],
            [53, "U", "U", "53", "213131", "11011101110"],
            [54, "V", "V", "54", "311123", "11101011000"],
            [55, "W", "W", "55", "311321", "11101000110"],
            [56, "X", "X", "56", "331121", "11100010110"],
            [57, "Y", "Y", "57", "312113", "11101101000"],
            [58, "Z", "Z", "58", "312311", "11101100010"],
            [59, "[", "[", "59", "332111", "11100011010"],
            [60, "\\", "\\", "60", "314111", "11101111010"],
            [61, "]", "]", "61", "221411", "11001000010"],
            [62, "^", "^", "62", "431111", "11110001010"],
            [63, "_", "_", "63", "111224", "10100110000"],
            [64, "NUL", "`", "64", "111422", "10100001100"],
            [65, "SOH", "a", "65", "121124", "10010110000"],
            [66, "STX", "b", "66", "121421", "10010000110"],
            [67, "ETX", "c", "67", "141122", "10000101100"],
            [68, "EOT", "d", "68", "141221", "10000100110"],
            [69, "ENQ", "e", "69", "112214", "10110010000"],
            [70, "ACK", "f", "70", "112412", "10110000100"],
            [71, "BEL", "g", "71", "122114", "10011010000"],
            [72, "BS", "h", "72", "122411", "10011000010"],
            [73, "HT", "i", "73", "142112", "10000110100"],
            [74, "LF", "j", "74", "142211", "10000110010"],
            [75, "VT", "k", "75", "241211", "11000010010"],
            [76, "FF", "I", "76", "221114", "11001010000"],
            [77, "CR", "m", "77", "413111", "11110111010"],
            [78, "SO", "n", "78", "241112", "11000010100"],
            [79, "SI", "o", "79", "134111", "10001111010"],
            [80, "DLE", "p", "80", "111242", "10100111100"],
            [81, "DC1", "q", "81", "121142", "10010111100"],
            [82, "DC2", "r", "82", "121241", "10010011110"],
            [83, "DC3", "s", "83", "114212", "10111100100"],
            [84, "DC4", "t", "84", "124112", "10011110100"],
            [85, "NAK", "u", "85", "124211", "10011110010"],
            [86, "SYN", "v", "86", "411212", "11110100100"],
            [87, "ETB", "w", "87", "421112", "11110010100"],
            [88, "CAN", "x", "88", "421211", "11110010010"],
            [89, "EM", "y", "89", "212141", "11011011110"],
            [90, "SUB", "z", "90", "214121", "11011110110"],
            [91, "ESC", "{", "91", "412121", "11110110110"],
            [92, "FS", "|", "92", "111143", "10101111000"],
            [93, "GS", "}", "93", "111341", "10100011110"],
            [94, "RS", "~", "94", "131141", "10001011110"],
            [95, "US", "DEL", "95", "114113", "10111101000"],
            [96, "FNC3", "FNC3", "96", "114311", "10111100010"],
            [97, "FNC2", "FNC2", "97", "411113", "11110101000"],
            [98, "SHIFT", "SHIFT", "98", "411311", "11110100010"],
            [99, "CODEC", "CODEC", "99", "113141", "10111011110"],
            [100, "CODEB", "FNC4", "CODEB", "114131", "10111101110"],
            [101, "FNC4", "CODEA", "CODEA", "311141", "11101011110"],
            [102, "FNC1", "FNC1", "FNC1", "411131", "11110101110"],
            [103, "StartA", "StartA", "StartA", "211412", "11010000100"],
            [104, "StartB", "StartB", "StartB", "211214", "11010010000"],
            [105, "StartC", "StartC", "StartC", "211232", "11010011100"],
            [106, "Stop", "Stop", "Stop", "2331112", "1100011101011"]
        ];
        
        var G_CONST_FNC1    = "11110101110";  //102  G_CONST_CODE_TABLE[102][5]
        var G_CONST_START_A = "11010000100";  //103  G_CONST_CODE_TABLE[103][5]
        var G_CONST_START_B = "11010010000";  //104  G_CONST_CODE_TABLE[104][5]
        var G_CONST_START_C = "11010011100";  //105  G_CONST_CODE_TABLE[105][5]
        var G_CONST_STOP    = "1100011101011";//106  G_CONST_CODE_TABLE[106][5]
        
        /**
         * 获取校验ID
         * @param int type code128类型，对应G_CONST_CODE_TABLE的列索引
         *                 1: CODE128-A  G_CONST_CODE_TABLE[ROW_INDEX][1]
         *                 2: CODE128-B  G_CONST_CODE_TABLE[ROW_INDEX][2]
         *                 3: CODE128-C  G_CONST_CODE_TABLE[ROW_INDEX][3]
         * @param char chr 字符
         * @return int id
         * @throw Error
         */
        function GetID(type, chr){
            for(var i = 0, len = G_CONST_CODE_TABLE.length; i < len; i++){
                //console.info(i + ":" + chr + "/" + G_CONST_CODE_TABLE[i][type])
                if(chr === G_CONST_CODE_TABLE[i][type]){
                    return G_CONST_CODE_TABLE[i][0];
                }
            }
            
            throw new Error("[BarCode::GetID(int type=" + type + ", char chr='" + chr + "')] unsupport character(" + chr + ")");
        };
        
        /**
         * 生成校验位以及数据位
         * @param String content 内容
         * @param int start 开始位 StartA
         * @param int type code128类型，对应G_CONST_CODE_TABLE的列索引
         *                 1: CODE128-A  G_CONST_CODE_TABLE[ROW_INDEX][1]
         *                 2: CODE128-B  G_CONST_CODE_TABLE[ROW_INDEX][2]
         *                 3: CODE128-C  G_CONST_CODE_TABLE[ROW_INDEX][3]
         * @param int step 步长
         * @param int enc1 针对EAN编码的FNC1控制位。值为1或0
         * @return Object {int sum, String bytes}
         */
        function CheckSum(content, start, type, step, enc1){
            var sum = 0;
            var bytes = "";
            var chr = "";
            var id = "";
            
            for(var i = 0, index = 0, len = content.length; i < len; i+=step, index++){
                chr = content.substr(i, step);
                id = GetID(type, chr);
                //console.info(chr + "/" + id);

                bytes += G_CONST_CODE_TABLE[id][5];
                
                if(1 === enc1){ //EAN - ENC1
                    if(0 === index){
                        sum += 102 * (index + 1);
                        sum += id * (index + 2);
                    }else{
                        sum += id * (index + 2);
                    }
                }else{
                    sum += id * (index + 1);
                }            
            }
            //console.info((start + sum) % 103)
            return {"sum" : (start + sum) % 103, "bytes" : bytes};
        };
        
        /**
         * 获取数值的长度
         * @param int index 索引
         * @param String content 内容
         * @return int length
         */
        function GetNumberLength(index, content){
            var pc = /(\d+)/; //大于或等于4位数字
            var str = content.substr(index);
            var result = pc.exec(str)||[];
            var num = result[1]||"";
            
            pc = null; str = null; result = null;
            
            return num.length;
        };
        
        /**
         * 校验是否为数字
         * @param char c
         * @return Boolean true/false
         */
        function IsNumber(c){
            return ("0123456789".indexOf(c) != -1);
        };
        
        /**
         * 同CheckSum
         */
        function CheckSumAuto(chrset, content, start){
            var sum = 0;
            var bytes = "";
            var len = content.length;
            var i = 0;
            var index = 0;
            var _chrset = chrset;
            
            (function(){
                var chr = "";
                var nLen = 0;
                if("B" == _chrset){ //code b
                    for(; i < len; i++){
                        chr = content.substr(i, 1);
                        
                        if(IsNumber(chr)){ //为数字
                            nLen = GetNumberLength(i, content);
                            
                            if(nLen >= 4){ //长度大于或等于4时，采用CODEC
                                if(nLen % 2 != 0){ //为奇数时，在第一个字符后插入转换字符
                                    id = GetID(2, chr);
                                    bytes += G_CONST_CODE_TABLE[id][5];
                                    sum += id * (++index);
                                    i++;
                                }
                                _chrset = "C"; //切换到CODE128-C
                                bytes += "10111011110"; //CODEC  G_CONST_CODE_TABLE[99][5]
                                sum += 99 * (++index);
                                arguments.callee.apply();
                                return;
                            }else{                        
                                for(j = 0; j < nLen; j++){
                                    chr = content.substr(i, 1);
                                    id = GetID(2, chr);
                                    bytes += G_CONST_CODE_TABLE[id][5];
                                    sum += id * (++index);
                                    i++;
                                }
                                i--;
                                continue;
                            }
                        }else{
                            id = GetID(2, chr);
                            bytes += G_CONST_CODE_TABLE[id][5];
                            sum += id * (++index);
                        }
                    }
                }else{ //code c
                    for(; i < len; i += 2){
                        chr = content.substr(i, 2);
                        
                        if(chr.length == 2){
                            id = GetID(3, chr);
                            
                            bytes += G_CONST_CODE_TABLE[id][5];
                            sum += id * (++index);
                        }else{
                            //插入转换字符 CODEB
                            _chrset = "B"; //切换到CODE128-B
                            bytes += "10111101110"; //CODEB  G_CONST_CODE_TABLE[100][5]
                            sum += 100 * (++index);
                            
                            arguments.callee.apply();
                            return;
                        }
                    }
                }
            })();
            
            return {"sum" : (start + sum) % 103, "bytes" : bytes};
        };
        
        /**
         * CODE128-A
         */
        function EncodeA(content){
            var result = CheckSum(content, 103, 1, 1, 0);
            return G_CONST_START_A + result.bytes + G_CONST_CODE_TABLE[result.sum][5] + G_CONST_STOP;
        };
        
        /**
         * CODE128-B
         */
        function EncodeB(content){
            var result = CheckSum(content, 104, 2, 1, 0);
            return G_CONST_START_B + result.bytes + G_CONST_CODE_TABLE[result.sum][5] + G_CONST_STOP;
        };
        
        /**
         * CODE128-C
         */
        function EncodeC(content){
            var result = CheckSum(content, 105, 3, 2, 0);
            return G_CONST_START_C + result.bytes + G_CONST_CODE_TABLE[result.sum][5] + G_CONST_STOP;
        };
        
        /**
         * CODE128-AUTO
         */
        function EncodeAuto(content){
            var result = null;
            var startChr = content.substr(0, 1);
            var startCode = G_CONST_START_B;
            var start = 104;
            var chrset = "B";
            
            if(IsNumber(startChr)){
                startCode = G_CONST_START_C;
                start = 105;
                chrset = "C";
            }
            
            result = CheckSumAuto(chrset, content, start);
            enc = startCode + result.bytes + G_CONST_CODE_TABLE[result.sum][5] + G_CONST_STOP;
            result = null;
            
            return enc;
        };
        
        /**
         * EAN128
         */
        function EncodeEAN(content){
            var result = CheckSum(content, 105, 3, 2, 1);
            return G_CONST_START_C + G_CONST_FNC1 + result.bytes + G_CONST_CODE_TABLE[result.sum][5] + G_CONST_STOP;
        };
        
        /**
         * 合并对象
         * @param Object newObj 新对象
         * @param Object refObj 引用对象
         * @param Object inObj 传入的对象
         * @return Object newObj 合并后的新对象
         */
        function Merge(newObj, refObj, inObj){
            for(var k in refObj){
                if(refObj.hasOwnProperty(k)){
                    newObj[k] = (k in inObj ? inObj[k] : refObj[k]);
                }
            }
            
            return newObj;
        };
        /**
         * 不足位数前补0
         * @param String instr 输入的字符串
         * @param int bit 位数
         * @return String str 补0后的字符串
         */
        function FillBefore(instr, bit){
            var len = instr.length;
            var shift = bit - len + 1;
            var str = instr;
            if(shift > 0){
                var a = new Array(shift);
                str = a.join("0") + str;
                a = null;
            }
            return str;
        };
        
        /**
         * 获取编码器
         * @param String format
         * @return Function encoder
         */
        function GetEncoder(format){
            switch(format){
                case "A":
                    return EncodeA;
                case "B":
                    return EncodeB;
                case "C":
                    return EncodeC;
                case "AUTO":
                    return EncodeAuto;
                case "EAN":
                    return EncodeEAN;
                default:
                    return null;
            }
        };
        
        /**
         * 创建条形码
         * @param String content 条形码内容
         * @param Object options 配置参数 {int width, int height, String format}
         * @return HTMLCanvas canvas
         */
        function CreateBarCode(content, options){
            var canvas = null;
            var encoder = null;
            var format = null;
            var width = 0;
            var height = 0;
            var binary = null;
            var ctx = null;
            var size = 0;
            
            options = Merge({}, G_CONST_DEFAULT, (options||{})); //合并对象
            format = options.format;
            width = options.width;
            height = options.height;
            encoder = GetEncoder(format);
            
            if(null !== encoder){
                canvas = document.createElement('canvas');
            }else{
                console.log("Unknown barcode format(" + format + "/[A|B|C|AUTO|EAN])");
                return false;
            }
            
            if (!canvas.getContext) {
                console.log("The browser does not support HTML5canvas");
                return false;
            }
            
            binary = encoder(content);
            size = binary.length;
            ctx = canvas.getContext("2d");
            
            canvas.width = size * width;
            canvas.height = height;
            
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            for(var i = 0; i < size; i++){
                var x = i * width;

                if(binary[i] == "1"){
                    ctx.fillStyle = "#000";
                }else{
                    ctx.fillStyle = "#fff";
                }

                ctx.fillRect(x, 0, width, height);
            }
            
            ctx = null;
            options = null;
            binary = null;
            
            return {
                "barcode" : canvas,
                "barcodeText" : content
            };
        };
        
        var G_CONST_DEFAULT = {
            width : 2,
            height : 100,
            format : "AUTO"
        };
        
        return {
            create : CreateBarCode
        };
    })(); 

    module.exports = BarCode;
});