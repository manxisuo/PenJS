(function(window) {
	/**
	 * 形状。
	 */
	var Shape = Pen.define(Sprite, {});

	/**
	 * 圆角矩形
	 */
	var RoundRect = Pen.define(Shape, {
		// 位置和尺寸。
		x: 50,
		y: 50,
		w: 50,
		h: 30,

		// 四个角的半径。lt：左上；rt：右上；rb：右下；lb：左下。
		corner: {
			lt: 5,
			rt: 5,
			rb: 5,
			lb: 5
		},

		FILL_COLOR: null,
		BORDER_COLOR: '#D1D1D1',

		// 填充颜色和边框颜色
		fillColor: null,
		borderColor: null,

		init: function() {
			var me = this;
			me.callParent('init');

			me.FILL_COLOR = brush.createGradient(0, 0, 0, this.h).addStop({
				0: '#FFFFFF',
				1: '#E7E7E7'
			}).make();

			me.fillColor = me.FILL_COLOR;
			me.borderColor = me.BORDER_COLOR;
		},

		draw: function(brush, dt) {
			var me = this;

			brush.roundRect(me.x, me.y, me.w, me.h, me.corner).fill(me.fillColor).stroke(
					me.borderColor);
		},

		checkInside: function(px, py) {
			var me = this;
			var x = me.x, y = me.y, w = me.w, h = me.h;
			var lt = me.corner.lt, rt = me.corner.rt;
			var rb = me.corner.rb, lb = me.corner.lb;
			var PI = Math.PI;

			var x$p = px - x, y$p = py - y;
			var x$lt = -w / 2 + lt, y$lt = -h / 2 + lt;
			var x$rt = w / 2 - rt, y$rt = -h / 2 + rt;
			var x$rb = w / 2 - rb, y$rb = h / 2 - rb;
			var x$lb = -w / 2 + lb, y$lb = h / 2 - lb;

			var chk1 = Util.isDotInFan(x$p, y$p, x$lt, y$lt, lt, -PI, -PI / 2, true);
			var chk2 = Util.isDotInFan(x$p, y$p, x$rt, y$rt, rt, -PI / 2, 0, true);
			var chk3 = Util.isDotInFan(x$p, y$p, x$rb, y$rb, rb, 0, PI / 2, true);
			var chk4 = Util.isDotInFan(x$p, y$p, x$lb, y$lb, lb, PI / 2, PI, true);

			var chk11 = Util.isDotInRect(x$p, y$p, x$lt / 2, y$lt / 2, lt, lt, true);
			var chk21 = Util.isDotInRect(x$p, y$p, x$rt / 2, y$rt / 2, rt, rt, true);
			var chk31 = Util.isDotInRect(x$p, y$p, x$rb / 2, y$rb / 2, rb, rb, true);
			var chk41 = Util.isDotInRect(x$p, y$p, x$lb / 2, y$lb / 2, lb, lb, true);

			var chk = Util.isDotInRect(x$p, y$p, 0, 0, w, h, true);

			return (chk && !chk11 & !chk21 & !chk31 & !chk41) || chk1 || chk2 || chk3 || chk4;
		}
	});

	/**
	 * 折线。指可以将两个点链接起来的三条垂直或水平线段组成的折线。
	 */
	var Polyline = Pen.define(Shape, {
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
			var me = this;

			brush.tmp(function() {
				brush.setStrokeStyle(me.color);
				brush.setLineWith(me.width);
				brush.beginPath();
				brush.moveTo(me.startX, me.startY);
				if (me.type == Polyline.X) {
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

	window.Pen.Shape = Shape;
	window.Pen.RoundRect = RoundRect;
	window.Pen.Polyline = Polyline;
})(window);