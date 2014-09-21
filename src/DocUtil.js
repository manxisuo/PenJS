(function(window) {
	var DocUtil = {
		offset: function(elem) {
			if (jQuery) { return $(elem).offset(); }

			var docElem, win = window, box = {
				top: 0,
				left: 0
			}, doc = elem && elem.ownerDocument;

			if (!doc) { return; }

			docElem = doc.documentElement;

			// If we don't have gBCR, just use 0,0 rather than error
			// BlackBerry 5, iOS 3 (original iPhone)
			if (typeof elem.getBoundingClientRect !== undefined) {
				box = elem.getBoundingClientRect();
			}

			return {
				top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
				left: box.left + (win.pageXOffset || docElem.scrollLeft)
						- (docElem.clientLeft || 0)
			};
		}
	};

	window.DocUtil = DocUtil;
})(window);
