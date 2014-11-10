/**
 * Sprite组。
 */
Pen.define('Pen.Group', {
    extend: Pen.Sprite,
    children: [],

    addChild: function(/* child... */) {
        var me = this, i, child;
        for (i = 0; i < arguments.length; i++) {
            child = arguments[i];
            if (child) {
                me.children.splice(0, 0, child);
            }
        }
    },

    show: function() {
        this.children.forEach(function(child) {
            child.show();
        });
    },

    hide: function() {
        this.children.forEach(function(child) {
            child.hide();
        });
    },
});