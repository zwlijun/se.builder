#!/bin/bash 

STATIC_TARGET_DIR=$(pwd)
STATIC_BASE_DIR=$(dirname $(dirname $(readlink -n "$0")))
#目标版本
STATIC_TARGET_VERSION=$1
#基础版本
STATIC_BASE_VERSION=basic

#基础版本目录前缀
STATIC_BASE_PREFIX=${STATIC_BASE_DIR}/static/${STATIC_BASE_VERSION}
#目标版本目录前缀
STATIC_PREFIX=${STATIC_TARGET_DIR}/static/${STATIC_TARGET_VERSION}
#基础版本相对目录
STATIC_BASE_RELATIVE_DIR=/static/${STATIC_BASE_VERSION}
#目标版本相对目录
STATIC_RELATIVE_DIR=/static/${STATIC_TARGET_VERSION}

#第三方库版本号
JQUERY_1X_VERSION=1.12.3
JQUERY_2X_VERSION=2.2.3
ZEPTO_120_VERSION=1.2.0
SEAJS_VERSION=3.0.0
COMBO_VERSION=1.0.1

#jquery 1.x基础版本路径
BASED_JQUERY_1X_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/jquery/r${JQUERY_1X_VERSION}/jquery.js
#jquery 2.x基础版本路径
BASED_JQUERY_2X_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/jquery/r${JQUERY_2X_VERSION}/jquery.js
#zepto 1.2.0 基础版本路径
BASED_ZEPTO_120_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/zepto/r${ZEPTO_120_VERSION}/zepto.js
#seajs基础版本路径
BASED_SEAJS_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/seajs/r${SEAJS_VERSION}/sea.js
#combo基础版本路径
BASED_COMBO_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/seajs/plugins/combo/r${COMBO_VERSION}/combo.js
#se基础版本路径
BASED_SE_PATH=${STATIC_BASE_PREFIX}/src/js/lib/based/se.js

#jquery 1.x 合并路径
JQUERY_1X_MIX=${STATIC_BASE_PREFIX}/src/js/lib/j.1x.mix.js
#jquery 2.x 合并路径
JQUERY_2X_MIX=${STATIC_BASE_PREFIX}/src/js/lib/j.2x.mix.js
#zepto 1.2.0 合并路径
ZEPTO_120_MIX=${STATIC_BASE_PREFIX}/src/js/lib/z.120.mix.js

echo ${STATIC_BASE_PREFIX}
echo ${STATIC_PREFIX}

