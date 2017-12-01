var net = require('net');
var os = require('os');

var resourceCheck = function(){
	console.log(os.cpus());
	console.log(os.totalmem());
	console.log(os.freemem());
}

setInterval(function(){resourceCheck();}, 5000);
