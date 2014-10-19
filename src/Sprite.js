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
			UNTIL: 4
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
		_tweenFnList: {},

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
		
		init: function() {
			// 鼠标事件
			this.addEvents('click', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave');
			
			// 键盘事件
			this.addEvents('keypress', 'keydown', 'keyup');

			// 每次绘制帧前触发。
			// 在Sprite的beforeDraw和draw方法之间触发。
			this.addEvents('beforedraw');

			// 每次绘制帧后触发。
			// 在Sprite的draw方法之后触发。
			this.addEvents('afterdraw');

			// 所有帧绘制完毕后触发。
			// 即满足终止条件后触发。若是被强行从舞台清除，则不会触发。
			this.addEvents('afterstop');
		}
	});

	/**
	 * 给Sprite分发事件。
	 * 内部方法，由Stage类使用。
	 */
	Sprite.prototype.dispatchEvent = function(e, x, y) {
		switch (e.type) {
			case 'click': {
				var hit = this.checkInside(x, y);
				if (hit) {
					this.fireEvent('click', e);
				}

				return hit;
			}
			case 'mousedown': {
				var hit = this.checkInside(x, y);
				if (hit) {
					this.fireEvent('mousedown', e);
				}

				return hit;
			}
			case 'mouseup': {
				var hit = this.checkInside(x, y);
				if (hit) {
					this.fireEvent('mouseup', e);
				}

				return hit;
			}
			case 'mousemove': {
				var hit = this.checkInside(x, y);

				if (!this._mouseInside && hit) {
					this.fireEvent('mouseenter', e);
				}
				else if (this._mouseInside && !hit) {
					this.fireEvent('mouseleave', e);
				}

				this._mouseInside = hit;

				return hit;
			}
		}
	};
	
})(window);
