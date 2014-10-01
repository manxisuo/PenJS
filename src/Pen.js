(function(window) {
	var Pen = Pen || {};

	var scriptList = ['Util.js', 'Loader.js', 'ClassManager.js.js', 'Event.js', 'Stage.js',
			'Sprite.js', 'Storage.js', 'Brush.js'];

	Pen.config = {
		root: ''
	};

	// TODO
	Pen.require = function(className) {
	};

	Pen.setConfig = function(config) {
		this.copy(this.config, config);
	};

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
	 * 初始化Pen JS。
	 */
	Pen.init = function(canvas) {
		// var me = this;
		// me.loadJS(getFullPath(me.config.root, 'Util.js'), function() {
		// for ( var i in scriptList) {
		// me.loadJS(getFullPath(me.config.root, scriptList[i]));
		// }
		// });

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
	}

	Pen.Global = {};

	window.Pen = Pen;
})(window);
