(function() {
    Pen.define('Pen.Brush', {
        
        /**
         * 构造函数。
         */
        construct: function(canvas) {
            this.canvas = canvas;
            this.ctx = this.canvas.getContext('2d');
        },

        /**
         * 新建子路径。即将移动画笔到某个位置.
         */
        moveTo: function(x, y) {
            this.ctx.moveTo(x, y);

            return this;
        },

        /**
         * 在当前子路径中增加一条直线。
         */
        lineTo: function(x, y) {
            this.ctx.lineTo(x, y);

            return this;
        },

        /**
         * 在当前子路径中增加一条二次贝塞尔曲线。
         */
        quadraticCurveTo: function(cp1x, cp1y, x, y) {
            this.ctx.quadraticCurveTo(cp1x, cp1y, x, y);

            return this;
        },

        /**
         * 在当前子路径中增加一条三次贝塞尔曲线。
         */
        bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);

            return this;
        },

        /**
         * 描边当前路径(中的所有子路径)。
         */
        stroke: function(style) {
            var me = this;
            me.tmp(function() {
                me.setStrokeStyle(style);
                me.ctx.stroke();
            });

            return me;
        },

        /**
         * 填充当前路径(中的所有子路径)。
         */
        fill: function(style) {
            var me = this;
            me.tmp(function() {
                me.setFillStyle(style);
                me.ctx.fill();
            });

            return me;
        },

        /**
         * 画直线。 需要接着调stroke方法描出直线。
         */
        line: function(x1, y1, x2, y2) {
            var ctx = this.ctx;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();

            return this;
        },

        /**
         * 画圆。 需要接着调stroke或fill方法描出或填充圆。
         */
        circle: function(x, y, r) {
            var ctx = this.ctx;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, true);
            ctx.closePath();

            return this;
        },

        /**
         * 画矩形.
         */
        rect: function(x, y, w, h) {
            var ctx = this.ctx;
            ctx.beginPath();
            ctx.rect(x - w / 2, y - h / 2, w, h);
            ctx.closePath();

            return this;
        },

        /**
         * 画圆角矩形。
         */
        roundRect: function(x, y, w, h, corners) {
            if (undefined == corners) {
                corners = [0, 0, 0, 0];
            }
            else if (!Pen.Util.isArray(corners)) {
                corners = [corners, corners, corners, corners];
            }

            var size = Pen.Util.min(w / 2, h / 2);

            for ( var i = 0; i < corners.length; i++) {
                if (corners[i] > size) {
                    corners[i] = size;
                }
            }

            var lt = corners[0], rt = corners[1], rb = corners[2], lb = corners[3];
            var PI = Math.PI;
            var ctx = this.ctx;

            ctx.save();
            ctx.translate(x, y);

            ctx.beginPath();

            ctx.moveTo(-w / 2, -h / 2 + lt);
            if (lt > 0) {
                ctx.arc(-w / 2 + lt, -h / 2 + lt, lt, -PI, -PI / 2);
            }

            ctx.lineTo(w / 2 - rt, -h / 2);
            if (rt > 0) {
                ctx.arc(w / 2 - rt, -h / 2 + rt, rt, -PI / 2, 0);
            }

            ctx.lineTo(w / 2, h / 2 - rb);
            if (rb > 0) {
                ctx.arc(w / 2 - rb, h / 2 - rb, rb, 0, PI / 2);
            }

            ctx.lineTo(-w / 2 + lb, h / 2);
            if (lb > 0) {
                ctx.arc(-w / 2 + lb, h / 2 - lb, lb, PI / 2, PI);
            }

            ctx.lineTo(-w / 2, -h / 2 + lt);

            ctx.closePath();

            ctx.restore();

            return this;
        },

        /**
         * 描边文字.
         */
        strokeText: function(text, x, y, font) {
            var ctx = this.ctx;
            this.tmp(function() {
                if (font)
                    ctx.font = font;
                ctx.strokeText(text, x - size.width / 2, y + size.height / 2 - size.height * 3 / 16);
            });

            return this;
        },

        /**
         * 描边指定颜色的文字.
         */
        strokeTextWithColor: function(text, x, y, color, font) {
            var ctx = this.ctx;
            this.tmp(function() {
                if (font)
                    ctx.font = font;
                ctx.strokeStyle = color;
                ctx.strokeText(text, x, y);
            });

            return this;
        },

        /**
         * 填充文字.
         */
        fillText: function(text, x, y, font) {
            var ctx = this.ctx;
            this.tmp(function() {
                if (font)
                    ctx.font = font;
                ctx.fillText(text, x, y);
            });

            return this;
        },

        /**
         * 填充指定颜色的文字.
         */
        fillTextWithColor: function(text, x, y, color, font) {
            var ctx = this.ctx;
            this.tmp(function() {
                if (font) {
                    ctx.font = font;
                }
                ctx.fillStyle = color;

                var size = Pen.DocUtil.getTextSize(text, ctx.font);

                // 注：将Y方向的坐标减去字高的3/16，是为了看起来更靠中间。这是一个经验值，没有广泛测试。
                ctx.fillText(text, x - size.width / 2, y + size.height / 2 - size.height * 3 / 16);
            });

            return this;
        },

        /**
         * 备份上下文状态，并执行一个函数，然后还原上下文状态。
         */
        tmp: function(fn, scope) {
            var me = this, r = null;
            if (fn) {
                me.save();
                r = fn.apply(scope || window);
                me.restore();
            }

            return r;
        },

        transPoint: function(sprite, x, y) {
            var a = sprite.angle, p;

            // 平移
            p = Pen.Util.transformPoint(1, 0, 0, 1, -sprite.x, -sprite.y, x, y);

            // 缩放
            p = Pen.Util.transformPoint(sprite.scaleX, 0, 0, sprite.scaleY, 0, 0, p.x, p.y);

            // 旋转
            p = Pen.Util.transformPoint(Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a), 0, 0, p.x, p.y);

            return p;
        },

        /**
         * 将坐标系按照指定Sprit(参考物)做转换，然后在转换后的坐标系调用指定的函数。
         * 
         * @param sprite 指定的Sprite
         * @param fn 调用的函数
         * @param scope 函数作用域
         */
        trans: function(sprite, fn, scope) {
            var me = this, r = null;
            if (fn) {
                me.save();

                // 转换
                me.translate(sprite.x, sprite.y);
                me.rotate(sprite.angle);
                me.scale(sprite.scaleX, sprite.scaleY);

                var backup = {
                    x: sprite.x,
                    y: sprite.y,
                    angle: sprite.angle,
                    scaleX: sprite.scaleX,
                    scaleY: sprite.scaleY
                };

                Pen.copy(sprite, {
                    x: 0,
                    y: 0,
                    angle: 0,
                    scaleX: 1,
                    scaleY: 1
                });

                r = fn.call(scope || window);

                Pen.copy(sprite, backup);

                me.restore();
            }

            return r;
        },

        /**
         * 清空画布内容.
         */
        clear: function(style) {
            var me = this, ctx = me.ctx;

            if (style) {
                me.tmp(function() {
                    ctx.fillStyle = style;
                    ctx.rect(0, 0, me.canvas.width, me.canvas.height);
                    ctx.fill();
                });
            }
            else {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }

            return this;
        },

        /**
         * 设置画布的Alpha值.
         * @type doubal(0.0 <= v <= 1.0)
         */
        setAlpha: function(alpha) {
            if (alpha != undefined)
                this.ctx.globalAlpha = alpha;

            return this;
        },

        /**
         * 设置填充样式.
         */
        setFillStyle: function(style) {
            if (style)
                this.ctx.fillStyle = style;

            return this;
        },

        /**
         * 设置描边样式.
         */
        setStrokeStyle: function(style) {
            if (style)
                this.ctx.strokeStyle = style;

            return this;
        },

        /**
         * 设置线宽.
         */
        setLineWith: function(lineWidth) {
            if (lineWidth)
                this.ctx.lineWidth = lineWidth;

            return this;
        },

        /**
         * 设置全家透明度.
         */
        setAlpha: function(alpha) {
            if (alpha)
                this.ctx.globalAlpha = alpha;

            return this;
        },

        /**
         * 画图。
         * image，x，y是必选的；width和height要么同时提供，要么同时不提供。
         * 注意：x和y不是图片左上角的坐标，是图片中心的坐标。
         */
        image: function(image, x, y, width, height) {
            var ctx = this.ctx;
            var len = arguments.length;
            var w;
            var h;

            if (len == 3) {
                w = image.width;
                h = image.height;
            }
            else {
                w = width;
                h = height;
            }

            ctx.drawImage(image, x - w / 2, y - h / 2, w, h);

            return this;
        },

        sliceImage: function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
            this.ctx.drawImage.apply(this.ctx, arguments);

            return this;
        },

        translate: function() {
            this.ctx.translate.apply(this.ctx, arguments);

            return this;
        },

        rotate: function() {
            this.ctx.rotate.apply(this.ctx, arguments);

            return this;
        },

        scale: function() {
            this.ctx.scale.apply(this.ctx, arguments);

            return this;
        },

        transform: function() {
            this.ctx.transform.apply(this.ctx, arguments);

            return this;
        },

        beginPath: function() {
            this.ctx.beginPath.apply(this.ctx, arguments);

            return this;
        },

        closePath: function() {
            this.ctx.closePath.apply(this.ctx, arguments);

            return this;
        },

        save: function() {
            this.ctx.save.apply(this.ctx, arguments);

            return this;
        },

        restore: function() {
            this.ctx.restore.apply(this.ctx, arguments);

            return this;
        },

        isPointInPath: function(x, y) {
            return this.ctx.isPointInPath(x, y);
        },

        /**
         * 创建一个渐进色对象。 
         * 接收4个或6个参数，分别对应线性和圆形渐进色。
         * 即(x1, y1, x2, y2)或(x1, y1, r1, x2, y2, r2)
         */
        createGradient: function() {
            var args = [this];
            for ( var i in arguments) {
                args.push(arguments[i]);
            }

            var constructor = Function.prototype.bind.apply(Gradient, args);

            return new constructor(this.ctx);
        }
    });

    function Gradient() {
        var x1, y1, r1, x2, y2, r2, ctx;
        if (arguments.length == 7) {
            x1 = arguments[0], y1 = arguments[1], r1 = arguments[2];
            x2 = arguments[3], y2 = arguments[4], r2 = arguments[5];
            ctx = arguments[6];

            this.gradient = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
        }
        else {
            x1 = arguments[0], y1 = arguments[1];
            x2 = arguments[2], y2 = arguments[3];
            ctx = arguments[4];

            this.gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        }
    }

    /**
     * 在渐进色中添加一个颜色。
     * 接收两种类型的参数：(position, color)或({position1: color1, position2: color2})。
     * 即单个添加或批量添加。
     */
    Gradient.prototype.addStop = function() {
        if (arguments.length == 2) {
            var position = arguments[0], color = arguments[1];

            this.gradient.addColorStop(position, color);
        }
        else {
            var position, conf = arguments[0];
            for (position in conf) {
                this.gradient.addColorStop(position, conf[position]);
            }
        }

        return this;
    };

    /**
     * 生成最终的渐进色。
     */
    Gradient.prototype.make = function() {
        return this.gradient;
    };
})();
