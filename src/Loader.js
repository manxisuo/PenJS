(function(window) {
	/**
	 * 资源. 表示一个待加载的对象.
	 */
	function Resource(loader) {
		this.ready = false;
		this.loader = loader;
	}

	Resource.prototype.getReady = function() {
		this.ready = true;
		this.loader.resourceIsLoaded();
	}

	var Loader = {
		resources: [],
		progressCallbacks: []
	};

	Loader.register = function() {
		var resource = new Resource(this);
		this.resources.push(resource);

		return resource;
	};

	Loader.resourceIsLoaded = function() {
		var callbacks = this.progressCallbacks;
		var resources = this.resources;
		var progress = 1;
		var completed = 0;

		if (resources.length > 0) {
			for ( var i = 0; i < resources.length; i++) {
				if (resources[i].ready) {
					completed++;
				}
			}

			progress = completed / resources.length;
		}

		for ( var i = 0; i < callbacks.length; i++) {
			if (callbacks[i]) {
				callbacks[i](progress, completed == resources.length);
			}
		}
	};

	Loader.progress = function(callback) {
		this.progressCallbacks.push(callback);
	};

	Loader.loadConfig = function(path, callback) {
		$.getJSON(path).done(function(config) {
			Loader.config = config;
			Util.invokeCallback(callback);
		});
	};

	Loader.loadImage = function(path, callback) {
		var img = new Image();
		img.src = path;
		img.onload = function() {
			if (callback) {
				callback(img);
			}
		};
	}

	window.Pen.Loader = Loader;
})(window);
