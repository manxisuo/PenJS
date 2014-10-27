/**
 * 图片。
 */
Pen.define('Pen.sprite.Image', {
	extend: Pen.Sprite,
	draw: function(brush) {
		var me = this;
		brush.tmp(function() {
			brush.translate(this.x, this.y);
			brush.rotate(this.angle);
			brush.image(this.image, 0, 0, this.w, this.h);
		}, me);
	},
	checkInside: function(x, y) {
		var me = this, brush = me.stage.brush;
		brush.tmp(function() {
			brush.translate(this.x, this.y);
			brush.rotate(this.angle);
			brush.rect(0, 0, this.w, this.h);
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
	fontSize: 10,
	font: '10px sans-serif',
	draw: function(brush) {
		var me = this;
		if (me.fontSize) {
			me.font = me.font.replace(/[0-9]+px/, Math.round(me.fontSize) + 'px');
		}
		brush.fillTextWithColor(me.text, me.x, me.y, me.color, me.font);
	}
});

/**
 * 多边形。
 */
Pen.define('Pen.sprite.Polygon', {
	extend: Pen.Sprite,
	
	// 多边形的顶点
	points: [],
});
















