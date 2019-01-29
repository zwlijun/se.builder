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
    charset: "utf8",
    setCharset: function(charset){
        CheckSum.charset = (charset || CheckSum.charset).replace(/\-/g, "");
    },
    getCharset: function(){
        return CheckSum.charset;
    },
    _read_ : function(filename){
        if(fs.existsSync(filename)){
            return fs.readFileSync(filename, {
                "encoding": CheckSum.getCharset()
            });
        }

        return null;
    },
    _write_ : function(filename, sum){
        fs.writeFileSync(filename, sum, {
            "encoding": CheckSum.getCharset()
        });
    },
    _filehash_ : function(algorithm, filename, callback, args, context) {
        // var hash = crypto.createHash(algorithm);
        
        // var input = fs.createReadStream(filename);
        // input.setEncoding(null);

        // input.on('data', (chunk) => {
        //     hash.update(chunk);
        // });

        // input.on('end', () => {
        //     var digest = hash.digest('hex');
        //     // console.log(filename + ' -> ' + digest);

        //     var target = CheckSum._read_(filename + "." + algorithm);

        //     if(digest != target){
        //         console.log("\x1B[33m", "digest", digest, target, filename, "\x1B[39m");
        //     }else{
        //         console.log("\x1B[32m", "digest", digest, target, filename, "\x1B[39m");
        //     }

        //     if(callback && callback.apply){
        //         callback.apply(context || null, [filename, digest, (null == target || digest != target)].concat(args||[]));
        //     }
        // });

        var hash = crypto.createHash(algorithm);
        // var opts = /\.(jpg|png|jpeg)$/i.test(filename) ? null : {
        //     "encoding": CheckSum.getCharset()
        // };
        var stream = fs.readFileSync(filename, {
             "encoding": null
        });

        var digest = null;

        if(!/\.(jpg|png|jpeg)$/i.test(filename)){
            const startTime = Date.now();
            console.log("transform line endings before: ", stream.length);
            const copyBuffer = new Int32Array(stream, 0, stream.length);
            const newBuffer = new Buffer(copyBuffer.filter((element, index, typedArray) => {
                if(0x0d === element){
                    if(0x0a === typedArray[index + 1]){ //Windows -> Unix
                        return false;
                    }else{
                        typedArray[index] = 0x0a; //Mac OS -> Unix
                    }
                }
                return true;
            }));
            console.log("transform line endings after: ", newBuffer.length);
            const costTime = Date.now() - startTime;
            console.log("transform line endings cost: " + costTime + "ms.");
            hash.update(newBuffer);
        }else{
            hash.update(stream);
        }

        digest = hash.digest("hex");

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

exports.setCharset = function(charset){
    CheckSum.setCharset(charset);
}

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




