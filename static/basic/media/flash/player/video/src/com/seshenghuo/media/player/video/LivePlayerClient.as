package com.seshenghuo.media.player.video {
	
	public class LivePlayerClient {

		public function LivePlayerClient() {
			// constructor code
		}
		
		public function onMetaData(info:Object):void {
			trace("LivePlayerClient::Event#MetaData/duration=" + info.duration + " width=" + info.width + " height=" + info.height + " framerate=" + info.framerate);
		}
		
		public function onCuePoint(info:Object):void {
			trace("LivePlayerClient::Event#CuePoint/time=" + info.time + " name=" + info.name + " type=" + info.type + " parameters=" + info.parameters);
		}
		
		public function onPlayStatus(info:Object):void {
			trace("LivePlayerClient::Event#PlayStatus/" + info);
		}
		
		public function onSeekPoint(info:Object):void {
			trace("LivePlayerClient::Event#SeekPoint/" + info);
		}
		
		public function onTextData(info:Object):void {
			trace("LivePlayerClient::Event#TextData/" + info);
			/*
			var key:String;

			for (key in textData) {
				trace(key + ": " + textData[key]);
			}
			*/
		}
		
		public function onXMPData(info:Object):void {
			trace("LivePlayerClient::Event#XMPData/" + info);
		}
		
		public function onImageData(info:Object):void {
			trace("LivePlayerClient::Event#ImageData/" + info.data.length);
		}

	}
	
}
