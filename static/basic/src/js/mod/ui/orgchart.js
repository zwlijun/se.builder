/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 组织结构图
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.5
 */
;define(function(require, exports, module){
    var Util                = require("mod/se/util");
    var TemplateEngine      = require("mod/se/template");

    var ROOT_HTML = '<div class="org-root flexbox top left"></div>';

    // {
    //     "node": {
    //         "textContent": "SE生活",
    //         "fields": [
    //             {
    //                 "label": "",
    //                 "value": ""
    //             }
    //         ],
    //         "children": [
    //             /* REF@node */
    //         ]
    //     }
    // }

    var DEFAULT_TEMPLATE = ''
                         + '<~'
                         + 'var node = oc.node || {};'
                         + 'var fields = node.fields || [];'
                         + 'var children = node.children || [];'
                         + '~>'
                         + '<div class="org-node flexbox middle center vertical nowrap">'
                         + '  <div class="org-node-data<~=children && children.length > 0 ? \'\' : \' no-children\'~>">'
                         + '    <h2 class="org-head"><~=node.textContent~></h2>'
                         + '    <~'
                         + '    for(var f = 0; f < fields.length; f++){'
                         + '    var field = fields[f];'
                         + '    if(field.label){'
                         + '    ~>'
                         + '    <p class="org-field"><label><~=field.label~></label><span><~=field.value~></span></p>'
                         + '    <~}else{~>'
                         + '    <p class="org-field"><span><~=field.value~></span></p>'
                         + '    <~}~>'
                         + '    <~}~>'
                         + '  </div>'
                         + '  <div class="org-node-children flexbox top center">'
                         + '    <~'
                         + '    for(var i = 0; i < children.length; i++){'
                         + '    var child = children[i] || {};'
                         + '    var childNode = child.node || {};'
                         + '    var childFields = childNode.fields || [];'
                         + '    var childChildren = childNode.children || [];'
                         + '    ~>'
                         + '    <div class="org-node flexbox middle center vertical nowrap">'
                         + '      <div class="org-node-data<~=childChildren && childChildren.length > 0 ? \'\' : \' no-children\'~>">'
                         + '        <h2 class="org-head"><~=childNode.textContent~></h2>'
                         + '        <~'
                         + '        for(var f = 0; f < fields.length; f++){'
                         + '        var field = fields[f];'
                         + '        if(field.label){'
                         + '        ~>'
                         + '        <p class="org-field"><label><~=field.label~></label><span><~=field.value~></span></p>'
                         + '        <~}else{~>'
                         + '        <p class="org-field"><span><~=field.value~></span></p>'
                         + '        <~}~>'
                         + '        <~}~>'
                         + '      </div>'
                         + '      <div class="org-node-children flexbox top center">'
                         + '        <~=window["@ORG_CHILDREN"].apply(null, [childChildren])~>'
                         + '      </div>'
                         + '    </div>'
                         + '    <~'
                         + '    }'
                         + '    ~>'
                         + '  </div>'
                         + '</div>'
                         + '';

    var ORGChart = function(name, templateId){
        var templateNode = $("#" + templateId);

        this.name = name;
        this.ote = TemplateEngine.getTemplate("ote_" + name, {
            "start": "<~",
            "close": "~>",
            "root": "oc"
        });
        this.template = templateNode.length > 0 ? templateNode.html() : DEFAULT_TEMPLATE;
        this.template = this.template.replace('window["@ORG_CHILDREN"]', 'window["@ORG_CHILDREN_' + (name.toUpperCase()) + '"]');
    };

    ORGChart.prototype = {
        children: function(items, template){
            var size = items.length;
            var html = "";

            var ote = this.ote;

            for(var i = 0; i < size; i++){
                var item = items[i];

                html += ote.render(true, template, item, {
                    callback: function(ret){
                        return ret.result;
                    }
                }).local;
            }

            return html;
        },
        render: function(targetSelector, data, positionHandler){
            var ote = this.ote;
            var target = $(targetSelector);

            var startTime = Util.getTime();

            if(target.length > 0){
                target.html(ROOT_HTML);

                ote.render(true, this.template, data, {
                    callback: function(ret, _target){
                        _target.find(".org-root").html(ret.result);
                    },
                    args: [target]
                });

                if(!positionHandler){
                    setTimeout(function(){
                        var firstNode = target.find(".org-root > .org-node")[0];
                        var rect = Util.getBoundingClientRect(firstNode);

                        target.find(".org-root")[0].scrollLeft = (rect.width / 2) - window.innerWidth / 2;
                    }, 60);
                }else{
                    Util.execHandler(positionHandler, [target]);
                }
            }else{
                console.warn("not found target node.");
            }

            var endTime = Util.getTime();

            console.log("org chart render cost: " + (endTime - startTime) + "ms");
        }
    };

    ORGChart.Cache = {};

    ORGChart.newInstance = function(name, templateId){
        var org = ORGChart.Cache[name] || (ORGChart.Cache[name] = new ORGChart(name, templateId));

        window["@ORG_CHILDREN_" + name.toUpperCase()] = function(items){
            return org.children(items, org.template);
        };

        return {
            children: function(items){
                return org.children(items, org.template);
            },
            render: function(targetSelector, data, positionHandler){
                org.render(targetSelector, data, positionHandler);
            }
        };
    };

    module.exports = {
        "version": "R18B0519",
        newInstance: function(name, templateId){
            return ORGChart.newInstance(name, templateId);
        }
    };
});