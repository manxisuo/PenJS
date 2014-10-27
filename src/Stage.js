// 舞台类
var Stage = Pen.define('Pen.Stage', {
	mixins: {
		event: Pen.EventSource
	},

	statics: {
		INTERVAL: 17
	},

	canvas: null,

	// @required
	brush: null,
	sprites: [],
	status: 'stopped', // 'stopped', 'paused', 'running'

	timer: new Pen.RAFTimer(),

	_lastTS: 0,

	inFixedIntervalMode: false,

	zoom: 1,

	_track: null,
	_trackConfig: null,
	_transX: 0,
	_transY: 0,

	// 事件
	_lastMoveTime: null,

	/**
	 * 事件相关参数，用于实现tap事件。表示最近一次在画布上发生touchstart事件的坐标。
	 * 例如：{x: 100, y: 200}
	 */
	_touchstartLoc: null,

	// 碰撞检测列表
	_detectList: [],

	// 在绘制帧前，是否自动清除画布。
	autoClear: true,

	init: function() {
		var me = this;

		me.canvas = me.brush.canvas;
		if (!me.canvas) {
			throw new Error('canvas is not provided.');
			return;
		}

		me.addEvents('touchstart', 'touchmove', 'touchend', 'tap');
		me.addEvents('click', 'mousedown', 'mouseup', 'mousemove');
		me.addEvents('started', 'paused', 'resumed', 'stopped');

		// 在速度改变时触发
		me.addEvents('speedUp');

		// 在绘制一帧前触发。
		me.addEvents('beforeframe');

		// 在绘制完一帧后触发。
		me.addEvents('afterframe');

		me._initTrackConfig();

		me.registerEvents();
	},

	registerEvents: function() {
		var me = this;
		me.canvas.addEventListener('touchstart', function(e) {
			e.preventDefault();

			me.fireEvent('touchstart');

			var locList = me._dispatchTouchEvent(me, e);
			if (locList.length == 1) {
				me._touchstartLoc = locList[0];
			}
			else {
				me._touchstartLoc = null;
			}
		}, false);

		me.canvas.addEventListener('touchend', function(e) {
			e.preventDefault();

			me.fireEvent('touchend');

			var locList = me._dispatchTouchEvent(me, e);
			var lastLoc = me._touchstartLoc;
			if (locList.length > 0 && lastLoc != null) {
				var loc = locList[0];
				if (Pen.Util.distance(loc.x, loc.y, lastLoc.x, lastLoc.y) <= 10) {
					me.fireEvent('tap');
				}
			}
		}, false);

		me.canvas.addEventListener('touchmove', function(e) {
			e.preventDefault();

			me.fireEvent('touchmove');
			me._dispatchTouchEvent(me, e);
		}, false);

		// 点击事件
		me.canvas.addEventListener('click', function(e) {
			me.fireEvent('click');
			me._dispatchMouseEvent(me, e);
		}, false);

		// 鼠标按下事件
		me.canvas.addEventListener('mousedown', function(e) {
			me.fireEvent('mousedown');
			me._dispatchMouseEvent(me, e);
		}, false);

		// 鼠标松开事件
		me.canvas.addEventListener('mouseup', function(e) {
			me.fireEvent('mouseup');
			me._dispatchMouseEvent(me, e);
		}, false);

		// 鼠标移动事件
		me.canvas.addEventListener('mousemove', function(e) {
			me.fireEvent('mousemove');

			var cur = +new Date();
			if (me._lastMoveTime != null) {
				if (cur - me._lastMoveTime < 25) { return; }
			}

			me._lastMoveTime = cur;
			me._dispatchMouseEvent(me, e);
		}, false);

		// 键盘按下事件
		me.canvas.addEventListener('keydown', function(e) {
			me._dispatchKeyEvent(me, e);
		}, false);

		// 键盘松开事件
		me.canvas.addEventListener('keyup', function(e) {
			me._dispatchKeyEvent(me, e);
		}, false);

		me._on('beforeframe', function() {
			if (me.autoClear) {
				me.brush.clear();
			}
		});
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

	/**
	 * 开始动画播放.
	 */
	start: function() {
		var me = this, self = me.self;

		if (me.status == 'stopped') {

			// var loopCount = 0;

			me.timer.run(function(timeStamp) {
				// TODO 抛弃前2次(这个负责的判断是为了在loopCount增加到3后，不再继续增加)
				// if (/* (loopCount >= 3 || loopCount < 3 && ++loopCount == 3) && */me.status == 'running') {
				if (me.status == 'running') {

					// 计算时间增量
					var dt;
					if (me._lastTS == 0) {
						dt = 0;
					}
					else {
						dt = timeStamp - me._lastTS;

						if (me.inFixedIntervalMode) {
							dt = self.INTERVAL;
						}
					}
					me._lastTS = timeStamp;

					// 变速处理
					dt *= me.zoom;
					dt = Math.round(dt);

					me._drawFrame(dt, timeStamp);
				}
			});

			me.status = 'running';
			me.fireEvent('started');
		}
	},

	/**
	 * 渲染舞台上的所有动画。
	 * 为了能够在循环中删除元素，所以采用了逆序循环。而添加元素时，是放到数组开始的。这样一来，最后添加的动画将会位于顶层。
	 * 
	 * @param dt 当前帧与上一帧的时间间隔
	 * @param timeStamp 时间戳。由requestAnimationFrame产生的。
	 */
	_drawFrame: function(dt, timeStamp) {
		var me = this;

		me.fireEvent('beforeframe');

		var sprites = me.sprites;
		var cur;

		me._doTrack(dt);

		for ( var i = sprites.length - 1; i >= 0; i--) {
			cur = sprites[i];

			// 计时
			if (cur.finishedCount == 0) {
				cur.startTime = timeStamp;
			}

			// 判断是否结束
			if (me.checkCompleted(cur, timeStamp)) {

				// TODO 如果追踪的Sprite停止播放了该怎么处理?
				if (cur == me._track) {
					me.stopTrack();
				}

				cur.fireEvent('afterstop');

				sprites.splice(i, 1);

				continue;
			}
			else {
				if (cur.beforeDraw && cur != me._track) {
					cur.beforeDraw(dt);
				}

				me._drawSprite(dt, cur);

				cur.finishedCount++;
			}
		}

		me.fireEvent('afterframe');
	},

	_drawSprite: function(dt, sprite) {
		var me = this;

		sprite.fireEvent('beforedraw', dt);

		me.brush.tmp(function() {
			// 处理因Track等原因导致的坐标平移。
			if (!sprite.fixed) {
				me.brush.translate(me._transX, me._transY);
			}

			// 处理不透明度。
			if (sprite.alpha != undefined) {
				me.brush.setAlpha(sprite.alpha);
			}

			// 处理是否隐藏。如果Sprite隐藏了，则不绘制。
			if (!sprite.hidden) {
				sprite.draw(me.brush, dt);
			}
		});

		sprite.fireEvent('afterdraw');
	},

	/**
	 * 追踪某个Sprite。 即以此Sprite为参考点，将此Sprite固定在画布的某个位置。
	 * 
	 * @param sprite 追踪的Sprite
	 * @param config 追踪配置
	 * 
	 * config的属性包括type、x和y。 其中type取值为'x'、'y'和'both'。如果取其他值，等价于'both'。
	 * x和y默认取画布的中心位置。 例如： config: { type: 'both', x: 100, y: 100 }
	 */
	track: function(sprite, config) {
		this._track = sprite;
		this._initTrackConfig();
		Pen.copy(this._trackConfig, config);
	},

	/**
	 * 停止追踪。
	 */
	stopTrack: function() {
		this._track = null;
		this._initTrackConfig();
	},

	/**
	 * 暂停动画播放。必须通过resume方法恢复。
	 */
	pause: function() {
		if (this.status == 'running') {
			this._lastTS = 0;
			this.status = 'paused';
			this.fireEvent('paused');
		}
	},

	/**
	 * 恢复动画播放。只有在暂停状态时才起作用。
	 */
	resume: function() {
		if (this.status == 'paused') {
			this.status = 'running';
			this.fireEvent('resumed');
		}
	},

	/**
	 * 停止动画播放。可通过start重新恢复。
	 */
	stop: function() {
		var me = this;
		if (me.status != 'stopped') {
			this.timer.pause();
			me.status = 'stopped';
			this.fireEvent('stopped');
		}
	},

	/**
	 * 从舞台中移除指定的Sprite。
	 * 如果Sprite被添加了多次，则都会被移除。
	 */
	remove: function(sprite) {
		var isDel = Pen.Util.removeArrayItem(this.sprites, sprite, true);
		if (isDel) {
			if (this._track == sprite) {
				this.stopTrack();
			}
			sprite.fireEvent('removed');
		}

		return this;
	},

	/**
	 * 移除所有Sprite。
	 */
	removeAll: function() {
		this.stopTrack();

		this.sprites.forEach(function(sprite) {
			sprite.fireEvent('removed');
		});

		this.sprites = [];
	},

	/**
	 * 隐藏舞台上的所有Sprite。
	 */
	hideAll: function() {
		this.sprites.forEach(function(sprite) {
			sprite.hide();
		});

		return this;
	},

	/**
	 * 显示舞台上的所有Sprite。
	 */
	showAll: function() {
		this.sprites.forEach(function(sprite) {
			sprite.show();
		});

		return this;
	},

	hide: function(/* sprite... */) {
		var me = this, i;
		for (i = 0; i < arguments.length; i++) {
			if (arguments[i]) {
				arguments[i].hide();
			}
		}

		return this;
	},

	show: function(/* sprite... */) {
		var me = this, i;
		for (i = 0; i < arguments.length; i++) {
			if (arguments[i]) {
				arguments[i].show();
			}
		}

		return this;
	},

	/**
	 * 改变动画的播放速度.
	 * 
	 * @param ratio 变速的比例. 大于1时加速, 小于1时减速, 等于1时速度不变.
	 */
	speedUp: function(zoom) {
		if (zoom) {
			this.zoom = zoom;
			this.fireEvent('speedUp', this.zoom);
		}

		return this;
	},

	/**
	 * 恢复变速前的速度.
	 */
	restoreSpeed: function() {
		this.zoom = 1;
		this.fireEvent('speedUp', this.zoom);

		return this;
	},

	getWidth: function() {
		return this.canvas.width;
	},

	getHeight: function() {
		return this.canvas.height;
	},

	/**
	 * 增加碰撞检测。
	 * @param spriteList 一组需要互相检测的Sprite
	 */
	addDetection: function(spriteList) {
		this._detectList.push(spriteList);
	},

	/**
	 * 进行碰撞检测。
	 */
	doDetection: function() {
		var me = this;
		me._detectList.forEach(function(detectGroup) {
			var i, j, sp1, sp2, len = detectGroup.length;
			for (i = 0; i < len; i++) {
				for (j = i + 1; j < len; j++) {
					me._doDetection(sp1, sp2);
				}
			}
		});
	},

	_doDetection: function(sprite1, sprite2) {
		var borderList1 = sprite1.getBorderList();
		var borderList2 = sprite2.getBorderList();
		var len1 = borderList1.length, len2 = borderList2.length;

		var i, j, border1, border2;
		if (borderList1 && borderList2) {
			for (i = 0; i < len1; i++) {
				border1 = borderList1[i];
				for (j = 0; j < len2; j++) {
					border2 = borderList2[j];
					if (Pen.Border.detect(border1, border2)) {

						sprite1.fireEvent('collision', sprite2);
						sprite2.fireEvent('collision', sprite1);

						return true;
					}
				}
			}
		}

		return false;
	},

	_initTrackConfig: function() {
		var me = this;
		me._trackConfig = {
			type: 'both',
			x: me.canvas.width / 2,
			y: me.canvas.height / 2
		};
	},

	/**
	 * 在舞台顶部增加一个或多个动画.
	 */
	add: function(/* sprite... */) {
		var i, sprite;
		for (i = 0; i < arguments.length; i++) {
			sprite = arguments[i];
			if (sprite) {
				sprite.stage = this;
				this.sprites.splice(0, 0, sprite);
			}
		}

		return this;
	},

	/**
	 * 在舞台底部增加一个或多个动画。
	 */
	addToBottom: function(/* sprite... */) {
		var i, sprite;
		for (i = 0; i < arguments.length; i++) {
			sprite = arguments[i];
			if (sprite) {
				sprite.stage = this;
				this.sprites.push(sprite);
			}
		}

		return this;
	},

	/**
	 * 生成一个Sprite对象。
	 * 
	 * @param spriteClass Sprite的类或类名
	 * @param config 初始化配置
	 */
	make: function(spriteClass, config) {
		var me = this;

		if (Pen.Util.isString(spriteClass)) {
			spriteClass = Pen.ClassManager.classes[spriteClass];
		}

		if (spriteClass === Pen.Sprite || spriteClass.prototype instanceof Pen.Sprite) {
			return new spriteClass(Pen.copy({
				stage: me
			}, config));
		}
		else {
			return null;
		}
	},

	/**
	 * 检查指定的Sprite是否已经添加到舞台。
	 */
	isSpriteAdded: function(sprite) {
		var sprites = this.sprites;
		for (i in sprites) {
			if (sprites[i] == sprite) { return true; }
		}

		return false;
	},

	/**
	 * 获取一个缓动对象。
	 * 
	 * @param targetSprite 缓动的目标
	 */
	getTween: function(targetSprite) {
		var tween = new Pen.Tween({
			stage: this,
			target: targetSprite
		});

		return tween;
	},

	_doTrack: function(dt) {
		var me = this;
		var track = (me._track != null);

		if (track) {
			me._track.beforeDraw(dt);

			me._transX = -me._track.x + me._trackConfig.x;
			me._transY = -me._track.y + me._trackConfig.y;

			if (me._trackConfig.type == 'x') {
				me._transY = 0;
			}
			else if (me._trackConfig.type == 'y') {
				me._transX = 0;
			}
		}
		else {
			me._transX = 0;
			me._transY = 0;
		}
	},

	/**
	 * 获取事件发生位置相对于画布的坐标。
	 * @param e 事件对象。对于触屏事件来说是Touch对象，它也有pageX和pageY等属性，因此使用此方法。修改实现时注意。
	 */
	_getEventLocation: function(me, e) {
		var offset = Pen.DocUtil.offset(me.canvas);

		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		return {
			x: x,
			y: y
		};
	},

	_dispatchKeyEvent: function(me, e) {
		// TODO
	},

	_dispatchTouchEvent: function(me, e) {
		var touches = e.touches, locList = [];
		var loc, sprites = me.sprites;
		var sprite, prevent;
		var i, j;

		if (touches.length == 0) {
			touches = e.changedTouches;
		}

		for (j = 0; j < touches.length; j++) {
			loc = me._getEventLocation(me, touches[j]);
			locList.push(loc);

			for (i = 0; i < sprites.length; i++) {
				if (sprites[i] && sprites[i].dispatchEvent) {
					sprite = sprites[i];

					if (!sprite.fixed) {
						prevent = sprite.dispatchEvent(e, loc.x - me._transX, loc.y - me._transY);
					}
					else {
						prevent = sprite.dispatchEvent(e, loc.x, loc.y);
					}

					if (prevent) {
						break;
					}
				}
			}
		}

		return locList;
	},

	_dispatchMouseEvent: function(me, e) {
		var loc = this._getEventLocation(me, e);
		var sprites = me.sprites;
		var sprite, prevent;

		for ( var i = 0; i < sprites.length; i++) {
			if (sprites[i] && sprites[i].dispatchEvent) {
				sprite = sprites[i];

				if (!sprite.fixed) {
					prevent = sprite.dispatchEvent(e, loc.x - me._transX, loc.y - me._transY);
				}
				else {
					prevent = sprite.dispatchEvent(e, loc.x, loc.y);
				}

				if (prevent) {
					break;
				}
			}
		}
	},

	/**
	 * 检查指定的动画是否已经完成。
	 */
	checkCompleted: function(sprite, timeStamp) {
		if (null == sprite)
			return true;

		var complete = false;

		if (sprite.type == Pen.Sprite.COUNT) {
			if (sprite.count == sprite.finishedCount) {
				complete = true;
			}
		}
		else if (sprite.type == Pen.Sprite.DURATION) {
			if (timeStamp - sprite.startTime >= sprite.duration) {
				complete = true;
			}
		}
		else if (sprite.type == Pen.Sprite.UNTIL) {
			if (sprite.util == undefined || sprite.util()) {
				complete = true;
			}
		}

		return complete;
	}
});
