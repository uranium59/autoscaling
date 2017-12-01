net = require('net');
fs = require('fs');
_ = require('underscore');

var config = JSON.parse(fs.readFileSync(__dirname + '/config/server.json', 'utf8'));


var clientArray = new Array(config.vmCount);

var makeClient = function(socket){
	socket.on('disconnect', disconnectSocket);
	socket.on('end', closeSocket);
	socket.on('readable', readSocket);
	socket.on('error', errorSocket);
	var client = {};
	client.socket = socket;
	clientArray.push(client);
	return client;
};

var server = net.createServer(function(socket){
	var client = makeClient(socket);
	socket.write('{"req":"whoareyou"}');
});

var disconnectSocket = function(){
}
var closeSocket = function(){
	var self = this;
	cosole.log('client Closed Socket. vm id : ' + self.vmid);
}
var errorSocket = function(){
}
var readSocket = function(){
	var self = this;
	var data = self.read();
	if(data === null){
		console.log('null data read');
		return;
	}
	var bufstr = data.toString();
	var jsonobj;
	if(bufstr.length < 1) return;
	try{
		jsonobj = JSON.parse(bufstr);
	}catch (e) {
		console.log('cannot parse string');
		console.log(bufstr);
		return;
	}
	switch(jsonobj.req){
		case 'refresh':
			break;
		case 'whoami':
			var client = makeClient(socket);
			break;
		default:
			break;
	}
}



var mainLoop = function(){
	var cpu = 0;
	var memory = 0;
	_.each(clientArray, function(e, i, a){
		if(e.client === undefined) return;
	});
}
var loopHandle = setInterval(mainLoop, config.interval);
