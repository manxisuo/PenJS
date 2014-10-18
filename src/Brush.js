(function(window) {

	var Brush = Pen.define('Pen.Brush', {
		canvas: null,

		init: function() {
			this.ctx = this.canvas.getContext('2d');
		}
	});

	/**
	 * 新建子路径。即将移动画笔到某个位置.
	 */
	Brush.prototype.moveTo = function(x, y) {
		this.ctx.moveTo(x, y);

		return this;
	};

	/**
	 * 在当前子路径中增加一条直线。
	 */
	Brush.prototype.lineTo = function(x, y) {
		this.ctx.lineTo(x, y);

		return this;
	};

	/**
	 * 在当前子路径中增加一条二次贝塞尔曲线。
	 */
	Brush.prototype.quadraticCurveTo = function(cp1x, cp1y, x, y) {
		this.ctx.quadraticCurveTo(cp1x, cp1y, x, y);

		return this;
	};

	/**
	 * 在当前子路径中增加一条三次贝塞尔曲线。
	 */
	Brush.prototype.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
		this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);

		return this;
	};

	/**
	 * 描边当前路径(中的所有子路径)。
	 */
	Brush.prototype.stroke = function(style) {
		this.tmp(function() {
			this.setStrokeStyle(style);
			this.ctx.stroke();
		});

		return this;
	};

	/**
	 * 填充当前路径(中的所有子路径)。
	 */
	Brush.prototype.fill = function(style) {
		this.tmp(function() {
			this.setFillStyle(style);
			this.ctx.fill();
		});

		return this;
	};

	/**
	 * 画直线。 需要接着调stroke方法描出直线。
	 */
	Brush.prototype.line = function(x1, y1, x2, y2) {
		var ctx = this.ctx;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.closePath();

		return this;
	};

	/**
	 * 画圆。 需要接着调stroke或fill方法描出或填充圆。
	 */
	Brush.prototype.circle = function(x, y, r) {
		var ctx = this.ctx;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2, true);
		ctx.closePath();

		return this;
	};

	/**
	 * 画矩形.
	 */
	Brush.prototype.rect = function(x, y, w, h) {
		var ctx = this.ctx;
		ctx.beginPath();
		ctx.rect(x - w / 2, y - h / 2, w, h);
		ctx.closePath();

		return this;
	};

	/**
	 * 画圆角矩形。
	 */
	Brush.prototype.roundRect = function(x, y, w, h, corner) {

		var corners = corner;
		if (Pen.Util.isNumber(corner)) {
			corners = {
				lt: corner,
				rt: corner,
				rb: corner,
				lb: corner
			};
		}

		corners = Pen.copy({
			lt: 0,
			rt: 0,
			rb: 0,
			lb: 0
		}, corners);

		var size = Pen.Util.min(w / 2, h / 2);

		for ( var p in corners) {
			if (corners[p] > size) {
				corners[p] = size;
			}
		}

		var lt = corners.lt, rt = corners.rt, rb = corners.rb, lb = corners.lb;
		var PI = Math.PI;

		ctx.save();
		ctx.translate(x, y);

		ctx.beginPath();

		ctx.moveTo(-w / 2, -h / 2 + lt);
		if (lt > 0) {
			ctx.arc(-w / 2 + lt, -h / 2 + lt, lt, -PI, -PI / 2);
		}

		ctx.lineTo(w / 2 - rt, -h / 2);
		if (rt > 0) {
			ctx.arc(w / 2 - rt, -h / 2 + rt, rt, -PI / 2, 0);
		}

		ctx.lineTo(w / 2, h / 2 - rb);
		if (rb > 0) {
			ctx.arc(w / 2 - rb, h / 2 - rb, rb, 0, PI / 2);
		}

		ctx.lineTo(-w / 2 + lb, h / 2);
		if (lb > 0) {
			ctx.arc(-w / 2 + lb, h / 2 - lb, lb, PI / 2, PI);
		}

		ctx.lineTo(-w / 2, -h / 2 + lt);

		ctx.closePath();

		ctx.restore();

		return this;
	};

	/**
	 * 描边文字.
	 */
	Brush.prototype.strokeText = function(text, x, y, font) {
		var ctx = this.ctx;
		this.tmp(function() {
			if (font)
				ctx.font = font;
			ctx.strokeText(text, x - size.width / 2, y + size.height / 2 - size.height * 3 / 16);
		});

		return this;
	};

	/**
	 * 描边指定颜色的文字.
	 */
	Brush.prototype.strokeTextWithColor = function(text, x, y, color, font) {
		var ctx = this.ctx;
		this.tmp(function() {
			if (font)
				ctx.font = font;
			ctx.strokeStyle = color;
			ctx.strokeText(text, x, y);
		});

		return this;
	};

	/**
	 * 填充文字.
	 */
	Brush.prototype.fillText = function(text, x, y, font) {
		var ctx = this.ctx;
		this.tmp(function() {
			if (font)
				ctx.font = font;
			ctx.fillText(text, x, y);
		});

		return this;
	};

	/**
	 * 填充指定颜色的文字.
	 */
	Brush.prototype.fillTextWithColor = function(text, x, y, color, font) {
		var ctx = this.ctx;
		this.tmp(function() {
			if (font) {
				ctx.font = font;
			}
			ctx.fillStyle = color;

			var size = Pen.DocUtil.getTextSize(text, ctx.font);
			ctx.fillText(text, x - size.width / 2, y + size.height / 2 - size.height * 3 / 16);
		});

		return this;
	};

	/**
	 * 备份上下文状态，并执行一个函数，然后还原上下文状态。
	 */
	Brush.prototype.tmp = function(fn, scope) {
		if (fn) {
			this.save();
			fn.apply(scope || this);
			this.restore();
		}
	};

	/**
	 * 清空画布内容.
	 */
	Brush.prototype.clear = function(style) {
		var ctx = this.ctx;

		if (style) {
			this.tmp(function() {
				ctx.fillStyle = style;
				ctx.rect(0, 0, this.canvas.width, this.canvas.height);
				ctx.fill();
			});
		}
		else {
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

		return this;
	};

	/**
	 * 设置填充样式.
	 */
	Brush.prototype.setFillStyle = function(style) {
		if (style)
			this.ctx.fillStyle = style;

		return this;
	};

	/**
	 * 设置描边样式.
	 */
	Brush.prototype.setStrokeStyle = function(style) {
		if (style)
			this.ctx.strokeStyle = style;

		return this;
	};

	/**
	 * 设置线宽.
	 */
	Brush.prototype.setLineWith = function(lineWidth) {
		if (lineWidth)
			this.ctx.lineWidth = lineWidth;

		return this;
	};

	/**
	 * 设置全家透明度.
	 */
	Brush.prototype.setAlpha = function(alpha) {
		if (alpha)
			this.ctx.globalAlpha = alpha;

		return this;
	};

	/**
	 * 画图. image, x, y是必选的. rotate是可选的. width和height要么同时提供, 要么同时不提供. 注意:
	 * x和y不是图片左上角的坐标, 是图片中心的坐标.
	 */
	Brush.prototype.image = function(image, x, y, width, height, rotate) {
		var ctx = this.ctx;
		var len = arguments.length;
		var w;
		var h;
		var angle = 0;

		ctx.save();

		if (len == 3 || len == 4) {
			w = image.width;
			h = image.height;
		}
		else {
			w = width;
			h = height;
		}

		ctx.translate(x, y);

		if (len == 4 || len == 6)
			angle = arguments[len - 1];

		if (angle != 0)
			ctx.rotate(angle);

		ctx.drawImage(image, -w / 2, -h / 2, w, h);

		ctx.restore();

		return this;
	};

	Brush.prototype.sliceImage = function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
		this.ctx.drawImage.apply(this.ctx, arguments);

		return this;
	};

	Brush.prototype.translate = function() {
		this.ctx.translate.apply(this.ctx, arguments);

		return this;
	};

	Brush.prototype.rotate = function() {
		this.ctx.rotate.apply(this.ctx, arguments);

		return this;
	};

	Brush.prototype.transform = function() {
		this.ctx.transform.apply(this.ctx, arguments);

		return this;
	};

	Brush.prototype.beginPath = function() {
		this.ctx.beginPath.apply(this.ctx, arguments);

		return this;
	};

	Brush.prototype.closePath = function() {
		this.ctx.closePath.apply(this.ctx, arguments);

		return this;
	};

	Brush.prototype.save = function() {
		this.ctx.save.apply(this.ctx, arguments);

		return this;
	};

	Brush.prototype.restore = function() {
		this.ctx.restore.apply(this.ctx, arguments);

		return this;
	};

	Brush.prototype.isPointInPath = function(x, y) {
		return this.ctx.isPointInPath(x, y);
	};

	/**
	 * 创建一个渐进色对象。 
	 * 接收4个或6个参数，分别对应线性和圆形渐进色。
	 * 即(x1, y1, x2, y2)或(x1, y1, r1, x2, y2, r2)
	 */
	Brush.prototype.createGradient = function() {
		var args = [this];
		for ( var i in arguments) {
			args.push(arguments[i]);
		}

		var constructor = Function.prototype.bind.apply(Gradient, args);

		return new constructor(this.ctx);
	};

	function Gradient() {
		var x1, y1, r1, x2, y2, r2, ctx;
		if (arguments.length == 7) {
			x1 = arguments[0], y1 = arguments[1], r1 = arguments[2];
			x2 = arguments[3], y2 = arguments[4], r2 = arguments[5];
			ctx = arguments[6];

			this.gradient = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
		}
		else {
			x1 = arguments[0], y1 = arguments[1];
			x2 = arguments[2], y2 = arguments[3];
			ctx = arguments[4];

			this.gradient = ctx.createLinearGradient(x1, y1, x2, y2);
		}
	}

	/**
	 * 在渐进色中添加一个颜色。
	 * 接收两种类型的参数：(position, color)或({position1: color1, position2: color2})。
	 * 即单个添加或批量添加。
	 */
	Gradient.prototype.addStop = function() {
		if (arguments.length == 2) {
			var position = arguments[0], color = arguments[1];

			this.gradient.addColorStop(position, color);
		}
		else {
			var position, conf = arguments[0];
			for (position in conf) {
				this.gradient.addColorStop(position, conf[position]);
			}
		}

		return this;
	};

	/**
	 * 生成最终的渐进色。
	 */
	Gradient.prototype.make = function() {
		return this.gradient;
	};
})(window);