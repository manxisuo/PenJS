function init() {
    // 配置Pen
    Pen.setConfig({
        fullscreen: false,
        resources: {
            images: {
                bg: 'image/bg.jpg'
            }
        }
    });

    // 初始化Pen
    Pen.init(function() {
        canvas = Pen.Global.canvas;
        ctx = Pen.Global.ctx;
        stage = Pen.Global.stage;
        stage.inFixedIntervalMode = false;
        stage.autoClear = true;
        stage.on('mousedown', function() {
            // console.log(arguments);
        });

        images = Pen.Loader.images;

        main(canvas, ctx, stage, images);
    });
}

function main(canvas, ctx, stage, images) {
    round = new Pen.Sprite({
        name: 'round',
        type: 1,
        count: 100,
        x: 10,
        y: 300,
        alpha: 0.75,
        w: 10,
        h: 10,
        vx: 0.1,
        vy: -0.02,
        ax: 0,
        ay: 0.0001,
        kx: 0,
        ky: 0,
        box: [[0, 0, 10]],

        beforeDraw: function(dt) {
            this.x += (this.vx * dt + this.ax * dt * dt / 2 + this.kx * dt * dt * dt / 6);
            this.y += (this.vy * dt + this.ay * dt * dt / 2 + this.ky * dt * dt * dt / 6);
            this.vx += this.ax * dt + this.kx * dt * dt / 2;
            this.vy += this.ay * dt + this.ky * dt * dt / 2;
            this.ax += this.kx * dt;
            this.ay += this.ky * dt;

            if (this.x + this.w / 2 > canvas.width || this.x - this.w / 2 < 0)
                this.vx = -this.vx;
            if (this.y + this.h / 2 > canvas.height || this.y - this.h / 2 < 0)
                this.vy = -this.vy;
        },
        draw: function(brush, dt) {
            brush.circle(this.x, this.y, this.w).fill();
        },
        checkInside: function(ex, ey) {
            return Math.abs(ex - this.x) <= this.w / 2 && Math.abs(ey - this.y) <= this.h / 2;
        }
    });

    round.on('click', function() {
        this.vx = -this.vx;
    });

    round.on('bordercollision', function() {
        console.log('bordercollision');
        // stage.stop();
        this.vx = -this.vx;
        this.vy = -this.vy;
    });

    var omiga = 0.003;
    var angle = 0;
    rect = new Pen.Sprite({
        name: 'rect',
        type: Pen.Sprite.CONTINUOUS,
        x: 0,
        y: canvas.height,
        w: 5,
        h: 5,
        fillColor: 'black',
        beforeDraw: function(dt) {
        },
        draw: function(brush, dt) {
            brush.rect(this.x, this.y, this.w, this.h).fill(this.fillColor);
        },
        checkInside: function(ex, ey) {
            return Pen.Util.isDotInRect(ex, ey, this.x, this.y, this.w, this.h, true);
        }
    });

    rect.on('mouseenter', function() {
    });

    line = stage.make(Pen.Polyline);

    text1 = new Pen.Sprite({
        name: 'text1:haha',
        type: Pen.Sprite.DURATION,
        duration: 5000,
        x: 300,
        y: 300,
        draw: function(brush, dt) {
            brush.fillTextWithColor('haha', this.x, this.y, 'blue', 30 + 'px Calibri');
        },
        checkInside: function(ex, ey) {
            return Math.abs(ex - this.x) <= this.w / 2 && Math.abs(ey - this.y) <= this.h / 2;
        }
    });

    text2 = new Pen.Sprite({
        name: 'text1:PenJS',
        type: Pen.Sprite.CONTINUOUS,
        x: 0,
        y: 400,
        beforeDraw: function(dt) {
            this.x += 2;
            this.y = 300 + 30 * Math.sin(angle += omiga * dt);
        },
        draw: function(brush, dt) {
            brush.fillTextWithColor('PenJS', this.x, this.y, 'orange', 50 + 'px Calibri');
        },
        checkInside: function(ex, ey) {
            return Math.abs(ex - this.x) <= this.w / 2 && Math.abs(ey - this.y) <= this.h / 2;
        }
    });

    bg = new Pen.sprite.Image({
        name: 'bg',
        x: canvas.width / 2,
        y: canvas.height / 2,
        w: canvas.width,
        h: canvas.height,
        image: Pen.Loader.images.bg,
        alpha: 0.8,
    });

    bg.on('click', function(e, e1, x, y) {
        console.log(x, y);
    });

    button1 = new Pen.Button({
        stage: stage,
        name: '暂停',
        x: 250,
        y: 370,
        w: 100,
        h: 130,
        box: [[-50, -65], [50, -65], [50, 65], [-50, 65]],
        corners: 0,
        label: '暂停'
    });

    button1.on('bordercollision', function() {
    });

    button2 = stage.make(Pen.Button, {
        name: '恢复',
        x: 380,
        y: 370,
        corners: 10,
        label: '恢复'
    });
    ;

    button1.on('tap', function(e1, e2, x, y) {
        //		console.log(arguments);
        stage.pause();
    });

    button2.on('tap', function() {
        stage.resume();
    });

    stage.addDetection([button1, round]);

    stage.start();
    stage.speedUp(1);

    stage.addToBottom(bg);
    stage.add(round);
    stage.add(rect);
    //	stage.add(text2);
    stage.add(button1);
    stage.add(button2);
    //	stage.add(text1);
    //	stage.add(line);

    tween1 = stage.getTween(rect);
    tween1.to(4300, {
        x: canvas.width,
        loop: true,
    }).to(4300, {
        x: 0,
        loop: true,
    });

    tween2 = stage.getTween(rect);
    tween2.to(1900, {
        y: 50,
        loop: true,
        ease: Pen.Easing.Quad.easeOut
    }).to(1900, {
        y: canvas.height,
        loop: true,
        ease: Pen.Easing.Quad.easeIn
    });

    rect1 = new Pen.sprite.Rect({
        x: 200,
        y: 200,
        w: 50,
        h: 150,
        alpha: 0.7,
        strokeColor: 'blue',
        fillColor: 'orange',
        angle: Math.PI / 6,
        scaleX: 1,
        scaleY: 1,
        labelSize: 18,
        labelColor: 'purple',
        label: 'Pen JS'
    });

    // 矩形
    rect1.on('mousedown', function() {
        console.log('rect1');
    });

    stage.getTween(rect1).wait(500).to(5000, {
        x: 300,
    }).wait(500).to(1000, {
        y: 320,
    }).wait(500).to(1000, {
        w: 150,
    }).wait(500).to(1000, {
        h: 250,
    }).wait(500).to(1000, {
        angle: Math.PI / 6,
    }).wait(500).to(1000, {
        scaleX: 2,
    }).wait(500).to(1000, {
        scaleY: 1.5,
    }).wait(500).to(1000, {
        labelSize: 30,
    });

    stage.getTween(rect1).to(5000, {
        angle: Math.PI * 3 / 2,
    });

    //	stage.add(rect1);

    // 多边形
    plg = stage.make(Pen.sprite.Polygon, {
        x: 100,
        y: 100,
        points: [[-50, -80], [10, -50], [100, 50], [-50, 50]],
        angle: 0,
    });

    stage.getTween(plg).wait(500).to(1000, {
        x: 300,
    }).wait(500).to(1000, {
        y: 200,
    }).wait(500).to(1000, {
        angle: Math.PI / 4,
    }).wait(500).to(1000, {
        scaleX: 2,
    }).wait(500).to(1000, {
        scaleY: 3,
    }).wait(500).to(1000, {
        angle: Math.PI / 2,
    }).wait(500).to(1000, {
        angle: Math.PI * 4 / 3,
    });

    //	stage.add(plg);

    // 椭圆
    ellipse = stage.make(Pen.sprite.Circle, {
        x: 300,
        y: 200,
        r: 50,
        r1: 50,
        r2: 100,
        scaleX: 2,
    });

    stage.getTween(ellipse).to(1000, {
        y: 300,
    }).to(1000, {
        angle: Math.PI / 4,
    }).to(1000, {
        x: 200,
    }).to(1000, {
        scaleX: 1
    });

    //		stage.add(ellipse);

    text33 = stage.make(Pen.sprite.Text, {
        x: 300,
        y: 200,
        labelSize: 50,
        labelColor: 'orange',
        label: 'PenJS游戏引擎!',
        scaleY: 2,
        alpha: 1,
        angle: Math.PI / 3,
    });
    stage.getTween(text33).to(3000, {
        angle: Math.PI * 2,
        loop: true,
    }).set({
        angle: 0,
        loop: true,
    });
    stage.add(text33);

    // 跟踪
    //	stage.track(rect);

}
