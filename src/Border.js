Pen.define('Pen.Border', {
	statics: {
		detect: function(e1, e2) {
			if (e1 instanceof Pen.CircleBorder && e2 instanceof Pen.CircleBorder) {
				return Pen.Util.distance(e1.x, e1.y, e2.x, e2.y) <= Math.abs(e1.r - e2.r);
			}
			else if (e1 instanceof Pen.CircleBorder && e2 instanceof Pen.PolygonBorder) {

			}
			else if (e1 instanceof Pen.PolygonBorder && e2 instanceof Pen.CircleBorder) {
				return Pen.Border.detect(e2, e1);
			}
			else {

			}
		}
	}
});

Pen.define('Pen.CircleBorder', {
	extend: Pen.Border,
	x: 0,
	y: 0,
	r: 10,

	statics: {
		make: function(x, y, r) {
			var border = new Pen.CircleBorder();
			border.x = x;
			border.y = y;
			border.r = r;

			return border;
		}
	}
});

Pen.define('Pen.PolygonBorder', {
	extend: Pen.Border,
	points: [],

	statics: {
		make: function() {
			var border = new Pen.PolygonBorder();

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