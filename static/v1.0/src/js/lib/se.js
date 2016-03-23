/* se.js define */
(function(){
$.__ROOT__ = ($.__ROOT__ || {});

var __APP__         	= $.__ROOT__.APP         	= $("html");
var __SEED_STYLE__    	= $.__ROOT__.SEED_STYLE  	= $("#seed_style");
var __SEED_SCRIPT__   	= $.__ROOT__.SEED_SCRIPT 	= $("#seed_script");
var __SCRIPT_SOURCE__ 	= $.__ROOT__.SCRIPT_SOURCE 	= __SEED_SCRIPT__.attr("src");
var __JAVASCRIPT__  	= $.__ROOT__.JAVASCRIPT  	= __SCRIPT_SOURCE__.replace(/(\/js\/)(.*)$/i, "$1");
var __RES_ROOT__    	= $.__ROOT__.RES_ROOT    	= __JAVASCRIPT__.replace("/js/", "/");
var __IMAGE__       	= $.__ROOT__.IMAGE       	= __RES_ROOT__ + "img/";
var __CSS__         	= $.__ROOT__.CSS         	= __RES_ROOT__ + "css/";
var __DEBUG__       	= $.__ROOT__.DEBUG       	= "1" === (__SEED_SCRIPT__.attr("data-debug") || "0");
var __COMBO__       	= $.__ROOT__.COMBO       	= "1" === (__SEED_SCRIPT__.attr("data-combo") || "1");
var __PAGE_ALIAS__  	= $.__ROOT__.PAGE_ALIAS  	= __APP__.attr("data-page-alias") || "";
var __REFERER__     	= $.__ROOT__.REFERER     	= document.URL;
var __DOC_REFERER__     = $.__ROOT__.DOC_REFERER    = document.referrer;

var hashIndex = __PAGE_ALIAS__.indexOf("#");
var isSourceDir = __RES_ROOT__.indexOf("/src/") != -1;

if(true === isSourceDir){
	__DEBUG__ = true;
}

$.__ROOT__.ALIAS_SET = {
	"PREFIX": __PAGE_ALIAS__,
	"SUFFIX": __PAGE_ALIAS__
};

if(hashIndex != -1){
	var aliasMain = __PAGE_ALIAS__.substring(0, hashIndex);
	var aliasSub  = __PAGE_ALIAS__.substring(hashIndex + 1);

	$.__ROOT__.ALIAS_SET = {
		"PREFIX": aliasMain,
		"SUFFIX": aliasSub
	};
}

var conf = {
    base: __JAVASCRIPT__
};

if(!__COMBO__ || (__COMBO__ && __DEBUG__)){
    conf["comboExcludes"] = /.*/;
}

seajs.config(conf);
})();