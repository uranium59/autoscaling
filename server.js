const net = require('net');
const exec = require('child_process').exec;
const fs = require('fs');
const _ = require('underscore');

var config = JSON.parse(fs.readFileSync(__dirname + '/config/server.json', 'utf8'));


var clientArray = {};
_.each(config.vmList, function(e, i, a){
	clientArray[e] = {
		name:e,
		state:'stop',
		socket:null,
		lastusage:[],
		refresh:Date.now()
	};
});

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
			if(self.parentobj === undefined) return;
			self.parentobj.lastusage.push(jsonobj);
			if(self.parentobj.lastusage.length > 5)
				self.parentobj.lastusage.shift();
			break;
		case 'whoami':
			clientArray[jsonobj.name].socket = self;
			self.parentobj = clientArray[jsonobj.name];
			break;
		default:
			break;
	}
}

var createInstance = function(name){
	if(clientArray[name].state != 'stop') return;
	exec('xen create ' + name, function(err, stdout, stderr){
		if(err){
			console.log(err);
			return;
		}
		clientArray[name].state = 'booting';
		console.log(stdout);
	});
}
var closeInstance = function(name){
	exec('xen shutdown ' + name, function(err, stdout, stderr){
		if(err){
			console.log(err);
		}
		console.log(stdout);
		clientArray[name].state = 'stop';
		clientArray[name].socket = null;
		clientARray[name].lastusage = {};
	});
}


var mainLoop = function(){
	var cpu = 0;
	var memory = 0;
	var livecount = 0;
	_.each(clientArray, function(e, i, a){
		if(e.client === null) return;
		livecount++;
		cpu+= _.reduce(e.lastusage, function(val, data){
			return (data.cpu/e.lastusage.length) + val;
		}, 0);
		memory+= _.reduce(e.lastusage, function(val, data){
			return (data.mem/e.lastusage.length) + val;
		}, 0);
	});
	if(livecount == 0){
		createInstance(config.vmList[0]);
		return;
	}
	cpu = cpu / livecount;
	memory = memory / livecount;
	
	var closeflag = false;
	var makeflag = false;

	if(cpu < config.cpu-low && memory < memory-high){
		closeflag = true;
	}
	if(memory < config.memory-low && cpu < cpu-high){
		closeflag = true;
	}
	if(cpu > config.cpu-high || memory > config.memory-high){
		makeflag = true;
	}
	if(makeflag){
		if(livecount == 6) return;
		var notworking = _.filter(
	}
	if(closeflag){
		if(livecount <2) return;
	}
}
//var loopHandle = setInterval(mainLoop, config.interval);

closeInstance('vm0');
