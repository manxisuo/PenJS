(function(window) {
    /**
     * 组件类。
     */
    Pen.define('Pen.Component', {
        extend: Pen.Sprite
    });

    /**
     * 按钮。
     */
    Pen.define('Pen.Button', {
        extend: Pen.Component,
        mixins: {
            labeling: Pen.Labeling
        },

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
        label: '确定',
        // font: '15px sans-serif',
        // fontColor: 'black',
        x: 50,
        y: 50,
        w: 50,
        h: 30,
        corners: 5,
        borders: null,

        fixed: true,
        stoppable: false,

        _backupCursor: null,

        init: function() {
            var me = this;
            var brush = me.stage.brush;

            me.borders = new Pen.RoundRect({
                stage: me.stage
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
                me._backupCursor = me.stage.canvas.style.cursor;

                me.stage.canvas.style.cursor = 'pointer';
            });

            me.on('mouseleave', function(e) {
                me.fillColor = me.FILL_COLOR.NORMAL;
                me.borderColor = me.BORDER_COLOR.NORMAL;

                me.stage.canvas.style.cursor = me._backupCursor;
            });

            me.on('mousedown', 'touchstart', function() {
                me.fillColor = me.FILL_COLOR.ACTIVE;
                me.borderColor = me.BORDER_COLOR.ACTIVE;
            });

            me.on('mouseup', 'touchend', function() {
                me.fillColor = me.FILL_COLOR.HOVER;
                me.borderColor = me.BORDER_COLOR.HOVER;
            });

        },
        draw: function(brush, dt) {
            var me = this;
            Pen.copy(me.borders, {
                x: me.x,
                y: me.y,
                w: me.w,
                h: me.h,
                corners: me.corners,
                fillColor: me.fillColor,
                borderColor: me.borderColor
            });
            me.borders.draw(brush, dt);
            me.drawLabel(brush);
            // brush.fillTextWithColor(me.text, me.x, me.y, me.fontColor, me.font);
        },
        checkInside: function(ex, ey) {
            var me = this;
            return me.borders.checkInside(ex, ey);
        }
    });
})(window);