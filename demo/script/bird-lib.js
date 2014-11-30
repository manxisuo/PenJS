(function() {
    var BIRD_SIZE = 50;
    var stage = Pen.Global.stage;

    // 定义鸟
    Pen.define('Bird', {
        extend: Pen.sprite.Image,
        imgs: null,
        swingSpeed: 3,
        image: null,
        w: BIRD_SIZE,
        h: BIRD_SIZE,
        x: stage.getWidth() / 2,
        y: stage.getHeight() / 2,
        init: function() {
            var me = this;
            me.on('beforedraw', function(e, dt) {
                me.image = me.getImage();
            });
        },
        getImage: function() {
            var n = Math.floor(this.finishedCount / this.swingSpeed) % 4;
            if (n < 3) {
                return this.imgs[n];
            }
            else {
                return this.imgs[1];
            }
        },
        checkInside: function(x, y) {
            var isIn = this.callParent('checkInside');
            return isIn ? Pen.Sprite.INSIDE : isIn;
        },
        getBox: function() {
            this.w -= 10;
            this.h -= 10;
            var box = this.callParent('getBox');
            this.w += 10;
            this.h += 10;

            return box;
        },
    });

    // 定义管子
    Pen.define('Tubes', {
        extend: Pen.Sprite,
        statics: {
            B_WIDTH: 50,
            H_WIDTH: 60,
            H_HEIGHT: 30,
            DISTANCE: 200
        },

        tubes: null,

        getNewTubes: function() {
            var x = stage.getWidth() + Tubes.H_WIDTH / 2;
            var y = Pen.Util.rndRange(Tubes.H_HEIGHT * 2, stage.getHeight() - Tubes.H_HEIGHT * 2 - BIRD_SIZE * 4);

            return {
                up: {
                    x: x,
                    y: y
                },
                down: {
                    x: x,
                    y: y + BIRD_SIZE * 3.2
                }
            };
        },
        reinit: function() {
            var me = this, brush = me.stage.brush;
            me.still = false;
            me.tubes = [];
            me.tubes.push(me.getNewTubes());
        },
        beforeDraw: function(dt) {
            var me = this, tubes = me.tubes, len = tubes.length;

            tubes.forEach(function(tube) {
                tube.up.x -= dt * 0.15;
                tube.down.x -= dt * 0.15;
            });

            if (tubes[len - 1].up.x <= stage.getWidth() - Tubes.DISTANCE - Tubes.H_WIDTH / 2) {
                me.tubes.push(me.getNewTubes());
            }

            if (tubes[0].up.x <= -Tubes.H_WIDTH / 2) {
                tubes.shift();
            }
        },
        draw: function(brush) {
            var me = this;
            var up, down, bColor, hColor;
            this.tubes.forEach(function(tube) {
                up = tube.up;
                down = tube.down;

                bColor = brush.createGradient(up.x - Tubes.B_WIDTH / 2, 0, up.x + Tubes.B_WIDTH / 2, 0).addStop({
                    0: '#777777',
                    1: '#EEEEEE'
                }).make();

                hColor = brush.createGradient(down.x - Tubes.H_WIDTH / 2, 0, down.x + Tubes.H_WIDTH / 2, 0).addStop({
                    0: '#777777',
                    1: '#EEEEEE'
                }).make();

                brush.rect(up.x, (up.y - Tubes.H_HEIGHT) / 2, Tubes.B_WIDTH, up.y - Tubes.H_HEIGHT).fill(bColor);
                brush.rect(up.x, up.y - Tubes.H_HEIGHT / 2, Tubes.H_WIDTH, Tubes.H_HEIGHT).fill(hColor);

                brush.rect(down.x, (stage.getHeight() + down.y + Tubes.H_HEIGHT) / 2, Tubes.B_WIDTH,
                        (stage.getHeight() - down.y - Tubes.H_HEIGHT)).fill(bColor);
                brush.rect(down.x, down.y + Tubes.H_HEIGHT / 2, Tubes.H_WIDTH, Tubes.H_HEIGHT).fill(hColor);
            });
        },
        getBox: function() {
            var boxes = [];

            var points, x, y, w, h;

            if (null == this.tubes) { return null; }

            this.tubes.forEach(function(tube) {
                up = tube.up;
                down = tube.down;

                boxes.push(Pen.PolygonBox.createRectBox(up.x, (up.y - Tubes.H_HEIGHT) / 2 - 10000, Tubes.B_WIDTH, up.y
                        - Tubes.H_HEIGHT + 20000));

                boxes
                        .push(Pen.PolygonBox.createRectBox(up.x, up.y - Tubes.H_HEIGHT / 2, Tubes.H_WIDTH,
                                Tubes.H_HEIGHT));

                boxes.push(Pen.PolygonBox.createRectBox(down.x,
                        (stage.getHeight() + down.y + Tubes.H_HEIGHT) / 2 + 10000, Tubes.B_WIDTH, (stage.getHeight()
                                - down.y - Tubes.H_HEIGHT) + 20000));

                boxes.push(Pen.PolygonBox.createRectBox(down.x, down.y + Tubes.H_HEIGHT / 2, Tubes.H_WIDTH,
                        Tubes.H_HEIGHT));
            });

            return new Pen.GroupBox(boxes);
        },
    });

    // 定义云
    Pen.define('Cloud', {
        extend: Pen.sprite.Image,
        w: 100,
        h: 100,
        x: stage.getWidth() + 50,
    });

    // 获取提示
    function getTip(tip) {
        var tip = stage.make(Pen.sprite.Text, {
            label: tip,
            labelSize: 40,
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 4,
        });
        return tip;
    }
    ;

    // 获取按钮
    function getBtn(label) {
        var btn = stage.make(Pen.Button, {
            label: label,
            x: stage.getWidth() / 2,
            y: stage.getHeight() * 3 / 4,
            w: 70,
            h: 40,
            font: '25px sans-serif'
        });
        return btn;
    }

    // 上蹿下跳
    function flip(bird, flipTween) {
        var y0 = bird.y;
        flipTween.to(1000, {
            y: y0 - 20,
            loop: true
        }).to(1000, {
            y: y0 + 20,
            loop: true
        });
    }

    //停止上蹿下跳
    function stopFlip(flipTween) {
        flipTween.stop();
    }

    function relocBird(bird, m, n) {
        bird.x = stage.getWidth() / m;
        bird.y = stage.getHeight() / n;
        bird.angle = 0;
        return bird;
    }

    Lib = {
        BIRD_SIZE: BIRD_SIZE,
        getTip: getTip,
        getBtn: getBtn,
        flip: flip,
        stopFlip: stopFlip,
        relocBird: relocBird
    };

    window.Lib = Lib;
})();