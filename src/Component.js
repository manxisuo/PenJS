(function(window) {
	var Component = Pen.define('Component', {
		extend: Pen.Sprite
	});

	var Button = Pen.define('Button', {
		extend: Component,
		FILL_COLOR: {
			NORMAL: null,
			HOVER: null,
			ACTIVE: null,
		},
		BORDER_COLOR: {
			NORMAL: '#D1D1D1',
			HOVER: '#B0CCF2',
			ACTIVE: '#9EBAE1',
		},
		fillColor: null,
		borderColor: null,
		text: '确定',
		font: '15px sans-serif',
		fontColor: 'black',
		x: 50,
		y: 50,
		w: 50,
		h: 30,

		roundRect: null,

		fixed: true,
		stoppable: false,

		_backupCursor: null,

		init: function() {
			var me = this;
			var brush = Pen.Global.stage.brush;

			me.callParent('init');

			me.roundRect = new Pen.RoundRect({
				corners: {
					lt: 5,
					rt: 5,
					rb: 5,
					lb: 5
				}
			});

			me.FILL_COLOR.NORMAL = brush.createGradient(0, 0, 0, this.h).addStop({
				0: '#FFFFFF',
				1: '#E7E7E7'
			}).make();

			me.FILL_COLOR.HOVER = brush.createGradient(0, 0, 0, this.h).addStop({
				0: '#E3F3FF',
				1: '#C5DBF5'
			}).make();

			me.FILL_COLOR.ACTIVE = brush.createGradient(0, 0, 0, this.h).addStop({
				0: '#B6CBE4',
				1: '#98C5F5'
			}).make();

			me.fillColor = me.FILL_COLOR.NORMAL;
			me.borderColor = me.BORDER_COLOR.NORMAL;

			me.on('click', function(e) {
			});

			me.on('mouseenter', function(e) {
				me.fillColor = me.FILL_COLOR.HOVER;
				me.borderColor = me.BORDER_COLOR.HOVER;
				me._backupCursor = Pen.Global.stage.canvas.style.cursor;

				Pen.Global.stage.canvas.style.cursor = 'pointer';
			});

			me.on('mouseleave', function(e) {
				me.fillColor = me.FILL_COLOR.NORMAL;
				me.borderColor = me.BORDER_COLOR.NORMAL;

				Pen.Global.stage.canvas.style.cursor = me._backupCursor;
			});

			me.on('mousedown', function() {
				me.fillColor = me.FILL_COLOR.ACTIVE;
				me.borderColor = me.BORDER_COLOR.ACTIVE;
			});

			me.on('mouseup', function() {
				me.fillColor = me.FILL_COLOR.HOVER;
				me.borderColor = me.BORDER_COLOR.HOVER;
			});

		},
		draw: function(brush, dt) {
			var me = this;
			Pen.copy(me.roundRect, {
				x: me.x,
				y: me.y,
				w: me.w,
				h: me.h,
				fillColor: me.fillColor,
				borderColor: me.borderColor
			});
			me.roundRect.draw(brush, dt);

			brush.fillTextWithColor(me.text, me.x, me.y, me.fontColor, me.font);
		},
		checkInside: function(ex, ey) {
			var me = this;
			return me.roundRect.checkInside(ex, ey);
		}
	});

	window.Pen.Component = Component;
	window.Pen.Button = Button;

})(window);