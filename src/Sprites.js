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

    getBox: function() {
        return Pen.PolygonBox.createRectBox(0, 0, this.w, this.h);
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
    mixins: {
        labeling: Pen.Labeling
    },
    draw: function(brush) {
        var me = this;
        brush.trans(me, function() {
            me.drawLabel(brush);
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
    },

    getBox: function() {
        return new Pen.CircleBox(0, 0, this.r);
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
 * 线段。
 */
Pen.define('Pen.sprite.Line', {
    extend: Pen.Sprite,
    x: 0,
    y: 0,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    strokeColor: '#000000',
    draw: function(brush) {
        var me = this;
        brush.trans(me, function() {
            brush.line(me.x1, me.y1, me.x2, me.y2).stroke(me.strokeColor);
        });
    },

    getBox: function() {
        return new Pen.PolygonBox([[this.x1, this.y1], [this.x2, this.y2]]);
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

    getBox: function() {
        return Pen.PolygonBox.createRectBox(0, 0, this.w, this.h);
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
    },

    getBox: function() {
        return new Pen.PolygonBox(this.points);
    }
});
