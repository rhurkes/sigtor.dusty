dusty.module = dusty.module || {};
dusty.module.codsat = (function() {
	var _name = 'codsat';
	var _refreshDelay = 60000;
	var _img = {
		res: '1km',
		area: 'Siouxland',
		base: 'http://climate.cod.edu/data/satellite/{{res}}/{{area}}/current/{{area}}.vis.gif'
	};
	var img = document.createElement('img');
	var _context;
	var _lastHash;

	var _init = function() {
		dusty.modules.push(_name);
		console.log('Loaded module: dusty.module.' + _name);
		var div = document.createElement('div');
		div.id = _name;
		div.className = 'module';
		var imgdiv = document.createElement('div');
		imgdiv.id = 'codsat-box';
		img.width = 800;
		img.height = 600;
		img.crossOrigin = 'Anonymous';
		img.onload = function() { _isNewImage(); };
		imgdiv.appendChild(img);
		div.appendChild(imgdiv);
		var canvas = document.createElement('canvas');
		canvas.width = 800;
		canvas.height = 600;
		div.appendChild(canvas);
		document.body.appendChild(div);
		_context = canvas.getContext('2d');
		_fetchImage();
	};

	var _fetchImage = function() {
		var url = _img.base.replace('{{res}}', _img.res).replaceAll('{{area}}', _img.area)
		img.src = url + '?' + (new Date().getTime());
	}

	var _isNewImage = function() {
		_context.drawImage(img, 0, 0);
		var imgdata = _context.getImageData(415, 589, 200, 11);
		var hash = JSON.stringify(imgdata.data).hashCode();

		if (_lastHash) {
			if (_lastHash === hash) {
				console.log('codsat image updated, but not new');
				dusty.notify(_name);
			}
			else {
				//$('#clink')[0].play();
				setTimeout(function() {	speakText('Visible satellite image has updated.'); }, 1000);
				dusty.notify(_name);
			}
		}
		
		_lastHash = hash;
	}

	var _codsatTimer = setInterval(function() {
		_fetchImage();
	}, _refreshDelay);

	// Start the module
	_init();

	return {
		init: function() {
			_init();
		},
		dispose: function() {
			var index = dusty.modules.indexOf(_name);
			if (index > -1) {
				dusty.modules.splice(index, 1);
			}
		},
		update: function() { update(); }
	};
}());