/**
 * 用于混入的类。
 * 给Sprite加标签。
 */
Pen.define('Pen.Labeling', {
	label: '',
	labelFont: '12px sans-serif',
	labelColor: '#000000',
	labelSize: 12,

	initLabel: function() {

	},

	drawLabel: function(brush) {
		var me = this;
		
		if (!Pen.Util.isStringEmpty(me.label) && me.x != undefined && me.y != undefined) {
			if (me.labelSize) {
				me.labelFont = me.labelFont.replace(/[0-9]+px/, Math.round(me.labelSize) + 'px');
			}
			
			brush.fillTextWithColor(me.label, me.x, me.y, me.labelColor, me.labelFont);
		}
	}
});