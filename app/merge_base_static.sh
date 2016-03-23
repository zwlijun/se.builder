#!/bin/bash 

STATIC_BASE_DIR=$(dirname $(dirname $(readlink -n "$0")))
STATIC_BASE_VERSION=$1

STATIC_BASE_PREFIX=${STATIC_BASE_DIR}/static/${STATIC_BASE_VERSION}
STATIC_RELATIVE_DIR=/static/${STATIC_BASE_VERSION}

JQUERY_VERSION=2.1.4
ZEPTO_VERSION=1.1.6
SEAJS_VERSION=3.0.0
COMBO_VERSION=1.0.1
HTML5_SHIV_VERSION=3.7.3

if [ "$#" -eq "1" ]; then
	#合并模块样式
    cat ${STATIC_BASE_PREFIX}/src/css/lib/g.css > ${STATIC_BASE_PREFIX}/src/css/lib/gm.css
    cat ${STATIC_BASE_PREFIX}/src/css/mod/* >> ${STATIC_BASE_PREFIX}/src/css/lib/gm.css
    #合并JS
    echo ";/*! jQuery JavaScript Library v${JQUERY_VERSION} - http://jquery.org/license */" > ${STATIC_BASE_PREFIX}/src/js/lib/j.mix.js
    cat ${STATIC_BASE_PREFIX}/src/js/lib/jquery-${JQUERY_VERSION}.js >> ${STATIC_BASE_PREFIX}/src/js/lib/j.mix.js
    echo ";/*! Sea.js ${SEAJS_VERSION} | seajs.org/LICENSE.md */" >> ${STATIC_BASE_PREFIX}/src/js/lib/j.mix.js
    cat ${STATIC_BASE_PREFIX}/src/js/lib/sea-${SEAJS_VERSION}.js >> ${STATIC_BASE_PREFIX}/src/js/lib/j.mix.js
    echo ";/*! SeaJS-Combo.js ${COMBO_VERSION} | seajs.org/LICENSE.md */" >> ${STATIC_BASE_PREFIX}/src/js/lib/j.mix.js
    cat ${STATIC_BASE_PREFIX}/src/js/lib/seajs-combo-${COMBO_VERSION}.js >> ${STATIC_BASE_PREFIX}/src/js/lib/j.mix.js
    echo ";/*! SE Config For SeaJS */" >> ${STATIC_BASE_PREFIX}/src/js/lib/j.mix.js
    cat ${STATIC_BASE_PREFIX}/src/js/lib/se.js >> ${STATIC_BASE_PREFIX}/src/js/lib/j.mix.js

    echo ";/*! Zepto v${ZEPTO_VERSION} - zepto event ajax form ie - zeptojs.com/license */" > ${STATIC_BASE_PREFIX}/src/js/lib/z.mix.js
    cat ${STATIC_BASE_PREFIX}/src/js/lib/zepto-${ZEPTO_VERSION}.js >> ${STATIC_BASE_PREFIX}/src/js/lib/z.mix.js
    echo ";/*! Sea.js ${SEAJS_VERSION} | seajs.org/LICENSE.md */" >> ${STATIC_BASE_PREFIX}/src/js/lib/z.mix.js
    cat ${STATIC_BASE_PREFIX}/src/js/lib/sea-${SEAJS_VERSION}.js >> ${STATIC_BASE_PREFIX}/src/js/lib/z.mix.js
    echo ";/*! SeaJS-Combo.js ${COMBO_VERSION} | seajs.org/LICENSE.md */" >> ${STATIC_BASE_PREFIX}/src/js/lib/z.mix.js
    cat ${STATIC_BASE_PREFIX}/src/js/lib/seajs-combo-${COMBO_VERSION}.js >> ${STATIC_BASE_PREFIX}/src/js/lib/z.mix.js
    echo ";/*! SE Config For SeaJS */" >> ${STATIC_BASE_PREFIX}/src/js/lib/z.mix.js
    cat ${STATIC_BASE_PREFIX}/src/js/lib/se.js >> ${STATIC_BASE_PREFIX}/src/js/lib/z.mix.js

    #生成INC文件
    echo -n "<link id=\"seed_style\" rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/gm.css\">" > ${STATIC_BASE_PREFIX}/inc/css_common_gm.html
    echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/m_main.css\">" > ${STATIC_BASE_PREFIX}/inc/css_common_mm.html
    echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/d_main.css\">" > ${STATIC_BASE_PREFIX}/inc/css_common_dm.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/j.mix.js\"></script>" > ${STATIC_BASE_PREFIX}/inc/js_common_j.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/z.mix.js\"></script>" > ${STATIC_BASE_PREFIX}/inc/js_common_z.html
    echo -n "<!--[if lt IE 9]><script src=\"${STATIC_RELATIVE_DIR}/src/js/lib/extra/html5/r${HTML5_SHIV_VERSION}/html5shiv.js\"></script><![endif]-->" > ${STATIC_BASE_PREFIX}/inc/js_html5_shiv.html
else
	echo "请输入基础版本，如：v1, v2, v2.1"
fi