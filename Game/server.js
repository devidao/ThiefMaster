global.fs = require('fs');

require('colors');
global.util = require('util');
global.EventEmitter = require('events').EventEmitter;
global._ = require('underscore');
global.Yaml = require('js-yaml');

global.cfg = require('./cfg.yaml');
	
process.on('uncaughtException', function (err){
	if(err.stack) console.log(err.stack.red);
	else console.log(err);
});

global.email = require("emailjs").server.connect(cfg.email);

global.POST = {};
global.GET = {};
global.PUT = {};

global.ecb = function(e){
	console.log(e);
};

global.api = {
	check:{},
};

global.mod = {};
global.sys = new EventEmitter();
fs.readdirSync('./modules').forEach(function(el){
	var file = './modules/' + el;
	var module = mod[el.split('.')[0]] = require(file);
	console.log(file);
	if(cfg.devMode)
		fs.watchFile(file, function(curr, prev){
			console.log(curr.mtime.toString().yellow +' '+ el.blue);
			delete require.cache[require.resolve(file)];
			require(file);
			if(module._reload) module._reload();
		});
});

sys.emit('loaded');

var http = require('http').createServer(function(req, res){
	query.serv(req, res);
});

http.listen(80, function(err) {
	if (err) return cb(err);

	var uid = parseInt(process.env.SUDO_UID);
	if (uid) process.setuid(uid);
	
	var d = new Date();
	console.log('Server is running '.blue.bold + d);
});

global.rooms = {};
socket.run(http);

var stdin = process.openStdin();
stdin.setEncoding('utf8');

stdin.on('data', function (input){
	console.log(eval(input));
});
