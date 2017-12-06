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
	var self = this;
	console.log('client disconnected.');
	if(self.vmid !== undefined){
		console.log(self.vmid + ' is disconnected');
		closeInstance(self.vmid);
	}
}
var closeSocket = function(){
	var self = this;
	console.log('client Closed Socket. vm id : ' + self.vmid);
	if(self.vmid !== undefined){
		console.log(self.vmid + ' is disconnected');
		closeInstance(self.vmid);
	}
}
var errorSocket = function(exc){
	var self = this;
	if(self.vmid === undefined) return;
	
	console.log(self.vmid + ' has error');
	console.log(exc);
	closeInstance(self.vmid);
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
			self.vmid = jsonobj.name;
			self.parentobj.state = 'working';
			break;
		default:
			break;
	}
}

var createInstance = function(name){
	console.log('creating new VM Instance');
	if(clientArray[name].state != 'stop') return;
	clientArray[name].state = 'booting';
	clientArray[name].refresh = Date.now();
	exec('xen create /etc/xen/' + name + '.cfg', function(err, stdout, stderr){
		logWrite('virtual machine start : ' + name);
		console.log('start booting');
		if(err){
			exec('xen destroy ' + name, function(a, b, c){
				clientArray[name].state = 'stop';
			});
			
			console.log(err);
			return;
		}
		console.log(stdout);
	});
}
var closeInstance = function(name){
	logWrite('virtual machine shutdown : ' + name);
	exec('xen shutdown ' + name, function(err, stdout, stderr){
		if(err){
			console.log(err);
		}
		console.log(stdout);
		clientArray[name].state = 'stop';
		clientArray[name].socket.vmid = undefined;
		clientArray[name].socket = null;
		clientArray[name].lastusage = [];
	});
}


var mainLoop = function(){
	console.log('\033c');
	var cpu = 0;
	var memory = 0;
	var livecount = 0;
	var cannotmake = false;
	_.each(clientArray, function(e, i, a){
		console.log(e.name + ' : ' + e.state);
		if(e.state == 'stop') return;
		if(e.state == 'booting') cannotmake = true;
		livecount++;
		var vmcpu = _.reduce(e.lastusage, function(val, data){
			return (data.cpu/5) + val;
		}, 0);
		var vmmemory = _.reduce(e.lastusage, function(val, data){
			return (data.mem/5) + val;
		}, 0);
		console.log('cpu : ' + vmcpu);
		console.log('memory : ' + vmmemory);
		cpu+= vmcpu;
		memory += vmmemory;
	});
	if(livecount == 0){
		createInstance(config.vmList[0]);
		return;
	}
	cpu = cpu / livecount;
	memory = memory / livecount;
	
	var closeflag = false;
	var makeflag = false;

	if(cpu < config.cpulow && memory < config.memoryhigh){
		closeflag = true;
	}
	if(memory < config.memorylow && cpu < config.cpuhigh){
		closeflag = true;
	}
	if(cpu > config.cpuhigh || memory > config.memoryhigh){
		makeflag = true;
	}
	if(makeflag && !cannotmake){
		if(livecount == 6) return;
		var notworking = _.find(clientArray, function(e){
			return e.state == 'stop';
		});
		
		createInstance(notworking.name);
		return;
	}
	if(closeflag){
		if(livecount <2) return;
		var livevm = _.filter(clientArray, function(e){
			return e.state == 'working';
		});
		closeInstance(_.last(livevm).name);
	}
}
var loopHandle = setInterval(mainLoop, config.interval);

var logWrite = function(data){
	fs.writeFileSync(__dirname + '/server.log', data + '\n');
}
//closeInstance('vm0');
