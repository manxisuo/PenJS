(function() {
	var Base = function() {
	};

	Base.prototype.callParent = function(methodName) {
		var args = this.callParent.caller.arguments;
		if (this.__proto__ && this.__proto__[methodName]) {
			var result = this.__proto__[methodName].apply(this, args);
			return result;
		}
	};

	var ClassManager = {
		/**
		 * 通过define方法定义的类列表。
		 */
		classes: {},

		/**
		 * 定义类。 说明： config是一个对象。
		 * 特殊的属性包括：extend、init、mixins。其中：
		 *  extend是父类。
		 * 	init是实例化对象时的初始化函数。
		 * 	mixins指定混入的类。例如： mixins: { event: Pen.Event }
		 * 
		 * @param className 类名称。可选，默认为空字符串。
		 * @param config 配置对象。可选，默认为空对象。
		 */
		define: function(/* [className], [config] */) {
			// 处理参数
			var me = this;
			var className, config, parent;
			var args = arguments, len = args.length;

			if (len == 1) {
				if (Pen.Util.isString(args[0])) {
					className = args[0];
				}
				else {
					config = args[0];
				}
			}
			else if (len == 2) {
				className = args[0];
				config = args[1];
			}

			className = className || '';
			config = config || {};
			parent = config.extend || Pen.Base;

			// 定义类(构造函数)
			var cls = function(config2) {
				// 调用父类构造函数
				parent.apply(this);

				// 调用混入类的构造函数
				var mixinClasses = cls.prototype._mixinClasses;
				if (mixinClasses) {
					for ( var name in mixinClasses) {
						mixinClasses[name].apply(this);
					}
				}

				// 自动生成ID
				this.id = Pen.getId();

				// 将config的属性拷贝到原型 
				// TODO: 应该拷到原型还是this?
				Pen.copy(this, config);

				// 将config的属性拷贝到原型
				Pen.copy(this, config2);

				// 在实例中增加一个属性指向类。方便引用。
				this.self = cls;

				// 将类名放到实例中。
				this.$className = className;

				// 调用初始化方法
				// TODO 默认调用父类的init方法是否合理？下同
				if (cls.prototype.init) {
					cls.prototype.init.apply(this);
				}
				if (config.init) {
					config.init.apply(this);
				}
				if (config2 && config2.init) {
					config2.init.apply(this);
				}
			};

			// 实现继承(指定类的原型)
			cls.prototype = new parent();

			// 处理mixins
			if (config.mixins) {
				for ( var mixinName in config.mixins) {
					me._mixin(cls, mixinName, config.mixins[mixinName]);
				}

				delete config.mixins;
			}

			// 静态变量和方法
			if (config.statics) {
				Pen.copy(cls, config.statics);

				delete config.statics;
			}

			cls.className = className;

			if (className) {
				me._buildNamespace(className, cls);
			}

			// toString
			//			cls.toString = function() {
			//				var str = this.className + ": " + JSON.stringify(config);
			//				
			//				return str;
			//			};

			// 加入列表
			if ('' !== className) {
				this.classes[className] = cls;
			}

			return cls;
		},

		/**
		 * 建立命名空间。
		 * 
		 * @param className 用点分割的类名
		 */
		_buildNamespace: function(className, newClass) {
			if (!className)
				return;
			var arr = className.split('.'), len = arr.length;
			var i, cls, name, scope = window;

			for ( var i = 0; i < len; i++) {
				name = arr[i];
				if (undefined == scope[name]) {
					scope[name] = {};
				}

				if (i == len - 1) {
					scope[name] = newClass;
				}

				scope = scope[name];
			}
		},

		/**
		 * 混入类。
		 * 例如在Desk类里面混入类Pen.EventSource(混入名为eventSrc)，就可以用下面的方式调用后者的方法，如fireEvent：
		 * ball.fireEvent('click'); 为了防止出现方法覆盖的问题，建议使用下面的方法：
		 * ball.mixins.eventSrc.fireEvent.call(ball, 'click');
		 * 
		 * @param destClass 目标类
		 * @param mixinName 混入的名称(自定义)
		 * @param mixinClass 混入类
		 */
		_mixin: function(destClass, mixinName, mixinClass) {
			var proto = destClass.prototype;
			Pen.copy(proto, mixinClass.prototype);

			if (proto.mixins == undefined) {
				proto.mixins = {};
			}
			if (proto._mixinClasses == undefined) {
				proto._mixinClasses = {};
			}

			proto.mixins[mixinName] = mixinClass.prototype;
			proto._mixinClasses[mixinName] = mixinClass;
		}
	};

	window.Pen.define = ClassManager.define.bind(ClassManager);

	window.Pen.Base = Base;
	window.Pen.ClassManager = ClassManager;
})();
