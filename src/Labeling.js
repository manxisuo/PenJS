Pen.require(['Pen.Util'], function() {

    /**
     * 用于混入的类。
     * 给Sprite加标签。
     */
    Pen.define('Pen.Labeling', {

        // 标签的文字
        label: '',

        // 标签的字体
        labelFont: '12px sans-serif',

        // 标签的颜色
        labelColor: '#000000',

        // 标签的文字的大小
        labelSize: 12,

        // 绘制标签
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
});