var net = require('net');
var fs = require('fs');
var os = require('os');

var config = JSON.parse(fs.readFileSync(__dirname + '/config/client.json', 'utf8'));

var client = net.createConnection(12800, config.server, function(){
	console.log('connected server');

});
client.on('data', function(data){
	var obj = JSON.parse(data);
	switch(obj.req){
		default:
			break;
	}
});
client.on('end', function(){
});

var resourceCheck = function(){
	console.log(os.cpus());
	console.log(os.totalmem());
	console.log(os.freemem());
}

setInterval(function(){resourceCheck();}, 5000);
