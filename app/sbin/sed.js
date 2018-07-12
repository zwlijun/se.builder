//---
var FOR_READING = 1, 
    FOR_WRITING = 2, 
    FOR_APPENDING = 8;
var TRISTATE_USE_DEFAULT = -2, 
    TRISTATE_TRUE = -1, 
    TRISTATE_FALSE = 0;
var _sed = {
    parse: function(name){
        var pattern = /^(.*)(\.[0-9a-fA-F]{40})(\.[a-zA-Z0-9]+)?$/g;
        var matcher = null;

        pattern.lastIndex = 0;

        if(null != (matcher = pattern.exec(name))){
            return {
                "source": matcher[0],
                "prefix": matcher[1],
                "sign": matcher[2],
                "ext": matcher[3],
                "target": matcher[1] + matcher[2]
            }
        }

        return null;
    },
    escape: function(str){
        str = str.replace(/\./g, "\\.");
        str = str.replace(/\-/g, "\\-");
        str = str.replace(/\//g, "\\/");

        return str;
    },
    read : function(pathname, charset){
        var stream = new ActiveXObject("ADODB.Stream");
        var content = "";

        stream.type = 2;
        stream.mode = 3;
        stream.charset = charset;
        stream.open();
        stream.loadFromFile(pathname);
        
        content = stream.readText;
        
        stream.close();
        stream = null;
        
        return content;
    },
    write : function(pathname, content, charset){
        var stream = new ActiveXObject("ADODB.Stream");
        var bom = null;
        
        stream.type = 2;
        stream.mode = 3;
        stream.charset = charset;
        stream.open();
        stream.writeText(content);
        
        if("utf-8" == charset){
            //BOM
            bom = new ActiveXObject("ADODB.Stream");
            stream.position = 3;
            bom.type = 1;
            bom.mode = 3;
            bom.open();
            stream.copyTo(bom);
            bom.saveToFile(pathname, 2);
            //-------------------------
            bom.flush();
            bom.close();
        }else{
            stream.saveToFile(pathname, 2);
        }
        
        stream.flush();
        stream.close();
        stream = null;
        bom = null;
    },
    single: function(data, findPath, charset){
        WScript.echo("SED(" + findPath + ")");

        var content = _sed.read(findPath, charset);
        var regexp = null;

        // WScript.echo(content)

        if(data.ext){
            regexp = new RegExp(_sed.escape(data.prefix) + "(\\.[0-9a-fA-F]{40}){0,1}", "g");
            // WScript.echo("pattern a: " + regexp);
            // WScript.echo("regexp a: " + regexp.test(content) + ", source: " + data.source);
            content = content.replace(regexp, data.target);
        }else{
            regexp = new RegExp("\"" + _sed.escape(data.prefix) + "(\\.[0-9a-fA-F]{40}){0,1}" + "\"", "g");
            // WScript.echo("pattern b: " + regexp);
            // WScript.echo("regexp b: " + regexp.test(content) + ", source: " + data.source);
            content = content.replace(regexp, "\"" + data.target + "\"");
        }

        // WScript.echo("regexp: " + regexp);

        regexp = null;

        _sed.write(findPath, content, charset);
    },
    multiple: function(data, findPath, charset){
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var folder = fso.GetFolder(findPath);
        var folders = new Enumerator(folder.SubFolders);
        var files = new Enumerator(folder.Files);

        for(; !files.atEnd(); files.moveNext()){
            var name = files.item();
            
            WScript.echo("multiple::file = " + name);

            _sed.single(data, name, charset);
        }

        for(; !folders.atEnd(); folders.moveNext()){
            var name = folders.item();
            
            WScript.echo("multiple::folder = " + name);

            _sed.multiple(data, name, charset);
        }

        fso = null;
    },
    find: function(data, findPath, charset){
        var fso = new ActiveXObject("Scripting.FileSystemObject");
            
        if(fso.FileExists(findPath)){
            _sed.single(data, findPath, charset);
        }else if(fso.FolderExists(findPath)){
            _sed.multiple(data, findPath, charset);
        }else{
            WScript.echo("find::not found(" + findPath + ")");
        }
        
        fso = null;
    },
    replace: function(replaceName, findPath, charset){
        replaceName = replaceName.replace(/[\\"]/g, "");
        charset = (charset || "utf-8").toLowerCase();

        var data = _sed.parse(replaceName);

        WScript.echo(replaceName + "; " + findPath);

        if(data){
            _sed.find(data, findPath, charset);
        }else{
            WScript.echo("replace::parse error(" + replaceName + ")");
        }
    }
};

//---
(function main(sed){
    var args = WScript.Arguments;
    var tmp = [];
    
    for(var i = 0, count = args.count(); i < count; i++){
        tmp.push(args.item(i));
    }
    
    sed.replace.apply(sed, tmp);
})(_sed);