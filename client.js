const net = require('net');
const fs = require('fs');
const exec = require('child_process').exec
const os = require('os');

var config = JSON.parse(fs.readFileSync(__dirname + '/config/client.json', 'utf8'));

var client = net.createConnection(12800, config.server, function(){
	console.log('connected server');
});
client.on('data', function(data){
	var obj = JSON.parse(data);
	switch(obj.req){
		case 'whoareyou':
			client.write('{"req":"whoami","name":"'+config.name+'"}');
			break;
		default:
			break;
	}
});
client.on('end', function(){
	exec('shutdown now', function(error, stdout, stderr){
		console.log(stdout);
	});
});

var resourceCheck = function(){
	var memusage = 100 - (os.freemem() / os.totalmem() * 100);
	var cpuusage = 0;
	var cpus = os.cpus();
	_.each(cpus, function(e, i, a){
		var tu = e.times.user + e.times.nice + e.times.sys;
		var tt = tu + e.times.idle;
		usage += (tu/tt*100);
	});
	usage /= cpus.length;
	var sendobj = {
		req :'refresh';
		cpu :cpuusage;
		mem :memusage;
	};
	client.write(JSON.Stringify(sendobj));
}

setInterval(function(){resourceCheck();}, 200);
