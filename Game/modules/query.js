var util = require('util'),
	qs = require('querystring'),
	cookie = require('cookie');

var Query = function(req,res){
	this.r = {};
	//req.setEncoding('utf8');
	this.req = req;
	this.res = res;
	this.post = {};
	this.date = new Date;
	this.domain = (req.headers.host || '').toLowerCase();
	var Url = require('url').parse(req.url);
	this.uri = decodeURI(Url.pathname).replace(/^\/+|[^A-Za-z0-9_.:\/~ -]|\/+$/g, '');
	this.query = Url.query;

	this.cookie = cookie.parse(req.headers['cookie'] || '');
	this.lang = this.cookie.lang || cfg.lang;
	this.p = this.uri.split(/[\/]+/);
}

Query.prototype.end = function(j){
	this.res.writeHead(200, {'Content-Type': 'application/json'});
	if(j) _.extend(this.r, j);
	this.res.end(JSON.stringify(this.r));
}

global.query = {
	staticDomains: [],
	serv: function (req, res){
		var q = new Query(req,res);

		q.inf = (req.headers['x-inf'])?JSON.parse(q.req.headers['x-inf']):{};

		if(req.method == 'POST'){
			var data = "";
			req.on("data", function(chunk){
				data += chunk;
			});
			
			req.on("end", function(){
				if(req.headers['content-type'] && req.headers['content-type'].split(';')[0] == 'application/json')
					q.post = data?JSON.parse(data):{};
				else
					q.post = data?qs.parse(data):{};
				
				if(typeof POST[q.p[0]] == 'function'){
					var e = POST[q.p[0]](q);
					if(e === 0)
						q.end();
				}
			});
		}
		else if(req.method == 'PUT'){
			if(isNaN(q.p[0])){
				if(typeof PUT[q.p[0]] == 'function')
					PUT[q.p[0]](q);
				else q.end({error: 'wrong cmd'});
			} else tree.put(q);
		}
		else if(req.method == 'GET'){
			if(query.staticDomains.indexOf(q.domain)+1)
				query.pump(q,'./static/'+(q.domain+'/'+q.uri).replace(/\/\.+/g,''));	
			else if(tree)	
				tree.get(q);
			else
				query.pump(q,'./static/wrongDomain.html');	
		}
	},

	pump: function(q, path){
		try{
			var stat = fs.lstatSync(path);
			if(stat.isDirectory()){
				path += 'index.html';
				stat = fs.lstatSync(path);
			}
		} catch(e){
			q.res.writeHead(404);
			q.res.end();
			return;
		}

		var lm = stat.mtime.toUTCString();
		var renew = !(q.req.headers['if-modified-since'] && q.req.headers['if-modified-since'] == lm);

		var name = path.replace(/^.*[\\\/]/, '');
		var ext = (/(?:\.([^.]+))?$/.exec(name)[1] || '').toLowerCase();
		
		var headers = {
			'Cache-Control': 'no-cache, must-revalidate',
			'Content-Length': stat.size,
			'Last-Modified': lm
		};

		var expires = new Date(Date.now() + 2628000000);
		headers.expires = expires.toUTCString();

		if(ext == 'css'){
			headers["Content-Type"] = "text/css";
			headers["X-Content-Type-Options"] = "nosniff";
		};

		q.res.writeHead(renew?200:304,headers);
		if(renew){
			var readStream = fs.createReadStream(path);
			readStream.pipe(q.res);
		}
		else
			q.res.end();
	},
};


fs.readdirSync('./static').forEach(function(el){
	query.staticDomains.push(el);
});
