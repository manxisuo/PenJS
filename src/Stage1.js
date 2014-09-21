(function(window) {
	function Stage(interval) {
		this.sprites = [];
		this.timerId = -1;
		this.running = false;
		this.clearCanvasFn = null;
		this.interval = interval == undefined ? 50 : interval;
		this.backupInterval = undefined;
	}

	/**
	 * 增加一个动画. 如果之前动画管理器没有启动, 将触发其启动.
	 */
	Stage.prototype.add = function(draw, type, config) {
		var sprite;

		if (arguments[0] instanceof Sprite) {
			sprite = arguments[0];
		}
		else {
			sprite = new Sprite(draw, type, config);
		}

		if (sprite.type == Sprite.PERIOD) {
			sprite.times = Math.round(sprite.period / this.interval);
		}

		// 表示已经执行了多少次(多少个帧)
		sprite.completedCount = 0;

		// 表示动画开始执行时的时间
		sprite.startTime = -1;

		this.sprites.splice(0, 0, sprite);

		if (!this.running) {
			this.start();
		}

		return sprite;
	};

	function checkCompleted(sprite) {
		if (null == sprite)
			return true;

		var complete = false;

		if (sprite.type == Sprite.PERIOD || sprite.type == Sprite.TIMES) {
			if ((sprite.times--) == 0) {
				complete = true;
			}
		}
		else if (sprite.type == Sprite.UNTIL) {
			if (sprite.util == undefined || sprite.util()) {
				complete = true;
			}
		}

		return complete;
	}

	// 计算动画已经持续的时间
	function calcDuration(current) {
		var duration;
		if (current.startTime == -1) {
			current.startTime = new Date().getTime();
			duration = 0;
		}
		else {
			duration = new Date().getTime() - current.startTime;
		}

		return duration;
	}

	/**
	 * 开始动画播放.
	 */
	Stage.prototype.start = function() {

		var me = this;
		var sprites = me.sprites;

		var current;
		var duration;

		if (!me.running && sprites.length > 0) {
			me.timerId = setInterval(function() {

				// 清空画布
				if (me.clearCanvasFn) {
					me.clearCanvasFn();
				}

				// 渲染所有动画的帧.
				// 为了能够在循环中删除元素, 所以采用了逆序循环. 而添加元素时, 是放到数组开始的.
				// 这样一来, 最后添加的动画将会位于顶层.
				for ( var i = sprites.length - 1; i >= 0; i--) {
					current = sprites[i];

					duration = calcDuration(current);

					if (checkCompleted(current)) {
						if (current.afterStop) {
							current.afterStop.call(current.scope || window, current.completedCount, duration);
						}
						sprites.splice(i, 1);
						continue;
					}
					else {

						current.draw.call(current.scope || window, current.completedCount++, duration);
					}
				}

				if (sprites.length == 0) {
					me.stop();
				}

			}, me.interval);

			me.running = true;
		}
	};

	/**
	 * 停止动画播放. 可通过start重新恢复.
	 */
	Stage.prototype.stop = function() {
		var me = this;
		if (me.running) {
			clearInterval(me.timerId);
			me.timerId = -1;
			me.running = false;
		}

		var sprites = me.sprites;
		var current;
		for ( var i = sprites.length - 1; i >= 0; i--) {
			current = sprites[i];
			duration = calcDuration(current);
			if (current.afterStop) {
				current.afterStop.call(current.scope || window, current.completedCount, duration);
			}
		}
	};
	
	Stage.prototype.remove = function(sprite) {
		var sprites = this.sprites;
		for ( var i = sprites.length - 1; i >= 0; i--) {
			if (sprites[i] == sprite) {
				sprites.splice(i, 1);
				
				break;
			}
		}
	}

	/**
	 * 重新设置每帧的持续时间.
	 */
	Stage.prototype.setInterval = function(interval) {
		var me = this;

		if (typeof interval == 'number' && interval > 0) {
			if (interval < 1) {
				interval = 1;
			}

			if (me.running) {
				me.stop();
				me.interval = interval;
				me.start();
			}
			else {
				me.interval = interval;
			}

			me.backupInterval = undefined;
		}
	};

	/**
	 * 改变动画的播放速度.
	 * 
	 * @param ratio 变速的比例. 大于1时加速, 小于1时减速, 等于1时速度不变.
	 */
	Stage.prototype.speedUp = function(ratio) {
		var me = this;

		if (typeof ratio == 'number' && ratio > 0) {

			if (ratio == 1 || ratio > 1 && this.interval == 1) { return; }

			// 只有第一次调过speedUp时, 才进行备份. (在调restoreSpeed恢复速度后, 将重新计数.)
			if (me.backupInterval == undefined) {
				me.backupInterval = me.interval;
			}

			var newInterval = me.interval / ratio;
			if (newInterval < 1) {
				newInterval = 1;
			}

			// 使新的interval产生作用
			if (me.running) {
				me.stop();
				me.interval = newInterval;
				me.start();
			}
			else {
				me.interval = newInterval;
			}
		}
	};

	/**
	 * 恢复变速前的速度.
	 */
	Stage.prototype.restoreSpeed = function() {
		if (this.backupInterval != undefined) {
			this.setInterval(this.backupInterval);
			this.backupInterval = undefined;
		}
	};

	/**
	 * 停止动画, 并清空动画列表.
	 */
	Stage.prototype.clear = function() {
		this.stop();
		this.sprites = [];
	};

	Stage.prototype.setClearCanvasFn = function(fn) {
		this.clearCanvasFn = fn;
	};

	window.Stage = Stage;
})(window);
