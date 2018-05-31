package com.seshenghuo.media.player.video {
	import flash.external.ExternalInterface;
	
	public class ExternalJavascriptInterface {

		public function ExternalJavascriptInterface() {
			// constructor code
		}
		
		public static function addJavascriptInterface(list:Array):void{
			if(ExternalInterface.available){
				var _items = list || [];
				var _size = _items.length;
				var item = null;
				
				for(var i = 0; i < _size; i++){
					item = _items[i];
					
					ExternalInterface.addCallback(item.name, item.method);
				}
			}
		}
		
		public static function invokeJavascriptInterface(functionName:String, obj:Object):*{
			if(ExternalInterface.available){
				try{
					return ExternalInterface.call("SESWFLivePlayer." + functionName, obj);
				}catch(e){
					return undefined;
				}
			}
			
			return undefined;
		}


	}
	
}
