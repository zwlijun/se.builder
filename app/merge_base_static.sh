#!/bin/bash 

STATIC_BASE_DIR=$(dirname $(dirname $(readlink -n "$0")))
STATIC_BASE_VERSION=basic

STATIC_BASE_PREFIX=${STATIC_BASE_DIR}/static/${STATIC_BASE_VERSION}
STATIC_RELATIVE_DIR=/static/${STATIC_BASE_VERSION}

JQUERY_1X_VERSION=1.12.3
JQUERY_2X_VERSION=2.2.3
ZEPTO_VERSION=1.1.6
SEAJS_VERSION=3.0.0
COMBO_VERSION=1.0.1
HTML5_SHIV_VERSION=3.7.3
REM_VERSION=1.3.4

BASED_JQUERY_1X_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/jquery/r${JQUERY_1X_VERSION}/jquery.js
BASED_JQUERY_2X_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/jquery/r${JQUERY_2X_VERSION}/jquery.js
BASED_ZEPTO_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/zepto/r${ZEPTO_VERSION}/zepto.js
BASED_SEAJS_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/seajs/r${SEAJS_VERSION}/sea.js
BASED_COMBO_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/seajs/plugins/combo/r${COMBO_VERSION}/combo.js
BASED_SE_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/se.js

JQUERY_1X_MIX=${STATIC_BASE_PREFIX}/src/js/lib/j.1x.mix.js
JQUERY_2X_MIX=${STATIC_BASE_PREFIX}/src/js/lib/j.2x.mix.js
ZEPTO_MIX=${STATIC_BASE_PREFIX}/src/js/lib/z.mix.js

#合并模块样式
cat ${STATIC_BASE_PREFIX}/src/css/lib/g.css > ${STATIC_BASE_PREFIX}/src/css/lib/gm.css
cat ${STATIC_BASE_PREFIX}/src/css/mod/* >> ${STATIC_BASE_PREFIX}/src/css/lib/gm.css
#合并JS
echo ";/*! jQuery JavaScript Library v${JQUERY_1X_VERSION} - http://jquery.org/license */" > ${JQUERY_1X_MIX}
cat ${BASED_JQUERY_1X_PATH} >> ${JQUERY_1X_MIX}
echo ";/*! Sea.js ${SEAJS_VERSION} | seajs.org/LICENSE.md */" >> ${JQUERY_1X_MIX}
cat ${BASED_SEAJS_PATH} >> ${JQUERY_1X_MIX}
echo ";/*! SeaJS-Combo.js ${COMBO_VERSION} | seajs.org/LICENSE.md */" >> ${JQUERY_1X_MIX}
cat ${BASED_COMBO_PATH} >> ${JQUERY_1X_MIX}
echo ";/*! SE Config For SeaJS */" >> ${JQUERY_1X_MIX}
cat ${BASED_SE_PATH} >> ${JQUERY_1X_MIX}

echo ";/*! jQuery JavaScript Library v${JQUERY_2X_VERSION} - http://jquery.org/license */" > ${JQUERY_2X_MIX}
cat ${BASED_JQUERY_2X_PATH} >> ${JQUERY_2X_MIX}
echo ";/*! Sea.js ${SEAJS_VERSION} | seajs.org/LICENSE.md */" >> ${JQUERY_2X_MIX}
cat ${BASED_SEAJS_PATH} >> ${JQUERY_2X_MIX}
echo ";/*! SeaJS-Combo.js ${COMBO_VERSION} | seajs.org/LICENSE.md */" >> ${JQUERY_2X_MIX}
cat ${BASED_COMBO_PATH} >> ${JQUERY_2X_MIX}
echo ";/*! SE Config For SeaJS */" >> ${JQUERY_2X_MIX}
cat ${BASED_SE_PATH} >> ${JQUERY_2X_MIX}

echo ";/*! Zepto v${ZEPTO_VERSION} - zepto event ajax form ie - zeptojs.com/license */" > ${ZEPTO_MIX}
cat ${BASED_ZEPTO_PATH} >> ${ZEPTO_MIX}
echo ";/*! Sea.js ${SEAJS_VERSION} | seajs.org/LICENSE.md */" >> ${ZEPTO_MIX}
cat ${BASED_SEAJS_PATH} >> ${ZEPTO_MIX}
echo ";/*! SeaJS-Combo.js ${COMBO_VERSION} | seajs.org/LICENSE.md */" >> ${ZEPTO_MIX}
cat ${BASED_COMBO_PATH} >> ${ZEPTO_MIX}
echo ";/*! SE Config For SeaJS */" >> ${ZEPTO_MIX}
cat ${BASED_SE_PATH} >> ${ZEPTO_MIX}

#生成INC文件
echo -n "<link id=\"seed_style\" rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/gm.css\">" > ${STATIC_BASE_PREFIX}/inc/css_common_gm.html
echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/m_main.css\">" > ${STATIC_BASE_PREFIX}/inc/css_common_mm.html
echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/d_main.css\">" > ${STATIC_BASE_PREFIX}/inc/css_common_dm.html
echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/j.1x.mix.js\"></script>" > ${STATIC_BASE_PREFIX}/inc/js_common_j.1.x.html
echo -m "<!--[if lt IE 9]><script src=\"${STATIC_RELATIVE_DIR}/src/js/lib/extra/rem/r${REM_VERSION}/rem.js\"></script><![endif]-->" >> ${STATIC_BASE_PREFIX}/inc/js_common_j.1.x.html
echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/j.2x.mix.js\"></script>" > ${STATIC_BASE_PREFIX}/inc/js_common_j.2.x.html
echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/z.mix.js\"></script>" > ${STATIC_BASE_PREFIX}/inc/js_common_z.html
echo -n "<!--[if lt IE 9]><script src=\"${STATIC_RELATIVE_DIR}/src/js/lib/extra/html5/r${HTML5_SHIV_VERSION}/html5shiv.js\"></script><![endif]-->" > ${STATIC_BASE_PREFIX}/inc/js_html5_shiv.html

