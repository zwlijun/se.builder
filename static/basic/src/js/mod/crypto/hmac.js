/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/*!
 * Crypto-JS v1.1.0
 * http://code.google.com/p/crypto-js/
 * Copyright (c) 2009, Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
/**
 * Crypto-HMAC
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.8
 */
;define(function(require, exports, module){
    var Base = require("mod/crypto/base");

    var HMAC = function (hasher, message, key, options) {

        // Allow arbitrary length keys
        key = key.length > hasher.blocksize * 4 ?
              hasher.encode(key, { asBytes: true }) :
              Base.stringToBytes(key);

        // XOR keys with pad constants
        var okey = key,
            ikey = key.slice(0);
        for (var i = 0; i < hasher.blocksize * 4; i++) {
            okey[i] ^= 0x5C;
            ikey[i] ^= 0x36;
        }

        var hmacbytes = hasher.encode(Base.bytesToString(okey) +
                               hasher.encode(Base.bytesToString(ikey) + message, { asString: true }),
                               { asBytes: true });
        return options && options.asBytes ? hmacbytes :
               options && options.asString ? Base.bytesToString(hmacbytes) :
               Base.bytesToHex(hmacbytes);

    };

    module.exports = {
        "version": "R18B0815",
        encode: function(hasher, message, key, options){
            return HMAC(hasher, message, key, options);
        }
    };
});