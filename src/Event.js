Pen.require(Util);
(function() {
	var Event = function(target, sourceEvent) {
		this.target = target;
		this.sourceEvent = sourceEvent;
	};

	var EventSource = function() {
		this.events = [];

		// 例如：
		// {
		// click: [handler1, handler2],
		// load: [handler3, handler4]
		// }
		this._handlerMap = {};
	};

	EventSource.prototype.addEvents = function(/* events */) {
		var e;
		for ( var i in arguments) {
			e = arguments[i];
			if (Util.isArray(e)) {
				this.events = this.events.concat(e);
			}
			else {
				this.events.push(e);
			}
		}
		
		return this;
	};

	EventSource.prototype.on = function(eventName, handler) {
		if (this.events.indexOf(eventName) != -1) {
			var handlers = this._handlerMap[eventName] || [];
			handlers.push(handler);
			this._handlerMap[eventName] = handlers;
		}
		
		return this;
	};
	
	EventSource.prototype.unbind = function(eventName) {
		delete this._handlerMap[eventName];
	};

	EventSource.prototype.fireEvent = function(eventName/* [, arg1, arg2 ...] */) {
		var len = arguments.length;
		var slice = Array.prototype.slice;
		var handlers = this._handlerMap[eventName] || [];
		var args;
		
		for ( var i in handlers) {
			if (handlers[i]) {
				args = [new Event(this)].concat(slice.call(arguments, 1, len));
				handlers[i].apply(this, args);
			}
		}
		
		return this;
	};

	Pen.Event = Event;
	Pen.EventSource = EventSource;
})();