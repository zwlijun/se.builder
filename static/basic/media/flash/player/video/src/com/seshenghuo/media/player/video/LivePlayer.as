package com.seshenghuo.media.player.video {
	import flash.display.Sprite;
    import flash.net.NetConnection;
    import flash.events.NetStatusEvent;
    import flash.events.AsyncErrorEvent;
    import flash.net.NetStream;
    import flash.media.Video;
	import flash.media.SoundTransform;
	import flash.media.SoundMixer;
    import flash.events.SecurityErrorEvent;
    import flash.events.IOErrorEvent;
	import flash.display.StageDisplayState;
	import flash.events.FullScreenEvent;
	
	import com.seshenghuo.media.player.video.LivePlayerClient;
	
	
	public class LivePlayer extends Sprite {
		private var ExternalPlayer:Object = null;
		
		private var ns:NetStream = null;
		private var nc:NetConnection = null;
		private var video:Video = null;
		private var sound:SoundTransform = null;
		
		private var client:LivePlayerClient = null;
		
		private var _width:Number = 640;
		private var _height:Number = 360;
		private var sourceList:Array = [
			/**
			{
				"source": String,
				"type": String
			}
			*/
		];
		private var sourceSize:int = 0;
		private var sourceIndex:int = 0;
		
		private var _fullscreen:Boolean = false;
		private var _muted:Boolean = false;
		private var _volume:Number = 0.5;
			
		
		public function LivePlayer() {
			// constructor code
			this.nc = new NetConnection();
			this.nc.addEventListener(NetStatusEvent.NET_STATUS, this.onNetStatusChange);
			this.nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this.onSecurityError);
			this.nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, this.onAsyncError);
			this.nc.addEventListener(IOErrorEvent.IO_ERROR, this.onIOError);
			
			this.nc.connect(null);
			this.client = new LivePlayerClient();
			this.sound = new SoundTransform();

			this.ns = new NetStream(this.nc);
			this.ns.addEventListener(NetStatusEvent.NET_STATUS, this.onNetStatusChange);
			
			this.ns.client = this.client;
			this.ns.soundTransform = this.sound;
			
			this.stage.addEventListener(FullScreenEvent.FULL_SCREEN, this.onFullScreen);
			
			test();
		}
		
		public function createLivePlayer(width:Number = 640, height:Number = 360):void{
			this._width = width;
			this._height = height;
			
			this.video = new Video(width, height);
			
			addChild(this.video);
			
			this.video.attachNetStream(this.ns);
		}
		
		public function attachSourceList(_sourceList:Array):void{
			_sourceList = _sourceList || [];
			
			this.sourceList = [].concat(this.sourceList, _sourceList);
			this.sourceSize = this.sourceList.length;
		}
		
		public function getSourceObject(index:int):Object{
			var sourceList = this.sourceList;
			var sourceSize = this.sourceSize;
			
			if(index < 0 || index >= sourceSize){
				return null;
			}
			
			return sourceList[index];
		}
		
		public function play(index:int = 0):void{
			var sourceObj = this.getSourceObject(index);
			
			if(sourceObj && sourceObj.source){
				this.ns.play(sourceObj.source);
			}
		}
		
		public function pause():void{
			this.ns.pause();
		}
		
		public function resume():void{
			this.ns.resume();
		}
		
		public function seek(offset:Number):void{
			this.ns.seek(offset);
		}
		
		public function requestFullscreen():void{
			this.stage.displayState = StageDisplayState.FULL_SCREEN;
		}
		
		public function exitFullscreen():void{
			this.stage.displayState = StageDisplayState.NORMAL;
		}
		
		public function get fullscreen():Boolean{
			return this._fullscreen;
		}
		
		public function get muted():Boolean{
			return this._muted;
		}
		
		public function setMute():void{
			if(false === this._muted){
				this._volume = this.ns.soundTransform.volume;
				
				this.sound.volume = 0;
			}else{
				this.sound.volume = this._volume;
			}
			
			this.ns.soundTransform = this.sound;
		}
		
		public function setVolume(volume:Number):void{
			this._volume = (this.sound.volume = volume);
			
			
			this.ns.soundTransform = this.sound;
		}
		
		private function test():void{
			this.createLivePlayer();
			this.attachSourceList([
				{
					"source": "http://www.helpexamples.com/flash/video/cuepoints.flv"
				}
			]);
				
			this.play();
		}
		
		private function onNetStatusChange(e:NetStatusEvent):void{
			//@see http://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/flash/events/NetStatusEvent.html
			trace("LivePlayer::Event#" + e.info.code);
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
			trace("LivePlayer::Event#SecuretyError");
		}
		
		private function onAsyncError(e:AsyncErrorEvent):void{
			//fire error
			trace("LivePlayer::Event#AsyncError");
		}
		
		private function onIOError(e:IOErrorEvent):void{
			//fire error
			trace("LivePlayer::Event#IOError");
		}
		
		private function onFullScreen(e:FullScreenEvent):void{
			this._fullscreen = e.fullScreen;
			
			//@TODO
		}
		
		//public function connect(player:Object):Object{
		//	this.ExternalLivePlayer = player;
		//}
	}
	
}
