// checksum

"use strict"

var crypto = require('crypto');
var fs     = require('fs');

var CheckSum = {
    Algorithm : {
        "MD5": "md5",
        "SHA1": "sha1",
        "SHA256": "sha256",
        "SHA512": "sha512"
    },
    _read_ : function(filename){
        if(fs.existsSync(filename)){
            return fs.readFileSync(filename, {
                "encoding": "utf8"
            });
        }

        return null;
    },
    _write_ : function(filename, sum){
        fs.writeFileSync(filename, sum, {
            "encoding": "utf8"
        });
    },
    _filehash_ : function(algorithm, filename, callback, args, context) {
        var sum = crypto.createHash(algorithm);

        var stream = fs.readFileSync(filename);
        var digest = null;

        sum.update(stream);
        digest = sum.digest("hex");

        var target = CheckSum._read_(filename + "." + algorithm);

        if(digest != target){
            console.log("\x1B[33m", "digest", digest, target, filename, "\x1B[39m");
        }else{
            console.log("\x1B[32m", "digest", digest, target, filename, "\x1B[39m");
        }

        if(callback && callback.apply){
            callback.apply(context || null, [filename, digest, (null == target || digest != target)].concat(args||[]));
        }

    },
    _texthash_ : function(algorithm, text) {
        var sum = crypto.createHash(algorithm);
        var digest = null;

        sum.update(text);
        digest = sum.digest("hex");

        return digest;
    }
};

exports.FileMD5CheckSum = function(filename, callback, args, context){
    CheckSum._filehash_(CheckSum.Algorithm.MD5, filename, callback, args, context);
};

exports.FileSHA1CheckSum = function(filename, callback, args, context){
    CheckSum._filehash_(CheckSum.Algorithm.SHA1, filename, callback, args, context);
};

exports.FileSHA256CheckSum = function(filename, callback, args, context){
    CheckSum._filehash_(CheckSum.Algorithm.SHA256, filename, callback, args, context);
};

exports.FileSHA512CheckSum = function(filename, callback, args, context){
    CheckSum._filehash_(CheckSum.Algorithm.SHA512, filename, callback, args, context);
};

exports.WriteMD5CheckSum = function(filename, checksum){
    CheckSum._write_(filename + "." + CheckSum.Algorithm.MD5, checksum);
};

exports.WriteSHA1CheckSum = function(filename, checksum){
    CheckSum._write_(filename + "." + CheckSum.Algorithm.SHA1, checksum);
};

exports.WriteSHA256CheckSum = function(filename, checksum){
    CheckSum._write_(filename + "." + CheckSum.Algorithm.SHA256, checksum);
};

exports.WriteSHA512CheckSum = function(filename, checksum){
    CheckSum._write_(filename + "." + CheckSum.Algorithm.SHA512, checksum);
};

exports.TextMD5CheckSum = function(text){
    return CheckSum._texthash_(CheckSum.Algorithm.MD5, text);
};

exports.TextSHA1CheckSum = function(text){
    return CheckSum._texthash_(CheckSum.Algorithm.SHA1, text);
};

exports.TextSHA256CheckSum = function(text){
    return CheckSum._texthash_(CheckSum.Algorithm.SHA256, text);
};

exports.TextSHA512CheckSum = function(text){
    return CheckSum._texthash_(CheckSum.Algorithm.SHA512, text);
};




