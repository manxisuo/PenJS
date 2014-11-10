(function(window) {
    var Loader = {};

    /**
     * 图片资源列表。
     * 键：用户定义的图片名称；值：图片对象。
     */
    Loader.images = {};

    /**
     * 声音资源列表。
     * 键：用户定义的声音名称；值：声音对象。
     */
    Loader.audios = {};

    /**
     * 加载资源。
     * TODO
     */
    Loader.loadResources = function() {
    };

    /**
     * 加载声音资源。
     * TODO
     */
    Loader.loadAudios = function() {
    };

    Loader.load = function(config, oncomplete, onprogress) {
        var me = this;
        var resName, resList = [];
        for (resType in config) {
            sourceConfig = config[resType];
            for (resName in sourceConfig) {
                resList.push({
                    type: resType,
                    name: resName,
                    path: sourceConfig[resName]
                });
            }
        }

        var i, len = resList.length, res, loaded = 0;
        for (i = 0; i < len; i++) {
            res = resList[i];

            (function(res) {
                if (res.type == 'images') {
                    me.loadImage(res.path, function(img) {
                        me.images[res.name] = img;
                        loaded++;

                        if (onprogress) {
                            onprogress(loaded / len);
                        }
                        if (loaded == len) {
                            if (oncomplete) {
                                oncomplete();
                            }
                        }
                    });
                }
                else if (res.type == 'audios') {
                    me.loadAudio(res.path, function(audio) {
                        me.audios[res.name] = audio;
                        loaded++;

                        if (onprogress) {
                            onprogress(loaded / len);
                        }
                        if (loaded == len) {
                            if (oncomplete) {
                                oncomplete();
                            }
                        }
                    });
                }
                else if (res.type == 'scripts') {
                    Pen.loadJS(res.path, function() {
                        loaded++;

                        if (onprogress) {
                            onprogress(loaded / len);
                        }
                        if (loaded == len) {
                            if (oncomplete) {
                                oncomplete();
                            }
                        }
                    });
                }
            })(res);
        }
    };

    Loader.loadImage = function(path, oncomplete) {
        var img = new Image();
        img.src = path;
        img.onload = function() {
            if (oncomplete) {
                oncomplete(img);
            }
        };
    };

    Loader.loadAudio = function(path, oncomplete) {
        var audio = new Audio();
        audio.src = path;
        audio.onloadeddata = function() {
            if (oncomplete) {
                oncomplete(audio);
            }
        };
    };

    window.Pen.Loader = Loader;
})(window);
