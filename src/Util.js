(function(window) {
	var Util = {};

	var PI = Math.PI;

	/**
	 * 返回N个数中的最小值. 至少需要提供一个参数.
	 */
	Util.min = function() {
		// if (arguments.length == 1) {
		// return arguments[0];
		// }
		// else {
		// var a = arguments[0];
		// var b = Util.min.apply(this, Array.prototype.slice.call(arguments, 1,
		// arguments.length));
		//
		// return a <= b ? a : b;
		// }

		return Math.min.apply(Math, arguments);
	};

	/**
	 * 返回N个数中的最大值. 至少需要提供一个参数.
	 */
	Util.max = function() {
		// if (arguments.length == 1) {
		// return arguments[0];
		// }
		// else {
		// var a = arguments[0];
		// var b = Util.max.apply(this, Array.prototype.slice.call(arguments, 1,
		// arguments.length));
		//
		// return a >= b ? a : b;
		// }

		return Math.max.apply(Math, arguments);
	};

	/**
	 * 返回数组中的最小元素。
	 */
	Util.minArrayItem = function(array) {
		// return array.reduce(function(a, b) {
		// return a <= b ? a : b;
		// });

		return Math.min.apply(Math, array);
	};

	/**
	 * 返回数组中的最大元素。
	 */
	Util.maxArrayItem = function(array) {
		// return array.reduce(function(a, b) {
		// return a >= b ? a : b;
		// });

		return Math.max.apply(Math, array);
	};

	/**
	 * 返回整数min和整数max之间的某个随机整数. 包括min, 不包括max.
	 */
	Util.rndRange = function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	};

	Util.rndAmong = function() {
		var index = this.rndRange(0, arguments.length);
		return arguments[index];
	};

	/**
	 * 生成一个随机RGB颜色值。 例如："rgb(132, 75, 44)"
	 */
	Util.rndRGB = function() {
		var r = this.rndRange(0, 256);
		var g = this.rndRange(0, 256);
		var b = this.rndRange(0, 256);

		return 'rgb(' + r + ', ' + g + ', ' + b + ')';
	};

	/**
	 * 在平面直角坐标系中，根据x和y方向的速度获取速度的方向角。 注：以X轴正半轴为起点，以朝Y轴正半轴的方向为角度增大的方向。
	 * 
	 * @param dx X轴方向的速度
	 * @param dy Y轴方向的速度
	 * @return 速度的方向角
	 */
	Util.getAngle = function(dx, dy) {
		var angle;
		if (dx > 0) {
			if (dy >= 0)
				angle = Math.atan(dy / dx);
			else
				angle = Math.atan(dy / dx) + 2 * PI;
		}
		else if (dx == 0) {
			if (dy == 0)
				angle = 0;
			else
				angle = Math.atan(dy / dx);
			;
		}
		else {
			angle = Math.atan(dy / dx) + PI;
		}

		return angle;
	};

	/**
	 * 删除数组中的某个元素。
	 * 
	 * @param array 数组
	 * @param value 待删除的元素
	 */
	Util.removeArrayItem = function(array, value) {
		var index;
		array.every(function(v, idx) {
			if (v == value) {
				index = idx;

				return false;
			}
			return true;
		});
		array.splice(index, 1);
	};

	/**
	 * 四舍五入，并保留N位小数。 注：注意使用场景。如果是为了获取字符串结果的话，应该用Number.prototype.toFixed。
	 * 参考Number.prototype.toFixed和Number.prototype.toPrecision。
	 * 注意：小数末尾连续的0会被丢弃，所以最终结果小数的位数可能小于N。
	 * 
	 * @param number 待处理的数
	 * @param n 保留的小数的位数
	 * @return 结果(数字)
	 */
	Util.correctTo = function(number, n) {
		var zoom = Math.pow(10, n);
		return Math.round(zoom * number) / zoom;
	};

	/**
	 * 打印日志。
	 */
	Util.log = function() {
		if (console && console.log) {
			Array.prototype.splice.call(arguments, 0, 0, '[log]');
			console.log.apply(console, arguments);
		}
	};

	/**
	 * 调用回调函数。
	 */
	Util.invokeCallback = function(callback, scope) {
		if (callback) {
			callback.apply(scope || window);
		}
	};

	Util.isNumber = function(v) {
		return typeof v === 'number' && isFinite(v);
	};

	Util.isNumeric = function(v) {
		return !isNaN(parseFloat(v)) && isFinite(v);
	};

	Util.isDate = function(v) {
		return toString.call(v) === '[object Date]';
	};

	Util.isArray = ('isArray' in Array) ? Array.isArray : function(value) {
		return toString.call(value) === '[object Array]';
	};

	Util.isSimpleObject = function(v) {
		return v instanceof Object && v.constructor === Object;
	};

	Util.isPrimitive = function(v) {
		var type = typeof v;

		return type === 'string' || type === 'number' || type === 'boolean';
	};

	Util.isFunction = function(v) {
		return typeof v == 'function';
	};
	
	Util.isString = function(v) {
		return typeof v == 'string';
	};

	Util.isRegExp = function(v) {
		return v instanceof RegExp;
	};

	/**
	 * 递归对象的所有属性，并且对每个属性(包括对象本身)调用一个回调函数。 采用后序遍历的顺序。
	 * 
	 * @param obj 对象
	 * @param callback 回调函数。有三个参数：当前属性所在的对象、当前属性的名称、当前属性的值。
	 */
	Util.recurseObject = (function() {
		function handle(obj, callback) {
			for ( var p in obj) {
				var v = obj[p]
				if (v == undefined || Util.isPrimitive(v)) {
					callback(obj, p, v);
				}
				else {
					handle(v, callback);
					callback(obj, p, v);
				}
			}
		}

		return function(obj, callback) {
			if (obj && callback) {
				handle(obj, callback);
				callback(null, null, obj);
			}
		}
	})();

	/**
	 * 判断某个点是否在矩形内。
	 * 
	 * @param dotX 点的X坐标
	 * @param dotY 点的X坐标
	 * @param rectX 矩形中心的X坐标
	 * @param rectY 矩形中心的Y坐标
	 * @param rectWidth 矩形的宽度
	 * @param rectHeight 矩形的高度
	 * @param includeBorder 是否将边框算在内。true表示点在边框时也算在矩形内。
	 */
	Util.isDotInRect = function(dotX, dotY, rectX, rectY, rectWidth, rectHeight, includeBorder) {
		if (includeBorder) {
			return Math.abs(dotX - rectX) <= rectWidth / 2
					&& Math.abs(dotY - rectY) <= rectHeight / 2;
		}
		else {
			return Math.abs(dotX - rectX) < rectWidth / 2
					&& Math.abs(dotY - rectY) < rectHeight / 2;
		}
	};

	Util.distance = function(x1, y1, x2, y2) {
		return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	};

	/**
	 * 将一个将转换到[0, 2π)范围。
	 */
	Util.normalizeAngle = function(angle) {
		angle %= 2 * PI;

		if (angle < 0) {
			angle += 2 * PI
		}

		return angle;
	};

	/**
	 * 计算一个向量的角度。在[0, 2π)的范围。
	 */
	Util.angleOfVector = function(x, y) {
		var angle;
		if (x == 0 && y == 0) {
			angle = undefined;
		}
		else if (x == 0 && y > 0) {
			angle = PI / 2;
		}
		else if (x == 0 && y < 0) {
			angle = PI * 3 / 2;
		}
		else {
			var atan = Math.atan(y / x);

			if (x < 0) {
				angle = atan + PI;
			}
			else if (x > 0 && y >= 0) {
				angle = atan;
			}
			else {
				angle = atan + 2 * PI;
			}
		}

		return angle;
	};

	Util.isDotInFan = function(dotX, dotY, x, y, r, beginAngle, endAngle, includeBorder) {
		if (dotX == x && dotY == y) {
			return includeBorder;
		}
		else {
			var distance = Util.distance(dotX, dotY, x, y);
			var dotAngle = Util.angleOfVector(dotX - x, dotY - y);
			beginAngle = Util.normalizeAngle(beginAngle);
			if (endAngle == 0 || endAngle == PI * 2) {
				endAngle = PI * 2;
			}
			else {
				endAngle = Util.normalizeAngle(endAngle);
			}

			if (includeBorder) {
				return distance <= r && dotAngle >= beginAngle && dotAngle <= endAngle;
			}
			else {
				return distance < r && dotAngle > beginAngle && dotAngle < endAngle;
			}
		}
	};

	Util.trim = function(str) {
		if (str && str instanceof String) {
			// return str.replace(/\s+$/g, '').replace(/^\s+/g, '');
			return str.trim();
		}
		else {
			return str;
		}
	};

	window.Pen.Util = Util;
})(window);
