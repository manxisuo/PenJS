(function(window) {
	Pen.define('Pen.Tween', {
		//@required
		stage: null,

		//@required
		target: null,

		_beforeDrawBackup: null,

		// 缓动动作列表
		actionList: null,

		init: function() {
			var me = this, target = me.target, ns = '.' + me.id;

			// 初始化动作列表 
			// TODO 由于ClassManager的bug。
			me.actionList = [];

			// 备份目标的beforeDraw方法
			me._beforeDrawBackup = target.beforeDraw;
		},

		/**
		 * 添加一个缓动动作并立即执行。
		 */
		to: function(duration, params) {
			var me = this, ns = '.' + me.id, target = me.target;

			if (me.actionList.length == 0) {
				target.off('afterstop' + ns).on('afterstop' + ns, function() {
					me.stop();
				});
			}

			if (!me._hasTween(target) && me.actionList.length == 0) {

				// 修改target的beforeDraw方法
				target.beforeDraw = function() {
					for ( var i in target._actionFnList) {
						target._actionFnList[i]();
					}
				};
			}

			// 动作的类型
			var ease = params.ease || Easing.None.easeIn;
			delete params.ease;

			// 动作是否循环
			var loop = params.loop;
			delete params.loop;

			// 动作完成后执行的回调函数
			var oncomplete = params.oncomplete;
			delete params.oncomplete;

			var action = {
				duration: duration,
				params: params,
				startTime: -1,
				ease: ease,
				loop: loop,
				oncomplete: oncomplete,
				passing: null,
				id: Pen.getId()
			};

			me.actionList.push(action);

			// 触发缓动开始
			if (me.actionList.length == 1) {
				me._handleNext();
			}

			return me;
		},

		/**
		 * 处理队列中的下一个动作。
		 */
		_handleNext: function() {
			var me = this, actionList = me.actionList, target = me.target;
			var action = actionList[0], ns = '.' + me.id;

			// 处理stage暂停或停止的情况
			me.stage.off('paused' + ns, 'stopped' + ns).on('paused' + ns, 'stopped' + ns,
					function() {
						action.passing = +new Date - action.startTime;
					});

			// 判断是否结束
			me.target.off('afterdraw' + ns).on('afterdraw' + ns, function() {
				if (+new Date - action.startTime >= action.duration) {
					me._endCurrent(action);
				}
			});

			var params0 = {}, p;
			for (p in action.params) {
				params0[p] = target[p];
			}

			action.startTime = +new Date;

			// 将当前动作需要执行的函数放入到target中
			// 注意：此函数是在target的beforeDraw中调用的
			target._actionFnList[me.id] = function() {

				// 计算动作已经持续的时间。
				// 需要判断动作是否暂停过。如果有暂停过，则暂停后的时间不计算在内。
				var t, current = +new Date;
				if (action.passing != null) {
					t = action.passing;
					action.startTime = current - action.passing;
					action.passing = null;
				}
				else {
					t = current - action.startTime;
				}

				var d = action.duration;

				// 根据缓动公式，计算target的当前状态。
				var p, b, c;
				if (action.duration <= 0) {
					for (p in action.params) {
						target[p] = action.params[p];
					}
					me._endCurrent(action);
				}
				else {
					for (p in action.params) {
						b = params0[p];
						c = action.params[p] - b;
						target[p] = action.ease(t, b, c, d);
					}
				}
			};
		},

		/**
		 * 结束缓动。
		 * 
		 * 并恢复目标的beforeDraw(这是与cancelAll唯一不同的地方)。
		 * 此Tween对象后续可以继续使用。
		 */
		stop: function() {
			var me = this, target = me.target;

			me.cancelAll();

			// 恢复target的beforeDraw方法
			if (!me._hasTween(target) && me._beforeDrawBackup != null) {
				target.beforeDraw = me._beforeDrawBackup;
			}
		},

		/**
		 * 取消所有缓动动作。
		 * 
		 * 不恢复目标的beforeDraw(这是与stop唯一不同的地方)。
		 * 此Tween对象后续可以继续使用。
		 */
		cancelAll: function() {
			var me = this, ns = '.' + me.id, target = me.target;

			me.actionList = [];

			delete target._actionFnList[me.id];

			target.off(ns);
			me.stage.off(ns);

			return me;
		},

		/**
		 * 等待指定的时间间隔。
		 */
		wait: function(duration) {
			return this.to(duration, {});
		},

		/**
		 * 等待指定的时间间隔。
		 */
		sleep: function() {
			return this.to(duration, {});
		},

		/**
		 * 等待指定的时间间隔。
		 */
		delay: function() {
			return this.to(duration, {});
		},

		set: function(params) {
			return this.to(0, params);
		},

		/**
		 * 取消当前缓动动作。
		 */
		cancelCurrent: function() {
			var me = this, actionList = me.actionList, target = me.target;
			var action;

			if (actionList.length > 0) {
				action = actionList[0];

				me._endCurrent(action, true);
			}

			return this;
		},

		/**
		 * 检查指定的Sprite上是否存在其他缓动。
		 */
		_hasTween: function(sprite) {
			if (sprite) {
				var p;
				for (p in sprite._actionFnList) {
					return true;
				}
			}

			return false;
		},

		/**
		 * 结束当前动作，并继续下一个动作。
		 * 如果没有更多动作，则结束缓存。
		 * 
		 * @param action 当前动作。
		 * @param isCancel 是否是被取消，即没有完成被中断。
		 */
		_endCurrent: function(action, isCancel) {
			var me = this, actionList = me.actionList;
			if (action.loop) {
				actionList.push(actionList.shift());
			}
			else {
				actionList.shift();
			}

			if (!isCancel && action.oncomplete) {
				action.oncomplete();
			}

			if (actionList.length == 0) {
				me.stop();
				return;
			}

			me._handleNext();
		},
	});

	/**
	 * t: current time（当前时间）
	 * b: beginning value（初始值）
	 * c: change in value（变化量）
	 * d: duration（持续时间）
	 */
	var Easing = {
		None: {
			easeIn: function(t, b, c, d) {
				return b + t * c / d;
			},
			easeOut: function(t, b, c, d) {
				return b + t * c / d;
			},
			easeInOut: function(t, b, c, d) {
				return b + t * c / d;
			}
		},
		Quad: {
			easeIn: function(t, b, c, d) {
				return c * (t /= d) * t + b;
			},
			easeOut: function(t, b, c, d) {
				return -c * (t /= d) * (t - 2) + b;
			},
			easeInOut: function(t, b, c, d) {
				if ((t /= d / 2) < 1) { return c / 2 * t * t + b; }
				return -c / 2 * ((--t) * (t - 2) - 1) + b;
			}
		},
		Cubic: {
			easeIn: function(t, b, c, d) {
				return c * (t /= d) * t * t + b;
			},
			easeOut: function(t, b, c, d) {
				return c * ((t = t / d - 1) * t * t + 1) + b;
			},
			easeInOut: function(t, b, c, d) {
				if ((t /= d / 2) < 1) { return c / 2 * t * t * t + b; }
				return c / 2 * ((t -= 2) * t * t + 2) + b;
			}
		},
		Quart: {
			easeIn: function(t, b, c, d) {
				return c * (t /= d) * t * t * t + b;
			},
			easeOut: function(t, b, c, d) {
				return -c * ((t = t / d - 1) * t * t * t - 1) + b;
			},
			easeInOut: function(t, b, c, d) {
				if ((t /= d / 2) < 1) { return c / 2 * t * t * t * t + b; }
				return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
			}
		},
		Quint: {
			easeIn: function(t, b, c, d) {
				return c * (t /= d) * t * t * t * t + b;
			},
			easeOut: function(t, b, c, d) {
				return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
			},
			easeInOut: function(t, b, c, d) {
				if ((t /= d / 2) < 1) { return c / 2 * t * t * t * t * t + b; }
				return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
			}
		},
		Sine: {
			easeIn: function(t, b, c, d) {
				return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
			},
			easeOut: function(t, b, c, d) {
				return c * Math.sin(t / d * (Math.PI / 2)) + b;
			},
			easeInOut: function(t, b, c, d) {
				return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
			}
		},
		Strong: {
			easeIn: function(t, b, c, d) {
				return c * (t /= d) * t * t * t * t + b;
			},
			easeOut: function(t, b, c, d) {
				return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
			},
			easeInOut: function(t, b, c, d) {
				if ((t /= d / 2) < 1) { return c / 2 * t * t * t * t * t + b; }
				return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
			}
		},
		Expo: {
			easeIn: function(t, b, c, d) {
				return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
			},
			easeOut: function(t, b, c, d) {
				return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
			},
			easeInOut: function(t, b, c, d) {
				if (t == 0) { return b; }
				if (t == d) { return b + c; }
				if ((t /= d / 2) < 1) { return c / 2 * Math.pow(2, 10 * (t - 1)) + b; }
				return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
			}
		},
		Circ: {
			easeIn: function(t, b, c, d) {
				return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
			},
			easeOut: function(t, b, c, d) {
				return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
			},
			easeInOut: function(t, b, c, d) {
				if ((t /= d / 2) < 1) { return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b; }
				return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
			}
		},
		Elastic: {
			easeIn: function(t, b, c, d, a, p) {
				var s;
				if (t == 0) { return b; }
				if ((t /= d) == 1) { return b + c; }
				if (!p) {
					p = d * .3;
				}
				if (!a || a < Math.abs(c)) {
					a = c;
					s = p / 4;
				}
				else {
					s = p / (2 * Math.PI) * Math.asin(c / a);
				}
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p))
						+ b;
			},
			easeOut: function(t, b, c, d, a, p) {
				var s;
				if (t == 0) { return b; }
				if ((t /= d) == 1) { return b + c; }
				if (!p) {
					p = d * .3;
				}
				if (!a || a < Math.abs(c)) {
					a = c;
					s = p / 4;
				}
				else {
					s = p / (2 * Math.PI) * Math.asin(c / a);
				}
				return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
			},
			easeInOut: function(t, b, c, d, a, p) {
				var s;
				if (t == 0) { return b; }
				if ((t /= d / 2) == 2) { return b + c; }
				if (!p) {
					p = d * (.3 * 1.5);
				}
				if (!a || a < Math.abs(c)) {
					a = c;
					s = p / 4;
				}
				else {
					s = p / (2 * Math.PI) * Math.asin(c / a);
				}
				if (t < 1) { return -.5
						* (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI)
								/ p)) + b; }
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)
						* .5 + c + b;
			}
		},
		Back: {
			easeIn: function(t, b, c, d, s) {
				if (typeof s == UNDEFINED) {
					s = 1.70158;
				}
				return c * (t /= d) * t * ((s + 1) * t - s) + b;
			},
			easeOut: function(t, b, c, d, s) {
				if (typeof s == UNDEFINED) {
					s = 1.70158;
				}
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			},
			easeInOut: function(t, b, c, d, s) {
				if (typeof s == UNDEFINED) {
					s = 1.70158;
				}
				if ((t /= d / 2) < 1) { return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b; }
				return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
			}
		},
		Bounce: {
			easeIn: function(t, b, c, d) {
				return c - Easing.Bounce.easeOut(d - t, 0, c, d) + b;
			},
			easeOut: function(t, b, c, d) {
				if ((t /= d) < (1 / 2.75)) {
					return c * (7.5625 * t * t) + b;
				}
				else if (t < (2 / 2.75)) {
					return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
				}
				else if (t < (2.5 / 2.75)) {
					return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
				}
				else {
					return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
				}
			},
			easeInOut: function(t, b, c, d) {
				if (t < d / 2) { return Easing.Bounce.easeIn(t * 2, 0, c, d) * .5 + b; }
				return Easing.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
			}
		}
	};

	Pen.Easing = Easing;

})(window);