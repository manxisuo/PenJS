(function(window) {
	/**
	 * Sprite(精灵)。
	 * 表示舞台上的一个独立的动画对象。可以逐帧绘制到舞台上从而实现动画效果。
	 */
	var Sprite = Pen.define('Pen.Sprite', {
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

		// 宽度
		w: 0,

		// 高度
		h: 0,

		// 运动学参数(速度)
		//		vx: 0,
		//		vy: 0,
		//		omiga: 0,

		// 运动学参数(加速度)
		//		ax: 0,
		//		ay: 0,

		// 运动学参数(加速度的变化率)
		//		kx: 0,
		//		ky: 0,

		// 缓动函数列表。
		// 用于实现缓动。
		_actionFnList: null,

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

		// 在绘制每一帧前执行，通常用来改变Sprite的状态。
		// 模板方法。
		beforeDraw: function() {
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
			this.addEvents('afterstop');
			
			// 被从舞台中删除时触发。即执行Stage的remove或removeAll方法时。
			this.addEvents('removed');
			
			this._actionFnList = {};
			
			var me = this;
			me.on('removed', function() {
				console.log(me.id);
			});
		}
	});

	function isInside(r) {
		return r === true || Pen.Sprite.INSIDE == r || Pen.Sprite.INSIDE_PREVENT == r;
	}

	function isPrevent(r) {
		return r === true || Pen.Sprite.INSIDE_PREVENT == r;
	}

	/**
	 * 在舞台中显示。
	 */
	Sprite.prototype.show = function() {
		this.hidden = false;
	};
	
	/**
	 * 在舞台中隐藏。
	 * 注意：被隐藏后，不会在舞台上渲染，不会触发用户事件(鼠标、触摸、键盘等用户操作)。
	 */
	Sprite.prototype.hide = function() {
		this.hidden = true;
	};
	
	/**
	 * 给Sprite分发事件。
	 * 内部方法，由Stage类使用。
	 */
	Sprite.prototype.dispatchEvent = function(e, x, y) {
		
		if (this.hidden) {
			return;
		}
		
		switch (e.type) {
			case 'click': {
				var r = this.checkInside(x, y);
				if (isInside(r)) {
					this.fireEvent('click', e);
				}

				return isPrevent(r);
			}
			case 'mousedown': {
				var r = this.checkInside(x, y);
				if (isInside(r)) {
					this.fireEvent('mousedown', e);
				}

				return isPrevent(r);
			}
			case 'mouseup': {
				var r = this.checkInside(x, y);
				if (isInside(r)) {
					this.fireEvent('mouseup', e);
				}

				return isPrevent(r);
			}
			case 'mousemove': {
				var r = this.checkInside(x, y);

				if (!this._mouseInside && isInside(r)) {
					this.fireEvent('mouseenter', e);
				}
				else if (this._mouseInside && !isInside(r)) {
					this.fireEvent('mouseleave', e);
				}

				this._mouseInside = isInside(r);

				return isPrevent(r);
			}
			case 'touchstart': {
				var r = this.checkInside(x, y);
				if (isInside(r)) {
					this.fireEvent('touchstart', e);

					this._touchstart = true;
				}

				return isPrevent(r);
			}
			case 'touchmove': {
				var r = this.checkInside(x, y);
				if (isInside(r)) {
					this.fireEvent('touchmove', e);
				}

				return isPrevent(r);
			}
			case 'touchend': {
				var r = this.checkInside(x, y);
				if (isInside(r)) {
					this.fireEvent('touchend', e);

					if (this._touchstart) {
						this.fireEvent('tap', e);
					}
				}
				else {
					this._touchstart = false;
				}

				return isPrevent(r);
			}
		}
	};

})(window);
