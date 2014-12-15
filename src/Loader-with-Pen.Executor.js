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

    Loader._loadRes = function() {
    };

    Loader.load = function(config, oncomplete, onprogress) {
        var me = this, executor = new Pen.Executor();

        // 全部加装完成回调
        var finishTask = executor.sync(function() {
            Pen.invokeCallback(oncomplete);
        });

        var resList = getResList(config), len = resList.length;
        var loadTask, loaded = 0, i;
        for (i = 0; i < len; i++) {
            (function(res) {
                loadTask = executor.async(function(callback) {
                    if (res.type == 'images') {
                        me.loadImage(res.path, function(img) {
                            me.images[res.name] = img;
                            loaded++;
                            callback();
                        });
                    }
                    else if (res.type == 'audios') {
                        me.loadAudio(res.path, function(audio) {
                            me.audios[res.name] = audio;
                            loaded++;
                            callback();
                        });
                    }
                    else if (res.type == 'scripts') {
                        Pen.loadJS(res.path, function() {
                            loaded++;
                            callback();
                        });
                    }
                });
            })(resList[i]);

            // 进度回调
            executor.sync(function() {
                Pen.invokeCallback(onprogress, loaded / len);
            }).after(loadTask);

            finishTask.after(loadTask);
        }

        executor.run();
    };

    /**
     * 加载图片。
     */
    Loader.loadImage = function(path, oncomplete) {
        var img = new Image();
        img.src = path;
        img.onload = function() {
            if (oncomplete) {
                oncomplete(img);
            }
        };
    };

    /**
     * 加载音频。
     */
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
