var rand = Math.random;
var workMain = function(){
	var i1 = rand() * 100000;
	var i2 = rand() * 100000;
	var arr = new Array(i2);
	for(var i = 0; i < i1; ++i){
		for(var j = 0; j < i2; ++j{
			arr[j] = rand()* 10000 + '' + rand() *10000;
		}
	}
}

setInterval(workMain, 1);
