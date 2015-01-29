global.socket = {
	sendOthers: function(room, id, msg){
		var isBuf = (msg instanceof Buffer),
			 ob = isBuf?{}:JSON.parse(msg);
		for(var i = 0; i < room.sockets.length; i++){
			var client = room.sockets[i];
			if(client &&  i != id){
				if(!(ob && ob.to > -1 && ob.to != i))
					try{
						client.send(msg, {binary: isBuf});
					}catch (e){
						console.log(e);
					}
			}
		};
	},

	connected: function(ws){
		var path = require('url').parse(ws.upgradeReq.url),
			url = ws.upgradeReq.headers.host + '/' + decodeURI(path.pathname).replace(/^\/+|[^A-Za-z0-9_.:\/~ -]|\/+$/g, '');

		var room = rooms[url];
		if(typeof room !== 'object'){
			room = rooms[url] = {
				sockets: [],
				info: {},
				url: url,
				online: []
			};
		}

		if(room.sockets.length >= 2) return;

		var id = room.sockets.push(ws) - 1;

		for(var i = 0; i < room.sockets.length; i++){
			if(room.sockets[i]) room.online.push(i);
		}
		
		ws.send(JSON.stringify({type: 'hi', id: id, online: room.online}));
		
		socket.sendOthers(room, id, JSON.stringify({type: 'connected', id: id}));
		ws.on('message', function(msg){
			if(!(msg instanceof Buffer)){
				var d = JSON.parse(msg);
				if(d._){
					switch(d._){
						case 'set':
							if(id == 0) _.extend(room.info, d.info || {});
							break;
					}
					return;
				}
			}
			socket.sendOthers(room, id, msg);
		});

		ws.on('close', function(code, msg){
			var n = 0;
			for(var i = 0; i < room.sockets.length; i++){
				if(i == id)
					room.sockets[i] = null;
				
				if(room.sockets[i] === null)
					n++;
			};

			if(room.sockets.length == n)
				delete rooms[url];
			else
				socket.sendOthers(room, id, JSON.stringify({type: 'disconnected', id: id}));
		});
	},

	run: function(http){
		var WebSocketServer = require('ws').Server,
			wss = new WebSocketServer({server: http});
			
		rooms = {};

		wss.on('connection', function(ws){
			socket.connected(ws);
		});
	}
}

POST.ws = function(q){
	if(!q.p[1]){
	}
	else switch(q.p[1]){
		case'rooms':
			var l = _.values(rooms),
				rms = [];
				
			for(var i = 0; i < l.length; i++){
				var room = l[i];
				rms.push(_.pick(room, 'url', 'info', 'online'));
			}
			q.end({rooms: rms});
			break;
	}
}