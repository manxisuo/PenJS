(function() {
    /**
     * 判断两条线段(线段x1,y1---x2,y2和线段x3,y3---x4,y4)是否相交。
     */
    function isLineSegmentIntersectant(x1, y1, x2, y2, x3, y3, x4, y4) {
        var p = Pen.Util.twoLinesIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
        if (null !== p) {
            var c1 = p.x >= x1 && p.x <= x2 || p.x >= x2 && p.x <= x1;
            var c2 = p.y >= y1 && p.y <= y2 || p.y >= y2 && p.y <= y1;
            var c3 = p.x >= x3 && p.x <= x4 || p.x >= x4 && p.x <= x3;
            var c4 = p.y >= y3 && p.y <= y4 || p.y >= y4 && p.y <= y3;

            if (c1 && c2 && c3 && c4) { return true; }
        }

        return false;
    }

    function detectCircleAndPolygon(cBox, pBox) {
        var points = pBox.points, len = points.length;
        var x0 = cBox.x, y0 = cBox.y, r = cBox.r;
        var i, p1, p2, d;
        for (i = 0; i < len; i++) {
            p1 = points[i];
            p2 = points[(i + 1) % len];

            d = Pen.Util.distanceOfPointAndLine(x0, y0, p1[0], p1[1], p2[0], p2[1]);

            if (d <= r) {
                if (Pen.Util.distance(x0, y0, p1[0], p1[1]) <= r || Pen.Util.distance(x0, y0, p2[0], p2[1]) <= r) {
                    return true;
                }
                else {
                    foot = Pen.Util.getFootPoint(x0, y0, p1[0], p1[1], p2[0], p2[1]);
                    if (foot.x >= Pen.Util.min(p1[0], p2[0]) && foot.x <= Pen.Util.max(p1[0], p2[0])) {
                        if (foot.y >= Pen.Util.min(p1[1], p2[1]) && foot.y <= Pen.Util.max(p1[1], p2[1])) { return true; }

                    }
                }
            }
        }

        return false;
    }

    function detectCircles(box1, box2) {
        return Pen.Util.distance(box1.x, box1.y, box2.x, box2.y) <= Math.abs(box1.r + box2.r);
    }

    /**
     * 检测两个多边形的Box是否相交。
     */
    function detectPolygons(box1, box2) {
        var points1 = box1.points, points2 = box2.points;
        var len1 = points1.length, len2 = points2.length;

        var i, j, x1, y1, x2, y2, x3, y3, x4, y4, intersectant;
        for (i = 0; i < len1; i++) {
            x1 = points1[i][0];
            y1 = points1[i][1];
            x2 = points1[(i + 1) % len1][0];
            y2 = points1[(i + 1) % len1][1];

            for (j = 0; j < len2; j++) {
                x3 = points2[j][0];
                y3 = points2[j][1];
                x4 = points2[(j + 1) % len2][0];
                y4 = points2[(j + 1) % len2][1];

                intersectant = isLineSegmentIntersectant(x1, y1, x2, y2, x3, y3, x4, y4);
                if (intersectant) { return true; }
            }
        }

        return false;
    }

    function getCircleBox(sprite) {
        var box = Pen.clone(sprite.box, true);
        box.x += sprite.x;
        box.y += sprite.y;
        return box;
    }

    function getPolygonBox(sprite) {
        var box = Pen.clone(sprite.box, true);
        var i, points = box.points;
        for (i = points.length - 1; i >= 0; i--) {
            points[i][0] += sprite.x;
            points[i][1] += sprite.y;
        }
        return box;
    }

    Pen.define('Pen.Box', {
        statics: {
            detect: function(sp1, sp2) {
                var collided = false;

                var box1 = sp1.box, box2 = sp2.box;

                if (box1 instanceof Pen.CircleBox && box2 instanceof Pen.CircleBox) {
                    collided = detectCircles(getCircleBox(sp1), getCircleBox(sp2));
                }
                else if (box1 instanceof Pen.CircleBox && box2 instanceof Pen.PolygonBox) {
                    collided = detectCircleAndPolygon(getCircleBox(sp1), getPolygonBox(sp2));
                }
                else if (box1 instanceof Pen.PolygonBox && box2 instanceof Pen.CircleBox) {
                    collided = detectCircleAndPolygon(getCircleBox(sp2), getPolygonBox(sp1));
                }
                else if (box1 instanceof Pen.PolygonBox && box2 instanceof Pen.PolygonBox) {
                    collided = detectPolygons(getPolygonBox(sp1), getPolygonBox(sp2));
                }

                return collided;
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
                var box = new Pen.CircleBox();
                box.x = x;
                box.y = y;
                box.r = r;

                return box;
            }
        }
    });

    Pen.define('Pen.PolygonBox', {
        extend: Pen.Box,
        points: [],
        statics: {
            make: function(points) {
                var box = new Pen.PolygonBox();
                if (points) {
                    box.points = points;
                }

                return box;
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

})();