if [ "$#" -eq "1" ]; then
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

    echo ";/*! Zepto v${ZEPTO_120_VERSION} - zepto event ajax form ie - zeptojs.com/license */" > ${ZEPTO_120_MIX}
    cat ${BASED_ZEPTO_120_PATH} >> ${ZEPTO_120_MIX}
    echo ";/*! Sea.js ${SEAJS_VERSION} | seajs.org/LICENSE.md */" >> ${ZEPTO_120_MIX}
    cat ${BASED_SEAJS_PATH} >> ${ZEPTO_120_MIX}
    echo ";/*! SeaJS-Combo.js ${COMBO_VERSION} | seajs.org/LICENSE.md */" >> ${ZEPTO_120_MIX}
    cat ${BASED_COMBO_PATH} >> ${ZEPTO_120_MIX}
    echo ";/*! SE Config For SeaJS */" >> ${ZEPTO_120_MIX}
    cat ${BASED_SE_PATH} >> ${ZEPTO_120_MIX}

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
    #create inc & html dir
    #公共Include文件目录
    mkdir -p ${STATIC_PREFIX}/inc
    #静态页面目录
    mkdir -p ${STATIC_PREFIX}/html
    #创建字体目录
    mkdir -p ${STATIC_PREFIX}/fonts
    #创建媒体目录
    mkdir -p ${STATIC_PREFIX}/media
    #创建SVG文件目录
    mkdir -p ${STATIC_PREFIX}/svg
    #功能模块复杂的第三方插件或工程目录，如：文本编辑器
    mkdir -p ${STATIC_PREFIX}/extra
    #创建测试目录
    mkdir -p ${STATIC_PREFIX}/test
    #创建演示目录
    mkdir -p ${STATIC_PREFIX}/demo
    #复制基础版本文件
    cp -rf ${STATIC_BASE_PREFIX}/* ${STATIC_PREFIX}/
    #合并模块样式
    cat ${STATIC_PREFIX}/src/css/lib/g.css > ${STATIC_PREFIX}/src/css/lib/gm.css
    cat ${STATIC_PREFIX}/src/css/mod/* >> ${STATIC_PREFIX}/src/css/lib/gm.css
    
    #清理不必要的文件
    rm -rf ${STATIC_PREFIX}/src/css/mod/*
    rm -rf ${STATIC_PREFIX}/src/css/lib/g.css
    rm -rf ${STATIC_PREFIX}/src/js/lib/based
    rm -rf ${STATIC_PREFIX}/html/*

    #生成基础版本INC文件
    echo -n "<script>window[\"SE_BUILDER_STATIC_VERSION\"] = \"${STATIC_BASE_VERSION}\";</script>" > ${STATIC_BASE_PREFIX}/inc/static_version.html
    echo -n "<link id=\"seed_style\" rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_BASE_RELATIVE_DIR}/src/css/lib/gm.css\">" > ${STATIC_BASE_PREFIX}/inc/css_common_gm.html
    echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_BASE_RELATIVE_DIR}/src/css/lib/m_main.css\">" > ${STATIC_BASE_PREFIX}/inc/css_common_mm.html
    echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_BASE_RELATIVE_DIR}/src/css/lib/d_main.css\">" > ${STATIC_BASE_PREFIX}/inc/css_common_dm.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" data-use-source=\"0\" src=\"${STATIC_BASE_RELATIVE_DIR}/src/js/lib/j.1x.mix.js\"></script>" > ${STATIC_BASE_PREFIX}/inc/js_common_j.1.x.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" data-use-source=\"0\" src=\"${STATIC_BASE_RELATIVE_DIR}/src/js/lib/j.2x.mix.js\"></script>" > ${STATIC_BASE_PREFIX}/inc/js_common_j.2.x.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" data-use-source=\"0\" src=\"${STATIC_BASE_RELATIVE_DIR}/src/js/lib/z.120.mix.js\"></script>" > ${STATIC_BASE_PREFIX}/inc/js_common_z.120.html
    
    #生成目标版本INC文件
    echo -n "<script>window[\"SE_BUILDER_STATIC_VERSION\"] = \"${STATIC_TARGET_VERSION}\";</script>" > ${STATIC_PREFIX}/inc/static_version.html
    echo -n "<link id=\"seed_style\" rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/gm.css\">" > ${STATIC_PREFIX}/inc/css_common_gm.html
    echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/m_main.css\">" > ${STATIC_PREFIX}/inc/css_common_mm.html
    echo -n "<link rel=\"stylesheet\" type=\"text/css\" href=\"${STATIC_RELATIVE_DIR}/src/css/lib/d_main.css\">" > ${STATIC_PREFIX}/inc/css_common_dm.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" data-use-source=\"0\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/j.1x.mix.js\"></script>" > ${STATIC_PREFIX}/inc/js_common_j.1.x.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" data-use-source=\"0\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/j.2x.mix.js\"></script>" > ${STATIC_PREFIX}/inc/js_common_j.2.x.html
    echo -n "<script id=\"seed_script\" data-debug=\"0\" data-combo=\"1\" data-use-source=\"0\" src=\"${STATIC_RELATIVE_DIR}/src/js/lib/z.120.mix.js\"></script>" > ${STATIC_PREFIX}/inc/js_common_z.120.html

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
    echo "请输入目标版本，如：v1, v2, v2.1"
fi


