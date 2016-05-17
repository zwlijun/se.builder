#!/bin/bash 

STATIC_TARGET_DIR=$(pwd)
STATIC_BASE_DIR=$(dirname $(dirname $(readlink -n "$0")))
STATIC_BASE_VERSION=$1
STATIC_TARGET_VERSION=$2

STATIC_BASE_PREFIX=${STATIC_BASE_DIR}/static/${STATIC_BASE_VERSION}
STATIC_PREFIX=${STATIC_TARGET_DIR}/static/${STATIC_TARGET_VERSION}
STATIC_RELATIVE_DIR=/static/${STATIC_TARGET_VERSION}

JQUERY_1X_VERSION=1.12.3
JQUERY_2X_VERSION=2.2.3
ZEPTO_VERSION=1.1.6
SEAJS_VERSION=3.0.0
COMBO_VERSION=1.0.1
HTML5_SHIV_VERSION=3.7.3
REM_VERSION=1.3.4

BASED_JQUERY_1X_PATH=${STATIC_PREFIX}/src/js/lib/based/jquery/r${JQUERY_1X_VERSION}/jquery.js
BASED_JQUERY_2X_PATH=${STATIC_PREFIX}/src/js/lib/based/jquery/r${JQUERY_2X_VERSION}/jquery.js
BASED_ZEPTO_PATH=${STATIC_PREFIX}/src/js/lib/based/zepto/r${ZEPTO_VERSION}/zepto.js
BASED_SEAJS_PATH=${STATIC_PREFIX}/src/js/lib/based/seajs/r${SEAJS_VERSION}/sea.js
BASED_COMBO_PATH=${STATIC_PREFIX}/src/js/lib/based/seajs/plugins/combo/r${COMBO_VERSION}/combo.js
BASED_SE_PATH=${STATIC_PREFIX}/src/js/lib/based/se.js

JQUERY_1X_MIX=${STATIC_PREFIX}/src/js/lib/j.1x.mix.js
JQUERY_2X_MIX=${STATIC_PREFIX}/src/js/lib/j.2x.mix.js
ZEPTO_MIX=${STATIC_PREFIX}/src/js/lib/z.mix.js

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
    #复制脚本文件
    cp -rf ${STATIC_BASE_PREFIX}/src/js/lib/extra ${STATIC_PREFIX}/src/js/lib/
    cp -rf ${STATIC_BASE_PREFIX}/src/js/lib/*.mix.js ${STATIC_PREFIX}/src/js/lib/
    cp -rf ${STATIC_BASE_PREFIX}/src/js/mod ${STATIC_PREFIX}/src/js/
    #复制样式文件
    cp -rf ${STATIC_BASE_PREFIX}/src/css/lib/extra ${STATIC_PREFIX}/src/css/lib/
    cp -rf ${STATIC_BASE_PREFIX}/src/css/lib/gm.css ${STATIC_PREFIX}/src/css/lib/
    #复制图片文件
    cp -rf ${STATIC_BASE_PREFIX}/src/img/lib ${STATIC_PREFIX}/src/img/
    cp -rf ${STATIC_BASE_PREFIX}/src/img/mod ${STATIC_PREFIX}/src/img/
    #复制字体目录
    cp -rf ${STATIC_BASE_PREFIX}/src/fonts/* ${STATIC_PREFIX}/src/fonts/
    cp -rf ${STATIC_BASE_PREFIX}/src/fonts/* ${STATIC_PREFIX}/res/fonts/
    #复制SVG目录
    cp -rf ${STATIC_BASE_PREFIX}/src/svg/* ${STATIC_PREFIX}/src/svg/
    cp -rf ${STATIC_BASE_PREFIX}/src/svg/* ${STATIC_PREFIX}/res/svg/
    #复制 inc/rem
    cp -rf ${STATIC_BASE_PREFIX}/inc/rem.html ${STATIC_PREFIX}/inc/

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
