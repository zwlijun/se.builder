; (function Index () {
    var client = io.connect();
    var isConnected = false;
    var user = "Lijun";
    var project = null;
    var building = false;
    var resourceParameters = [];

    client.on("connect", function(){
        Logger.info("connected to server");
        
        client.send({
            "head":{
                "cmd":"hello", 
                "user":user
            }, 
            "body":{
                "message":"I am coming..."
            }
        });
    });

    client.on("hello", function(message){
        Logger.info("hello::Message Recevied !");
        isConnected = true;
    });

    client.on("exit", function(message){
        Logger.info("exit::Message Recevied !");
        isConnected = false;

        building = false;
        Util.setBuildState("end");
    });

    client.on("workspace", function(message){
        Logger.info("workspace::Message Recevied !");
        Logic.ls(message);
    });

    client.on("encode", function(message){
        var head = message.head;
        var body = message.body;

        building = true;

        Util.setBuildState("encoding");

        switch(head.state){
            case "start":
                Logger.info("**************************************************************************");
                Logger.info("encode::Build start...");
                Logger.info(body.message);
                Logger.info("**************************************************************************");
            break;
            case "init":
                Logger.info("encode::[building]&nbsp;" + body.message);
            break;
            case "encoding":
                Logger.info("encode::[building]&nbsp;" + body.message);
            break;
            case "error":
                Logger.error("encode::[building]&nbsp;" + body.message);
                building = false;

                Util.setBuildState("end")
            break;
            case "end":
                Logger.info("**************************************************************************");
                Logger.info("encode::Build done, Ready deploy...");
                Logger.info(body.message);
                Logger.info("**************************************************************************");
                building = false;

                Util.setBuildState("end");

                Logic.resource.apply(Logic, resourceParameters);
            break;
            case "deploy":
                Logger.info("**************************************************************************");
                Logger.info("encode::deploy SED...");
                Logger.info(body.message);
                Logger.info("**************************************************************************");

                // building = false;
                // Util.setBuildState("end");
            break;
        }
        
    });

    client.on("disconnect", function(){
        Logger.info("disconnect...")
        isConnected = false;

        building = false;
        Util.setBuildState("end");
    });

    ///////////////////////////////////////////////////////
    var Logger = {
        max : 10,
        items : [],
        console: document.querySelector(".console"),
        write : function(){
            Logger.console.innerHTML = this.items.join("");
        },
        log : function(level, message){
            var item = '<p class="log ' + level.toLowerCase() + '">[<span>' + level + '</span>]&nbsp;' + new Date() + '&nbsp;:&nbsp;' + message + '</p>'
            this.items.push(item);

            if(this.items.length > this.max){
                this.items.splice(0, this.items.length - this.max);
            }

            this.write();
        },
        info : function(message){
            this.log("INFO", message);
        },
        warn : function(message){
            this.log("WARN", message);
        },
        error : function(message){
            this.log("ERROR", message);
        },
        debug : function(message){
            this.log("DEBUG", message);
        }
    };
    var Util = {
        /**
         * 执行回调
         * @param Object handler {Function callback, Array args, Object context, int delay}
         */
        execHandler : function(handler){
            if(handler && handler instanceof Object){
                var callback = handler.callback || null;
                var args = handler.args || [];
                var context = handler.context || null;
                var delay = handler.delay || -1;

                if(callback && callback instanceof Function){
                    if(typeof(delay) == "number" && delay >= 0){
                        setTimeout(function(){
                            callback.apply(context, args);
                        }, delay);
                    }else{
                        callback.apply(context, args);
                    }
                }
            }
        },
        /**
         * 合并参数后执行回调
         * @param Object handler {Function callback, Array args, Object context, int delay}
         * @param Array args 参数
         */
        execAfterMergerHandler : function(handler, _args){
            if(handler && handler instanceof Object){
                var callback = handler.callback || null;
                var args = handler.args || [];
                var context = handler.context || null;

                handler.args = _args.concat(args);
            }
            
            this.execHandler(handler);
        },
        setBuildState : function(state){
            var b = document.getElementById("build");
            var r = document.getElementById("reset");

            switch(state){
                case "encoding":
                    b.innerHTML = "Building";
                    b.disabled = r.disabled = true;
                break;
                case "end":
                    b.innerHTML = "Build";
                    b.disabled = r.disabled = false;
                break;
            }
        }
    };
    var Simulate = {
        hook : function (selector, eventType, hook, handler) {
            // body...
            var node = document.querySelector(selector);

            if(node && "1" != node.getAttribute("data-setted")){
                node.addEventListener(eventType, function(e){
                    var target = e.target;

                    if(target && 1 === target.nodeType && hook == target.getAttribute("data-hook")){
                        Util.execAfterMergerHandler(handler, [e, target]);
                    }
                }, false);
                node.setAttribute("data-setted", "1");
            }
        }
    };

    var Logic = {
        load : function(projectAlias, envAlias, deployAlias){
            client.send({
                "head": {
                    "cmd": "workspace",
                    "user": user
                },
                "body": {
                    "message": "change workspace! ",
                    "data": {
                        "project": projectAlias,
                        "env": envAlias,
                        "deploy": deployAlias
                    }
                }
            });
        },
        resource : function(type, p, e, d){
            var pInput = document.querySelector("#" + p);
            var eInput = e ? document.querySelector("#" + p + "_" + e) : null;
            var dInput = d ? document.querySelector("#" + p + "_" + e + "_" + d) : null;

            pInput && (pInput.checked = true);
            eInput && (eInput.checked = true);
            dInput && (dInput.checked = true);

            if(d){
                this.load(p, e, d);
            }
        },
        html : function(selector, str){
            document.querySelector(selector).innerHTML = str;
        },
        tree : function(type, pathname, data){
            var buf = [];
            var item = null;
            var filelist = null;
            var file = null;
            var size = 0;
            var lock = project.lock;
            var fullbuild = project.fullbuild;
            var sed = project.env.build.sed.turn;

            for(var key in data){
                if(data.hasOwnProperty(key)){
                    item = data[key];
                    filelist = item.filelist;
                    size = filelist.length;

                    if(size === 0){
                        continue;
                    }

                    buf.push('<dl class="dir">');

                    buf.push('<dt class="dirname">');
                    buf.push('<input');
                    buf.push(' type="checkbox" data-hook="1" data-filetype="dir" disabled="disabled"');
                    buf.push(' name="' + type + '_dir"');
                    buf.push(' id="' + type + '_' + item.checksum + '"');
                    buf.push(' value="' + type + ',' + item.name + ',' + item.relative + ',' + item.folder + ',' + item.checksum + '"');
                    buf.push('>')
                    buf.push('<label for="' + type + '_' + item.checksum + '" data-hook="' + type + '">' + item.relative + '</label>');
                    buf.push('</dt>');

                    for(var i = 0; i < size; i++){
                        file = filelist[i];

                        buf.push('<dd class="filename">');
                        buf.push('<input');
                        buf.push(' type="checkbox" data-hook="1" data-filetype="file"');
                        // buf.push((true === checked ? ' checked="checked" disabled="disabled"':''));

                        if("lib" == type || "mod" == type){
                            if(false !== lock){ // 锁定
                                buf.push(' disabled="disabled"');
                                buf.push(' checked="checked"');
                            }else{
                                if(true === sed || true === fullbuild){
                                    buf.push(' checked="checked"');
                                }
                            }
                        }else if("logic" == type){
                            if(true === fullbuild){
                                buf.push(' checked="checked"');
                            }
                        }

                        buf.push(' name="' + type + '_file"');
                        buf.push(' id="' + type + '_' + item.checksum + '_' + file.checksum + '"');
                        buf.push(' value="');
                        buf.push(type + ',');
                        buf.push(item.name + ',');
                        buf.push(item.relative + ',');
                        buf.push(item.folder + ',');
                        buf.push(item.checksum + ',');
                        buf.push(file.absolutePath + ',');
                        buf.push(file.checksum + ',');
                        buf.push(file.fileName + ',');
                        buf.push(file.fileType + ',');
                        buf.push(file.fileExtName + ',');
                        buf.push(file.isUpdate);
                        buf.push('"');
                        buf.push('>');
                        buf.push('<label for="' + type + '_' + item.checksum + "_" + file.checksum + '"' + (file.isUpdate ? ' class="update"' : '') + '>' + file.fileName + '</label>');
                        buf.push('</dd>');
                    }

                    buf.push('</dl>');
                }
            }

            return buf.join("");
        },
        lib : function(lib){
            if(lib){
                this.html(".lib", this.tree("lib", "lib", lib));
            }else{
                this.html(".lib", "not config");
            }
        },
        mod : function(mod){
            if(mod){
                this.html(".mod", this.tree("mod", "mod", mod));
            }else{
                this.html(".mod", "not config");
            }
        },
        logic : function(logic){
            if(logic){
                this.html(".logic", this.tree("logic", "logic", logic));
            }else{
                this.html(".logic", "not config");
            }
        },
        ls : function(data){
            var body = data.body;
            var lib = body.lib;
            var mod = body.mod;
            var logic = body.logic;

            project = body.project;

            //console.info(base);
            //console.dir(project);

            this.lib(lib);
            this.mod(mod);
            this.logic(logic);
        },
        collect : function(){
            if(true === building){
                return false;
            }

            var f = document.querySelector("#fileForm");
            var items = f.elements;
            var size = items.length;
            var item = null;
            var value = "";
            var group = null;
            
            var treeType = null;
            var itemName = null;
            var itemRelative = null;
            var itemFolder = null;
            var itemCheckSum = null;
            var fileAbsolutePath = null;
            var fileCheckSum = null;
            var fileName = null;
            var fileType = null;
            var fileExtName = null;
            var isUpdate = null;

            var dataType = null;
            var map = {
                "size": 0,
                "project": null,
                "files":[]
            };

            for(var i = 0; i < size; i++){
                item = items[i];

                dataType = item.getAttribute("data-filetype");

                if("checkbox" != item.type || "file" != dataType || false === item.checked){
                    continue;
                }

                // buf.push(type + ',');
                // buf.push(item.name + ',');
                // buf.push(item.relative + ',');
                // buf.push(item.folder + ',');
                // buf.push(item.checksum + ',');
                // buf.push(file.absoultePath + ',');
                // buf.push(file.checksum + ',');
                // buf.push(file.fileName + ',');
                // buf.push(file.fileType + ',');
                // buf.push(file.fileExtName + ',');
                // buf.push(file.isUpdate);

                value = item.value;
                group = value.split(",");
                
                treeType = group[0];
                itemName = group[1];
                itemRelative = group[2];
                itemFolder = group[3];
                itemCheckSum = group[4];
                fileAbsolutePath = group[5];
                fileCheckSum = group[6];
                fileName = group[7];
                fileType = group[8];
                fileExtName = group[9];
                isUpdate = ("true" == group[10]);

                if(!fileAbsolutePath){
                    continue;
                }

                // if(!(treeType in map.files)){
                //     map.files[treeType] = [];
                // }

                map.files.push({
                    "type" : treeType,
                    "name": itemName,
                    "relative": itemRelative,
                    "folder": itemFolder,
                    "folderCheckSum": itemCheckSum,
                    "file" : fileAbsolutePath,
                    "fileName": fileName,
                    "fileType": fileType,
                    "fileExtName": fileExtName,
                    "fileCheckSum": fileCheckSum,
                    "isUpdate": isUpdate
                });

                map.size = map.files.length;
            }

            if(map.size > 0){
                map.project = project;

                client.send({
                    "head": {
                        "cmd": "encode",
                        "user": user
                    },
                    "body": {
                        "message": "collect resource files ",
                        "data": map
                    }
                });

            }else{
                alert("请选择需要构建的资源文件");
            }
        },
        build : function(){
            var btn = document.querySelector("#build");

            btn.addEventListener("click", Logic.collect, false);
        }
    };

    //-------------------------------
    Simulate.hook(".project-nav", "click", "1", {
        callback : function(e, node){
            e.stopPropagation();

            var v = node.value;
            var items = v.split(",");
            var type = items[0];
            var p_alias = items[1];
            var e_alias = items[2] || null;
            var d_alias = items[3] || null;
            var f = document.querySelector("#projNavForm");

            f.reset();

            resourceParameters = [].concat([type, p_alias, e_alias, d_alias]);

            //======================
            setTimeout(function(){
                var projs = document.querySelectorAll(".project-nav .project");
                var size = projs.length;
                var proj = null;
                var envs = null;
                var env = null;

                var projRadio = null;
                var envRadio = null;

                var currentProj = null;
                var currentEnv = null;

                for(var i = 0; i < size; i++){
                    proj = projs[i];

                    projRadio = proj.querySelector('input[name="project"]');

                    if(true === projRadio.checked){
                        proj.setAttribute("data-visible", "1");
                    }else{
                        proj.removeAttribute("data-visible");
                    }

                    envs = proj.querySelectorAll("dl.env");
                    for(var j = 0; j < envs.length; j++){
                        env = envs[j];

                        envRadio = env.querySelector('input[name="env"]');

                        if(true === envRadio.checked){
                            env.setAttribute("data-visible", "1");
                        }else{
                            env.removeAttribute("data-visible");
                        }
                    }
                }
            }, 60);
            //======================

            Logic.resource.apply(Logic, resourceParameters);
        }
    });

    Simulate.hook(".frame .block", "click", "logic", {
        callback : function(e, node){
            e.stopPropagation();

            var p = node.parentNode.parentNode;
            var items = p.querySelectorAll('.filename input[type="checkbox"]');
            var size = items.length;

            for(var i = 0; i < size; i++){
                items[i].checked = !items[i].checked;
            }
        }
    });

    Logic.build();
})();