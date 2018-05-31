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
	import flash.ui.ContextMenu;
	import flash.ui.ContextMenuItem;
	import flash.events.ContextMenuEvent;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	
	import com.seshenghuo.media.player.video.LivePlayerClient;
	import com.seshenghuo.media.player.video.ExternalJavascriptInterface;
	
	
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
		
		private var livePlayerContextMenu:ContextMenu;
		
		public function LivePlayer() {
			// constructor code
			this.stage.addEventListener(FullScreenEvent.FULL_SCREEN, this.onFullScreen);
			this.addJavascriptInterface();
			this.setConextMenu();
			
			//test();
		}
		
		public function createLivePlayer(width:Number = 640, height:Number = 360):void{
			this._width = width;
			this._height = height;
			
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
				
				this._muted = true;
			}else{
				this.sound.volume = this._volume;
				this._muted = false;
			}
			
			this.ns.soundTransform = this.sound;
		}
		
		public function setVolume(volume:Number):void{
			this._volume = (this.sound.volume = volume);
			
			
			this.ns.soundTransform = this.sound;
		}
		
		/*
		private function test():void{
			this.createLivePlayer();
			this.attachSourceList([
				{
					"source": "http://www.helpexamples.com/flash/video/cuepoints.flv"
				}
			]);
			
			this.play();
		}*/
		
		
		private function onNetStatusChange(e:NetStatusEvent):void{
			//@see http://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/flash/events/NetStatusEvent.html
			trace("LivePlayer::Event#" + e.info.code);
			
			var key:String;
			var info: Object = {};
			
			for(key in e.info){
				trace(key + ": " + e.info[key]);
				info[key] = e.info[key];
			}
			
			var o:Object = {
				"bubbles": e.bubbles,
				"cancelable": e.cancelable,
				"eventPhase": e.eventPhase,
				"type": e.type,
				"info": info
			};

			this.invokeJavascriptInterface("onNetStatusChange", o);
			
			switch(e.info.code){
				case "NetConnection.Connect.Closed":
					//fire emptied
					//reconnect
					this.invokeJavascriptInterface("onNetConnectionConnectClosed", o);
				break;
				case "NetConnection.Connect.Failed":
					//fire error
					this.invokeJavascriptInterface("onNetConnectionConnectFailed", o);
				break;
				case "NetConnection.Connect.NetworkChange":
					this.invokeJavascriptInterface("onNetConnectionConnectNetworkChange", o);
				break;
				case "NetConnection.Connect.Rejected":
					//fire abort
					this.invokeJavascriptInterface("onNetConnectionConnectRejected", o);
				break;
				case "NetConnection.Connect.Success":
					//
					this.invokeJavascriptInterface("onNetConnectionConnectSuccess", o);
				break;
				case "NetStream.Buffer.Empty":
					//
					this.invokeJavascriptInterface("onNetStreamBufferEmpty", o);
				break;
				case "NetStream.Buffer.Flush":
					//
					this.invokeJavascriptInterface("onNetStreamBufferFlush", o);
				break;
				case "NetStream.Buffer.Full":
					//
					this.invokeJavascriptInterface("onNetStreamBufferFull", o);
				break;
				case "NetStream.Connect.Closed":
					//
					this.invokeJavascriptInterface("onNetStreamConnectClosed", o);
				break;
				case "NetStream.Connect.Failed":
					//
					this.invokeJavascriptInterface("onNetStreamConnectFailed", o);
				break;
				case "NetStream.Connect.Rejected":
					//
					this.invokeJavascriptInterface("onNetStreamConnectRejected", o);
				break;
				case "NetStream.Connect.Success":
					//
					this.invokeJavascriptInterface("onNetStreamConnectSuccess", o);
				break;
				case "NetStream.Failed":
					//
					this.invokeJavascriptInterface("onNetStreamFailed", o);
				break;
				case "NetStream.Pause.Notify":
					// fire pause
					this.invokeJavascriptInterface("onNetStreamPauseNotify", o);
				break;
				case "NetStream.Play.Failed":
					//
					this.invokeJavascriptInterface("onNetStreamPlayFailed", o);
				break;
				case "NetStream.Play.FileStructureInvalid":
					//
					this.invokeJavascriptInterface("onNetStreamPlayFileStructureInvalid", o);
				break;
				case "NetStream.Play.InsufficientBW":
					//
					this.invokeJavascriptInterface("onNetStreamPlayInsufficientBW", o);
				break;
				case "NetStream.Play.Reset":
					//
					this.invokeJavascriptInterface("onNetStreamPlayReset", o);
				break;
				case "NetStream.Play.Start":
					// fire play
					this.invokeJavascriptInterface("onNetStreamPlayStart", o);
				break;
				case "NetStream.Play.Stop":
					// 
					this.invokeJavascriptInterface("onNetStreamPlayStop", o);
				break;
				case "NetStream.Play.StreamNotFound":
					//
					this.invokeJavascriptInterface("onNetStreamPlayStreamNotFound", o);
				break;
				case "NetStream.Seek.Failed":
					//
					this.invokeJavascriptInterface("onNetStreamSeekFailed", o);
				break;
				case "NetStream.Seek.InvalidTime":
					//
					this.invokeJavascriptInterface("onNetStreamSeekInvalidTime", o);
				break;
				case "NetStream.Seek.Notify":
					//
					this.invokeJavascriptInterface("onNetStreamSeekNotify", o);
				break;
				default:
					//
				break;
			}
		}
		
		private function onSecurityError(e:SecurityErrorEvent):void{
			//fire error
			trace("LivePlayer::Event#SecuretyError");

			var o:Object = {
				"bubbles": e.bubbles,
				"cancelable": e.cancelable,
				"eventPhase": e.eventPhase,
				"type": e.type,
				"errorID": e.errorID,
				"text": e.text
			};
			
			this.invokeJavascriptInterface("onSecurityError", o);
		}
		
		private function onAsyncError(e:AsyncErrorEvent):void{
			//fire error
			trace("LivePlayer::Event#AsyncError");
			
			var o:Object = {
				"bubbles": e.bubbles,
				"cancelable": e.cancelable,
				"eventPhase": e.eventPhase,
				"type": e.type,
				"errorID": e.errorID,
				"text": e.text
			};
			
			this.invokeJavascriptInterface("onAsyncError", o);
		}
		
		private function onIOError(e:IOErrorEvent):void{
			//fire error
			trace("LivePlayer::Event#IOError");
			
			var o:Object = {
				"bubbles": e.bubbles,
				"cancelable": e.cancelable,
				"eventPhase": e.eventPhase,
				"type": e.type,
				"errorID": e.errorID,
				"text": e.text
			};
			
			this.invokeJavascriptInterface("onIOError", o);
		}
		
		private function onFullScreen(e:FullScreenEvent):void{
			this._fullscreen = e.fullScreen;
			
			var o:Object = {
				"type": e.type,
				"fullScreen": e.fullScreen,
				"eventPhase": e.eventPhase,
				"activating": e.activating,
				"bubbles": e.bubbles,
				"cancelable": e.cancelable,
				"interactive": e.interactive
			};
			//@TODO
			if(true === e.fullScreen){
				this.invokeJavascriptInterface("onRequestFullscreen", o);
			}else{
				this.invokeJavascriptInterface("onExitFullscreen", o);
			}
		}
		
		private function addJavascriptInterface():void{
			ExternalJavascriptInterface.addJavascriptInterface([
				{
					"name": "createLivePlayer",
					"method": this.createLivePlayer
				},
				{
					"name": "attachSourceList",
					"method": this.attachSourceList
				},
				{
					"name": "getSourceObject",
					"method": this.getSourceObject
				},
				{
					"name": "play",
					"method": this.play
				},
				{
					"name": "pause",
					"method": this.pause
				},
				{
					"name": "resume",
					"method": this.resume
				},
				{
					"name": "seek",
					"method": this.seek
				},
				{
					"name": "requestFullscreen",
					"method": this.requestFullscreen
				},
				{
					"name": "exitFullscreen",
					"method": this.exitFullscreen
				},
				{
					"name": "setMute",
					"method": this.setMute
				},
				{
					"name": "setVolume",
					"method": this.setVolume
				}
			]);
		}
		
		private function invokeJavascriptInterface(functionName:String, info:Object):*{
			return ExternalJavascriptInterface.invokeJavascriptInterface(functionName, info);
		}
		
		private function menuItem_click(event:ContextMenuEvent):void{
			navigateToURL(new URLRequest("http://www.seshenghuo.com/"), "_blank");
		}
		
		private function setConextMenu():void{
			this.livePlayerContextMenu = new ContextMenu();
			
			this.livePlayerContextMenu.hideBuiltInItems();
			
			var item:ContextMenuItem = new ContextMenuItem("LivePlayer v1.0.0");
            this.livePlayerContextMenu.customItems.push(item);
			
			item.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,menuItem_click);
			
			
			this.contextMenu = this.livePlayerContextMenu;
		}
	}
	
}
