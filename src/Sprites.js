/**
 * 图片。
 */
Pen.define('Pen.sprite.Image', {
	extend: Pen.Sprite,
	draw: function(brush) {
		var me = this;
		brush.trans(me, function() {
			brush.image(me.image, me.x, me.y, me.w, me.h);
		}, me);
	},
	checkInside: function(x, y) {
		var me = this, brush = me.stage.brush;
		brush.trans(me, function() {
			brush.rect(me.x, me.y, me.w, me.h);
		}, me);

		return brush.isPointInPath(x, y);
	},
});

/**
 * 文字。
 */
Pen.define('Pen.sprite.Text', {
	extend: Pen.Sprite,
	text: '',
	color: 'black',
	fontSize: 12,
	font: '12px sans-serif',
	draw: function(brush) {
		var me = this;

		brush.trans(me, function() {
			if (me.fontSize) {
				me.font = me.font.replace(/[0-9]+px/, Math.round(me.fontSize) + 'px');
			}
			brush.fillTextWithColor(me.text, me.x, me.y, me.color, me.font);
		});
	}
});

/**
 * 圆形。
 */
Pen.define('Pen.sprite.Circle', {
	extend: Pen.Sprite,
	mixins: {
		labeling: Pen.Labeling
	},
	x: 100,
	y: 100,
	r: 50,
	strokeColor: '#000000',
	fillColor: '#000000',

	draw: function(brush) {
		var me = this;
		brush.trans(me, function() {
			brush.circle(me.x, me.y, me.r);
			if (me.strokeColor) {
				brush.stroke(me.strokeColor);
			}
			if (me.fillColor) {
				brush.fill(me.fillColor);
			}
			me.drawLabel(brush);
		});
	}
});

/**
 * 椭圆。
 * 
 * 注：椭圆的scaleX和scaleY属性无效。
 */
Pen.define('Pen.sprite.Ellipse', {
	extend: Pen.Sprite,
	mixins: {
		labeling: Pen.Labeling
	},
	x: 100,
	y: 100,
	r1: 50,
	r2: 30,
	strokeColor: '#000000',
	fillColor: '#000000',

	draw: function(brush) {
		var me = this;

		me.scaleX = 1;
		me.scaleY = 1;

		brush.trans(me, function() {
			if (me.r1 != 0 && me.r1 != me.r2) {
				brush.scale(1, me.r2 / me.r1);
			}
			brush.circle(0, 0, me.r1);

			if (me.strokeColor) {
				brush.stroke(me.strokeColor);
			}
			if (me.fillColor) {
				brush.fill(me.fillColor);
			}
			me.drawLabel(brush);
		});
	}
});

/**
 * 矩形。
 */
Pen.define('Pen.sprite.Rect', {
	extend: Pen.Sprite,
	mixins: {
		labeling: Pen.Labeling
	},
	x: 100,
	y: 100,
	w: 50,
	h: 30,
	strokeColor: '#000000',
	fillColor: '#000000',

	draw: function(brush) {
		var me = this;
		brush.trans(me, function() {
			brush.rect(me.x, me.y, me.w, me.h);
			if (me.strokeColor) {
				brush.stroke(me.strokeColor);
			}
			if (me.fillColor) {
				brush.fill(me.fillColor);
			}
			me.drawLabel(brush);
		});
	},

	checkInside: function(x, y) {
		var me = this, brush = me.stage.brush;
		brush.trans(me, function() {
			brush.rect(me.x, me.y, me.w, me.h);
		}, me);

		return brush.isPointInPath(x, y);
	}
});

/**
 * 多边形。
 */
Pen.define('Pen.sprite.Polygon', {
	extend: Pen.Sprite,

	// 多边形的顶点。坐标是相对于多边形的(x, y)的相对坐标。
	// 参数格式：[[x1, y1], [x2, y2], [x3, y3]...]
	points: [],

	strokeColor: '#000000',
	fillColor: '#000000',

	addPoint: function(x, y) {
		this.points.push([x, y]);
	},

	draw: function(brush) {
		var me = this, points = me.points, len = points.length;
		var i, p;

		brush.trans(me, function() {
			brush.beginPath();
			for (i = 0; i < len; i++) {
				p = points[i];
				if (i == 0) {
					brush.moveTo(p[0], p[1]);
				}
				else {
					brush.lineTo(p[0], p[1]);
				}
			}
			brush.closePath();

			if (me.strokeColor) {
				brush.stroke(me.strokeColor);
			}
			if (me.fillColor) {
				brush.fill(me.fillColor);
			}
		});
	}
});
