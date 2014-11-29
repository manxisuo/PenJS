(function(window) {
    /**
     * 池中存放对象的封装。
     */
    function PoolItem(obj) {
        this.obj = obj;
        this.busy = false;
    }
    
    /**
     * 可池化的。
     * 混入类。
     */
    Pen.define('Pen.Poolable', {
        
    });

    /**
     * 对象池。
     */
    Pen.define('Pen.ObjectPool', {
        
        /**
         * 构造函数。
         * @param type 池中存放的对象的类型
         * @param coreSize 池中保存的对象数
         * @param maxSize 池中允许的最大对象数
         */
        construct: function(type, coreSize, maxSize) {
            this.coreSize = coreSize || 5;
            this.maxSize = maxSize || this.coreSize;
            this.type = type;
            this.items = null;
        },

        /**
         * 初始化池。
         */
        init: function() {
            if (null === this.items) {
                this.items = [];

                var i;
                for (i = 0; i < this.coreSize; i++) {
                    this.items.push(new PoolItem(new this.type()));
                }
            }
        },

        /**
         * 从池中获取一个对象。
         */
        getObject: function() {
            var i, item;
            for (i in this.items) {
                item = this.items[i];
                if (!item.busy) {
                    item.busy = true;

                    return item.obj;
                }
            }

            if (this.items.length < this.maxSize) {
                var obj = new this.type();
                var item = new PoolItem(obj);
                item.busy = true;
                this.items.push(item);

                return obj;
            }

            return null;
        },

        /**
         * 向池中释放一个对象。
         */
        releaseObject: function(obj) {
            var i, item;
            for (i in this.items) {
                item = this.items[i];
                if (item.obj === obj) {
                    item.busy = false;

                    return;
                }
            }
        }
    });

})(window);