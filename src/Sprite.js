/**
 * Sprite(精灵)。
 * 表示舞台上的一个独立的动画对象。可以逐帧绘制到舞台上从而实现动画效果。
 */
Pen.define('Pen.Sprite', {
    mixins: {
        event: Pen.EventSource
    },

    statics: {
        CONTINOUS: 1,
        COUNT: 2,
        DURATION: 3,
        UNTIL: 4,

        // 光标不在Sprite内
        NOT_INSIED: 0,

        // 光标在Sprite内
        INSIDE: 1,

        // 光标在Sprite内，且阻止事件继续向下传播
        INSIDE_PREVENT: 2,
    },

    name: '',

    // Sprite所属的舞台
    stage: null,

    // 动画类型相关参数
    type: 1,
    count: 0,
    duration: 0,

    // 已经执行的次数。
    finishedCount: 0,

    // 开始执行的时间。
    startTime: null,

    // 运动学参数(位置)
    x: 0,
    y: 0,
    angle: 0,

    // 宽度和高度
    w: 0,
    h: 0,

    // 伸缩(在旋转前的x和y方向上面的伸缩)
    scaleX: 1,
    scaleY: 1,

    // 透明度
    alpha: 1.0,

    // 边界点列表。用于碰撞检测。
    box: null,

    // 缓动函数列表。
    // 用于实现缓动。
    _actionFnList: {},

    // 是否固定。如果取true，则在舞台处于追踪状态时位置不受影响。
    fixed: false,

    // TODO 暂未使用。
    stoppable: true,

    // TODO 暂未使用。
    scale: {
        x: 1,
        y: 1
    },

    /**
     * 图像数据。
     * 
     * @type Image
     */
    image: null,

    /**
     * 事件相关参数，用于实现mousemove事件。表示光标此前是否位于该Sprite内。
     */
    _mouseInside: false,

    /**
     * 事件相关参数，用于实现tap事件。表示已经在该Sprite上触发了touchstart，且触摸还没有结束。
     */
    _touchstart: false,

    /**
     * 是否已经隐藏。
     */
    hidden: false,

    init: function() {
        this.addEvents('touchstart', 'touchmove', 'touchend', 'tap');

        // 鼠标事件
        this.addEvents('click', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave');

        // 键盘事件
        this.addEvents('keypress', 'keydown', 'keyup');

        /**
         * 每次绘制帧前触发。
         * 在Sprite的beforeDraw和draw方法之间触发。
         * 参数：
         *   e：事件；
         *   dt：与上一帧的时间间隔。
         */
        this.addEvents('beforedraw');

        // 每次绘制帧后触发。
        // 在Sprite的draw方法之后触发。
        this.addEvents('afterdraw');

        // 所有帧绘制完毕后触发。
        // 即满足终止条件后触发。
        this.addEvents('aftercomplete');

        // 被从舞台中删除时触发。即执行Stage的remove或removeAll方法时。
        this.addEvents('removed');

        // 隐藏和显示
        this.addEvents('show', 'hide');

        // 发生碰撞
        this.addEvents('collision');
    },

    // 在绘制每一帧前执行，通常用来改变Sprite的状态。
    // 模板方法。
    beforeDraw: function(dt) {
    },

    // 绘制Sprite的某一帧。
    // 模板方法，所有子类应该重写。
    draw: function() {
    },

    // 检查某个点是否位于Sprite内。
    // 模板方法，需要实现鼠标事件的子类应该重写。
    checkInside: function(x, y) {
        return false;
    },

    getBox: function() {
        return this.box;
    },

    beforeBindEvent: function(event, handler) {
        var eventName = Pen.Event.getEventName(event);
        if (eventName == 'tap' && !Pen.Util.isMobile()) {
            this.on(event.replace('tap', 'click'), handler);

            return false;
        }

        return true;
    },

    beforeUnbindEvent: function(event) {
        var eventName = Pen.Event.getEventName(event);
        if (eventName == 'tap' && !Pen.Util.isMobile()) {
            // TODO 这样是有问题的，会误伤无关的click。
            this.off(event.replace('tap', 'click'), handler);

            return false;
        }

        return true;
    },

    isInside: function(r) {
        return r === true || Pen.Sprite.INSIDE == r || Pen.Sprite.INSIDE_PREVENT == r;
    },

    isPrevent: function(r) {
        return r === true || Pen.Sprite.INSIDE_PREVENT == r;
    },

    /**
     * 在舞台中显示。
     */
    show: function() {
        this.hidden = false;
        this.fireEvent('show');
    },

    /**
     * 在舞台中隐藏。
     * 注意：被隐藏后，不会在舞台上渲染，不会触发用户事件(鼠标、触摸、键盘等用户操作)。
     */
    hide: function() {
        this.hidden = true;
        this.fireEvent('hide');
    },

    /**
     * 给Sprite分发事件。
     * 内部方法，由Stage类使用。
     */
    dispatchEvent: function(e, x, y) {
        if (this.hidden) { return; }

        var r = this.checkInside(x, y);
        var isInside = this.isInside(r);

        switch (e.type) {
            case 'click': {
                if (isInside) {
                    this.fireEvent('click', e, x, y);
                }

                return this.isPrevent(r);
            }
            case 'mousedown': {
                if (isInside) {
                    this.fireEvent('mousedown', e, x, y);
                }

                return this.isPrevent(r);
            }
            case 'mouseup': {
                if (isInside) {
                    this.fireEvent('mouseup', e, x, y);
                }

                return this.isPrevent(r);
            }
            case 'mousemove': {
                if (!this._mouseInside && isInside) {
                    this.fireEvent('mouseenter', e, x, y);
                }
                else if (this._mouseInside && !isInside) {
                    this.fireEvent('mouseleave', e, x, y);
                }
                this._mouseInside = isInside;

                return this.isPrevent(r);
            }
            case 'touchstart': {
                if (isInside) {
                    this.fireEvent('touchstart', e, x, y);
                    this._touchstart = true;
                }

                return this.isPrevent(r);
            }
            case 'touchmove': {
                if (isInside) {
                    this.fireEvent('touchmove', e, x, y);
                }

                return this.isPrevent(r);
            }
            case 'touchend': {
                if (isInside) {
                    this.fireEvent('touchend', e, x, y);
                    if (this._touchstart) {
                        this.fireEvent('tap', e, x, y);
                    }
                }
                else {
                    this._touchstart = false;
                }

                return this.isPrevent(r);
            }
        }
    }
});