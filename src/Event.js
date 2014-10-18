(function(window) {
	/**
	 * 事件对象。
	 */
	var Event = function(target, sourceEvent) {
		this.target = target;
		this.sourceEvent = sourceEvent;
	};

	Event.TYPE1 = /^\w+\.\w+$/;
	Event.TYPE2 = /^\w+$/;
	Event.TYPE3 = /^\.\w+$/;

	/**
	 * 事件源。
	 */
	var EventSource = function() {
		this.events = [];

		/**
		 * 处理器列表。
		 *	例如：
		 *	{
		 *		'click': [handler1, handler2],
		 *		'click.my': [handler3],
		 *		'load': [handler4, handler5]
		 *	}
		 */
		this._handlerMap = {};
	};

	EventSource.prototype.addEvents = function(/* eventNames */) {
		var i, name;
		for (i in arguments) {
			name = arguments[i];
			if (Pen.Util.isArray(name)) {
				this.events = this.events.concat(name);
			}
			else {
				this.events.push(name);
			}
		}

		return this;
	};

	EventSource.prototype.on = function(/* event1, [event2, ..., eventN,]  handler */) {
		// 检查事件源是否支持指定的事件
		var i, event;
		var len = arguments.length, handler = arguments[len - 1];
		for (i in arguments) {
			event = arguments[i];
			if (typeof event == 'string') {
				if (this.events.indexOf(event.split(/\./)[0]) != -1) {
					var handlers = this._handlerMap[event] || [];
					handlers.push(handler);
					this._handlerMap[event] = handlers;
				}
			}
		}

		return this;
	};

	EventSource.prototype.unbind = function(/* event1[, event2, ..., eventN]*/) {
		var i, event, handlerMap = this._handlerMap;
		var p;
		for (i in arguments) {
			event = arguments[i];

			// 'click.my'
			if (Event.TYPE1.test(event)) {
				delete handlerMap[event];
			}

			// 'click'
			else if (Event.TYPE2.test(event)) {
				for (p in handlerMap) {
					if (p.split('.')[0] == event) {
						delete handlerMap[p];
					}
				}
			}

			// '.my'
			else if (Event.TYPE3.test(event)) {
				for (p in handlerMap) {
					if ('.' + p.split('.')[1] == event) {
						delete handlerMap[p];
					}
				}
			}
		}

		return this;
	};

	EventSource.prototype.off = function() {
		return this.unbind.apply(arguments);
	};

	EventSource.prototype.fireEvent = function(eventName/* [, arg1, arg2 ...] */) {
		var handlers = [];
		var p, handerMap = this._handlerMap;
		for (p in handerMap) {
			if (p.split('.')[0] == eventName) {
				handlers = handlers.concat(handerMap[p]);
			}
		}

		var len = arguments.length;
		var slice = Array.prototype.slice;
		var i, args;
		for ( var i in handlers) {
			if (handlers[i]) {
				args = [new Event(this)].concat(slice.call(arguments, 1, len));
				handlers[i].apply(this, args);
			}
		}

		return this;
	};

	window.Pen.Event = Event;
	window.Pen.EventSource = EventSource;
})(window);