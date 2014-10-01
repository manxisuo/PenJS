(function(window) {
	/**
	 * 形状。
	 */
	Pen.define('Pen.Shape', {
		extend: Pen.Sprite
	});

	/**
	 * 圆角矩形
	 */
	Pen.define('Pen.RoundRect', {
		extend: Pen.Shape,

		// 位置和尺寸。
		x: 50,
		y: 50,
		w: 50,
		h: 30,

		// 四个角的半径。lt：左上；rt：右上；rb：右下；lb：左下。
		corners: {
			lt: 5,
			rt: 5,
			rb: 5,
			lb: 5
		},

		/**
		 * 如果设置了corner，则覆盖corners的设置。只在实例化时起作用。
		 * @type Number(v >= 0)
		 */
		corner: undefined,

		// 填充色和边框色
		fillColor: null,
		borderColor: null,

		// 文本
		text: '',
		textStyle: {},
		_textDiv: null,

		statics: {
			FILL_COLOR: '#E7E7E7',
			BORDER_COLOR: '#D1D1D1',
		},

		init: function() {
			var me = this;
			me.callParent('init');

			// 初始化圆角的半径
			if (me.corner !== undefined) {
				var c = me.corner;
				me.corners = {
					lt: c,
					rt: c,
					rb: c,
					lb: c
				};
			}

			// 初始化填充色和边框色
			me.fillColor = me.self.FILL_COLOR;
			me.borderColor = me.self.BORDER_COLOR;

			// 初始化文本
			var div = $('<div />');
			var css = {
				'postion': 'absolute',
				'word-wrap': 'break-word',
				'text-align': 'center',
				'vertical-align': 'middle',
				'overflow': 'hidden',
				'display': 'none'
			};
			Pen.copy(css, me.textStyle);
			div.css(css);
			div.addClass('pen-shape-text');
			div.appendTo($(Pen.Global.canvas).parent());
			me._textDiv = div;
		},

		_drawText: function() {
			var me = this, text = me.text, div = me._textDiv, cs = me.corners;

			if (text && Pen.Util.trim(text)) {
				var padding = Pen.Util.max(cs.lt, cs.rt, cs.rb, cs.lb);
				div.css({
					padding: padding + 'px',
					left: me.x - me.w / 2 + padding + 'px',
					top: me.y - me.h / 2 + padding + 'px',
					width: me.w - 2 * padding + 'px',
					height: me.h = 2 * padding + 'px',
				// 'line-height': me.h - 2 * padding + 'px'
				});
				div.text(me.text);

				div.show();
			}
			else {
				div.hide();
			}
		},

		draw: function(brush, dt) {
			var me = this;

			brush.roundRect(me.x, me.y, me.w, me.h, me.corners).fill(me.fillColor).stroke(
					me.borderColor);

			me._drawText();
		},

		checkInside: function(px, py) {
			var me = this;
			var x = me.x, y = me.y, w = me.w, h = me.h;
			var lt = me.corners.lt, rt = me.corners.rt;
			var rb = me.corners.rb, lb = me.corners.lb;
			var PI = Math.PI;

			var x$p = px - x, y$p = py - y;
			var x$lt = -w / 2 + lt, y$lt = -h / 2 + lt;
			var x$rt = w / 2 - rt, y$rt = -h / 2 + rt;
			var x$rb = w / 2 - rb, y$rb = h / 2 - rb;
			var x$lb = -w / 2 + lb, y$lb = h / 2 - lb;

			var chk1 = Pen.Util.isDotInFan(x$p, y$p, x$lt, y$lt, lt, -PI, -PI / 2, true);
			var chk2 = Pen.Util.isDotInFan(x$p, y$p, x$rt, y$rt, rt, -PI / 2, 0, true);
			var chk3 = Pen.Util.isDotInFan(x$p, y$p, x$rb, y$rb, rb, 0, PI / 2, true);
			var chk4 = Pen.Util.isDotInFan(x$p, y$p, x$lb, y$lb, lb, PI / 2, PI, true);

			var chk11 = Pen.Util.isDotInRect(x$p, y$p, x$lt / 2, y$lt / 2, lt, lt, true);
			var chk21 = Pen.Util.isDotInRect(x$p, y$p, x$rt / 2, y$rt / 2, rt, rt, true);
			var chk31 = Pen.Util.isDotInRect(x$p, y$p, x$rb / 2, y$rb / 2, rb, rb, true);
			var chk41 = Pen.Util.isDotInRect(x$p, y$p, x$lb / 2, y$lb / 2, lb, lb, true);

			var chk = Pen.Util.isDotInRect(x$p, y$p, 0, 0, w, h, true);

			return (chk && !chk11 & !chk21 & !chk31 & !chk41) || chk1 || chk2 || chk3 || chk4;
		}
	});

	/**
	 * 折线。指可以将两个点链接起来的三条垂直或水平线段组成的折线。
	 */
	Pen.define('Pen.Polyline', {
		extend: Pen.Shape,
		startX: 100,
		startY: 100,
		endX: 200,
		endY: 200,
		type: 1,

		// 中间线的坐标。
		center: 130,

		color: '#FF00FF',
		width: 2,

		statics: {
			// 中间线是水平方向的。
			X: 1,

			// 中间线是 竖直方向的。
			Y: 2
		},
		draw: function(brush, dt) {
			var me = this, self = me.self;

			brush.tmp(function() {
				brush.setStrokeStyle(me.color);
				brush.setLineWith(me.width);
				brush.beginPath();
				brush.moveTo(me.startX, me.startY);
				if (me.type == self.X) {
					brush.lineTo(me.startX, me.center);
					brush.lineTo(me.endX, me.center);
					brush.lineTo(me.endX, me.endY);
				}
				else {
					brush.lineTo(me.center, me.startY);
					brush.lineTo(me.center, me.endY);
					brush.lineTo(me.endX, me.endY);
				}

				brush.stroke();
			});
		}
	});
})(window);