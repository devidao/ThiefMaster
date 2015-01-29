var ws = {
	ping: 0,
	lastResp: 0,
	inerval: 10,
	
	online: {},
	send: function(msg){
		ws.connection.send(JSON.stringify(msg));
	},
	
	move: function(x,y){
		var buf = new ArrayBuffer(4),
			 arr = new Uint8Array(buf);
		arr[0] = ((x & 0xff00) >> 8);
		arr[1] = (x & 0x00ff);
		arr[2] = ((y & 0xff00) >> 8);
		arr[3] = (y & 0x00ff);
		
		ws.connection.send(buf);
	},
	
	connect: function(room){
		ws.connection = new WebSocket('ws://'+room);
		ws.connection.binaryType = "arraybuffer";
		
		ws.connection.onmessage = ws.message;
		ws.connection.onclose = function(){
			
		}
		
		ws.connection.error = function (error){
			alert('noConnection');
		};
	},
	
	close: function(){
		if(ws.connection) ws.connection.close();
		ws.online = {};
	},
	
	message: function(msg){
		var now = (new Date()).getTime();
		ws.ping = now - ws.lastResp;
		ws.lastResp = now;
	
		if(msg.data instanceof ArrayBuffer){
			var arr = new Uint8Array(msg.data);
			game.ctrl.move(ws.rival, Physics.vector().set((arr[0] << 8) + arr[1], (arr[2] << 8) + arr[3]));
			return;
		};
		
		msg = JSON.parse(msg.data);
		
		if(msg.type == 'hi'){
			ws.id = msg.id;
			for(var i = 0; i < msg.online.length; i++){
				ws.online[msg.online[i]] = {};
			}
			
			ws.active = ws.online[ws.id];
			ws.active.id = ws.id;
			
			if(ws.hi) ws.hi(msg);
			
			/*
			setInterval(function(){
				if(x && y)
					ws.move(x, y);
			}, ws.inerval);
			*/
		}
		else if(msg.type == 'connected'){
			ws.online[msg.id] = {};
			game.reset();
			game.setTimeout();
			$('.pg').hide();
			$('#game').show();
		}
		else if(msg.type == 'disconnected'){
			delete ws.online[msg.id];
		}
		else if(msg.do == 'clean'){
			delete app.img;
			ws.canvas.height = window.innerHeight-2;
		}
	},
};

$(function(){
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	
	if(!window.WebSocket)
		alert('noSockets');
});