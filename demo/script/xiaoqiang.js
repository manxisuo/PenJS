function init() {
    Pen.setConfig({
        resources: {
            images: {
                xq: 'image/xiaoqiang/xq.png',
                bg1: 'image/xiaoqiang/floor2.jpg',
                bg2: 'image/xiaoqiang/floor3.jpg',
                bg3: 'image/xiaoqiang/floor5.jpg',
                bg4: 'image/xiaoqiang/floor6.jpg',
            }
        }
    });

    Pen.init(function() {
        main();
    });
}

function main() {
    var stage = Pen.Global.stage;
    stage.start();

    var width = stage.getWidth();
    var height = stage.getHeight();

    // 定义Bug
    Pen.define('Bug', {
        extend: Pen.sprite.Image,
        image: Pen.Loader.images['xq'],
        v: 150,
        w: 100,
        h: 100,
        beforeDraw: function(dt) {
            var me = this;

            var size = Pen.Util.max(me.w, me.h) / 2;
            if (me.x <= -size || me.y <= -size) {
                me.x = Pen.Util.rndRange(50, width - 50);
                me.y = Pen.Util.rndRange(50, height - 50);
            }
            else {
                var v = me.v;
                var dx = v * Math.cos(me.angle) * dt / 1000;
                var dy = v * Math.sin(me.angle) * dt / 1000;
                me.x += dx;
                me.y += dy;
                if (Math.random() < 0.05) {
                    me.angle += Pen.Util.rndAmong(1, -1) * Math.PI / Pen.Util.rndAmong(4, 5, 6);
                }
            }
        },
        checkInside: function(x, y) {
            var isIn = this.callParent('checkInside');
            if (isIn) { return Pen.Sprite.INSIDE; }
            return isIn;
        }
    });

    // 提示
    var getTip = function(text) {
        return stage.make(Pen.sprite.Text, {
            type: Pen.Sprite.DURATION,
            duration: 500,
            text: text,
            color: 'purple',
            x: width / 2,
            y: height / 2
        });
    };

    var bugList = [], bug;

    var count = 10;

    // 产生Bug
    for ( var i = 0; i < count; i++) {
        bug = stage.make(Bug, {
            x: Pen.Util.rndRange(50, width - 50),
            y: Pen.Util.rndRange(50, height - 50),
            w: 80,
            h: 80,
            angle: Pen.Util.rndRange(0, Math.PI * 2),
            init: function() {
                var me = this;
                me.on('mousedown', 'touchstart', function() {
                    me.stage.remove(me);
                    count--;

                    var tip = getTip('+1');
                    stage.add(tip);
                    stage.getTween(tip).set({
                        x: me.x,
                        y: me.y,
                        fontSize: 40
                    }).to(500, {
                        fontSize: 80
                    });
                });
            }
        });

        stage.add(bug);
    }

    // 背景
    var background = stage.make(Pen.sprite.Image, {
        image: Pen.Loader.images[Pen.Util.rndAmong('bg1', 'bg2', 'bg3', 'bg4')],
        x: width / 2,
        y: height / 2,
        w: width,
        h: height,
    });

    stage.addToBottom(background);
}
