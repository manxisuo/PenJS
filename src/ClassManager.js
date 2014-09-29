(function() {
	var Base = function() {
		
	};
	
	Base.prototype.callParent = function(methodName) {
		if (this.__proto__ && this.__proto__[methodName]) {
			return this.__proto__[methodName].apply(this);
		}
	};
	
	var ClassManager = {
		/**
		 * 定义类。 说明： config是一个对象。特殊的属性包括：init、mixins。其中： init是实例化对象时回调的函数。
		 * mixins指定混入的类。例如： mixins: { event: Pen.Event }
		 * 
		 * @param parent 父类。可选，默认为Object。
		 * @param config 配置对象。可选，默认为空对象。
		 */
		define: function(/* [parent], [config] */) {

			// 处理参数
			var parent, config;
			var args = arguments, len = args.length;
			
			if (len == 1) {
				if (Util.isFunction(args[0])) {
					parent = args[0];
				}
				else {
					config = args[0];
				}
			}
			else if (len == 2) {
				parent = args[0];
				config = args[1];
			}
			
			parent = parent || Object;
			config = config || {};
			
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
				
				// 将config的属性拷贝到原型 
				// TODO: 应该拷到原型还是this?
				Pen.copy(this, config);

				// 将config的属性拷贝到原型
				Pen.copy(this, config2);
				
				// 调用初始化方法
				if (config2 && config2.init) {
					config2.init.apply(this);
				}
				else if (config.init) {
					config.init.apply(this);
				}
			};

			// 实现继承(指定类的原型)
			cls.prototype = new parent();

			// 处理mixins
			if (config.mixins) {
				for ( var mixinName in config.mixins) {
					ClassManager._mixin(cls, mixinName, config.mixins[mixinName]);
				}

				delete config.mixins;
			}
			
			// 静态变量和方法
			if (config.statics) {
				Pen.copy(cls, config.statics);
				
				delete config.statics;
			}
			
			return cls;
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

	window.Pen.define = ClassManager.define;
	// Pen._mixin = ClassManager._mixin;

	window.Pen.Base = Base;
	window.ClassManager = ClassManager;
})();
