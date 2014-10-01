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
		},

		getTextSize: (function() {
			var buff = {
				length: 0
			};
			var BUFF_LIMIT = 50;

			return function(text, font) {
				var key = text + '#@#' + font;
				if (buff[key]) { return buff[key]; }

				var span;
				var spans = document.getElementsByClassName('pen-test-size');
				if (spans.length > 0) {
					span = spans[0];
				}
				else {
					var div = document.createElement('div');
					div.setAttribute('style', 'width:0;height:0;overflow:hidden');
					document.body.appendChild(div)

					span = document.createElement('span');
					span.setAttribute('class', 'pen-test-size');
					div.appendChild(span)
				}

				span.setAttribute('style', 'white-space:nowrap;font:' + font);
				span.innerText = text;

				var size = {
					width: 0,
					height: 0
				};
				if (typeof span.getBoundingClientRect !== undefined) {
					var box = span.getBoundingClientRect();
					size.width = box.width;
					size.height = box.height;
				}

				// 缓存
				buff[key] = size;
				buff.length++;

				// 缓存过大时清空缓存
				if (buff.length >= BUFF_LIMIT) {
					buff = {
						length: 0
					};
				}

				return size;
			}
		})(),
	};

	window.Pen.DocUtil = DocUtil;
})(window);
