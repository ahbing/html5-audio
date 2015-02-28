
//web-audio-api

var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

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

audioInput.onchange = function(){
	//上传文件点了取消 文件长度为0
	if(audioInput.files.length !== 0){ //说明有文件上传
		file = audioInput.files[0];
		console.log(file);
		filename = file.name;
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
	var audioBufferSourceNode = ac.createBufferSource();
	audioBufferSourceNode.connect(ac.destination); //链接到目的地  !!最终都要链接到des	tination
	audioBufferSourceNode.buffer = buffer; //将buffer数据赋值给audioBufferSourceNode的buffer属性
	//通过audioBufferSourceNode的start属性播放
	audioBufferSourceNode.start(0);

}

//到这里的bug  同时播放歌曲

