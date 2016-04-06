#!/bin/bash 

STATIC_TARGET_DIR=$(pwd)
STATIC_BASE_DIR=$(dirname $(dirname $(readlink -n "$0")))
STATIC_BASE_VERSION=$1
STATIC_TARGET_VERSION=$2

STATIC_BASE_PREFIX=${STATIC_BASE_DIR}/static/${STATIC_BASE_VERSION}
STATIC_PREFIX=${STATIC_TARGET_DIR}/static/${STATIC_TARGET_VERSION}
STATIC_RELATIVE_DIR=/static/${STATIC_TARGET_VERSION}
JQUERY_VERSION=2.1.4
ZEPTO_VERSION=1.1.6
SEAJS_VERSION=3.0.0
COMBO_VERSION=1.0.1
HTML5_SHIV_VERSION=3.7.3

echo ${STATIC_BASE_PREFIX}
echo ${STATIC_PREFIX}

if [ "$#" -eq "2" ]; then
    #复制脚本文件
    cp -rf ${STATIC_BASE_PREFIX}/src/js/lib/extra ${STATIC_PREFIX}/src/js/lib/
    cp -rf ${STATIC_BASE_PREFIX}/src/js/mod ${STATIC_PREFIX}/src/js/
    #复制样式文件
    cp -rf ${STATIC_BASE_PREFIX}/src/css/lib/extra ${STATIC_PREFIX}/src/css/lib/
    #复制图片文件
    cp -rf ${STATIC_BASE_PREFIX}/src/css/lib ${STATIC_PREFIX}/src/img/
    cp -rf ${STATIC_BASE_PREFIX}/src/css/mod ${STATIC_PREFIX}/src/img/
    #复制字体目录
    cp -rf ${STATIC_PREFIX}/src/fonts/* ${STATIC_PREFIX}/res/fonts/

    #合并模块样式
    cat ${STATIC_PREFIX}/src/css/lib/g.css > ${STATIC_PREFIX}/src/css/lib/gm.css
    cat ${STATIC_PREFIX}/src/css/mod/* >> ${STATIC_PREFIX}/src/css/lib/gm.css
    
    #合并JS
    echo ";/*! jQuery JavaScript Library v${JQUERY_VERSION} - http://jquery.org/license */" > ${STATIC_PREFIX}/src/js/lib/j.mix.js
    cat ${STATIC_PREFIX}/src/js/lib/jquery-${JQUERY_VERSION}.js >> ${STATIC_PREFIX}/src/js/lib/j.mix.js
    echo ";/*! Sea.js ${SEAJS_VERSION} | seajs.org/LICENSE.md */" >> ${STATIC_PREFIX}/src/js/lib/j.mix.js
    cat ${STATIC_PREFIX}/src/js/lib/sea-${SEAJS_VERSION}.js >> ${STATIC_PREFIX}/src/js/lib/j.mix.js
    echo ";/*! SeaJS-Combo.js ${COMBO_VERSION} | seajs.org/LICENSE.md */" >> ${STATIC_PREFIX}/src/js/lib/j.mix.js
    cat ${STATIC_PREFIX}/src/js/lib/seajs-combo-${COMBO_VERSION}.js >> ${STATIC_PREFIX}/src/js/lib/j.mix.js
    echo ";/*! SE Config For SeaJS */" >> ${STATIC_PREFIX}/src/js/lib/j.mix.js
    cat ${STATIC_PREFIX}/src/js/lib/se.js >> ${STATIC_PREFIX}/src/js/lib/j.mix.js

    echo ";/*! Zepto v${ZEPTO_VERSION} - zepto event ajax form ie - zeptojs.com/license */" > ${STATIC_PREFIX}/src/js/lib/z.mix.js
    cat ${STATIC_PREFIX}/src/js/lib/zepto-${ZEPTO_VERSION}.js >> ${STATIC_PREFIX}/src/js/lib/z.mix.js
    echo ";/*! Sea.js ${SEAJS_VERSION} | seajs.org/LICENSE.md */" >> ${STATIC_PREFIX}/src/js/lib/z.mix.js
    cat ${STATIC_PREFIX}/src/js/lib/sea-${SEAJS_VERSION}.js >> ${STATIC_PREFIX}/src/js/lib/z.mix.js
    echo ";/*! SeaJS-Combo.js ${COMBO_VERSION} | seajs.org/LICENSE.md */" >> ${STATIC_PREFIX}/src/js/lib/z.mix.js
    cat ${STATIC_PREFIX}/src/js/lib/seajs-combo-${COMBO_VERSION}.js >> ${STATIC_PREFIX}/src/js/lib/z.mix.js
    echo ";/*! SE Config For SeaJS */" >> ${STATIC_PREFIX}/src/js/lib/z.mix.js
    cat ${STATIC_PREFIX}/src/js/lib/se.js >> ${STATIC_PREFIX}/src/js/lib/z.mix.js

    #svn check & commit
    SVN_REVISION=`svn info |grep "Last Changed Rev:" |awk '{print $4}'`  

    if [ ${SVN_REVISION} ]; then
        SVN_URL=`svn info |grep URL: |awk '{print $2}'` 

        echo "The revision is ${SVN_REVISION}"  
        echo "The url is ${SVN_URL}" 

        svn up

        SVN_STATUS=`svn status static | awk '{print $1}'`

        if [ "${SVN_STATUS}" ]; then
            svn add static --force
            svn commit static -m "se.builder.auto"
        else
            echo "'${STATIC_TARGET_DIR}' is not changed"
        fi
    else
        echo "'${STATIC_TARGET_DIR}' is not a working copy"
    fi
else
    echo "请输入基础版本和目标版本，如：v1, v2, v2.1"
fi


