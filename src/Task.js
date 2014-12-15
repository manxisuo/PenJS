Pen.require([], function() {

    function Task(func, isAsync) {
        this.func = func;
        this.isAsync = isAsync;
    }

    function Executor() {
        // 任务队列
        this.queue = [];

        // true时表示当前有异步函数正在进行
        this.blocked = false;
    }

    /**
     * 异步函数的回调函数。
     */
    Executor.prototype.callback = function() {
        this.blocked = false;
        this.check();
    };

    /**
     * 检查是否有需要执行的任务。
     */
    Executor.prototype.check = function() {
        var me = this, queue = me.queue, len = queue.length;

        if (me.blocked) { return; }

        if (len > 0) {
            var task = queue[0];

            // 立即执行的函数
            if (!task.isAsync) {
                queue.shift();
                task.func();
                me.check();
            }
            // 异步执行的函数
            else {
                me.blocked = true;
                queue.shift();
                task.func(function() {
                    me.callback();
                });
            }
        }
    };

    Executor.prototype.log = function(/* [msg1, msg2, ...] */) {
        var args = arguments;
        this.instant(function() {
            if (console && console.log) {
                Array.prototype.splice.call(args, 0, 0, '[' + (+new Date) + ']');
                console.log.apply(console, args);
            }
        });
        return this;
    };

    /**
     * 等待指定的时间间隔。
     */
    Executor.prototype.wait = function(interval) {
        this.async(function(callback) {
            setTimeout(function() {
                callback();
            }, interval);
        });
        return this;
    };

    /**
     * 立即执行函数。
     */
    Executor.prototype.instant = function(func) {
        this.queue.push(new Task(func, false));
        this.check();
        return this;
    };

    /**
     * 执行异步函数。
     */
    Executor.prototype.async = function(func) {
        this.queue.push(new Task(func, true));
        this.check();
        return this;
    };

    Pen.Executor = Executor;
});