const net = require('net');
const exec = require('child_process').spawn;
const fs = require('fs');
_ = require('underscore');

var config = JSON.parse(fs.readFileSync(__dirname + '/config/server.json', 'utf8'));


var clientArray = {};
_.each(config.vmList, function(e, i, a){
	clientArray[e] = {
		name:e,
		socket:null,
		lastusage:{},
		refresh:Date.now();
	};
});

var makeClient = function(socket){
	var client = {};
	client.socket = socket;
	clientArray.push(client);
	return client;
};

var server = net.createServer(function(socket){
	socket.on('disconnect', disconnectSocket);
	socket.on('end', closeSocket);
	socket.on('readable', readSocket);
	socket.on('error', errorSocket);
	socket.write('{"req":"whoareyou"}');
});
server.listen(12800, function(){
	console.log('server bound');
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

var createInstance = function(name){
	exec('xen create ' + name, function(err, stdout, stderr){
		if(err){
			console.log(err);
		}
		console.log(stdout);
	});
}
var closeInstance = function(name){
}


var mainLoop = function(){
	var cpu = 0;
	var memory = 0;
	_.each(clientArray, function(e, i, a){
		if(e.client === null) return;
	});
}
var loopHandle = setInterval(mainLoop, config.interval);
