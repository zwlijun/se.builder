/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * MIME配置，根据扩展名匹配MIME
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2017.9
 */
;define(function (require, exports, module){
    var DataType = require("mod/se/datatype");

    var Types = {
        "text/html": ["html", "htm", "shtml"],
        "text/css": ["css"],
        "text/xml": ["xml"],
        "text/mathml": ["mml"],
        "text/plain": ["txt"],
        "text/vnd.sun.j2me.app-descriptor": ["jad"],
        "text/vnd.wap.wml": ["wml"],
        "text/x-component": ["htc"],
        "image/gif": ["gif"],
        "image/jpeg": ["jpeg", "jpg", "jpe"],
        "image/bmp": ["bmp"],
        "image/png": ["png"],
        "image/tiff": ["tif", "tiff"],
        "image/vnd.wap.wbmp": ["wbmp"],
        "image/x-icon": ["ico"],
        "image/x-jng": ["jng"],
        "image/x-ms-bmp": ["bmp"],
        "image/svg+xml": ["svg", "svgz"],
        "image/webp": ["webp"],
        "image/vnd.wap.wbmp": ["wbmp"],
        "image/vnd.adobe.photoshop": ["psd"],
        "application/javascript": ["js"],
        "application/atom+xml": ["atom"],
        "application/rss+xml": ["rss"],
        "application/font-woff": ["woff"],
        "application/java-archive": ["jar", "war", "ear"],
        "application/json": ["json"],
        "application/mac-binhex40": ["hqx"],
        "application/msword": ["doc"],
        "application/pdf": ["pdf"],
        "application/postscript": ["ps", "eps", "ai"],
        "application/rtf": ["rtf"],
        "application/vnd.apple.mpegurl": ["m3u8"],
        "application/vnd.ms-excel": ["xls"],
        "application/vnd.ms-fontobject": ["eot"],
        "application/vnd.ms-powerpoint": ["ppt"],
        "application/vnd.wap.wmlc": ["wmlc"],
        "application/vnd.google-earth.kml+xml": ["kml"],
        "application/vnd.google-earth.kmz": ["kmz"],
        "application/x-7z-compressed": ["7z"],
        "application/x-cocoa": ["cco"],
        "application/x-java-archive-diff": ["jardiff"],
        "application/x-java-jnlp-file": ["jnlp"],
        "application/x-makeself": ["run"],
        "application/x-perl": ["pl", "pm"],
        "application/x-pilot": ["prc", "pdb"],
        "application/x-rar-compressed": ["rar"],
        "application/x-redhat-package-manager": ["rpm"],
        "application/x-sea": ["sea"],
        "application/x-shockwave-flash": ["swf"],
        "application/x-stuffit": ["sit"],
        "application/x-tcl": ["tcl", "tk"],
        "application/x-x509-ca-cert": ["der", "pem", "crt"],
        "application/x-xpinstall": ["xpi"],
        "application/xhtml+xml": ["xhtml"],
        "application/xspf+xml": ["xspf"],
        "application/zip": ["zip"],
        "application/octet-stream": ["bin", "exe", "dll"],
        "application/octet-stream": ["deb"],
        "application/octet-stream": ["dmg"],
        "application/octet-stream": ["iso", "img"],
        "application/octet-stream": ["msi", "msp", "msm"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"],
        "audio/midi": ["mid", "midi", "kar", "rmi"],
        "audio/mp4": ["mp4a", "mp4"],
        "audio/mp3": ["mp3"],
        "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"],
        "audio/ogg": ["ogg", "oga", "spx"],
        "audio/x-m4a": ["m4a"],
        "audio/x-realaudio": ["ra"],
        "audio/webm": ["weba"],
        "audio/x-aac": ["aac"],
        "audio/x-aiff": ["aif", "aiff", "aifc"],
        "audio/x-caf": ["caf"],
        "audio/x-flac": ["flac"],
        "audio/x-matroska": ["mka"],
        "audio/x-mpegurl": ["m3u"],
        "audio/x-ms-wax": ["wax"],
        "audio/x-ms-wma": ["wma"],
        "audio/x-pn-realaudio": ["ram", "ra"],
        "audio/x-pn-realaudio-plugin": ["rmp"],
        "audio/x-wav": ["wav"],
        "audio/xm": ["xm"],
        "video/3gpp": ["3gpp", "3gp"],
        "video/3gpp2": ["3g2"],
        "video/h261": ["h261"],
        "video/h263": ["h263"],
        "video/h264": ["h264"],
        "video/mp2t": ["ts"],
        "video/mp4": ["mp4", "mp4v", "mpg4"],
        "video/jpeg": ["jpgv"],
        "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"],
        "video/ogg": ["ogv"],
        "video/quicktime": ["mov", "qt"],
        "video/vnd.mpegurl": ["mxu", "m4u"],
        "video/webm": ["webm"],
        "video/x-f4v": ["f4v"],
        "video/x-fli": ["fli"],
        "video/x-flv": ["flv"],
        "video/x-m4v": ["m4v"],
        "video/x-mng": ["mng"],
        "video/x-ms-asf": ["asx", "asf"],
        "video/x-ms-wmv": ["wmv"],
        "video/x-msvideo": ["avi"],
        "video/x-sgi-movie": ["movie"]
    };

    module.exports = {
        "version": "R17B0922",
        ext: function(mime){
            mime = (mime || "").toLowerCase();

            if(mime in Types){
                return Types[mime];
            }

            return [];
        },
        maybe: function(ext){
            var a = [];
            var ret = [];

            ext = (ext || "").toLowerCase();
            for(var t in Types){
                if(Types.hasOwnProperty(t)){
                    a = Types[t];

                    for(var i = 0; i < a.length; i++){
                        if(a[i] === ext){
                            ret.push(t);
                        }
                    }
                }
            }

            return ret;
        },
        merge: function(arr1, arr2){
            var arr = [];
            var a = arr1.concat(arr2);
            var flag = {};
            var ext = null;

            for(var i = 0; i < a.length; i++){
                ext = a[i];

                if(ext in flag){
                    continue;
                }

                arr.push(ext);
                flag[ext] = 1;
            }

            return arr;
        },
        add: function(mime, ext){
            var arr = [];

            if(DataType.isArray(ext)){
                arr = [].concat(ext);
            }else{
                arr = ext.split(/[,;\s ]+/);
            }
            if(mime in Types){
                Types[mime] = this.merge(arr, Types[mime]);
            }else{
                Types[mime] = arr;
            }

            return this;
        },
        match_ext: function(mime, ext){
            mime = (mime || "").toLowerCase();
            ext = (ext || "").toLowerCase();

            var a = this.ext(mime);

            for(var i = 0; i < a.length; i++){
                if(a[i] === ext){
                    return true;
                }
            }

            return false;
        },
        match_mime: function(ext, mime){
            ext = (ext || "").toLowerCase();
            mime = (mime || "").toLowerCase();
            
            var a = this.maybe(ext);

            for(var i = 0; i < a.length; i++){
                if(a[i] === mime){
                    return true;
                }
            }
            
            return false;
        }
    };
});