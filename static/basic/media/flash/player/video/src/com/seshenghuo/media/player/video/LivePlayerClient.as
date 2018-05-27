package com.seshenghuo.media.player.video {
	import flash.external.ExternalInterface;
	
	public class LivePlayerClient {

		public function LivePlayerClient() {
			// constructor code
		}
		
		public function onMetaData(info:Object):void {
			trace("LivePlayerClient::Event#MetaData/duration=" + info.duration + " width=" + info.width + " height=" + info.height + " framerate=" + info.framerate);
			
			this.invokeJavascriptInterface("onMetaData", {
				"duration": info.duration,
				"width": info.width,
				"height": info.height,
				"framerate": info.framerate
			});
		}
		
		public function onCuePoint(info:Object):void {
			trace("LivePlayerClient::Event#CuePoint/time=" + info.time + " name=" + info.name + " type=" + info.type + " parameters=" + info.parameters);
			
			this.invokeJavascriptInterface("onCuePoint", {
				"time": info.time,
				"name": info.name,
				"type": info.type,
				"parameters": info.parameters
			});
		}
		
		public function onPlayStatus(info:Object):void {
			trace("LivePlayerClient::Event#PlayStatus/" + info);
			
			this.invokeJavascriptInterface("onPlayStatus", {
				"code": info.code,
				"level": info.status
			});
		}
		
		public function onSeekPoint(info:Object):void {
			trace("LivePlayerClient::Event#SeekPoint/" + info);
			
			this.invokeJavascriptInterface("onSeekPoint", info);
		}
		
		public function onTextData(textData:Object):void {
			trace("LivePlayerClient::Event#TextData/" + textData);
			
			var key:String;
			var obj:Object = {};

			for (key in textData) {
				obj[key] = textData[key];
			}
			
			this.invokeJavascriptInterface("onTextData", obj);
		}
		
		public function onXMPData(xmpData:Object):void {
			trace("LivePlayerClient::Event#XMPData/" + xmpData);
			
			this.invokeJavascriptInterface("onXMPData", {
				"data": xmpData.data
			});
		}
		
		public function onImageData(imageData:Object):void {
			trace("LivePlayerClient::Event#ImageData/" + imageData.data.length);
			
			this.invokeJavascriptInterface("onImageData", {
				"data": imageData.data,
				"length": imageData.data.length
			});
		}
		
		private function invokeJavascriptInterface(functionName:String, info:Object):*{
			if(ExternalInterface.available){
				try{
					return ExternalInterface.call("SESWFLivePlayer." + functionName, info);
				}catch(e){
					return undefined;
				}
			}
			
			return undefined;
		}

	}
	
}
