<pre>
1. 下载nodejs  http://nodejs.org
2. 安装nodejs
3. 安装grunt
   win32: 在cmd窗口下运行    npm install -g grunt-cli
   linux/osx: 在终端窗口下运行    npm install -g grunt-cli
4. 安装依赖模块
   win32: 在cmd窗口下切换到 se.builder/app  目录
   linux/osx: 在终端窗口下切换到 se.builder/app 目录
   运行 npm install
5. 执行  se.builder/app 下的 startup.cmd(win32) | startup.sh(linux/osx)
6. 打开chrome，访问 http://localhost:8000 ，如果能正常访问说明启动成功
7. 配置需要编绎的项目，配置文件位于 se.builder/app/conf/project.js

说明：每次修改配置需要终止startup进程，然后再启动startup进程，然后刷新web页面
</pre>
---
<pre>
//项目/工程配置示例
{
    "name": "SE Static Base Project",
    "alias": "se_static_base",
    "vctrl": "none",
    "rsync": "none",
    "lock": true,
    "charset": "utf-8",
    "sign": "sha1",
    "banner": "/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com */\n",
    "env": [
        {
            "name": "正式发布环境",
            "alias": "online_v1",
            "root": {
                "doc": "/data/wwwroot/htdocs/",
                "src": "/static/v1/src/",
                "bin": "/static/v1/res/",
                "sed": "/"
            },
            "build": [
                {
                    "name": "JavaScript",
                    "alias": "js",
                    "filter": /(\.(js))$/mi,
                    "transport": true,
                    "sed": {
                        "turn": true,
                        "paths": [
                            "static/v1/res/js",
                            "static/v1/inc"
                        ]
                    },
                    "files": {
                        "lib": {
                            "name": "lib",
                            "folder": "js/lib",
                            "includeFolders": null,
                            "includeFiles": null,
                            "excludeFolders": null,
                            "excludeFiles": null,
                            "concat": null
                        },
                        "mod": {
                            "name": "mod",
                            "folder": "js/mod",
                            "includeFolders": null,
                            "includeFiles": null,
                            "excludeFolders": null,
                            "excludeFiles": null,
                            "concat": null
                        },
                        "logic": {
                            "name": "logic",
                            "folder": "js/logic",
                            "includeFolders": null,
                            "includeFiles": null,
                            "excludeFolders": null,
                            "excludeFiles": null,
                            "concat": null
                        }
                    }
                },
                {
                    "name": "CSS",
                    "alias": "css",
                    "filter": /(\.(css))$/mi,
                    "transport": false,
                    "sed": {
                        "turn": true,
                        "paths": [
                            "static/v1/inc"
                        ]
                    },
                    "files": {
                        "lib": {
                            "name": "lib",
                            "folder": "css/lib",
                            "includeFolders": null,
                            "includeFiles": null,
                            "excludeFolders": null,
                            "excludeFiles": null,
                            "concat": null
                        },
                        "mod": {
                            "name": "mod",
                            "folder": "css/mod",
                            "includeFolders": null,
                            "includeFiles": null,
                            "excludeFolders": null,
                            "excludeFiles": null,
                            "concat": null
                        },
                        "logic": {
                            "name": "logic",
                            "folder": "css/logic",
                            "includeFolders": null,
                            "includeFiles": null,
                            "excludeFolders": null,
                            "excludeFiles": null,
                            "concat": null
                        }
                    }
                },
                {
                    "name": "Image",
                    "alias": "img",
                    "filter": /(\.(jpg|jpeg|png))$/mi,
                    "transport": false,
                    "sed": {
                        "turn": true,
                        "paths": [
                            "static/v1/res/css",
                            "static/v1/res/js",
                            "static/v1/html"
                        ]
                    },
                    "files": {
                        "lib": {
                            "name": "lib",
                            "folder": "img/lib",
                            "includeFolders": null,
                            "includeFiles": null,
                            "excludeFolders": null,
                            "excludeFiles": null,
                            "concat": null
                        },
                        "mod": {
                            "name": "mod",
                            "folder": "img/mod",
                            "includeFolders": null,
                            "includeFiles": null,
                            "excludeFolders": null,
                            "excludeFiles": null,
                            "concat": null
                        },
                        "logic": {
                            "name": "logic",
                            "folder": "img/logic",
                            "includeFolders": null,
                            "includeFiles": null,
                            "excludeFolders": null,
                            "excludeFiles": null,
                            "concat": null
                        }
                    }
                }
            ]
        }
    ]
}
</pre>
---
<pre>
//初始化静态资源基础版本
@see ./app/merge_base_static.sh

//静态资源目录结构约定
@see ./app/init_static.sh

//在osx/linux下添加到全局环境中
chmod +x ${SE_BUILDER_ROOT}/se.builder/app/merge_base_static.sh
chmod +x ${SE_BUILDER_ROOT}/se.builder/app/init_static.sh
chmod +x ${SE_BUILDER_ROOT}/se.builder/app/update_static.sh

ln -s ${SE_BUILDER_ROOT}/se.builder/app/merge_base_static.sh /usr/local/bin/merge_base_static
ln -s ${SE_BUILDER_ROOT}/se.builder/app/init_static.sh /usr/local/bin/init_static
ln -s ${SE_BUILDER_ROOT}/se.builder/app/init_static.sh /usr/local/bin/update_static

//在osx/linux下构建一个新的静态资源
STEP 1: merge_base_static
STEP 2: init_static TARGET_VERSION

//在osx/linux下同步更新静态资源
STEP 1: merge_base_static
STEP 2: update_static TARGET_VERSION
</pre>


