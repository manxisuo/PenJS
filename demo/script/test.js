
function init() {
    // 配置Pen
    Pen.setConfig({
        fullscreen: false,
        resources: {
            images: {
                xq: 'image/xiaoqiang/xq.png'
            }
        }
    });

    // 初始化Pen
    Pen.init(function() {
        var stage = Pen.Global.stage;
        stage.inFixedIntervalMode = true;
        stage.autoClear = true;
        stage.start();

        main(stage, Pen.Global.canvas);
    });
}

function main(stage, canvas) {
    // 矩形
    var rect = stage.make(Pen.sprite.Rect, {
        x: 160,
        y: 100,
        w: 100,
        h: 50,
        r: 50,
        angle: Math.PI / 6,
        fillColor: 'orange',
    });

    stage.getTween(rect).to(5000, {
        x: 200,
        y: 400,
        loop: true
    }).to(5000, {
        x: 160,
        y: 100,
        loop: true
    });

    // 多边形
    var polygon = stage.make(Pen.sprite.Polygon, {
        x: 300,
        y: 300,
        fillColor: null,
        lineWidth: 1,
        angle: Math.PI / 3,
        points: [[10, 100], [50, 180], [150, 120], [100, 90], [60, 50]],
    });

    stage.getTween(polygon).to(6000, {
        x: 50,
        y: 100,
        loop: true
    }).to(4000, {
        x: 100,
        y: 200,
        loop: true
    });

    // 直线
    var line = stage.make(Pen.sprite.Line, {
        x: 200,
        y: 300,

        x1: -100,
        x2: 100,

        lineWidth: 1,
        strokeColor: 'purple',
        angle: Math.PI / 3
    });

    // 图片
    var image = stage.make(Pen.sprite.Image, {
        x: 200,
        y: 300,
        w: 100,
        h: 100,
        image: Pen.Loader.images.xq,
    });

    // 圆
    var round = stage.make(Pen.sprite.Circle, {
        x: 160,
        y: 100,
        r: 20,
        vx: 0.1,
        vy: 0.2,
        fillColor: 'yellow',
        beforeDraw: function(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }
    });

    var round2 = stage.make(Pen.sprite.Circle, {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: 30,
        vx: 0.04,
        vy: 0.03,
        fillColor: null,
        beforeDraw: function(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }
    });

    stage.on('click', function(e, e1, x, y) {
        console.log(x, y);
    });

    // 边界
    var boundary = stage.make(Pen.sprite.Rect, {
        x: canvas.width / 2,
        y: canvas.height / 2,
        w: canvas.width,
        h: canvas.height,
        fillColor: null,
    });

    // 边界线
    var leftLine = stage.make(Pen.sprite.Line, {
        x: 0,
        y: 0,
        x2: 0,
        y2: canvas.height,
    });

    var rightLine = stage.make(Pen.sprite.Line, {
        x: canvas.width,
        y: 0,
        x2: 0,
        y2: canvas.height,
    });

    var topLine = stage.make(Pen.sprite.Line, {
        x: 0,
        y: 0,
        x2: canvas.width,
        y2: 0,
    });

    var bottomLine = stage.make(Pen.sprite.Line, {
        x: 0,
        y: canvas.height,
        x2: canvas.width,
        y2: 0,
    });

    stage.add(rect);
    stage.add(round2);
    // stage.add(boundary);
    stage.add(image);
    stage.add(round);
    stage.add(polygon);
    stage.add(line);
    // stage.addDetection([rect, polygon, boundary]);
    // stage.addDetection([round, round2]);
    stage.add(leftLine);
    stage.add(rightLine);
    stage.add(topLine);
    stage.add(bottomLine);

    stage.addDetection([round, leftLine]);
    stage.addDetection([round, rightLine]);
    stage.addDetection([round, topLine]);
    stage.addDetection([round, bottomLine]);

    round.on('bordercollision', function(e, sprite) {
        console.log('bordercollision');

        if (sprite == leftLine || sprite == rightLine) {
            this.vx = -this.vx;
        }
        if (sprite == topLine || sprite == bottomLine) {
            this.vy = -this.vy;
        }
    });
}
