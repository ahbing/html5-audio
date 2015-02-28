
//web-audio-api

var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
var audioBufferSourceNod;
var file = null,
	filename = null,
	source = null;

try{
	var ac = new AudioContext();
} catch(e) {
	console.log('你的浏览器不支持AudioContext');
	console.log(e);
}

var audioInput = document.getElementById('uploadfile');
var canvas = document.getElementById('canvas');
var CANVAS_WIDTH = 1024;
var CANVAS_HEIGHT = 400;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
var context = canvas.getContext('2d');
	console.log(audioInput.files.length);

var inputCount =0;  //假设没有本地上传歌曲

audioInput.onchange = function(){
	//上传文件点了取消 文件长度为0
	if(audioInput.files.length !== 0){ //说明有文件上传
		file = audioInput.files[0];
		console.log(file);
		filename = file.name;
		console.log(inputCount);
		inputCount++;
		console.log(inputCount);
		var n = 1;
		if(inputCount !== n){
			//退出原来的歌曲播放
			audioBufferSourceNode.stop(0);  //如果本地上传的歌超过一首  停止前一首歌
		}

		start();  //获得文件后开始

	}

}

function start(){

	

	var fr = new FileReader();  //用于读取文件
	fr.onload = function(e){
		//文件读取成功后执行
		var fileResult = e.target.result;   //储存成功读取的文件  arraybuffer格式

		//audioContext 的 decodeAudioData 方法解码arraybuffer数据
		// param : arraybuffer数据，成功回调，失败回调
		ac.decodeAudioData(fileResult,function(buffer){

			visualize(buffer); //将数据播放可视化

		},function(err){
			console.log('解码失败');
			console.log(err);
		});
	}

	//上传的文件读取
	fr.readAsArrayBuffer(file);

}

function visualize(buffer){

	audioBufferSourceNode = ac.createBufferSource();
	var analyser =  ac.createAnalyser();

	audioBufferSourceNode.connect(analyser); //链接到目的地  !!最终都要链接到destination
	audioBufferSourceNode.buffer = buffer; //将buffer数据赋值给audioBufferSourceNode的buffer属性
	//通过audioBufferSourceNode的start属性播放
	audioBufferSourceNode.start(0);

	//创造分析节点
	analyser.connect(ac.destination);  //analyser插入audioBufferSourceNode 和 destination中间

	draw(analyser);  //将分析结果可视化

}

//到这里的bug  同时播放歌曲

function draw(analyser){

	var meterWidth = 10,  // 能量条宽度
		gap = 2,  //能量条间距
		meterNum = Math.floor(CANVAS_WIDTH/(10+2));  //能量条个数

	var animated = function(){  //canvas的可视化动画

		//AnalyserNode.getByteFrequencyData() 方法来获取频率数据
		//返回 AnalyserNode.frequencyBinCount 值, 它是FFT的一部分,
		// 然后调用Uint8Array(),把frequencyBinCount作为它的参数 — 这代表我们将对这个尺寸的FFT收集多少数据点.

		var array = new Uint8Array(analyser.frequencyBinCount);  //frequency 频率
		analyser.getByteFrequencyData(array);
		//console.log(array);

		var step = Math.round(array.length / meterNum);  //每个能量条存储的数组个数
		context.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);  //清空canvas

		//定义渐变
		my_gradient = context.createLinearGradient(0,0,0,300);
		my_gradient.addColorStop(1,'#0f0');
		my_gradient.addColorStop(0.5,'#ff0');
		my_gradient.addColorStop(0,'#f00');

		context.fillStyle = my_gradient;
		for(var i = 0; i < meterNum; i++){
			var value = array[ i*step];
			context.fillRect(i*12,CANVAS_HEIGHT-value-6,meterWidth,CANVAS_HEIGHT-2);
		}

		requestAnimationFrame(animated);  //动画
	};

	requestAnimationFrame(animated);
}


