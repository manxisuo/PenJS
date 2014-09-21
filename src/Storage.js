(function() {
	var manager = {
		set: function(key, value) {
			// if (localStorage) {
			// localStorage.setItem(key, JSON.stringify({'data':
			// this._beforeSet(value)}));
			// }
		},

		get: function(key) {
			// if (localStorage) {
			// var value = JSON.parse(localStorage.getItem(key)).data;
			// }
		},

		_beforeSet: function(obj) {

		},

		_beforeGet: function(obj) {

		}
	};

	window.StorageManager = manager;
})();