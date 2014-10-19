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

	/**
	 *  加载图片资源。
	 *  
	 * @param imgInfoMap 需要加载的图片列表
	 * @param oncomplete 所有图片加载完成后的回调函数。参数：images，图片资源列表，即Loader.images。
	 * @param onprogress 提示进度回调函数。参数：percent，加载进度的百分比。
	 */
	Loader.loadImages = function(imgInfoMap, oncomplete, onprogress) {
		var me = this, imgName, path, len = 0, loaded = 0;
		for (imgName in imgInfoMap) {
			len++;
			path = imgInfoMap[imgName];

			(function(imgName) {
				me.loadImage(path, function(img) {
					me.images[imgName] = img;
					loaded++;

					if (onprogress) {
						onprogress(loaded / len);
					}

					if (loaded == len) {
						if (oncomplete) {
							oncomplete(me.images);
						}
					}
				});
			})(imgName);
		}
	};

	/**
	 *  加载声音资源。
	 *  
	 * @param audioInfoMap 需要加载的声音列表
	 * @param oncomplete 所有声音加载完成后的回调函数。参数：audios，图片资源列表，即Loader.audios。
	 * @param onprogress 提示进度回调函数。参数：percent，加载进度的百分比。
	 */
	Loader.loadAudios = function(audioInfoMap, oncomplete, onprogress) {
		var me = this, audioName, path, len = 0, loaded = 0;
		for (audioName in audioInfoMap) {
			len++;
			path = audioInfoMap[audioName];

			(function(audioName) {
				me.loadAudio(path, function(audio) {
					me.audios[audioName] = audio;
					loaded++;

					if (onprogress) {
						onprogress(loaded / len);
					}

					if (loaded == len) {
						if (oncomplete) {
							oncomplete(me.audios);
						}
					}
				});
			})(audioName);
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
