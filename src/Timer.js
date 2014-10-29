/**
 * 用RAF实现的动画定时器。
 */
Pen.define('Pen.RAFTimer', {
	id: -1,
	task: null,
	scope: null,
	running: false,

	/**
	 *  执行一个任务。
	 *  会自动取消之前的任务。
	 *  
	 * @param task 必选。执行的任务函数
	 * @param scope 可选。任务执行的上下文。
	 */
	run: function(task /* [, scope] */) {
		this.pause();

		this.task = task;
		this.scope = arguments[1] || window;

		this.resume();
	},

	_run: function() {
		var me = this;

		var loop = function(timestamp) {
			me.task.call(me.scope, timestamp);
			me.id = Pen.RAFTimer.raf(loop);
		};
		me.id = Pen.RAFTimer.raf(loop);
	},

	// 暂停定时器。
	pause: function() {
		if (this.running) {
			Pen.RAFTimer.caf(this.id);
			this.running = false;
		}
	},

	// 恢复定时器。
	resume: function() {
		if (!this.running) {
			this._run();
			this.running = true;
		}
	},

	statics: {
		// requestAnimationFrame
		raf: (window.requestAnimationFrame || window.mozRequestAnimationFrame
				|| window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
				|| window.oRequestAnimationFrame || function(callback) {
			setTimeout(callback, 1000 / 60);
		}).bind(window),

		// cancelAnimationFrame
		caf: (window.cancelAnimationFrame || window.mozCancelAnimationFrame
				|| window.webkitCancelAnimationFrame || window.msCancelAnimationFrame
				|| window.oCancelAnimationFrame || window.clearTimeout).bind(window)
	},
});