/**
 * 用于碰撞检测。
 * 碰撞是指两个图形存在重合部分，包括部分重合或一个在另一个的内部。
 */

(function() {

    /**
     * 测试圆和多边形是否碰撞。
     * 算法：首先检测多边形的所有顶点是否在圆内部或圆上，如果存在这样的顶点，则说明发生碰撞；
     * 如果所有顶点都不在圆内部或圆上，那么再检测圆心到多边形所有边的距离，如果存在小于或等于半径的情况，则说明发生碰撞；
     * 如果所有距离都大于半径，那么再检测圆心是否在多边形内，如果是则发生碰撞，否则没有。
     */
    function detectCircleAndPolygon(cBox, pBox) {
        var len = pBox.length;
        var x0 = cBox[0][0], y0 = cBox[0][1], r = cBox[0][2];

        // 检测多边形的所有顶点是否在圆内部或圆上
        var i, p;
        for (i = 0; i < len; i++) {
            p = pBox[i];
            if (Pen.Util.checkDotInCircle(p[0], p[1], x0, y0, r) <= 0) { return true; }
        }

        // 检测圆心到多边形所有边的距离是否小于或等于半径
        var j, p1, p2;
        for (j = 0; j < len; j++) {
            p1 = pBox[j];
            p2 = pBox[(j + 1) % len];

            if (Pen.Util.distanceOfPointAndLine(x0, y0, p1[0], p1[1], p2[0], p2[1]) <= r) { return true; }
        }

        // 检测圆心是否在多边形内
        return Pen.Util.checkDotInPolygon(x0, y0, pBox) <= 0;
    }

    /**
     * 测试两个圆是否碰撞。
     * 算法：如果两个圆心的距离小于或等于它们的半径的和，则发生碰撞。
     */
    function detectCircles(box1, box2) {
        var x1 = box1[0][0], y1 = box1[0][1], r1 = box1[0][2];
        var x2 = box2[0][0], y2 = box2[0][1], r2 = box2[0][2];

        return Pen.Util.distance(x1, y1, x2, y2) <= Math.abs(r1 + r2);
    }

    /**
     * 测试两个多边形是否碰撞。
     * 算法：首先检测两个多边形是否存在相交的边，如果有则说明发生碰撞；
     * 如果没有相交的边，说明两个多边形相离或包含，那么再从其中一个多边形中任取一个顶点，检测此顶点是否在另一个多边形内：
     * 如果是则说明是包含关系，发生碰撞；如果不是，则说明是相离关系，没有发生碰撞。
     */
    function detectPolygons(box1, box2) {
        var len1 = box1.length, len2 = box2.length;

        // 检测两个多边形是否存在相交的边
        var i, j, x1, y1, x2, y2, x3, y3, x4, y4;
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

                if (Pen.Util.isLineSegmentIntersectant(x1, y1, x2, y2, x3, y3, x4, y4)) { return true; }
            }
        }

        if (Pen.Util.checkDotInPolygon(box1[0][0], box1[0][1], box2) <= 0) { return true; }
        if (Pen.Util.checkDotInPolygon(box2[0][0], box2[0][1], box1) <= 0) { return true; }

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

            /**
             * 碰撞检测。
             * 目前支撑两种类型的Box：
             *  1. 圆形盒：[[x, y, r]]
             *  2. 多边形盒：[[x1, y1], [x2, y2], ...]
             */
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