Pen.define('Pen.Box', {
    statics: {
        detect: function(e1, e2) {
            if (e1 instanceof Pen.CircleBox && e2 instanceof Pen.CircleBox) {
                return Pen.Util.distance(e1.x, e1.y, e2.x, e2.y) <= Math.abs(e1.r - e2.r);
            }
            else if (e1 instanceof Pen.CircleBox && e2 instanceof Pen.PolygonBox) {

            }
            else if (e1 instanceof Pen.PolygonBox && e2 instanceof Pen.CircleBox) {
                return Pen.Box.detect(e2, e1);
            }
            else {

            }
        }
    }
});

Pen.define('Pen.CircleBox', {
    extend: Pen.Box,
    x: 0,
    y: 0,
    r: 10,

    statics: {
        make: function(x, y, r) {
            var border = new Pen.CircleBox();
            border.x = x;
            border.y = y;
            border.r = r;

            return border;
        }
    }
});

Pen.define('Pen.PolygonBox', {
    extend: Pen.Box,
    points: [],

    statics: {
        make: function() {
            var border = new Pen.PolygonBox();

            return border;
        }
    },

    addPoint: function(x, y) {
        this.points.push({
            x: x,
            y: y
        });

        return this;
    }
});