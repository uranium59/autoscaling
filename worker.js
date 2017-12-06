var rand = Math.random;
var staticnum
var workMain = function(){
	var i1 = parseInt(rand() * 210000 + 10000);
	var i2 = parseInt(rand() * 210000 + 10000);
	var arr = new Array(i2);
	for(var i = 0; i < i1; ++i){
		for(var j = 0; j < i2; ++j){
			arr[j] = parseInt(rand()* 100000) + '' + parseInt(rand() *100000);
			staticnum = i / j;
			if(rand() > 0.99) break;
		}
		if(rand()< 0.0002) break;
	}
}

setInterval(workMain, 2);
