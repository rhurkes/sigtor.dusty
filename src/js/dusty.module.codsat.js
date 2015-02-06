// TODO mesoanalysis
// TODO looping
// TODO should not fire off new image alert when you deliberately load a new image, only on timed refresh

dusty.module = dusty.module || {};
dusty.module.codsat = (function() {
	var _name = 'codsat';
	var _refreshDelay = 60000;
	var _img = {
		res: 'regional',
		area: 'usa',
		type: 'vis',
		base: 'http://climate.cod.edu/data/satellite/{{res}}/{{area}}/current/{{area}}.{{type}}.gif'
	};
	var _context;
	var _lastHash;
	var imgdiv = document.createElement('div');

	var _menuCallback = function(resp) {
		if (resp.data.type === 'imagetype') {
			_img.type = resp.data.name;

		} else if (resp.data.type === 'area') {
			_img.res = resp.data.area;
			_img.area = resp.data.name;
		}
		_fetchImage();
	};

	var _displayOptions = function() {
		if (dusty.menu.style.display && dusty.menu.style.display !== 'none') {
			umenu(dusty.menu);
		}
		else {
			umenu(dusty.menu, _options, _menuCallback);
		}
	};

	var _options = {
		'Image Type': {
			id: 'Image Type', children: [
				{ id: 'vis', label: 'Visible', data: { type: 'imagetype', name: 'vis' }},
				{ id: 'wv', label: 'Water Vapor', data: { type: 'imagetype', name: 'wv' }},
				{ id: 'ir', label: 'Infrared', data: { type: 'imagetype', name: 'ir' }}
			]
		},
		'Area': {
			id: 'Area', children: [
				{ id: 'regional', children: [
						{ id: 'northwest', label: 'North West', data: { type: 'area', area: 'regional', name: 'northwest' } },
						{ id: 'northcentral', label: 'North Central', data: { type: 'area', area: 'regional', name: 'northcentral' } },
						{ id: 'northeast', label: 'North East', data: { type: 'area', area: 'regional', name: 'northeast' } },
						{ id: 'southwest', label: 'South West', data: { type: 'area', area: 'regional', name: 'southwest' } },
						{ id: 'southcentral', label: 'South Central', data: { type: 'area', area: 'regional', name: 'southcentral' } },
						{ id: 'southeast', label: 'South East', data: { type: 'area', area: 'regional', name: 'southeast' } }
					]
				},
				{ id: '2km', children: [
						{ id: 'nd', label: 'ND', data: { type: 'area', area: '2km', name: 'ND' } },
						{ id: 'sd', label: 'SD', data: { type: 'area', area: '2km', name: 'SD' } },
						{ id: 'il', label: 'IL', data: { type: 'area', area: '2km', name: 'IL' } },
						{ id: 'ks', label: 'KS', data: { type: 'area', area: '2km', name: 'KS' } },
						{ id: 'co_ut', label: 'CO/UT', data: { type: 'area', area: '2km', name: 'CO_UT' } },
						{ id: 'nm', label: 'NM', data: { type: 'area', area: '2km', name: 'NM' } },
						{ id: 'tx', label: 'TX', data: { type: 'area', area: '2km', name: 'TX' } },
						{ id: 'ms', label: 'MS', data: { type: 'area', area: '2km', name: 'MS' } },
						{ id: 'il_in', label: 'IL/IN', data: { type: 'area', area: '2km', name: 'IL_IN' } }
					]
				},
				{ id: '1km', children: [
						{ id: 'nd', label: 'ND', data: { type: 'area', area: '2km', name: 'ND' } },
					]
				}
			]
		}
	};

	var _init = function() {
		dusty.modules.push(_name);
		console.log('Loaded module: dusty.module.' + _name);
		var div = document.createElement('div');
		div.id = _name;
		div.className = 'module';
		imgdiv.id = 'codsat-box';
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
		var url = _img.base.replace('{{res}}', _img.res).replace('{{type}}', _img.type).replaceAll('{{area}}', _img.area);
		var img = document.createElement('img');
		img.width = 800;
		img.height = 600;
		img.crossOrigin = 'Anonymous';
		img.onload = function() { _isNewImage(img); };
		imgdiv.appendChild(img);
		img.src = url + '?' + (new Date().getTime());
	}

	var _isNewImage = function(img) {
		_context.drawImage(img, 0, 0);
		var imgdata = _context.getImageData(415, 589, 200, 11);
		var hash = JSON.stringify(imgdata.data).hashCode();

		if (_lastHash) {
			if (_lastHash === hash) {
				console.log('codsat image updated, but not new');
				img.parentNode.removeChild(img);
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
		update: function() { update(); },
		options: function() {
			_displayOptions();
		}
	};
}());