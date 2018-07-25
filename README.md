# SE.Builder
SE前端构建工具及静态资源基础版本库

<pre>
./app - 前端构建工具
./static - 静态资源基础版本
</pre>

# Static目录结构说明
<pre>
./static
  + [version]
    + demo   示例文件
    + extra  第三方引用文件
    + fonts  iconfont存放目录
    + html   静态页面目录
    + app    保留目录，用于将html目录中的.shtml文件转换成.html文件的存放目录
    + inc    全局公共引用文件，如：样式，脚本，HTML片断
    + media  媒体文件，如：视频，音频，Flash等
      + audio   音频文件
      + flash   Flash文件
      + video   视频文件
    + res    src下的资源文件(javascript/css/image)构建后的目录
      + css  样式文件(下设固定的lib/mod/logic三个统一目录)
      + img  图片文件(下设固定的lib/mod/logic三个统一目录)
      + js   脚本文件(下设固定的lib/mod/logic三个统一目录)
    + src    资源文件(javascript/css/image)源文件
      + css  样式文件(下设固定的lib/mod/logic三个统一目录)
      + img  图片文件(下设固定的lib/mod/logic三个统一目录)
      + js   脚本文件(下设固定的lib/mod/logic三个统一目录)
    + svg    svg文件
    + test   测试文件

</pre>

# 测试地址
<pre>
http://static.seshenghuo.com/${STATIC_PATH}
<a href="http://static.seshenghuo.com/static/basic/test/mod_actionsheet.shtml" target="_blank">Module#ActionSheet</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_datetimepicker.shtml" target="_blank">Module#Datetime Picker</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_imageviewer.shtml" target="_blank">Module#Image Viewer</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_svg.shtml" target="_blank">Module#SVG</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_swiper.shtml" target="_blank">Module#Swiper</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_liveplayer.shtml" target="_blank">Module#Live Player</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_audiovisualizer.shtml" target="_blank">Module#Audio Visualizer</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_request.shtml" target="_blank">Module#Request</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_form.shtml" target="_blank">Module#Form</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_dataform.shtml" target="_blank">Module#DataForm</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_uicomponent.shtml" target="_blank">Module#UI Component</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_layerbox.shtml" target="_blank">Module#Layer Box</a> @see UI Component
<a href="http://static.seshenghuo.com/static/basic/test/mod_loading.shtml" target="_blank">Module#Loading</a> @see UI Component
<a href="http://static.seshenghuo.com/static/basic/test/mod_logicbox.shtml" target="_blank">Module#Logic Box</a> @see UI Component
<a href="http://static.seshenghuo.com/static/basic/test/mod_framebox.shtml" target="_blank">Module#Frame Box</a> @see UI Component
<a href="http://static.seshenghuo.com/static/basic/test/mod_lightscroll.shtml" target="_blank">Module#LightScroll</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_touchselect.shtml" target="_blank">Module#TouchSelect</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_touchcity.shtml" target="_blank">Module#TouchCity</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_touchdatetime.shtml" target="_blank">Module#TouchDatetime</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_toast.shtml" target="_blank">Module#Toast</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_marquee.shtml" target="_blank">Module#Marquee</a>
<a href="http://static.seshenghuo.com/static/basic/test/mod_orgchart.shtml" target="_blank">Module#ORGChart</a>
<a href="http://static.seshenghuo.com/static/basic/test/org.shtml" target="_blank">CSS3组织架构生成DEMO</a>
</pre>

# ICON Font Demo
<pre>
<a href="http://static.seshenghuo.com/static/basic/fonts/iconfont/basefont/demo_fontclass.html" target="_blank">demo_fontclass</a>
<a href="http://static.seshenghuo.com/static/basic/fonts/iconfont/basefont/demo_symbol.html" target="_blank">demo_symbol</a>
<a href="http://static.seshenghuo.com/static/basic/fonts/iconfont/basefont/demo_unicode.html" target="_blank">demo_unicode</a>
</pre>

# shtml转换成html
<pre>
npm install shtml2html-fix -g
shtml2html-fix -s static/v1.0/html/ -d static/v1.0/app/ -w /data/wwwroot/sehome/htdocs/
</pre>

