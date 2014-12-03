(function(window) {
    var Pen = Pen || {};

    Pen._firstScripts = ['ClassManager.js', 'Event.js'];

    Pen._scriptList = [

    'Box.js', 'Tween.js', 'Brush.js', 'Storage.js', 'Shape.js',

    'Component.js', 'Sprites.js', 'Group.js', 'Sprite.js', 'Stage.js',

    'Timer.js', 'Labeling.js', 'ObjectPool.js', 'DocUtil.js',

    'Loader.js', 'Util.js', 'Task.js'];

    Pen.config = {
        root: null,
        requires: [],
        canvas: null,
        resources: {},
        fullscreen: true
    };

    Pen.Base = function() {
    };

    Pen.Base.prototype.callParent = function(methodName) {
        var args = this.callParent.caller.arguments;
        if (this.__proto__ && this.__proto__[methodName]) {
            var result = this.__proto__[methodName].apply(this, args);
            return result;
        }
    };

    // 等待加载的项目列表。
    Pen.waitQueue = [];

    /**
     * 检测指定的字符串表示的类或函数(类)是否存在。
     * 例如：'A.B.C', 'A.b.C.d.E'
     */
    Pen.isExist = function(objectString) {
        if (objectString) {
            var arr = objectString.split('.'), len = arr.length;
            var i, name, scope = window;

            for (i = 0; i < len; i++) {
                name = arr[i];
                if (undefined == scope[name]) { return false; }
                scope = scope[name];
            }

            return true;
        }

        return false;
    };

    /**
     * 有条件的执行某个函数。
     * 当需要的类或对象都已经存在时，立即执行；否则，加入等待列表，等需要的类或对象加载完成后再执行。
     * 
     * @param requireList
     * @param callback
     */
    Pen.require = function(requireList, callback) {
        var i, len = requireList.length, absentList = [];
        for (i = 0; i < len; i++) {
            if (!Pen.isExist(requireList[i])) {
                absentList.push(requireList[i]);
            }
        }

        if (absentList.length > 0) {
            Pen.waitQueue.push({
                absentList: absentList,
                callback: callback
            });
        }
        else {
            callback();
        }
    };

    Pen._checkWaitQueue = function() {
        var waitItem, k, hasNewLoaded = false;
        for (k = Pen.waitQueue.length - 1; k >= 0; k--) {
            waitItem = Pen.waitQueue[k];

            var j, absentList = waitItem.absentList;
            for (j = absentList.length - 1; j >= 0; j--) {
                if (Pen.isExist(absentList[j])) {
                    absentList.splice(j, 1);
                }
            }

            if (absentList.length == 0) {
                Pen.waitQueue.splice(k, 1);
                waitItem.callback();
                hasNewLoaded = true;
            }
        }

        // 如果此次检查，存在解除堵塞的函数，则继续检查。
        if (hasNewLoaded) {
            Pen._checkWaitQueue();
        }
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

    Pen.isArray = ('isArray' in Array) ? Array.isArray : function(value) {
        return toString.call(value) === '[object Array]';
    };

    Pen.isSimpleObject = function(v) {
        return v instanceof Object && v.constructor === Object;
    };

    /**
     * 克隆对象。
     * 对于[数组]和[简单对象]，会迭代其[元素]和[属性]。
     * 
     * @param source 源对象
     * @param deep 是否进行深度克隆。默认不进行深度克隆。
     */
    Pen.clone = function(source, deep) {
        if (source != null) {
            // 对于[数组]，会迭代其[元素]。
            if (Pen.isSimpleObject(source) || (typeof source === 'object' && deep)) {
                var obj = {}, p;
                for (p in source) {
                    obj[p] = Pen.clone(source[p]);
                }

                return obj;
            }

            // 对于[简单对象]，会迭代其[属性]。
            if (Pen.isArray(source)) {
                var arr = [], i, len = source.length;
                for (i = 0; i < len; i++) {
                    arr.push(Pen.clone(source[i]));
                }

                return arr;
            }
        }

        return source;
    };

    // TODO
    Pen.copyDeep = function() {
    };

    /**
     * 将一个对象的属性合并到另一个对象。 
     * 注意：不会递归对象的属性，且不会克隆非基本类型的属性。即只是"浅复制"。
     * 
     * @param target 目标对象
     * @param source 源对象
     * @return 目标对象
     */
    Pen.copy = function(target, source) {
        if (source && target) {
            for ( var p in source) {
                target[p] = Pen.clone(source[p]);
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
                    target[p] = Pen.clone(source[p]);
                }
            }
        }

        return target;
    };

    /**
     * 并行地加载指定的脚本列表。
     */
    Pen._loadAllJsParallelly = function(list, oncomplete) {
        var me = this;
        var len = list.length, count = 0;
        var i, script;

        for (i in list) {
            script = list[i];

            (function(script) {
                me.loadJS(getFullPath(me.config.root, script), function() {
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
     * 串行(顺序)地加载指定的脚本列表。
     */
    Pen._loadScriptsSerially = function(list, oncomplete) {
        var me = this;
        var len = list.length, count = 0;
        var i, script;

        var l = [];
        for (i in list) {
            script = list[i];

            (function(script) {
                l.push(function() {
                    me.loadJS(getFullPath(me.config.root, script), function() {
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
     * 加载js脚本。
     * 
     * @param path 脚本文件
     * @param callback 回调函数
     */
    Pen.loadJS = function(path, callback) {
        var me = this, script = document.createElement('script');
        script.src = path;
        script.type = 'text/javascript';
        script.onload = function() {
            me._checkWaitQueue();

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
     * 加载所有脚本。
     */
    Pen._loadAllJs = function(oncomplete) {
        var me = this;
        var list = me._scriptList.concat(me.config.requires), len = list.length, count = 0;
        var i, script;

        for (i in list) {
            script = list[i];

            (function(script) {
                me.loadJS(getFullPath(me.config.root, script), function() {
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

    // 获取框架脚本的路径
    function getScriptPath() {
        var i, src, scripts = document.querySelectorAll('script');
        var re = /(.*[\/|\\])Pen.js$/;
        for (i in scripts) {
            var result = re.exec(scripts[i].src);
            if (null != result) { return result[1]; }
        }

        return '';
    }

    // 获取画布
    function getCanvas(config) {
        var c = config.canvas, canvas;

        if (null === c || undefined === c) {
            canvas = document.querySelector('canvas');
        }
        else if (typeof c == 'string') {
            canvas = document.getElementById(c);
            if (!canvas) {
                canvas = document.querySelectorAll(c)[0];
            }
        }

        if (!(canvas instanceof HTMLCanvasElement)) {
            Pen.Util.error('Failed to find <canvas> element with ' + c);
        }

        return canvas;
    }

    function getInitor() {
        var initor = {
            ready: null,
            loaded: null,
            progress: null,
            onReady: function(callback) {
                this.ready = callback;
            },
            onLoaded: function(callback) {
                this.loaded = callback;
            },
            onProgress: function(callback) {
                this.progress = callback;
            },
            fire: function(event, arg) {
                if (this[event]) {
                    this[event](arg);
                }
            }
        };

        return initor;
    }

    /**
     * 初始化Pen JS。
     */
    Pen.init = function(oncomplete, onprogress) {
        var me = this, config = me.config;

        // 获取框架脚本的根目录
        if (!config.root) {
            config.root = getScriptPath();
        }

        var initor = getInitor();

        // 加载必须的脚本
        me._loadScriptsSerially(me._firstScripts, function() {

            // 加载所有的框架脚本
            me._loadAllJs(function() {

                // 获取画布
                var canvas = getCanvas(config);
                if (config.fullscreen) {
                    canvas.width = $(window).width();
                    canvas.height = $(window).height();
                }

                var ctx = canvas.getContext('2d');
                var brush = new Pen.Brush(canvas);
                var stage = new Pen.Stage({
                    brush: brush,
                });

                // 设置全局变量(Pen.Global)
                Pen.copy(Pen.Global, {
                    canvas: canvas,
                    ctx: ctx,
                    brush: brush,
                    stage: stage
                });

                initor.fire('ready');

                // 加载用户的资源
                Pen.Loader.load(config.resources, function() {
                    initor.fire('loaded');
                    if (oncomplete) {
                        oncomplete();
                    }
                }, function(percent) {
                    initor.fire('progress', percent);
                    if (onprogress) {
                        onprogress(percent);
                    }
                });
            });
        });

        return initor;
    };

    Pen.Global = {};

    window.Pen = Pen;
    window.$P = Pen;

})(window);
