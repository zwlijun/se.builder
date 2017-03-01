/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 光标
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2017.3
 */
;define(function (require, exports, module){
    var _Cursor = {
        "version": "R17B0301",
        getCursorPosition: function(dom){
            var pos = 0;

            if(!dom){
                return pos;
            }

            if(document.selection){
                var section = null;

                dom.focus();
                section = document.selection.createRange(); 
                section.moveStart ('character', -dom.value.length);

                pos = section.text.length;
            }else if(!isNaN(dom.selectionStart)){
                pos = dom.selectionStart;
            }

            return pos;
        },
        setCursorPosition: function(dom, pos){
            if(!isNaN(dom.selectionStart)){
                dom.selectionStart = dom.selectionEnd = pos;
            }else if(dom.setSelectionRange){
                dom.focus();
                dom.setSelectionRange(pos, pos);
            }else if (dom.createTextRange) {
                var range = dom.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        },
        getSelectionText: function(){
            var userSelection = null; 
            var text = "";

            if(window.getSelection){
                userSelection = window.getSelection();
            }else if(document.selection){
                userSelection = document.selection.createRange();
            }

            if(!(text = userSelection.text)){
                text = userSelection;
            }

            return text;
        },
        setSelectTextRange: function(dom, start, end){
            var spos = Number(start);
            var epos = Number(end);

            var fullText = dom.value || "";
            var length = fullText.length;

            if(length > 0){
                if(isNaN(spos)){
                    spos = 0;
                }

                if(isNaN(epos)){
                    epos = length;
                }

                if(spos > length){
                    spos = length;
                }

                if(epos > length){
                    epos = length;
                }

                if(spos < 0){
                    var abs = Math.abs(spos);

                    if(abs > length){
                        var a = spos / length;
                        var b = a - Math.ceil(a);

                        spos = Math.round(b * length);
                    }

                    spos = length + spos;
                }

                if(epos < 0){
                    var abs = Math.abs(epos);

                    if(abs > length){
                        var a = epos / length;
                        var b = a - Math.ceil(a);

                        epos = Math.round(b * length);
                    }

                    epos = length + epos;
                }

                if(dom.createTextRange){
                    var range = dom.createTextRange();

                    range.moveStart("character", -length);
                    range.moveEnd("character", -length);
                    range.moveStart("character", spos);
                    range.moveEnd("character", epos);

                    range.select();
                }else{
                    dom.setSelectionRange(spos, epos);

                    dom.focus();
                }
            }
        },
        insertText: function(dom, text){
            if(document.selection){
                var selectRange = null;

                dom.focus();

                selectRange = document.selection.createRange();
                selectRange.text = text;

                dom.focus();
            }else if(!isNaN(dom.selectionStart)){
                var startPos = dom.selectionStart;
                var endPos = dom.selectionEnd;
                var scrollTop = dom.scrollTop;
                var value = dom.value || "";

                dom.value = value.substring(0, startPos) + text + value.substring(endPos, value.length);

                dom.focus();

                dom.selectionStart = startPos + text.length;
                dom.selectionEnd = startPos + text.length;

                dom.scrollTop = scrollTop;
            }
            else {
                dom.value += text;
                dom.focus();
            }
        }
    };

    module.exports = _Cursor;
});