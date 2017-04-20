!function() {
	var the_canvas = document.createElement("canvas"), //画布
		config = {
			line:false,
			l: 'star',
			z: -1, //z-index
			o: 0.5, //opacity
			g: 0.01,
			n: 2,
			c: "47,135,193" //color
		},//配置
		random_lines = [], canvas_width, canvas_height,
		current_point = {
			p:'point',
			x:null,
			y:null
		};//当前点
	//封装方法，压缩之后减少文件大小
	function get_attribute(node, attr, default_value) {
		return node.getAttribute(attr) || default_value;
	}
	//封装方法，压缩之后减少文件大小
	function get_by_tagname(name) {
		return document.getElementsByTagName(name);
	}
	function get_by_id(id) {
		return document.getElementById(id);
	}
	//获取配置参数
	function get_config_option() {
		var r = parseInt(get_by_id('radius').value,10) || 0;
		if(typeof r === 'number'){
			var m1 = r*r*r;
			current_point.r = r;
			current_point.m = m1;
			current_point.max = m1*m1;
		}
		config.p = get_by_id('own').checked;
		config.n = get_by_id('count').value||2; //count
		config.g = parseFloat(get_by_id('g').value) || 0.01;
		config.line = get_by_id('line').checked;
		//随机生成config.n条线位置信息
		for (random_lines = [], i = 0; config.n > i; i++) {
			random_lines.push(creatStar());
		}
	}
	var creatStar = function(){
		var random = Math.random,
			x = random() * canvas_width, //随机位置
			y = random() * canvas_height,
			xa = 2 * random() - 1, //随机运动方向
			ya = 2 * random() - 1,
			ran = random(),
			ran_c = Math.round(ran*255),
			r = ran*10+0.5,
			m = r*r*r;
		return {
			c: 'rgb('+ran_c+','+ran_c+','+ran_c+')',
			r: r,
			x: x,
			y: y,
			xa: xa,
			ya: ya,
			m : m,
			max: m*m //沾附距离
		}
	};
	set_canvas_size(),window.onresize = set_canvas_size;
	get_config_option();
	//设置canvas的高宽
	function set_canvas_size() {
		canvas_width = the_canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, 
		canvas_height = the_canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	}
	function run(star1, star2){
		var G = config.g,
			x = star1.x - star2.x,
			y = star1.y - star2.y,
			r2 = x*x + y*y;
		if(r2 < (star1.r+star2.r)*(star1.r+star2.r)){
			r2 = (star1.r+star2.r)*(star1.r+star2.r);
		}
		var	k1 = Math.sqrt(G*star2.m)/r2,
			k2 = Math.sqrt(G*star1.m)/r2;
		star1.xa -= x*k1,star1.ya -= y*k1;
		star2.xa += x*k2,star2.ya += y*k2;
	};
	//绘制过程
	function draw_canvas() {
		context.clearRect(0, 0, canvas_width, canvas_height);
		//随机的线条和当前位置联合数组
		var i,j,e1,e2,all_array = [current_point].concat(random_lines),l=all_array.length;
		
		all_array.forEach(function(r) {
			if(!r.p){
				r.x += r.xa, 
				r.y += r.ya, //移动
				r.xa *= r.x > canvas_width || r.x < 0 ? -1 : 1, 
				r.ya *= r.y > canvas_height || r.y < 0 ? -1 : 1; //碰到边界，反向反弹
//				context.fillRect(r.x - r.r, r.y - r.r, r.r*2, r.r*2); //绘制一个宽高为r的点
				//画圆
				context.beginPath();
	            context.arc(r.x,r.y,r.r,0,2*Math.PI,true);
	           	context.fill();
			}else if(config.p){
				context.beginPath();
	            context.arc(r.x,r.y,r.r,0,2*Math.PI,true);
	           	context.fill();
			}
		});
		for(i=0;i<l;i++){
			e1 = all_array[i];
			if(!e1.x || !e1.y || (!config.p && e1.p)){
				continue;
			}
			for(j=i+1;j<l;j++){
				e2 = all_array[j];
				run(e1,e2);
				//不是当前点
				if (config.line && e1 !== e2 && null !== e2.x && null !== e2.y) {
						x_dist = e1.x - e2.x, //x轴距离 l
						y_dist = e1.y - e2.y, //y轴距离 n
						dist = x_dist * x_dist + y_dist * y_dist; //总距离, m
					if(Math.max(e1.m,e2.m)*config.g > dist*0.0001){
						context.beginPath();
						context.lineWidth = 1; 
						context.strokeStyle = "rgba(" + config.c + "," + 0.5 + ")";
						context.moveTo(e1.x, e1.y); 
						context.lineTo(e2.x, e2.y);
						context.stroke();
					}
				}
			}
		}
		frame_func(draw_canvas);
//		window.setTimeout(draw_canvas, 1000/60);
	}
	//创建画布，并添加到body中
	var canvas_id = "c_n" + config.l, //canvas id
		context = the_canvas.getContext("2d"), 
		frame_func = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(func) {
			window.setTimeout(func, 1000/40);
		};
	
	get_by_id('reset').onclick = function(){
		get_config_option();
	};
	the_canvas.id = canvas_id;
	the_canvas.style.cssText = "position:fixed;top:0;left:0;z-index:" + config.z + ";opacity:" + config.o;
	get_by_tagname("body")[0].appendChild(the_canvas);
	
	
	//当时鼠标位置存储，离开的时候，释放当前位置信息
	window.onmousemove = function(e) {
		e = e || window.event, current_point.x = e.clientX, current_point.y = e.clientY;
	}, window.onmouseout = function() {
		current_point.x = null, current_point.y = null;
	};
	//0.1秒后绘制
	setTimeout(function() {
		draw_canvas();
	}, 100);
}();