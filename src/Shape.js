(function(window, Pen) {
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

        // 四个角的半径。可以是数字(四个角的半径相同)或数组(依次为左上、右上、右下、左下的角的半径)。
        corners: [5, 5, 5, 5],

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

            // 初始化填充色和边框色
            me.fillColor = me.self.FILL_COLOR;
            me.borderColor = me.self.BORDER_COLOR;

            // 初始化文本
            if (me.text != null && me.text !== '') {
                me._initText();
            }
        },

        _initText: function() {
            var me = this;
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
            div.appendTo($(me.stage.canvas).parent());
            me._textDiv = div;
        },

        _drawText: function() {
            var me = this;

            if (me._textDiv == null) {
                me._initText();
            }

            var text = me.text, div = me._textDiv, cs = me.corners;

            if (text && Pen.Util.trim(text)) {
                var padding = Pen.Util.isNumber(cs) ? cs : Pen.Util.maxArrayItem(cs);
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
            var me = this, brush = me.stage.brush;
            brush.roundRect(me.x, me.y, me.w, me.h, me.corners);

            return brush.isPointInPath(px, py);
        },
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
})(window, Pen);