(function(window) {
    var Util = {};

    var PI = Math.PI;

    // 一个极小值
    var LITTLE = 1e-8;

    /**
     * 返回N个数中的最小值. 至少需要提供一个参数.
     */
    Util.min = function() {
        return Math.min.apply(Math, arguments);
    };

    /**
     * 返回N个数中的最大值. 至少需要提供一个参数.
     */
    Util.max = function() {
        return Math.max.apply(Math, arguments);
    };

    /**
     * 返回数组中的最小元素。
     */
    Util.minArrayItem = function(array) {
        return Math.min.apply(Math, array);
    };

    /**
     * 返回数组中的最大元素。
     */
    Util.maxArrayItem = function(array) {
        return Math.max.apply(Math, array);
    };

    /**
     * 返回指定范围内的一个随机数。
     * 包括start，不包括end。
     */
    Util.rndRange = function(start, end) {
        return Math.random() * (end - start) + start;
    };

    /**
     * 返回整数min和整数max之间的某个随机整数. 包括min和max.
     */
    Util.rndBetween = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * 返回指定的N个参数(类型任意)中的某一个。
     */
    Util.rndAmong = function(/* a1, a2, a3... */) {
        var index = this.rndBetween(0, arguments.length - 1);
        return arguments[index];
    };

    /**
     * 生成一个随机RGB颜色值。 例如："rgb(132, 75, 44)"
     */
    Util.rndRGB = function() {
        var r = this.rndBetween(0, 256);
        var g = this.rndBetween(0, 256);
        var b = this.rndBetween(0, 256);

        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    };

    /**
     * 在平面直角坐标系中，根据x和y方向的速度获取速度的方向角。 注：以X轴正半轴为起点，以朝Y轴正半轴的方向为角度增大的方向。
     * 
     * @param dx X轴方向的速度
     * @param dy Y轴方向的速度
     * @return 速度的方向角
     */
    Util.getAngle = function(dx, dy) {
        var angle;
        if (dx > 0) {
            if (dy >= 0)
                angle = Math.atan(dy / dx);
            else
                angle = Math.atan(dy / dx) + 2 * PI;
        }
        else if (dx == 0) {
            if (dy == 0)
                angle = 0;
            else
                angle = Math.atan(dy / dx);
            ;
        }
        else {
            angle = Math.atan(dy / dx) + PI;
        }

        return angle;
    };

    /**
     * 删除数组中的某个元素。
     * 
     * @param array 数组
     * @param value 待删除的元素
     * @param isGlobal true时，删除所有匹配的元素；否则，只删除第一个匹配的。
     */
    Util.removeArrayItem = function(array, value, isGlobal) {
        var indexList = [];
        array.every(function(v, idx) {
            if (v == value) {
                indexList.splice(0, 0, idx);

                if (isGlobal !== true) { return false; }
            }
            return true;
        });

        indexList.forEach(function(index) {
            array.splice(index, 1);
        });

        return indexList.length > 0;
    };

    /**
     * 四舍五入，并保留N位小数。 
     * 注：注意使用场景。如果是为了获取字符串结果的话，应该用Number.prototype.toFixed。
     * 参考Number.prototype.toFixed和Number.prototype.toPrecision。
     * 注意：小数末尾连续的0会被丢弃，所以最终结果小数的位数可能小于N。
     * 
     * @param number 待处理的数
     * @param n 保留的小数的位数
     * @return 结果(数字)
     */
    Util.correctTo = function(number, n) {
        var zoom = Math.pow(10, n);
        return Math.round(zoom * number) / zoom;
    };

    /**
     * 打印日志。
     */
    Util.log = function() {
        if (console && console.log) {
            Array.prototype.splice.call(arguments, 0, 0, '[log]');
            console.log.apply(console, arguments);
        }
    };

    /**
     * 调用回调函数。
     */
    Util.invokeCallback = function(callback, scope) {
        if (callback) {
            callback.apply(scope || window);
        }
    };

    Util.isNumber = function(v) {
        return typeof v === 'number' && isFinite(v);
    };

    Util.isNumeric = function(v) {
        return !isNaN(parseFloat(v)) && isFinite(v);
    };

    Util.isDate = function(v) {
        return toString.call(v) === '[object Date]';
    };

    Util.isSimpleObject = function(v) {
        return Pen.isSimpleObject.apply(Pen, arguments);
    };

    Util.isPrimitive = function(v) {
        var type = typeof v;

        return type === 'string' || type === 'number' || type === 'boolean';
    };

    Util.isFunction = function(v) {
        return typeof v == 'function';
    };

    Util.isString = function(v) {
        return typeof v == 'string';
    };

    Util.isRegExp = function(v) {
        return v instanceof RegExp;
    };

    /**
     * 递归对象的所有属性，并且对每个属性(包括对象本身)调用一个回调函数。 采用后序遍历的顺序。
     * 
     * @param obj 对象
     * @param callback 回调函数。有三个参数：当前属性所在的对象、当前属性的名称、当前属性的值。
     */
    Util.recurseObject = (function() {
        function handle(obj, callback) {
            for ( var p in obj) {
                var v = obj[p];
                if (v == undefined || Util.isPrimitive(v)) {
                    callback(obj, p, v);
                }
                else {
                    handle(v, callback);
                    callback(obj, p, v);
                }
            }
        }

        return function(obj, callback) {
            if (obj && callback) {
                handle(obj, callback);
                callback(null, null, obj);
            }
        };
    })();

    /**
     * 判断某个点是否在矩形内。
     * 
     * @param dotX 点的X坐标
     * @param dotY 点的X坐标
     * @param rectX 矩形中心的X坐标
     * @param rectY 矩形中心的Y坐标
     * @param rectWidth 矩形的宽度
     * @param rectHeight 矩形的高度
     * @param includeBorder 是否将边框算在内。true表示点在边框时也算在矩形内。
     */
    Util.isDotInRect = function(dotX, dotY, rectX, rectY, rectWidth, rectHeight, includeBorder) {
        if (includeBorder) {
            return Math.abs(dotX - rectX) <= rectWidth / 2 && Math.abs(dotY - rectY) <= rectHeight / 2;
        }
        else {
            return Math.abs(dotX - rectX) < rectWidth / 2 && Math.abs(dotY - rectY) < rectHeight / 2;
        }
    };

    /**
     * 计算两点的距离。
     * 点的坐标为(x1, y1)和(x2, y2)。
     */
    Util.distance = function(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    };

    /**
     * 计算两条直线的交点。
     * 直线由两个点的坐标指定，分别为(x1, y1)---(x2, y2)和(x3, y3)---(x4, y4)。
     * 注意：当两条直线平行或重合时返回null。
     */
    Util.twoLinesIntersection = function(x1, y1, x2, y2, x3, y3, x4, y4) {
        var p = null;
        var k = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (k !== 0) {
            var x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            var y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);

            p = {
                x: x / k,
                y: y / k
            };
        }

        return p;
    };

    /**
     * 判断点是否在线段上。
     * 点：(x, y)；线段：(x1, y1)---(x2, y2)。
     */
    Util.isDotOnSegment = function(x, y, x1, y1, x2, y2) {
        var minY = Util.min(y1, y2), maxY = Util.max(y1, y2);
        var minX = Util.min(x1, x2), maxX = Util.max(x1, x2);

        if (x1 === x2) {
            return Math.abs(x - x1) <= LITTLE && y >= minY && y <= maxY;
        }
        else if (x1 === x) {
            return Math.abs(y - y1) <= LITTLE;
        }
        else {
            return Math.abs((y2 - y1) / (x2 - x1) - (y - y1) / (x - x1)) <= LITTLE && x >= minX && x <= maxX;
        }
    };

    /**
     * 计算两条线段的交点。
     * 线段由两个端点的坐标指定，分别为(x1, y1)---(x2, y2)和(x3, y3)---(x4, y4)。
     * 注意：当两条线段平行、重合或没有交点时返回null。
     */
    Util.twoLineSegmentsIntersection = function(x1, y1, x2, y2, x3, y3, x4, y4) {
        var p = Util.twoLinesIntersection(x1, y1, x2, y2, x3, y3, x4, y4);

        if (null != p) {
            if (!Util.isDotOnSegment(p.x, p.y, x1, y1, x2, y2) || !Util.isDotOnSegment(p.x, p.y, x3, y3, x4, y4)) {
                p = null;
            }
        }

        return p;
    };

    /**
     * 判断两条线段(线段x1,y1---x2,y2和线段x3,y3---x4,y4)是否相交。
     */
    Util.isLineSegmentIntersectant = function(x1, y1, x2, y2, x3, y3, x4, y4) {
        var p = Util.twoLinesIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
        if (null !== p) {
            var c1 = p.x >= x1 && p.x <= x2 || p.x >= x2 && p.x <= x1;
            var c2 = p.y >= y1 && p.y <= y2 || p.y >= y2 && p.y <= y1;
            var c3 = p.x >= x3 && p.x <= x4 || p.x >= x4 && p.x <= x3;
            var c4 = p.y >= y3 && p.y <= y4 || p.y >= y4 && p.y <= y3;

            if (c1 && c2 && c3 && c4) { return true; }
        }

        return false;
    };

    /**
     * 计算线段和直线的交点。
     * 线段为(x1, y1)---(x2, y2)，直线为(x3, y3)---(x4, y4)。
     * 注意：当线段和直线平行、重合或没有交点时返回null。
     */
    Util.segmentAndLineIntersection = function(x1, y1, x2, y2, x3, y3, x4, y4) {
        var p = Util.twoLinesIntersection(x1, y1, x2, y2, x3, y3, x4, y4);

        if (null != p) {
            if (!Util.isDotOnSegment(p.x, p.y, x1, y1, x2, y2)) {
                p = null;
            }
        }

        return p;
    };

    /**
     * 获取点到直线的距离。
     */
    Util.distanceOfPointAndLine = function(x0, y0, x1, y1, x2, y2) {
        var A = y2 - y1, B = x1 - x2, C = x2 * y1 - x1 * y2;
        var Z = A * A + B * B;
        var x, y, d;

        x = x0 - A * (A * x0 + B * y0 + C) / Z;
        y = y0 - B * (A * x0 + B * y0 + C) / Z;
        d = Math.abs(A * x0 + B * y0 + C) / Math.sqrt(Z);

        return d;
    };

    /**
     * 求点到直线的垂足的坐标。
     */
    Util.getFootPoint = function(x0, y0, x1, y1, x2, y2) {
        var A = y2 - y1, B = x1 - x2, C = x2 * y1 - x1 * y2;
        var Z = A * A + B * B;
        var x, y, d;

        x = x0 - A * (A * x0 + B * y0 + C) / Z;
        y = y0 - B * (A * x0 + B * y0 + C) / Z;

        return {
            x: x,
            y: y
        };
    };

    /**
     * 将一个将转换到[0, 2π)范围。
     */
    Util.normalizeAngle = function(angle) {
        angle %= 2 * PI;

        if (angle < 0) {
            angle += 2 * PI;
        }

        return angle;
    };

    /**
     * 计算一个向量的角度。在[0, 2π)的范围。
     */
    Util.angleOfVector = function(x, y) {
        var angle;
        if (x == 0 && y == 0) {
            angle = undefined;
        }
        else if (x == 0 && y > 0) {
            angle = PI / 2;
        }
        else if (x == 0 && y < 0) {
            angle = PI * 3 / 2;
        }
        else {
            var atan = Math.atan(y / x);

            if (x < 0) {
                angle = atan + PI;
            }
            else if (x > 0 && y >= 0) {
                angle = atan;
            }
            else {
                angle = atan + 2 * PI;
            }
        }

        return angle;
    };

    /**
     * 判断点是否在多边形内。
     * 限制：多边形不能自相交。
     * 如果点在多边形内，返回-1；如果点在多边形外，返回1；如果点在多边形边界上，返回0。
     * 
     * @param x 点的X坐标
     * @param y 点的Y坐标
     * @param points 多边形的顶点的坐标数组。例如[[1, 2], [5, 6], [3, 8]]
     */
    Util.checkDotInPolygon = function(x, y, points) {
        var intersections = [];

        var x1, y1, x2, y2, p, i, len = points.length;
        for (i = 0; i < len; i++) {
            x1 = points[i][0];
            y1 = points[i][1];
            x2 = points[(i + 1) % len][0];
            y2 = points[(i + 1) % len][1];

            p = Util.segmentAndLineIntersection(x1, y1, x2, y2, x, y, x + 1, y);
            if (null !== p) {
                intersections.push(p);
            }
        }

        var leftPoints = 0, j, len2 = intersections.length;

        for (j = 0; j < len2; j++) {
            if (intersections[j].x === x) {
                return 0;
            }
            else if (intersections[j].x < x) {
                leftPoints++;
            }
        }

        if (leftPoints % 2 !== 0) {
            return -1;
        }
        else {
            return 1;
        }
    };

    /**
     * 检查点是否在圆内。
     * 如果点在圆内，返回-1；如果点在圆外，返回1；如果点在圆边界上，返回0。
     */
    Util.checkDotInCircle = function(dotX, dotY, x, y, r) {
        var d = Util.distance(dotX, dotY, x, y);

        if (d === r) {
            return 0;
        }
        else if (d < r) {
            return -1;
        }
        else {
            return 1;
        }
    };

    Util.isDotInFan = function(dotX, dotY, x, y, r, beginAngle, endAngle, includeBorder) {
        if (dotX == x && dotY == y) {
            return includeBorder;
        }
        else {
            var distance = Util.distance(dotX, dotY, x, y);
            var dotAngle = Util.angleOfVector(dotX - x, dotY - y);
            beginAngle = Util.normalizeAngle(beginAngle);
            if (endAngle == 0 || endAngle == PI * 2) {
                endAngle = PI * 2;
            }
            else {
                endAngle = Util.normalizeAngle(endAngle);
            }

            if (includeBorder) {
                return distance <= r && dotAngle >= beginAngle && dotAngle <= endAngle;
            }
            else {
                return distance < r && dotAngle > beginAngle && dotAngle < endAngle;
            }
        }
    };

    Util.trim = function(str) {
        if (Util.isString(str)) {
            // return str.replace(/\s+$/g, '').replace(/^\s+/g, '');
            return str.trim();
        }
        else {
            return str;
        }
    };

    Util.isStringEmpty = function(str) {
        var s = Util.trim(str);
        return s === null || s===undefined || s === '';
    };

    Util.isMobile = function() {
        return window.ontouchstart !== undefined;
    };

    /**
     * 用[变换矩阵]变换一个点。
     */
    Util.transformPoint = function(m11, m12, m21, m22, dx, dy, x, y) {
        return {
            x: m11 * x + m21 * y + dx,
            y: m12 * x + m22 * y + dy
        };
    };
    
    Util.throwError = function(msg) {
        throw new Error(msg);
    };

    window.Pen.Util = Util;
})(window);
