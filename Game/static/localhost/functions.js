function checkEmail(email){
	var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
	return emailPattern.test(email);
}


$.fn.inp = function(clean){
	var data = {};
	this.find('input.changed, .inp.changed, textarea.changed, .ap').each(function (i){
		var $el = $(this);
		data[$el.attr('name')] = $el.hasClass('check')?($el.hasClass('v')?1:0):$el.val();
		if(clean)$el.removeClass('changed').val('');
	});
	return data;
};

jQuery.extend({
	query: function(url, data, callback) {
		return jQuery.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify(data),
			success: callback,
			dataType: "json",
			contentType: "application/json",
			processData: false
		});
	}
});

$.fn.bindEnter = function(fn){
	var el = this;
	this.bind('keypress', function(e){
		if(e.keyCode==13){
			if(fn) fn.call(this);
			else $(this).blur();
		}
	});
};

$.fn.blink = function(cls, time, cb){
	if(!cls) var cls = 'wrong';
	if(!time) var time = 1200;
	var $el = this.addClass(cls);
	setTimeout(function(){
		$el.removeClass(cls);
		if(cb)cb();
	},time);
	return this;
};

$.fn.bgURL = function(){
	return this.css('backgroundImage').replace(/url\(|\)|"|'/g,"");
};

var q = {
	txt: function(a){return a?a:''},
	sh: function(a){return a?'show':'hide'},
	ar: function(a){return a?'addClass':'removeClass'},
	sUD: function(a){return a?'slideDown':'slideUp'},
	f: function(){return false},
	p: function(e){
		e.preventDefault();
	}
}

function textselect(bool){
	$( document )[ bool ? "unbind" : "bind" ]("selectstart",  q.f)
		.attr("unselectable", bool ? "off" : "on" )
		.css("MozUserSelect", bool ? "" : "none" );
}

function isNum(num){
	return num == parseInt(num);
}

function dec2rgb(c){
	return (((c & 0xff0000) >> 16)+','+((c & 0x00ff00) >> 8)+','+(c & 0x0000ff));
}

function rgb2dec(r,g,b){
	return (r << 16) + (g << 8) + b;;
}

function rgb2hex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function dec2hex(c){
    return "#" + ((1 << 24) + (c & 0xff0000) + (c & 0x00ff00) + (c & 0x0000ff)).toString(16).slice(1);
}

function color(str){
	if (str.charAt(0) == '#')
		str = str.substr(1,6);

    str = str.replace(/ /g,'').toLowerCase();
	
	var bits;
	if(bits = (/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/).exec(str))
		return rgb2dec(parseInt(bits[1]),parseInt(bits[2]),parseInt(bits[3]));
	
	if(bits = (/^(\w{2})(\w{2})(\w{2})$/).exec(str))
		return rgb2dec(parseInt(bits[1],16),parseInt(bits[2],16),parseInt(bits[3],16));
		
	if(bits = (/^(\w{1})(\w{1})(\w{1})$/).exec(str))
		return rgb2dec(parseInt(bits[1] + bits[1], 16),parseInt(bits[2] + bits[2], 16),parseInt(bits[2] + bits[2], 16));
}

String.prototype.url = function () {
	var url = this;
	var preserveNormalForm = /[,_`;\':-]+/gi
	url = url.replace(preserveNormalForm, ' ');

	for(var letter in diacritics)
		url = url.replace(diacritics[letter], letter);

	url = url.replace(/[^a-z|^0-9|^-|\s]/gi, '').trim();
	url = url.replace(/\s+/gi, '-');
	return url;
}

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}

function randomString(len, charSet) {
    charSet = charSet || 'abcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}