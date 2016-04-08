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
    #create src dir
    #js源文件目录，lib - 基础库   mod - 公用模块  logic - 业务逻辑  extra - 第三方插件、引擎或库
    mkdir -p ${STATIC_PREFIX}/src/js/lib/extra
    mkdir -p ${STATIC_PREFIX}/src/js/mod
    mkdir -p ${STATIC_PREFIX}/src/js/logic
    #CSS源文件目录，lib - 基础库   mod - 公用模块  logic - 业务逻辑  extra - 第三方插件、引擎或库
    mkdir -p ${STATIC_PREFIX}/src/css/lib/extra
    mkdir -p ${STATIC_PREFIX}/src/css/mod
    mkdir -p ${STATIC_PREFIX}/src/css/logic
    #图片源文件目录，lib - 基础库   mod - 公用模块  logic - 业务逻辑  extra - 第三方插件、引擎或库
    mkdir -p ${STATIC_PREFIX}/src/img/lib/extra
    mkdir -p ${STATIC_PREFIX}/src/img/mod
    mkdir -p ${STATIC_PREFIX}/src/img/logic
    #字体目录
    mkdir -p ${STATIC_PREFIX}/src/fonts
    #SVG文件目录
    mkdir -p ${STATIC_PREFIX}/src/svg
    #create res dir
    #JS构建后的目录，lib - 基础库   mod - 公用模块  logic - 业务逻辑  extra - 第三方插件、引擎或库
    mkdir -p ${STATIC_PREFIX}/res/js/lib/extra
    mkdir -p ${STATIC_PREFIX}/res/js/mod
    mkdir -p ${STATIC_PREFIX}/res/js/logic
    #CSS构建后的目录，lib - 基础库   mod - 公用模块  logic - 业务逻辑  extra - 第三方插件、引擎或库
    mkdir -p ${STATIC_PREFIX}/res/css/lib/extra
    mkdir -p ${STATIC_PREFIX}/res/css/mod
    mkdir -p ${STATIC_PREFIX}/res/css/logic
    #图片构建后的目录，lib - 基础库   mod - 公用模块  logic - 业务逻辑  extra - 第三方插件、引擎或库
    mkdir -p ${STATIC_PREFIX}/res/img/lib/extra
    mkdir -p ${STATIC_PREFIX}/res/img/mod
    mkdir -p ${STATIC_PREFIX}/res/img/logic
    #媒体目录，audio - 音频    video - 视频
    mkdir -p ${STATIC_PREFIX}/res/media/audio
    mkdir -p ${STATIC_PREFIX}/res/media/video
    #字体目录
    mkdir -p ${STATIC_PREFIX}/res/fonts
    #SVG文件目录
    mkdir -p ${STATIC_PREFIX}/res/svg
    #create inc & html dir
    #公共Include文件目录
    mkdir -p ${STATIC_PREFIX}/inc
    #静态页面目录
    mkdir -p ${STATIC_PREFIX}/html
    #功能模块复杂的第三方插件或工程目录，如：文本编辑器
    mkdir -p ${STATIC_PREFIX}/extra
    #创建测试目录
    mkdir -p ${STATIC_PREFIX}/test
    #创建演示目录
    mkdir -p ${STATIC_PREFIX}/demo
    #复制基础版本文件
    cp -rf ${STATIC_BASE_PREFIX}/* ${STATIC_PREFIX}/
    #复制字体目录
    cp -rf ${STATIC_PREFIX}/src/fonts/* ${STATIC_PREFIX}/res/fonts/
    #复制SVG目录
    cp -rf ${STATIC_PREFIX}/src/svg/* ${STATIC_PREFIX}/res/svg/
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

    #清理不必要的文件
    rm -rf ${STATIC_PREFIX}/src/css/mod/*
    rm -rf ${STATIC_PREFIX}/src/css/lib/g.css
    rm -rf ${STATIC_PREFIX}/src/js/lib/jquery-${JQUERY_VERSION}.js
    rm -rf ${STATIC_PREFIX}/src/js/lib/zepto-${ZEPTO_VERSION}.js
    rm -rf ${STATIC_PREFIX}/src/js/lib/sea-${SEAJS_VERSION}.js
    rm -rf ${STATIC_PREFIX}/src/js/lib/seajs-combo-${COMBO_VERSION}.js
    rm -rf ${STATIC_PREFIX}/src/js/lib/se.js
    rm -rf ${STATIC_PREFIX}/html/*

    #生成INC文件
    echo -n "<link id=\"seed_style\" rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/gm.css\">" > ${STATIC_PREFIX}/inc/css_common_gm.html
    echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/m_main.css\">" > ${STATIC_PREFIX}/inc/css_common_mm.html
    echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/d_main.css\">" > ${STATIC_PREFIX}/inc/css_common_dm.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/j.mix.js\"></script>" > ${STATIC_PREFIX}/inc/js_common_j.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/z.mix.js\"></script>" > ${STATIC_PREFIX}/inc/js_common_z.html
    echo -n "<!--[if lt IE 9]><script src=\"${STATIC_RELATIVE_DIR}/src/js/lib/extra/html5/r${HTML5_SHIV_VERSION}/html5shiv.js\"></script><![endif]-->" > ${STATIC_PREFIX}/inc/js_html5_shiv.html

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


