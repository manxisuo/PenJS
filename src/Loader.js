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

    Loader.playAudio = function(tag) {
        if (this.audios[tag]) {
            this.audios[tag].currentTime = 0;
            this.audios[tag].play();
        }
    };

    Loader.stopAudio = function(tag) {
        if (this.audios[tag]) {
            this.audios[tag].pause();
            this.audios[tag].currentTime = 0;
        }
    };

    Loader.pauseAudio = function(tag) {
        if (this.audios[tag]) {
            this.audios[tag].pause();
        }
    };

    Loader.resumeAudio = function(tag) {
        if (this.audios[tag]) {
            this.audios[tag].play();
        }
    };

    function getResList(config) {
        var resType, sourceConfig, resName, resList = [];
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

        return resList;
    }
    
    function callback(onprogress, oncomplete, loaded, len) {
        if (onprogress) {
            onprogress(loaded / len);
        }
        if (loaded == len) {
            if (oncomplete) {
                oncomplete();
            }
        }
    }
    
    Loader.load = function(config, oncomplete, onprogress) {
        var me = this;
        var resList = getResList(config);
        var i, len = resList.length, res, loaded = 0;
        
        if (0 == len) {
            callback(onprogress, oncomplete, 1, 1);
            return;
        }
        
        for (i = 0; i < len; i++) {
            res = resList[i];

            (function(res) {
                if (res.type == 'images') {
                    me.loadImage(res.path, function(img) {
                        me.images[res.name] = img;
                        loaded++;
                        callback(onprogress, oncomplete, loaded, len);
                    });
                }
                else if (res.type == 'audios') {
                    if (!me._supportAudio()) {
                        loaded++;
                        callback(onprogress, oncomplete, loaded, len);
                    }
                    else {
                        me.loadAudio(res.path, function(audio) {
                            me.audios[res.name] = audio;
                            loaded++;
                            callback(onprogress, oncomplete, loaded, len);
                        });
                    }
                }
                else if (res.type == 'scripts') {
                    Pen.loadJS(res.path, function() {
                        loaded++;
                        callback(onprogress, oncomplete, loaded, len);
                    });
                }
            })(res);
        }
    };

    // 加载图片
    Loader.loadImage = function(path, oncomplete) {
        var img = new Image();
        img.src = path;
        img.onload = function() {
            if (oncomplete) {
                oncomplete(img);
            }
        };
    };

    // 加载音频
    Loader.loadAudio = function(path, oncomplete) {
        var audio = new Audio();
        audio.src = path;
        audio.onloadeddata = function() {
            if (oncomplete) {
                oncomplete(audio);
            }
        };
    };
    
    // TODO 是否支持加载audio
    Loader._supportAudio = (function() {
        var audio = new Audio();
        var support = (null === audio.onloadeddata);
        
        return function() {
            return support;
        };
    })();

    window.Pen.Loader = Loader;
})(window);
