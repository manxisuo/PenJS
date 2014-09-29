(function(window) {
	var Sprite = Pen.define(Pen.Base, {
		mixins: {
			event: Pen.EventSource
		},

		statics: {
			CONTINOUS: 1,
			COUNT: 2,
			DURATION: 3,
			UNTIL: 4
		},

		// 动画类型相关参数
		type: 1,
		count: 0,
		duration: 0,
		finishedCount: 0,
		startTime: null,

		// 运动学参数(位置)
		x: 0,
		y: 0,
		angle: 0,

		// 运动学参数(速度)
		vx: 0,
		vy: 0,
		omiga: 0,

		// 运动学参数(加速度)
		ax: 0,
		ay: 0,

		// 运动学参数(加速度的变化率)
		kx: 0,
		ky: 0,

		fixed: false,
		stoppable: true,
		
		scale: {
			x: 1,
			y: 1
		},

		// 图像
		image: null,

		// 事件相关参数
		_mouseInside: false,

		// 模板方法。在绘制每一帧前，计算Sprite的状态。
		beforeDraw: function() {
		},

		// 模板方法。绘制某一帧的Sprite。
		draw: function() {
		},

		init: function() {
			this.type = Sprite.CONTINOUS;
			
			this.addEvents('click', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave');
			this.addEvents('click', 'keydown', 'keyup');

			// 每次绘制帧前触发。
			// 在Sprite的beforeDraw和draw方法之间触发。
			this.addEvents('beforedraw');

			// 所有帧绘制完毕后触发。
			this.addEvents('afterstop');
		}
	});

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
	}

	Sprite.prototype.checkInside = function(x, y) {
		return false;
	}

	window.Sprite = Sprite;
})(window);
