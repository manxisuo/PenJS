Pen.require([], function() {

    /**
     * 任务。
     * 同步任务：在JS线程执行的任务。
     * 异步任务：交给其他线程执行，不堵塞JS线程。需要在完成时调用一个回调函数，以通知执行器。
     */
    function Task(func, isAsync, executor) {

        // 任务要执行的具体函数
        this.func = func;

        // 任务是否是异步的
        this.isAsync = isAsync;

        // 用来执行任务的执行器
        this.executor = executor;

        // 作为此任务的前置条件的任务的列表。即列表中的任务全部完成后，此任务才能执行。
        this.preQueue = [];

        // 任务是否在执行。(此字段对异步任务才有意义)
        this.running = false;
    }

    var Util = {
        isArray: ('isArray' in Array) ? Array.isArray : function(value) {
            return toString.call(value) === '[object Array]';
        }
    };

    /**
     * 在参数指定的一个或多个任务全部完成后，才开始执行。
     * TODO 参数支持数组
     */
    Task.prototype.after = function(/* [task1, task2, ...] */) {
        var me = this, args = arguments;
        for (i = args.length - 1; i >= 0; i--) {
            if (args[i] instanceof Task) {
                me.preQueue.push(args[i]);
            }
            else if (Util.isArray(args[i])){
                args[i].forEach(function(task) {
                    me.preQueue.push(task);
                });
            }
        }

        return this;
    };

    /**
     * 在当前已添加的(除了自己以外的)所有任务完成后执行。
     */
    Task.prototype.afterAll = function() {
        var me = this;
        me.executor.queue.forEach(function(task) {
            if (me !== task) {
                me.preQueue.push(task);
            }
        });

        return me;
    };

    /**
     * 任务执行器。
     */
    function Executor() {

        // 任务队列。(注意：新添加的任务会放到数组的头部)
        this.queue = [];
    }

    /**
     * 添加一个异步执行的函数(函数有一个callback参数，必须在异步流程结束时调用)。
     * @param func
     * @returns 异步任务对象
     */
    Executor.prototype.async = function(func) {
        var task = new Task(func, true, this);
        this.queue.splice(0, 0, task);
        return task;
    };

    /**
     * 添加一个同步执行的函数。
     * @param func
     * @returns 同步任务对象
     */
    Executor.prototype.sync = function(func) {
        var task = new Task(func, false, this);
        this.queue.splice(0, 0, task);
        return task;
    };

    /**
     * 当一个任务执行完成，用此方法将其从从队列中移除。
     */
    Executor.prototype._complete = function(task) {
        var i;
        for (i = this.queue.length - 1; i >= 0; i--) {
            if (this.queue[i] == task) {
                this.queue.splice(i, 1);
            }
        }
    };

    /**
     * 某个异步任务执行结束时，用于通知执行器的回调函数。
     */
    Executor.prototype._callback = function(task) {
        this._complete(task);
        this._check();
    };

    /**
     * 检测某个任务是否被堵塞。
     * 当存在尚未完成的前置任务时，返回true。
     */
    Executor.prototype._isBlocked = function(task) {
        var i, j;
        for (i = this.queue.length - 1; i >= 0; i--) {
            for (j = task.preQueue.length - 1; j >= 0; j--) {
                if (this.queue[i] == task.preQueue[j]) { return true; }
            }
        }

        return false;
    };

    /**
     * 执行某个任务。
     * 在前置任务全部完成后才能调用。
     */
    Executor.prototype._execTask = function(task) {
        var me = this;
        if (!task.running && task.func instanceof Function) {

            task.running = true;

            if (task.isAsync) {
                task.func(function() {
                    me._callback(task);
                });
            }
            else {
                task.func();
                me._complete(task);
            }
        }
    };

    /**
     * 遍历队列中的任务，执行其中未被堵塞的任务。
     */
    Executor.prototype._check = function() {
        var me = this;
        var i, task, len = me.queue.length;
        for (i = len - 1; i >= 0; i--) {
            task = me.queue[i];
            if (!me._isBlocked(task)) {
                me._execTask(task);
            }
        }
    };

    /**
     * 在当前已添加的所有任务完成后堵塞指定的时间间隔。
     * 在此时间间隔内，不能执行任何任务。
     */
    Executor.prototype.wait = function(interval) {

    };

    Executor.prototype.run = function() {
        this._check();
    };

    Pen.Executor = Executor;
});
