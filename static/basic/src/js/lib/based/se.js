/* se.js define */
(function(){
$.__ROOT__ = ($.__ROOT__ || {});

var __APP__             = $.__ROOT__.APP            = $("html");
var __SEED_STYLE__      = $.__ROOT__.SEED_STYLE     = $("#seed_style");
var __SEED_SCRIPT__     = $.__ROOT__.SEED_SCRIPT    = $("#seed_script");
var __SCRIPT_SOURCE__   = $.__ROOT__.SCRIPT_SOURCE  = __SEED_SCRIPT__.attr("src");
var __JAVASCRIPT__      = $.__ROOT__.JAVASCRIPT     = __SCRIPT_SOURCE__.replace(/(\/js\/)(.*)$/i, "$1");
var __RES_ROOT__        = $.__ROOT__.RES_ROOT       = __JAVASCRIPT__.replace("/js/", "/");
var __IMAGE__           = $.__ROOT__.IMAGE          = __RES_ROOT__ + "img/";
var __CSS__             = $.__ROOT__.CSS            = __RES_ROOT__ + "css/";
var __DEBUG__           = $.__ROOT__.DEBUG          = "1" === (__SEED_SCRIPT__.attr("data-debug") || "0");
var __COMBO__           = $.__ROOT__.COMBO          = "1" === (__SEED_SCRIPT__.attr("data-combo") || "1");
var __USE_SOURCE__      = $.__ROOT__.USE_SOURCE     = "1" === (__SEED_SCRIPT__.attr("data-use-source") || "0");
var __PAGE_ALIAS__      = $.__ROOT__.PAGE_ALIAS     = __APP__.attr("data-page-alias") || "";
var __REFERER__         = $.__ROOT__.REFERER        = document.URL;
var __DOC_REFERER__     = $.__ROOT__.DOC_REFERER    = document.referrer;

var _SOURCE_DIR_NAME = "src";

var aliasItems = __PAGE_ALIAS__.split(".");
var aliasItemSize = aliasItems.length;
var isSourceDir = __RES_ROOT__.indexOf("/" + _SOURCE_DIR_NAME + "/") != -1;
var isForceUseSource = __REFERER__.indexOf("FORCE_USE_SOURCE=1") != -1;
var isForceDebug = __REFERER__.indexOf("FORCE_DEBUG=1") != -1;

var GetAliasItem = function(index){
    return aliasItems[index];
};

var GetAlistItemIndex = function(size, n){
    var lastIndex = Math.max(size - 1, 0);

    return Math.max(lastIndex - n, 0);
}

if(true === isSourceDir || true === isForceDebug){
    __DEBUG__           = $.__ROOT__.DEBUG          = true;
}

if(isForceUseSource){
    __DEBUG__           = $.__ROOT__.DEBUG          = true;
    __USE_SOURCE__      = $.__ROOT__.USE_SOURCE     = true;
}

if(!isSourceDir && true === __USE_SOURCE__){
    __DEBUG__           = $.__ROOT__.DEBUG          = true;
    __JAVASCRIPT__      = $.__ROOT__.JAVASCRIPT     = __JAVASCRIPT__.replace("/res/", "/" + _SOURCE_DIR_NAME + "/");
}

$.__ROOT__.ALIAS_SET = {
    "PLATFORM": __PAGE_ALIAS__,     //平台
    "APP":      __PAGE_ALIAS__,     //应用
    "PROJECT":  __PAGE_ALIAS__,     //项目
    "MODULE":   __PAGE_ALIAS__,     //模块
    "FEATURE":  __PAGE_ALIAS__,     //功能
    "PAGE":     __PAGE_ALIAS__      //页面
};

if(aliasItemSize > 1){
    var __platform  = GetAliasItem(GetAlistItemIndex(aliasItemSize, 5));
    var __app       = GetAliasItem(GetAlistItemIndex(aliasItemSize, 4));
    var __project   = GetAliasItem(GetAlistItemIndex(aliasItemSize, 3));
    var __module    = GetAliasItem(GetAlistItemIndex(aliasItemSize, 2));
    var __feature   = GetAliasItem(GetAlistItemIndex(aliasItemSize, 1));
    var __page      = GetAliasItem(GetAlistItemIndex(aliasItemSize, 0));

    $.__ROOT__.ALIAS_SET = {
        "PLATFORM": __platform,    //平台
        "APP":      __app,         //应用
        "PROJECT":  __project,     //项目
        "MODULE":   __module,      //模块
        "FEATURE":  __feature,     //功能
        "PAGE":     __page         //页面
    };
}

var WEIXIN_JSSDK_URL = ($('meta[name="open-wechat-jssdk"]').attr("content") || "http://res.wx.qq.com/open/js/jweixin-1.0.0.js");

var conf = {
    base: __JAVASCRIPT__,
    alias: {
        "wxjssdk": WEIXIN_JSSDK_URL
    }
};
(function(){
    var seajsAlias = $('meta[name="seajs-alias"]');
    var size = seajsAlias.length;
    var meta = null;
    var aliasName = null;
    var content = null;

    for(var i = 0; i < size; i++){
        meta = $(seajsAlias[i]);
        aliasName = meta.attr("data-alias");
        content = meta.attr("content");

        conf.alias[aliasName] = content;
    }
})();

if(!__COMBO__ || (__COMBO__ && __DEBUG__)){
    conf["comboExcludes"] = /.*/;
}

seajs.config(conf);
})();