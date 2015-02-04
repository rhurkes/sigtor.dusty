// TODO add selections

dusty.module = dusty.module || {};
dusty.module.spcmeso = (function() {
	var _name = 'spcmeso';
	var _width = 1000;
	var _height = 750;
	var _sectorBase = 'http://www.spc.noaa.gov/exper/mesoanalysis/s{{sector}}/cnty/cnty.gif';
	var _baseUrl = 'http://www.spc.noaa.gov/exper/mesoanalysis/s{{sector}}/{{param}}/{{param}}.gif?';
	var _state = {
		sectorname: 'Central Plains',
		sector: 14,
		param: 'lr3c',
		param2: 'mcon'
	};
	var _refreshDelay = 60000;
	var img = document.createElement('img');
	var img2 = document.createElement('img');
	var imgbg = document.createElement('img');

	var _init = function() {
		dusty.modules.push(_name);
		console.log('Loaded module: dusty.module.' + _name);
		var div = document.createElement('div');
		div.id = _name;
		div.className = 'module';
		var imgdiv = document.createElement('div');
		imgdiv.id = 'spcmeso-box';
		imgdiv.appendChild(imgbg);
		imgdiv.appendChild(img);
		imgdiv.appendChild(img2);
		div.appendChild(imgdiv);
		document.body.appendChild(div);
		_loadParameters(12, 'lr3c', 'mcon');
	};

	var _loadParameters = function(sector, param, param2) {
		var now = new Date().getTime();
		imgbg.src = _sectorBase.replace('{{sector}}', sector);
		var url = _baseUrl.replace('{{sector}}', sector).replaceAll('{{param}}', param) + now;
		img.src = url;

		if (param2) {
			url = _baseUrl.replace('{{sector}}', sector).replaceAll('{{param}}', param2) + now;
			img2.src = url;
		}
	}

	var _spcmesoTimer = setInterval(function() {
		_loadParameters(_state.sector, _state.param, _state.param2);
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