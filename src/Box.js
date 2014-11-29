/**
 * 用于碰撞检测。
 * 碰撞是指两个图形存在重合部分，包括部分重合或一个在另一个的内部。
 */

Pen.require(['Pen.Util'], function() {

    /**
     * 测试圆和多边形是否碰撞。
     * -1：包含；0：相交；1：相离。
     */
    function detectCircleAndPolygon(cBox, pBox) {
        var len = pBox.length;
        var x0 = cBox[0][0], y0 = cBox[0][1], r = cBox[0][2];

        // 检测多边形的所有顶点与圆的关系
        var inCircleNum = 0, outCircleNum = 0, check1;
        var i, p;
        for (i = 0; i < len; i++) {
            p = pBox[i];
            check1 = Pen.Util.checkDotInCircle(p[0], p[1], x0, y0, r);
            if (check1 == 0) {
                return 0;
            }
            else if (check1 < 0) {
                inCircleNum++;
            }
            else {
                outCircleNum++;
            }
        }

        if (outCircleNum === 0) { return -1; }

        if (inCircleNum > 0) { return 0; }

        // 检测圆心到多边形所有边的距离与半径的关系
        var j, p1, p2, d;
        for (j = 0; j < len; j++) {
            p1 = pBox[j];
            p2 = pBox[(j + 1) % len];
            d = Pen.Util.distanceOfPointAndLine(x0, y0, p1[0], p1[1], p2[0], p2[1]);
            if (d <= r) {
                var foot = Pen.Util.getFootPoint(x0, y0, p1[0], p1[1], p2[0], p2[1]);
                if (Pen.Util.isDotOnSegment(foot.x, foot.y, p1[0], p1[1], p2[0], p2[1])) { return 0; }
            }
        }

        // 检测圆心是否在多边形内
        return Pen.Util.checkDotInPolygon(x0, y0, pBox) < 0 ? -1 : 1;
    }

    /**
     * 测试两个圆是否碰撞。
     * -1：包含；0：相交；1：相离。
     */
    function detectCircles(box1, box2) {
        var x1 = box1[0][0], y1 = box1[0][1], r1 = box1[0][2];
        var x2 = box2[0][0], y2 = box2[0][1], r2 = box2[0][2];

        var d = Pen.Util.distance(x1, y1, x2, y2);

        if (d >= Math.abs(r1 - r2) && d <= r1 + r2) {
            return 0;
        }
        else if (d > r1 + r2) {
            return 1;
        }
        else {
            return -1;
        }
    }

    /**
     * 测试两个多边形是否碰撞。
     * -1：包含：0；相交；1：相离。
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

                if (Pen.Util.isLineSegmentIntersectant(x1, y1, x2, y2, x3, y3, x4, y4)) { return 0; }
            }
        }

        if (Pen.Util.checkDotInPolygon(box1[0][0], box1[0][1], box2) <= 0) { return -1; }
        if (Pen.Util.checkDotInPolygon(box2[0][0], box2[0][1], box1) <= 0) { return -1; }

        return 1;
    }

    function getCircleBox(cbox, sprite) {
        var box = [[cbox.x, cbox.y, cbox.r]];
        var a = -sprite.angle;
        var p = Pen.Util.transformPoint(Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a), 0, 0, cbox.x, cbox.y);

        box[0][0] = p.x + sprite.x;
        box[0][1] = p.y + sprite.y;

        return box;
    }

    function getPolygonBox(box, sprite) {
        var box = Pen.clone(box.points);
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
        return box instanceof Pen.CircleBox;
    }

    function isPolyonBox(box) {
        return box instanceof Pen.PolygonBox;
    }

    function isGroupBox(box) {
        return box instanceof Pen.GroupBox;
    }

    function _detect(box1, sp1, box2, sp2) {
        var collide = null, i, r;

        if (isGroupBox(box1)) {
            for (i in box1.boxes) {
                r = _detect(box1.boxes[i], sp1, box2, sp2);
                if (r <= 0) { return r; }
            }

            return 1;
        }

        if (isGroupBox(box2)) {
            var i;
            for (i in box2.boxes) {
                r = _detect(box1, sp1, box2.boxes[i], sp2);
                if (r <= 0) { return r; }
            }

            return 1;
        }

        // 圆形盒 & 圆形盒
        if (isCircleBox(box1) && isCircleBox(box2)) {
            collide = detectCircles(getCircleBox(box1, sp1), getCircleBox(box2, sp2));
        }

        // 圆形盒 & 多边形盒
        else if (isCircleBox(box1) && isPolyonBox(box2)) {
            collide = detectCircleAndPolygon(getCircleBox(box1, sp1), getPolygonBox(box2, sp2));
        }

        // 多边形盒 & 圆形盒
        else if (isPolyonBox(box1) && isCircleBox(box2)) {
            collide = detectCircleAndPolygon(getCircleBox(sp2), getPolygonBox(box1, sp1));
        }

        // 多边形盒 & 多边形盒
        else if (isPolyonBox(box1) && isPolyonBox(box2)) {
            collide = detectPolygons(getPolygonBox(box1, sp1), getPolygonBox(box2, sp2));
        }

        return collide;
    }

    Pen.define('Pen.Box', {
        statics: {

            /**
             * 碰撞检测。
             * 目前支撑两种类型的Box：
             *  圆形盒：[[x, y, r]]
             *  多边形盒：[[x1, y1], [x2, y2], ...]
             *  
             * 返回值：
             *  null：检测无效；
             *  -1：包含；
             *  0：相交；
             *  1：相离。
             */
            detect: function(sp1, sp2) {
                var box1 = sp1.getBox(), box2 = sp2.getBox();

                return _detect(box1, sp1, box2, sp2);
            }
        }
    });

    /**
     * 圆形盒。
     */
    Pen.define('Pen.CircleBox', {
        construct: function(x, y, r) {
            this.x = x;
            this.y = y;
            this.r = r;
        }
    });

    /**
     * 多边形盒。
     * points: [[x1, y1], [x2, y2], ...]
     */
    Pen.define('Pen.PolygonBox', {
        construct: function(points) {
            this.points = points;
        },
        statics: {
            createRectBox: function(x, y, w, h) {
                var points = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2],
                        [x - w / 2, y + h / 2]];
                return new Pen.PolygonBox(points);
            }
        }
    });

    /**
     * 盒列表。
     * @param boxes 基本盒(圆形盒或多边形盒)的数组
     */
    Pen.define('Pen.GroupBox', {
        construct: function(boxes) {
            this.boxes = boxes;
        }
    });
});