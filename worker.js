var rand = Math.random;
var staticnum
var workMain = function(){
	var i1 = parseInt(rand() * 50000);
	var i2 = parseInt(rand() * 50000);
	var arr = new Array(i2);
	for(var i = 0; i < i1; ++i){
		for(var j = 0; j < i2; ++j){
			arr[j] = rand()* 10000 + '' + rand() *10000;
			staticnum = i / j;
			if(rand() > 0.94) break;
		}
	}
}

setInterval(workMain, 2);
