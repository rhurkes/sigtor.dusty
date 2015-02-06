// TODO finish selections
// TODO move options into separate file
// TODO move modules in modules directory

dusty.module = dusty.module || {};
dusty.module.spcmeso = (function() {
	var _name = 'spcmeso';
	var _width = 1000;
	var _height = 750;
	var _sectorBase = 'http://www.spc.noaa.gov/exper/mesoanalysis/s{{sector}}/cnty/cnty.gif';
	var _baseUrl = 'http://www.spc.noaa.gov/exper/mesoanalysis/s{{sector}}/{{parama}}/{{paramb}}.gif?';
	var _state = {
		sector: 14,
		param1: 'lr3c',
		param2: 'mcon'
	};
	var _refreshDelay = 60000;
	var img = document.createElement('img');
	var img2 = document.createElement('img');
	var imgbg = document.createElement('img');

	var _menuCallback = function(data) {
		if (data.type === 'sector') {
			_state.sector = data.number;

		} else if (data.type === 'param1') {
			_state.param1 = data.name;
		} else if (data.type === 'param2') {
			_state.param2 = data.name;
		}
		_loadImages();
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
		'general': {
			id: 'General', children: [
			]
		},
		'sector': {
			id: 'Sector', children: [
				{ id: 'National', info: { type: 'sector', number: 19 }},
				{ id: 'NW', info: { type: 'sector', number: 11 }},
				{ id: 'SW', info: { type: 'sector', number: 12 }},
				{ id: 'N Plns', info: { type: 'sector', number: 13 }},
				{ id: 'C Plns', info: { type: 'sector', number: 14 }},
				{ id: 'MW', info: { type: 'sector', number: 20 }},
				{ id: 'S Plns', info: { type: 'sector', number: 15 }},
				{ id: 'NE', info: { type: 'sector', number: 16 }},
				{ id: 'EC', info: { type: 'sector', number: 17 }},
				{ id: 'SE', info: { type: 'sector', number: 18 }}
			]
		},
		'param1': {
			id: 'Parameter 1', children: [
				{ id: 'Observations', children: [
					{ id: 'bigsfc', label: 'Sfc Obs', info: { type: 'param1', name: 'bigsfc' }},
					{ id: '1kmv', label: 'Vis Sat', info: { type: 'param1', name: '1kmv' }},
				] },
				{ id: 'Basic Sfc', children: [
					{ id: 'ttd', label: 'Temp/Wind/Td', info: { type: 'param1', name: 'ttd' }},
					{ id: 'mcon', label: 'Moisture Convergence', info: { type: 'param1', name: 'mcon' }},
					{ id: 'thea', label: 'Theta-E Advection', info: { type: 'param1', name: 'thea' }},
					{ id: 'mxth', label: 'Mixing Ratio', info: { type: 'param1', name: 'mxth' }}
				] },
				{ id: 'Basic UA', children: [] },
				{ id: 'Kinematics', children: [] },
				{ id: 'Thermodynamics', children: [
					{ id: 'sbcp', label: 'SBCAPE', info: { type: 'param1', name: 'sbcp' }},
					{ id: 'mlcp', label: 'MLCAPE', info: { type: 'param1', name: 'mlcp' }},
					{ id: 'mucp', label: 'MUCAPE', info: { type: 'param1', name: 'mucp' }},
					{ id: 'ncap', label: 'Normalized CAPE', info: { type: 'param1', name: 'ncap' }},
					{ id: 'dcape', label: 'Downdraft CAPE', info: { type: 'param1', name: 'dcape' }},
					{ id: 'muli_sf', label: 'SB LIs', info: { type: 'param1', name: 'muli_sf' }},
					{ id: 'kidx', label: 'K Index', info: { type: 'param1', name: 'kidx' }},
					{ id: 'laps_sf', label: 'Lapse Rates', info: { type: 'param1', name: 'laps_sf' }},
					{ id: 'lllr_sf', label: 'Low-level Lapse Rates', info: { type: 'param1', name: 'lllr_sf' }},
					{ id: 'lclh_sf', label: 'LCL', info: { type: 'param1', name: 'lclh_sf' }},
					{ id: 'lfch_sf', label: 'LFC', info: { type: 'param1', name: 'lfch_sf' }},
					{ id: 'lfrh_sf', label: 'LCL-LFC RH', info: { type: 'param1', name: 'lfrh_sf' }},
					{ id: 'sbcp_chg_sf', label: '3HR SBCAPE', info: { type: 'param1', name: 'sbcp_chg_sf' }},
					{ id: 'sbcn_chg', label: '3HR SBCIN', info: { type: 'param1', name: 'sbcn_chg' }},
					{ id: 'mlcp_chg_sf', label: '3HR MLCAPE', info: { type: 'param1', name: 'mlcp_chg_sf' }},
					{ id: 'mucp_chg_sf', label: '3HR MUCAPE', info: { type: 'param1', name: 'mucp_chg_sf' }},
					{ id: 'lllr_chg_sf', label: '3HR LLLR', info: { type: 'param1', name: 'lllr_chg_sf' }},
					{ id: 'laps_chg_sf', label: '6HR LR', info: { type: 'param1', name: 'laps_chg_sf' }}
				] },
				{ id: 'Wind Shear', children: [] },
				{ id: 'Composite Indices', children: [] },
				{ id: 'Multi-Parameter Fields', children: [] },
				{ id: 'Heavy Rain', children: [] },
				{ id: 'Winter Weather', children: [] },
				{ id: 'Fire Weather', children: [] }
			]
		},
		'param2': {
			id: 'Parameter 2', children: [
				{ id: 'Observations', children: [
					{ id: 'bigsfc', label: 'Sfc Obs', info: { type: 'param2', name: 'bigsfc' }},
					{ id: '1kmv', label: 'Vis Sat', info: { type: 'param2', name: '1kmv' }},
				] },
				{ id: 'Basic Sfc', children: [
					{ id: 'ttd', label: 'Temp/Wind/Td', info: { type: 'param2', name: 'ttd' }},
					{ id: 'mcon', label: 'Moisture Convergence', info: { type: 'param2', name: 'mcon' }},
					{ id: 'thea', label: 'Theta-E Advection', info: { type: 'param2', name: 'thea' }},
					{ id: 'mxth', label: 'Mixing Ratio', info: { type: 'param2', name: 'mxth' }}
				] },
				{ id: 'Basic UA', children: [] },
				{ id: 'Kinematics', children: [] },
				{ id: 'Thermodynamics', children: [] },
				{ id: 'Wind Shear', children: [] },
				{ id: 'Composite Indices', children: [] },
				{ id: 'Multi-Parameter Fields', children: [] },
				{ id: 'Heavy Rain', children: [] },
				{ id: 'Winter Weather', children: [] },
				{ id: 'Fire Weather', children: [] }
			]
		}
	};

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
		_loadImages();
	};

	var _loadImages = function() {
		var now = new Date().getTime();
		var bgurl = _sectorBase.replace('{{sector}}', _state.sector);
		var param1a = _state.param1.replace('_sf', '');
		if (imgbg.src.indexOf(bgurl) === -1) {
			imgbg.src = _sectorBase.replace('{{sector}}', _state.sector);
		}
		var url = _baseUrl.replace('{{sector}}', _state.sector).replace('{{parama}}', param1a).replace('{{paramb}}', _state.param1);
		if (img.src.indexOf(url) === -1) {
			img.src = url + now;
		}

		if (_state.param2) {
			var param2a = _state.param2.replace('_sf', '');
			img2.style.display = (_state.param2 === 'none') ? 'none' : 'block';
			url = _baseUrl.replace('{{sector}}', _state.sector).replace('{{parama}}', param2a).replace('{{paramb}}', _state.param2);
			if (img2.src.indexOf(url) === -1) {
				img2.src = url + now;
			}
		}
	}

	var _spcmesoTimer = setInterval(function() {
		_loadImages();
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