function init() {
    Pen.setConfig({
        resources: {
            images: {
                birdU: 'image/bird/up-t.png',
                birdM: 'image/bird/middle-t.png',
                birdD: 'image/bird/down-t.png',
                cloud: 'image/bird/cloud.png',
            },
            scripts: ['script/bird-lib.js']
        }
    });

    Pen.init(function() {
        main();
    }, function(per) {
        Pen.Util.log('时间:', new Date().getTime());
        Pen.Util.log('加载:', per * 100 + '%');
    });
}

function main() {
    var stage = Pen.Global.stage;
    stage.start();

    var WIDTH = stage.getWidth();
    var HEIGHT = stage.getHeight();
    var images = Pen.Loader.images;

    var getTime = function(distance) {
        return Math.sqrt(distance) * 50;
    };

    // 管子
    var tubes = stage.make(Tubes, {
        name: '管子',
    });

    // 云
    var cloud = stage.make(Cloud, {
        name: '云',
        y: 100,
        image: images.cloud,
    });
    stage.getTween(cloud).to((WIDTH + 100) * 20, {
        x: -50,
        loop: true
    }).set({
        x: WIDTH + 50,
        loop: true
    });
    stage.addToBottom(cloud);

    // 鸟
    bird = stage.make(Bird, {
        name: '鸟',
        imgs: [images.birdU, images.birdM, images.birdD],
        image: images.birdU,
    });
    stage.add(bird);

    bird.on('innercollision', function(e, sprite) {
        tubes.still = true;
        stage.unbind('.clickscreen');
        stage.removeDetection(bird);

        // 取消前面的动作
        tween.cancelAll();

        // 跌落
        tween.to(getTime(HEIGHT - bird.y + Lib.BIRD_SIZE), {
            y: HEIGHT - Lib.BIRD_SIZE / 2,
            angle: Math.PI / 2,
            ease: Pen.Easing.Quad.easeIn,
            oncomplete: function() {
                gameOver();
            }
        });
    });

    var flipTween = stage.getTween(bird);

    // 游戏标题
    var welcomeTip = Lib.getTip('Flappy Bird');
    stage.add(welcomeTip);

    // 游戏玩法提示
    var playTip = Lib.getTip('点击屏幕');
    stage.add(playTip);

    // 游戏结束提示
    var overTip = Lib.getTip('结束');
    stage.add(overTip);

    // 开始按钮
    var startBtn = Lib.getBtn('开始');
    startBtn.on('tap', function() {
        startGame();
    });
    stage.add(startBtn);

    // 重新开始按钮
    var retryBtn = Lib.getBtn('重试');
    retryBtn.on('tap', function() {
        stage.remove(tubes);
        startGame();
    });
    stage.add(retryBtn);

    var initGroup = new Pen.Group();
    initGroup.addChild(welcomeTip, startBtn, bird);

    var startGroup = new Pen.Group();
    startGroup.addChild(playTip, bird);

    var overGroup = new Pen.Group();
    overGroup.addChild(overTip, retryBtn, bird, tubes);

    var bgGroup = new Pen.Group();
    bgGroup.addChild(overTip, cloud);

    // 欢迎画面
    var initGame = function() {
        stage.hideAll();

        Lib.relocBird(bird, 2, 2);
        Lib.flip(bird, flipTween);

        initGroup.show();
    };

    // 缓动对象
    var tween = stage.getTween(bird);

    // 游戏开始画面
    var startGame = function() {
        stage.hideAll();

        stage.addDetection([bird, tubes]);
        Lib.relocBird(bird, 4, 2);
        Lib.stopFlip(flipTween);
        Lib.flip(bird, flipTween);

        startGroup.show();

        var started = false;
        stage.on('touchstart.clickscreen', 'mousedown.clickscreen', function() {
            if (!started) {
                playTip.hide();
                cloud.show();
                tubes.show();
                started = true;
                Lib.stopFlip(flipTween);

                tubes.reinit();
                stage.addBelow(tubes, bird);
            }

            // 取消前面的动作
            tween.cancelAll();

            // 调整方向
            tween.to(0, {
                angle: -Math.PI / 8
            });

            // 向上
            tween.to(getTime(50), {
                y: bird.y - 75,
                ease: Pen.Easing.Quad.easeOut
            });

            // 跌落
            tween.to(getTime(HEIGHT - bird.y + Lib.BIRD_SIZE), {
                y: HEIGHT - Lib.BIRD_SIZE / 2,
                angle: Math.PI / 2,
                ease: Pen.Easing.Quad.easeIn,
                oncomplete: function() {
                    gameOver();
                }
            });
        });
    };

    // 游戏结束画面
    var gameOver = function() {
        stage.unbind('.clickscreen');
        tubes.still = true;
        stage.hideAll().show(overGroup);
    };

    initGame();
}
