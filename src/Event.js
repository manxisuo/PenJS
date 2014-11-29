Pen.require([], function() {

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

    Event.getEventName = function(event) {
        return event.split(/\./)[0];
    };

    Event.getEventNS = function(event) {
        return event.split(/\./)[1];
    };

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

        this._internalHandlerMap = {};
    };

    EventSource.prototype.addEvents = function(/* eventNames */) {
        var i, name;
        for (i in arguments) {
            name = arguments[i];
            if (Pen.isArray(name)) {
                this.events = this.events.concat(name);
            }
            else {
                this.events.push(name);
            }
        }

        return this;
    };

    /**
     * 内部使用。
     * @private
     */
    EventSource.prototype._on = function(/* event1, [event2, ..., eventN,]  handler */) {
        // 检查事件源是否支持指定的事件
        var i, event;
        var len = arguments.length, handler = arguments[len - 1];
        for (i in arguments) {
            event = arguments[i];
            if (typeof event == 'string') {
                if (this.events.indexOf(event.split(/\./)[0]) != -1) {
                    var handlers = this._handlerMap[event] || [];
                    handlers.push(handler);
                    this._internalHandlerMap[event] = handlers;
                }
            }
        }

        return this;
    };

    /**
     * 模板方法。在注册事件监听器之前调用。
     * 返回false将阻止注册。
     * 
     * @param event 事件名称。带命名空间。
     * @param handler 事件处理器
     */
    EventSource.prototype.beforeBindEvent = function(event, handler) {
        return true;
    };

    /**
     * 模板方法。在去注册事件监听器之前调用。
     * 返回false将阻止去注册。
     * 
     * @param event 事件名称。带命名空间。
     */
    EventSource.prototype.beforeUnbindEvent = function(event) {
        return true;
    };

    EventSource.prototype.on = function(/* event1, [event2, ..., eventN,]  handler */) {
        // 检查首先事件源是否支持指定的事件
        var me = this, i, event, eventName;
        var len = arguments.length, handler = arguments[len - 1];
        for (i in arguments) {
            event = arguments[i];
            if (typeof event == 'string') {
                eventName = event.split(/\./)[0];
                if (me.events.indexOf(eventName) != -1) {
                    if (me.beforeBindEvent(eventName, handler)) {
                        var handlers = me._handlerMap[event] || [];
                        handlers.push(handler);
                        me._handlerMap[event] = handlers;
                    }
                }
            }
        }

        return this;
    };

    EventSource.prototype.unbind = function(/* event1[, event2, ..., eventN]*/) {
        var me = this;
        var i, event, handlerMap = me._handlerMap;
        var p;
        for (i in arguments) {
            event = arguments[i];

            // 'click.my'
            if (Event.TYPE1.test(event) && me.beforeUnbindEvent(event)) {
                delete handlerMap[event];
            }

            // 'click'
            else if (Event.TYPE2.test(event)) {
                for (p in handlerMap) {
                    if (p.split('.')[0] == event && me.beforeUnbindEvent(event)) {
                        delete handlerMap[p];
                    }
                }
            }

            // '.my'
            else if (Event.TYPE3.test(event)) {
                for (p in handlerMap) {
                    if ('.' + p.split('.')[1] == event && me.beforeUnbindEvent(event)) {
                        delete handlerMap[p];
                    }
                }
            }
        }

        return me;
    };

    EventSource.prototype.off = function() {
        return this.unbind.apply(this, arguments);
    };

    /**
     * 触发事件。
     */
    EventSource.prototype.fireEvent = function(eventName/* [, arg1, arg2 ...] */) {
        var handlers = [];
        var p, handerMap = this._handlerMap, internalHandlerMap = this._internalHandlerMap;
        for (p in handerMap) {
            if (p.split('.')[0] == eventName) {
                handlers = handlers.concat(handerMap[p]);
            }
        }
        for (p in internalHandlerMap) {
            if (p.split('.')[0] == eventName) {
                handlers = handlers.concat(internalHandlerMap[p]);
            }
        }

        var len = arguments.length;
        var slice = Array.prototype.slice;
        var i, args;
        for (i in handlers) {
            if (handlers[i]) {
                args = [new Event(this)].concat(slice.call(arguments, 1, len));
                handlers[i].apply(this, args);
            }
        }

        return this;
    };

    window.Pen.Event = Event;
    window.Pen.EventSource = EventSource;
});