(function(window) {
	Pen.define('Pen.Tween', {
		stage: null,
		target: null,
		beforeDrawBackup: null,
		twList: null,
		init: function() {
			var me = this, target = me.target;
			me.stage = Pen.Global.stage;
			me.twList = [];

			if (!me._hasTween(target)) {
				me.beforeDrawBackup = target.beforeDraw;
				
				target.beforeDraw = function() {
					for (var i in target._tweenFnList) {
						target._tweenFnList[i]();
					}
				}
			}
		},

		_hasTween: function(sprite) {
			if (sprite) {
				var p;
				for (p in sprite._tweenFnList) {
					return true;
				}
			}

			return false;
		},

		_tweenOver: function() {
			var me = this, ns = '.' + me.id, target = me.target;

			delete target._tweenFnList[me.id];
			
			if (!me._hasTween(target) && me.beforeDrawBackup != null) {
				target.beforeDraw = me.beforeDrawBackup;
			}

			target.unbind(ns);
			me.stage.unbind(ns);
		},

		_handleNext: function() {
			var me = this, twList = me.twList, target = me.target;
			var tw = twList[0], ns = '.' + me.id;

			// 处理stage暂停或停止的情况
			me.stage.unbind('paused' + ns, 'stopped' + ns).on('paused' + ns, 'stopped' + ns,
					function() {
						tw.passing = +new Date - tw.startTime;
					});

			// 判断是否结束
			me.target.unbind('afterdraw' + ns).on('afterdraw' + ns, function() {
				if (+new Date - tw.startTime >= tw.duration) {
					if (tw.loop) {
						twList.push(twList.shift());
					}
					else {
						twList.shift();
					}

					if (twList.length == 0) {
						me._tweenOver();

						return;
					}
					me._handleNext();
				}
			});

			var params0 = {}, p;
			for (p in tw.params) {
				params0[p] = target[p];
			}

			tw.startTime = +new Date;

			target._tweenFnList[me.id] = function() {
				var t, current = +new Date;
				if (tw.passing != null) {
					t = tw.passing;
					tw.startTime = current - tw.passing;
					tw.passing = null;
				}
				else {
					t = current - tw.startTime;
				}

				var d = tw.duration;

				var p, b, c;
				for (p in tw.params) {
					b = params0[p];
					c = tw.params[p] - b;
					target[p] = tw.ease(t, b, c, d);
				}
			};
		},

		stop: function() {
			this._tweenOver();
		},

		wait: function(duration) {
			return this.to(duration, {});
		},

		sleep: function() {
			return this.to(duration, {});
		},

		delay: function() {
			return this.to(duration, {});
		},

		to: function(duration, params) {
			var me = this;

			var ease = params.ease || Easing.None.easeIn;
			delete params.ease;

			var loop = params.loop;
			delete params.loop;

			var tw = {
				duration: duration,
				params: params,
				startTime: -1,
				ease: ease,
				loop: loop,
				passing: null,
				id: Pen.getId()
			};

			me.twList.push(tw);

			// 触发缓动开始
			if (me.twList.length == 1) {
				me._handleNext();
			}

			return me;
		}
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