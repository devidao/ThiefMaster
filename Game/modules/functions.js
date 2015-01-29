global.checkEmail = function(email){
	var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
	return emailPattern.test(email);
}

global.bufferEqual = function(a, b){
    if (!Buffer.isBuffer(a)) return undefined;
    if (!Buffer.isBuffer(b)) return undefined;
    if (a.length !== b.length) return false;
    
    for(var i = 0; i < a.length; i++){
        if (a[i] !== b[i]) return false;
    }
    
    return true;
};

global.randomString = function(len, charSet) {
    charSet = charSet || 'abcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
};


global.XBuffer = function(data)
{
	this.data = data;
	this.position = 0;
}

XBuffer.prototype.readString = function()
{
	var string = '';

	while(this.data[this.position] != 0x00)
	{
		string += String.fromCharCode(this.data[this.position]);
		this.position++;

		if(this.position > this.data.length)
			break;
	}

	//skip  0x00
	this.position++;

	return string;
}
XBuffer.prototype.skip = function(n)
{
	n = n || 1;
	this.position += n;
}
XBuffer.prototype.available = function()
{
	return Math.max(this.data.length - this.position, 0);
}
XBuffer.prototype.read = function(n)
{
	var b = new Buffer(n);
	n = n || 1;
	for(var i=0; i < n; i++)
	{
		b[i] = this.data[this.position+n];
		this.position++;
	}

	return new XBuffer(b);
}
XBuffer.prototype.readByte = function()
{
	var value = this.data[this.position];
	this.position++;
	return String.fromCharCode(value);
}
XBuffer.prototype.lookAhead = function(n)
{
	var tempPos = this.position;
	var buff = this.read(n);
	this.position=tempPos;
	return buff;
}

XBuffer.prototype.readUInt8 = function()
{
	var value = this.data.readUInt8(this.position);
	this.position++;
	return value;
}
XBuffer.prototype.readInt8 = function()
{
	var value = this.data.readInt8(this.position);
	this.position++;
	return value;
}
XBuffer.prototype.readInt16LE = function()
{
	var value = this.data.readInt16LE(this.position);
	this.position+=2;
	return value;
}
XBuffer.prototype.readInt16BE = function()
{
	var value = this.data.readInt16BE(this.position);
	this.position+=2;
	return value;
}
XBuffer.prototype.readInt32LE = function()
{
	var value = this.data.readInt32LE(this.position);
	this.position+=4;
	return value;
}
XBuffer.prototype.readFloatLE = function()
{
	var value = this.data.readFloatLE(this.position);
	this.position+=4;
	return value;
}
XBuffer.prototype.toString = function()
{
	return "[XBuffer " + this.data + "]";
}
