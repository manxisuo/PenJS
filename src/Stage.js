(function(window) {
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
			|| window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
			|| window.oRequestAnimationFrame || function(callback) {
				setTimeout(callback, 1000 / 60);
			};

	var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame
			|| window.webkitCancelAnimationFrame || window.msCancelAnimationFrame
			|| window.oCancelAnimationFrame || window.clearTimeout;

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
		timerId: -1,
		status: 'stopped', // 'stopped', 'paused', 'running'

		_lastTS: 0,

		inFixedIntervalMode: false,

		zoom: 1,

		_track: null,
		_trackConfig: null,
		_transX: 0,
		_transY: 0,

		// 事件
		_lastMoveTime: null,

		// 在绘制帧前，是否自动清除画布。
		autoClear: true,

		init: _init
	});

	function _getEventLocation(me, e) {
		var offset = Pen.DocUtil.offset(me.canvas);

		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		return {
			x: x,
			y: y
		};
	}

	function _dispatchKeyEvent(me, e) {
		// TODO
	}

	function _dispatchMouseEvent(me, e) {
		var loc = _getEventLocation(me, e);
		var sprites = me.sprites;
		var sprite, hit;

		for ( var i = 0; i < sprites.length; i++) {
			if (sprites[i] && sprites[i].dispatchEvent) {
				sprite = sprites[i];

				if (!sprite.fixed) {
					hit = sprite.dispatchEvent(e, loc.x - me._transX, loc.y - me._transY);
				}
				else {
					hit = sprite.dispatchEvent(e, loc.x, loc.y);
				}

				if (hit) {
					break;
				}
			}
		}
	}

	function _init() {
		var me = this;

		me.canvas = me.brush.canvas;
		if (!me.canvas) {
			throw new Error('canvas is not provided.');
			return;
		}

		me.addEvents('started', 'paused', 'resumed', 'stopped');

		// 在速度改变时触发
		me.addEvents('speedUp');

		// 在绘制一帧前触发。
		me.addEvents('beforeframe');

		// 在绘制完一帧后触发。
		me.addEvents('afterframe');

		me._initTrackConfig();

		// 点击事件
		me.canvas.addEventListener('click', function(e) {
			_dispatchMouseEvent(me, e);
		}, false);

		// 鼠标按下事件
		me.canvas.addEventListener('mousedown', function(e) {
			_dispatchMouseEvent(me, e);
		}, false);

		// 鼠标松开事件
		me.canvas.addEventListener('mouseup', function(e) {
			_dispatchMouseEvent(me, e);
		}, false);

		// 鼠标移动事件
		me.canvas.addEventListener('mousemove', function(e) {
			var cur = +new Date();
			if (me._lastMoveTime != null) {
				if (cur - me._lastMoveTime < 25) { return; }
			}

			me._lastMoveTime = cur;
			_dispatchMouseEvent(me, e);

		}, false);

		// 键盘按下事件
		me.canvas.addEventListener('keydown', function(e) {
			_dispatchKeyEvent(me, e);
		}, false);

		// 键盘松开事件
		me.canvas.addEventListener('keyup', function(e) {
			_dispatchKeyEvent(me, e);
		}, false);

		me._on('beforeframe', function() {
			if (me.autoClear) {
				me.brush.clear();
			}
		});
	}

	Stage.prototype._initTrackConfig = function() {
		var me = this;
		me._trackConfig = {
			type: 'both',
			x: me.canvas.width / 2,
			y: me.canvas.height / 2
		};
	};

	/**
	 * 在舞台顶部增加一个动画.
	 */
	Stage.prototype.add = function(sprite) {
		if (sprite) {
			sprite.stage = this;
			sprite.brush = this.brush;
			this.sprites.splice(0, 0, sprite);
		}

		return this;
	};

	/**
	 * 在舞台底部增加一个动画。
	 */
	Stage.prototype.addToBottom = function(sprite) {
		if (sprite) {
			sprite.stage = this;
			sprite.brush = this.brush;
			this.sprites.push(sprite);
		}

		return this;
	};
	
	/**
	 * 生成一个Sprite对象。
	 * @param spriteClass Sprite的类或类名
	 * @param config 初始化配置
	 */
	Stage.prototype.make = function(spriteClass, config) {
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
	};
	
	Stage.prototype.isSpriteAdded = function(sprite) {
		var sprites = this.sprites;
		for (i in sprites) {
			if (sprites[i] == sprite) {
				return true;
			}
		}
		
		return false;
	};
	
	Stage.prototype.getTween = function(targetSprite) {
		var me = this;
		
		if (!me.isSpriteAdded(targetSprite)) {
			me.add(targetSprite);
		}
		
		var tween = new Pen.Tween({
			stage: me,
			target: targetSprite
		});
		
		return tween;
	};
	
	function checkCompleted(sprite, timeStamp) {
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

	Stage.prototype._doTrack = function(dt) {
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
	};

	/**
	 * 开始动画播放.
	 */
	Stage.prototype.start = function() {
		var me = this, self = me.self;

		if (me.status != 'stopped') { return; }

		var dt;
		var loopCount = 0;
		var loop = function(timeStamp) {

			// TODO 抛弃前2次(这个负责的判断是为了在loopCount增加到3后，不再继续增加)
			if (/* (loopCount >= 3 || loopCount < 3 && ++loopCount == 3) && */me.status == 'running') {

				// 计算时间增量
				if (me._lastTS == 0) {
					dt = 0;
				}
				else {
					dt = timeStamp - me._lastTS;

					// TODO
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

			me.timerId = requestAnimationFrame(loop);
		};

		me.timerId = requestAnimationFrame(loop);

		me.status = 'running';
		me.fireEvent('started');
	};

	/**
	 * 渲染所有动画。
	 * 为了能够在循环中删除元素，所以采用了逆序循环。而添加元素时，是放到数组开始的。这样一来，最后添加的动画将会位于顶层。
	 * 
	 * 
	 * @param dt 当前帧与上一帧的时间间隔
	 * @param timeStamp 时间戳。由requestAnimationFrame产生的。
	 */
	Stage.prototype._drawFrame = function(dt, timeStamp) {
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
			if (checkCompleted(cur, timeStamp)) {

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

				cur.fireEvent('beforedraw');

				me.brush.tmp(function() {
					if (!cur.fixed) {
						me.brush.translate(me._transX, me._transY);
					}
					cur.draw(me.brush, dt);
				});
				
				cur.fireEvent('afterdraw');

				cur.finishedCount++;
			}
		}

		me.fireEvent('afterframe');
	};

	/**
	 * 追踪某个Sprite。 即以此Sprite为参考点，将此Sprite固定在画布的某个位置。
	 * 
	 * @param sprite 追踪的Sprite
	 * @param config 追踪配置
	 * 
	 * config的属性包括type、x和y。 其中type取值为'x'、'y'和'both'。如果取其他值，等价于'both'。
	 * x和y默认取画布的中心位置。 例如： config: { type: 'both', x: 100, y: 100 }
	 */
	Stage.prototype.track = function(sprite, config) {
		this._track = sprite;
		this._initTrackConfig();
		Pen.copy(this._trackConfig, config);
	};

	/**
	 * 停止追踪。
	 */
	Stage.prototype.stopTrack = function() {
		this._track = null;
		this._initTrackConfig();
	};

	/**
	 * 暂停动画播放。必须通过resume方法恢复。
	 */
	Stage.prototype.pause = function() {
		if (this.status == 'running') {
			this._lastTS = 0;
			this.status = 'paused';
			this.fireEvent('paused');
		}
	};

	/**
	 * 恢复动画播放。只有在暂停状态时才起作用。
	 */
	Stage.prototype.resume = function() {
		if (this.status == 'paused') {
			this.status = 'running';
			this.fireEvent('resumed');
		}
	};

	/**
	 * 停止动画播放。可通过start重新恢复。
	 */
	Stage.prototype.stop = function() {
		var me = this;
		if (me.status != 'stopped') {
			cancelAnimationFrame(me.timerId);
			me.timerId = -1;
			me.status = 'stopped';
			this.fireEvent('stopped');
		}
	};

	Stage.prototype.remove = function(sprite) {
		var sprites = this.sprites;
		for ( var i = sprites.length - 1; i >= 0; i--) {
			if (sprites[i] == sprite) {

				if (this._track == sprite) {
					this.stopTrack();
				}

				sprites.splice(i, 1);

				break;
			}
		}

		return this;
	};

	/**
	 * 改变动画的播放速度.
	 * 
	 * @param ratio 变速的比例. 大于1时加速, 小于1时减速, 等于1时速度不变.
	 */
	Stage.prototype.speedUp = function(zoom) {
		if (zoom) {
			this.zoom = zoom;
			this.fireEvent('speedUp', this.zoom);
		}
	};

	/**
	 * 恢复变速前的速度.
	 */
	Stage.prototype.restoreSpeed = function() {
		this.zoom = 1;
		this.fireEvent('speedUp', this.zoom);
	};

	/**
	 * 清空Sprite列表.
	 */
	Stage.prototype.clear = function() {
		this.stopTrack();
		this.sprites = [];
	};
})(window);
