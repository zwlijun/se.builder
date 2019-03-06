"use strict"

/**
 * 项目配置说明
   name {String} 项目名称
   alias {string} 项目别名
   vctrl {String} 版本控制，目前不支持
         {String} => none 无版本控制
         {String} => script 脚本
   rsync {String} 远程自动同步设置，目前不支持
         {String} => none 无远程同步设置
         {String} => script 脚本
   lock {Boolean} 是否锁定lib和mod目录，如果为false，lib和mod目录的文件可自行勾选编绎。为true时禁用自行勾选
   fullbuild {Boolean} 是否全量构建，如果为true, logic目录会自动全选
   charset {String} 编码，默认utf-8
   sign {String} 文件签名串，默认为sha1，目前只支持sha1
   banner {String} 文件编绎后的公共头文件
   env {Array} 项目环境
       {Array} => [
           {Object} => {
               name {String} 环境名称
               alias {String} 环境别名
               root {Object} 根路径设置
                    {Object} => {
                        doc {String} 站点文档根路径，如：/data/wwwroot/htdocs
                        src {String} 资源源文件存放相对{root.doc}目录，如：/static/v1.0/src
                        bin {String} 资源构建后存放相对{root.doc}目录，如：/static/v1.0/res
                        sed {String} 资源版本查换替换相对{root.doc}目录，如：/
                    }
               serviceWork {Object} service work配置
                           {Object} => {
                                trun {Boolean} 是否启用
                                path {String} service-worker.js存放路径
                                dest {String} service-worker.js 文件名
                                options {Object} workbox 配置
                                conf {String} workbox 配置文件路径
                                targets {Array} service-worker对应的不同环境，默认为 []
                           } 
               build {Array} 构建配置
                     {Array} => [
                         {Object} => {
                             name {String} 资源名称
                             alias {String} 资源别名 [js | css | img]
                             filter {RegExp} 过滤正则，只读取匹配的文件 /(\.(js))$/mi | /(\.(css))$/mi | /(\.(jpg|jpeg|png))$/mi
                             transport {Boolean} 是否提取seajs依赖，对JS有效
                             sed {Object} 版本替换配置
                                 {Object} => {
                                     turn {Boolean} 是否开启版本替换
                                     paths {Array} 查找路径或文件
                                           {Array} => [
                                               {String} 相对于{root.sed}的路径或文件
                                           ]
                                 }
                             files {Object} 文件配置
                                   {Object} => {
                                       lib   {Object} 库文件目录
                                       mod   {Object} 模块文件目录
                                       logic {Object} 业务逻辑文件目录
                                             {Object} => {
                                                 name {String} 名称 [lib | mod | logic]
                                                 folder {String} 文件夹 [{build.alias}/lib | {build.alias}/mod | {build.alias}/logic]
                                                 includeFolders {Array} 包含的目录，如果为null为所有
                                                 includeFiles {Array} 包含的文件，如果为null为所有
                                                 excludeFolders {Array} 去除的目录，如果为null为所有
                                                 excludeFiles {Array} 去除的文件，如果为null为所有
                                             }
                                   }
                         }
                     ]
           }
       ]
 */

//示例项目配置
var ex = [
    {"name": "SE Static Base Project",
        "alias": "se_static_base",
        "vctrl": "none",
        "rsync": "none",
        "lock": true,
        "fullbuild": true,
        "charset": "utf-8",
        "sign": "sha1",
        "banner": "/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN(CARLLI) - Email: zwlijun@gmail.com */\n",
        "env": [
            {"name": "正式发布环境",
                "alias": "online_v1",
                "root": {
                    "doc": "/data/wwwroot/htdocs/",
                    "src": "/static/v1.0/src/",
                    "bin": "/static/v1.0/res/",
                    "sed": "/"
                },
                "serviceWork":{
                    "turn": true,
                    "path": "/static/v1.0/sw/",
                    "dest": "service-worker.js",
                    "options": {},
                    "conf": "../conf/service-worker/sw.conf",
                    "targets": []
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
                                "static/v1.0/res/js",
                                "static/v1.0/inc"
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
                                "static/v1.0/inc"
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
                                "static/v1.0/res/css",
                                "static/v1.0/res/js",
                                "static/v1.0/html"
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
];

exports.projects = [
    //project{}
];