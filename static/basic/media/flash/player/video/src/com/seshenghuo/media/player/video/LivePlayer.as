package com.seshenghuo.media.player.video {
	import flash.display.Sprite;
	import flash.display.Sprite;
    import flash.net.NetConnection;
    import flash.events.NetStatusEvent;
    import flash.events.AsyncErrorEvent;
    import flash.net.NetStream;
    import flash.media.Video;
    import flash.events.SecurityErrorEvent;
    import flash.events.IOErrorEvent;
	
	public class LivePlayer extends Sprite {
		private var ExternalPlayer:Object = null;
		
		private var ns:NetStream = null;
		private var nc:NetConnection = null;
		private var video:Video = null;
		
		private var _width:Number = 640;
		private var _height:Number = 360;
			
		
		public function LivePlayer() {
			// constructor code
			this.nc = new NetConnection();
			this.nc.addEventListener(NetStatusEvent.NET_STATUS, this.onNetStatusChange);
			this.nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onSecurityError);
			this.nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, this.onAsyncError);
			this.nc.addEventListener(IOErrorEvent.IO_ERROR, this.onIOError);
		}
		
		private function onNetStatusChange(e:NetStatusEvent):void{
			//@see http://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/flash/events/NetStatusEvent.html
			switch(e.info.code){
				case "NetConnection.Connect.Closed":
					//fire emptied
					//reconnect
				break;
				case "NetConnection.Connect.Failed":
					//fire error
				break;
				case "NetConnection.Connect.NetworkChange":
					
				break;
				case "NetConnection.Connect.Rejected":
					//fire abort
				break;
				case "NetConnection.Connect.Success":
					//
				break;
				case "NetStream.Buffer.Empty":
					//
				break;
				case "NetStream.Buffer.Flush":
					//
				break;
				case "NetStream.Buffer.Full":
					//
				break;
				case "NetStream.Connect.Closed":
					//
				break;
				case "NetStream.Connect.Failed":
					//
				break;
				case "NetStream.Connect.Rejected":
					//
				break;
				case "NetStream.Connect.Success":
					//
				break;
				case "NetStream.Failed":
					//
				break;
				case "NetStream.Pause.Notify":
					// fire pause
				break;
				case "NetStream.Play.Failed":
					//
				break;
				case "NetStream.Play.FileStructureInvalid":
					//
				break;
				case "NetStream.Play.InsufficientBW":
					//
				break;
				case "NetStream.Play.Reset":
					//
				break;
				case "NetStream.Play.Start":
					// fire play
				break;
				case "NetStream.Play.Stop":
					// 
				break;
				case "NetStream.Play.StreamNotFound":
					//
				break;
				case "NetStream.Seek.Failed":
					//
				break;
				case "NetStream.Seek.InvalidTime":
					//
				break;
				case "NetStream.Seek.Notify":
					//
				break;
				case "NetStream.Play.StreamNotFound":
					//
				break;
				default:
					//
				break;
			}
		}
		
		private function onSecurityError(e:SecurityErrorEvent):void{
			//fire error
		}
		
		private function onAsyncError(e:AsyncErrorEvent):void{
			//fire error
		}
		
		private function onIOError(e:IOErrorEvent):void{
			//fire error
		}
		
		public function connect(player:Object):Object{
			this.ExternalLivePlayer = player;
		}
	}
	
}
