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
        var len = pBox.length;
        var x0 = cBox[0][0], y0 = cBox[0][1], r = cBox[0][2];
        var i, p1, p2, d;
        for (i = 0; i < len; i++) {
            p1 = pBox[i];
            p2 = pBox[(i + 1) % len];

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
        var x1 = box1[0][0], y1 = box1[0][1], r1 = box1[0][2];
        var x2 = box2[0][0], y2 = box2[0][1], r2 = box2[0][2];

        return Pen.Util.distance(x1, y1, x2, y2) <= Math.abs(r1 + r2);
    }

    /**
     * 检测两个多边形的Box是否相交。
     */
    function detectPolygons(box1, box2) {
        var len1 = box1.length, len2 = box2.length;

        var i, j, x1, y1, x2, y2, x3, y3, x4, y4, intersectant;
        for (i = 0; i < len1; i++) {
            x1 = box1[i][0];
            y1 = box1[i][1];
            x2 = box1[(i + 1) % len1][0];
            y2 = box1[(i + 1) % len1][1];

            for (j = 0; j < len2; j++) {
                x3 = box2[j][0];
                y3 = box2[j][1];
                x4 = box2[(j + 1) % len2][0];
                y4 = box2[(j + 1) % len2][1];

                intersectant = isLineSegmentIntersectant(x1, y1, x2, y2, x3, y3, x4, y4);
                if (intersectant) { return true; }
            }
        }

        return false;
    }

    function getCircleBox(sprite) {
        var box = Pen.clone(sprite.getBox());
        var x0 = box[0][0], y0 = box[0][1];
        var a = -sprite.angle;
        var p = Pen.Util.transformPoint(Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a), 0, 0, x0, y0);

        box[0][0] = p.x + sprite.x;
        box[0][1] = p.y + sprite.y;

        return box;
    }

    function getPolygonBox(sprite) {
        var box = Pen.clone(sprite.getBox());
        var i, x0, y0, x, y, a = -sprite.angle;

        var m11 = Math.cos(a), m12 = -Math.sin(a), m21 = Math.sin(a), m22 = Math.cos(a);

        for (i = box.length - 1; i >= 0; i--) {
            x = x0 = box[i][0], y = y0 = box[i][1];

            if (a != 0) {
                x = m11 * x0 + m21 * y0;
                y = m12 * x0 + m22 * y0;
            }

            box[i][0] = x + sprite.x;
            box[i][1] = y + sprite.y;
        }

        return box;
    }

    function isCircleBox(box) {
        return (null != box && box.length == 1 && box[0].length == 3);
    }

    function isPolyonBox(box) {
        return (null != box && box.length > 1);
    }

    Pen.define('Pen.Box', {
        statics: {
            detect: function(sp1, sp2) {
                var collided = false;

                var box1 = sp1.getBox(), box2 = sp2.getBox();

                // 圆形盒 & 圆形盒
                if (isCircleBox(box1) && isCircleBox(box2)) {
                    collided = detectCircles(getCircleBox(sp1), getCircleBox(sp2));
                }

                // 圆形盒 & 多边形盒
                else if (isCircleBox(box1) && isPolyonBox(box2)) {
                    collided = detectCircleAndPolygon(getCircleBox(sp1), getPolygonBox(sp2));
                }

                // 多边形盒 & 圆形盒
                else if (isPolyonBox(box1) && isCircleBox(box2)) {
                    collided = detectCircleAndPolygon(getCircleBox(sp2), getPolygonBox(sp1));
                }

                // 多边形盒 & 多边形盒
                else if (isPolyonBox(box1) && isPolyonBox(box2)) {
                    collided = detectPolygons(getPolygonBox(sp1), getPolygonBox(sp2));
                }

                return collided;
            }
        }
    });
})();