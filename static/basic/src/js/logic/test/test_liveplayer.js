;define(function(require, exports, module){
	var LivePlayer = require("mod/ui/liveplayer");

	var player = LivePlayer.createLivePlayer("test_liveplayer");

	player.options(player.parse(player.getLivePlayerName()));
    player.render();

    player.updateOnlineUsers(37);
});