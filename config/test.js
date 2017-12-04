const os = require('os');
const _ = require('underscore');

var cpus = os.cpus();
var usage = 0;
_.each(cpus, function(e, i, a){
	var tu = e.times.user + e.times.nice + e.times.sys;
	var tt = tu + e.times.idle;
	usage += (tu / tt * 100);
});
usage /= cpus.length;
console.log(cpus.length);
