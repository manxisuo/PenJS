(function(window) {
	var Pen = Pen || {};

	Pen._scriptList = ['Util.js', 'Loader.js', 'DocUtil.js', 'ClassManager.js', 'Event.js',
			'Stage.js', 'Sprite.js', 'Component.js', 'Shape.js', 'Storage.js', 'Brush.js',
			'Tween.js'];

	Pen.config = {
		root: '',
		canvas: null,
	};

	// TODO
	Pen.require = function(className) {
	};

	Pen.setConfig = function(config) {
		this.copy(this.config, config);
	};

	/**
	 * 生成ID。
	 */
	Pen.getId = (function() {
		var id = 0;

		return function() {
			return 'gen' + (++id);
		};
	})();

	/**
	 * 将一个对象的属性合并到另一个对象。 注意：不会递归对象的属性，且不会克隆非基本类型的属性。
	 * 
	 * @param target 目标对象
	 * @param source 源对象
	 * @return 目标对象
	 */
	Pen.copy = function(target, source) {
		if (source && target) {
			for ( var p in source) {
				target[p] = source[p];
			}
		}

		return target;
	};

	/**
	 * 将一个对象的属性合并到另一个对象。 但是只拷贝目标对象中不存在的属性。 注意：不会递归对象的属性，且不会克隆非基本类型的属性。
	 * 
	 * @param target 目标对象
	 * @param source 源对象
	 * @return 目标对象
	 */
	Pen.copyIf = function(target, source) {
		if (source && target) {
			for ( var p in source) {
				if (target[p] === undefined) {
					target[p] = source[p];
				}
			}
		}

		return target;
	};

	/**
	 * 加载js脚本。
	 * 
	 * @param path 脚本文件
	 * @param callback 回调函数
	 */
	Pen.loadJS = function(path, callback) {
		var script = document.createElement('script');
		script.src = path;
		script.type = 'text/javascript';
		script.onload = function() {
			if (callback) {
				callback();
			}
		};

		document.head.appendChild(script);
	};

	function getFullPath(dir, name) {
		if (null != dir) {
			if (dir.charAt(dir.length - 1) != '/') {
				dir += '/';
			}

			return dir + name;
		}

		return name;
	}

	/**
	 * 并行地加载所有脚本。
	 */
	Pen._loadAllJsParallelly = function(oncomplete) {
		var me = this;
		var root = me.config.root;
		var list = me._scriptList, len = list.length, count = 0;
		var i, script;

		for (i in list) {
			script = list[i];

			(function(script) {
				me.loadJS(getFullPath(root, script), function() {
					count++;
					if (count == len) {
						if (oncomplete) {
							oncomplete();
						}
					}
				});
			})(script);
		}
	};

	/**
	 * 串行地加载所有脚本。
	 */
	Pen._loadAllJsSerially = function(oncomplete) {
		var me = this;
		var root = me.config.root;
		var list = me._scriptList, len = list.length, count = 0;
		var i, script;

		var l = [];
		for (i in list) {
			script = list[i];
			(function(script) {
				l.push(function() {
					me.loadJS(getFullPath(root, script), function() {
						l.shift();
						if (l.length > 0) {
							l[0]();
						}
						else {
							if (oncomplete) {
								oncomplete();
							}
						}
					});
				});
			})(script);
		}

		if (l.length > 0) {
			l[0]();
		}
	};
	
	/**
	 * 根据实际需要加载所有脚本。
	 * TODO
	 */
	Pen._loadAllJsAsRequired = function(oncomplete) {
	};

	/**
	 * 初始化Pen JS。
	 */
	Pen.init = function(callback) {
		var me = this;
		me._loadAllJsSerially(function() {
			var canvas = me.config.canvas;
			var ctx, brush, stage;
			ctx = canvas.getContext('2d');
			brush = new Pen.Brush({
				canvas: canvas
			});
			stage = new Pen.Stage({
				brush: brush,
			});

			Pen.copy(Pen.Global, {
				canvas: canvas,
				ctx: ctx,
				brush: brush,
				stage: stage
			});

			if (callback) {
				callback();
			}
		});
	};

	Pen.Global = {};

	window.Pen = Pen;
	window.$P = Pen;
})(window);
