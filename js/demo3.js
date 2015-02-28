/*
	1. web audio api
	创建audioContext:new window.AudioContext()  
		属性 : destination  所有的audionNode都链接到这里
		方法 : decodeAudioData(buffer, success(buffer), err )   异步解码获得的arraybuffer类型的 Buffer
			  createBufferSource()  
			  	属性 buffer   loop   onended 绑定音频播放结束的事件处理程序
			    方法 start/noteOn        stop/noteOff  //参数一般为0 重头开始播放 / 立即结束  

			  createAnalyser()  分析节点
			  cerateGain / createGainNode()  控制音量的节点

	
	
*/
window.onload = function(){
  new Visualizer().init();
}


function Visualizer(){
  this.file = null;  //读取的文件
  this.filename = null;  //文件名
  this.ac = null;  //audioContext 
  this.animate = null;
  this.count = 0;   //播放的歌曲
//  this.cancel = false; //退出前一首歌曲
  this.timer = null; //定时器
  this.source;   //audioBufferSourceNode 
  this.width = 1204; //canvas 的宽
  this.height = 400;

}

Visualizer.prototype = {
  init : function(){
	this.getApi();
	this.addEventListener();
	// console.log('hello world');
  },

  getApi : function(){
	AC = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
	window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

	try{
		this.ac = new AC();
	}catch(e){
		this.updateInfo('你的浏览器不支持',false);
		console.log(e);
	}
  },

  addEventListener : function(){
  	var that = this;
  	var oInput = document.getElementById('uploadfile');
  	oInput.onchange = function(){
  		//如果不存在 audioContext  就return
  		if(that.ac === null){ return; }

  		if(oInput.files.length !== 0){
  			that.file = oInput.files[0];
  			that.filename = that.file.name;
  			that.count++;  
  			console.log('这是第'+that.count+'首歌');  //播放歌曲的数量
  			if(that.count !== 1){
  				//退出之前的歌曲
  				that.source.stop(0);
  				//that.cancel = true;
  			}
  			that.start();
  		}
  	}
  },
  start : function(){
  	var that = this,
  		file = this.file,
  		fr = new FileReader();

  	fr.onload = function(e){
  		var buffer = e.target.result;
  		var ac = that.ac;
  		that.updateInfo('正在加载资源',true);
  		ac.decodeAudioData(buffer,function(buffer){
  			that.updateInfo('数据加载成功',false);
  			that.visualize(ac,buffer);  //成功编码后的buffer数据
  		},function(err){
  			that.updateInfo('数据解码错误',false);
  			console.log(err);
  		});
  	}

  	this.updateInfo('正在上传',true);
  	fr.readAsArrayBuffer(file);
  },

  visualize : function(ac,buffer){
  	var that = this;
  	var bufferSourceNode = ac.createBufferSource();
  	var analyser = ac.createAnalyser();
  	var destination = ac.destination;
  	bufferSourceNode.connect(analyser);
  	analyser.connect(destination);
  	bufferSourceNode.buffer = buffer;  //将buffer 付给 sourceNode

  	if(!bufferSourceNode.start){
  		bufferSourceNode.start = bufferSourceNode.noteOn;
  		bufferSourceNode.stop = bufferSourceNode.noteOff;
  	}
  	bufferSourceNode.start(0);
  	this.updateInfo('当前正在播放  '+this.filename,false);
  	this.source = bufferSourceNode;  //相当于将其设置为全局变量

/*  	if(this.cancel){ //退出前一首歌曲
  		console.log('我去年买了个表');
  		bufferSourceNode.stop(0);  //不起作用
  		this.source.stop(0);
  	}*/
  	
  	this.draw(analyser);
  },

  draw:function(analyser){
  	var that = this,
  		meterWidth = 10, //能量条宽度
  		gap = 2,  //能量条间距
  		meterNum = Math.floor(this.width / 12),
  		canvas = document.getElementById('canvas');

  	canvas.width = this.width;
  	canvas.height = this.height;

  	var ctx = canvas.getContext('2d');
  	animateDraw = function(){
  		
  		var array = new Uint8Array(analyser.frequencyBinCount);  //frequency 频率
		analyser.getByteFrequencyData(array);
  		// console.log(array);
  		var step = Math.round(array.length / meterNum); 
  		ctx.clearRect(0,0,that.width,that.height);  //先清空画布

		my_gradient = ctx.createLinearGradient(0,0,0,380);
		my_gradient.addColorStop(1,'#0f0');
		my_gradient.addColorStop(0.5,'#ff0');
		my_gradient.addColorStop(0,'#f00');
		ctx.fillStyle = my_gradient;

  		for(var i = 0; i < meterNum; i++){
  			var value = array[i * step];
  			ctx.fillRect(i*12, that.height-value-4, meterWidth, that.height);
  		}

  		requestAnimationFrame(animateDraw);
  	};
  	requestAnimationFrame(animateDraw);
  },

  updateInfo : function(text,theType){
  	var oText = document.getElementById('msg');
  	if(theType){  //参数为true  加载...动画
  		var dot ='...',
  			i = 0,
  			that = this;
  		var text = text + dot.substring(0,i++);

  		if(that.timer !== null){
  			clearTimeout(that.timer);
  		}

  		var animateDot = function(){
  			if(i > 3){
  				i = 0;
  			}
  			text = text +dot.substring(0,i++);
  			that.timer = setTimeout(animateDot,250);
  		}

  		this.timer = setTimeout(animateDot,250);
  	}
  	oText.innerHTML = text;
  }

}

