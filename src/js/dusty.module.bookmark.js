dusty.module = dusty.module || {};
dusty.module.bookmark = (function() {
	var _name = 'bookmark';

	var _menu = {
		'ahl3': { id: 'ahl3', label: 'AH Level3 Status', data: { type: 'ahl3', url: 'https://www.allisonhouse.com/pages/status/level3' }},
		'nwsl3': { id: 'nwsl3', label: 'NWS Level3 Status', data: { type: 'nwsl3', url: 'http://weather.noaa.gov/monitor/radar3/' }}
	};

	var _options = {
		alwaysOpen: true
	};

	var _menuCallback = function(resp) {
		switch (resp.data.type) {
			case 'ahl3':
				window.open(resp.data.url);
				break;
			case 'nwsl3':
				window.open(resp.data.url)
				break;
		}

	};

	var _init = function() {
		dusty.modules.push(_name);
		console.log('Loaded module: dusty.module.' + _name);
		var moduleDiv = document.createElement('div');
		moduleDiv.id = _name;
		moduleDiv.className = 'module';
		var menuDiv = document.createElement('div');
		moduleDiv.appendChild(menuDiv);
		document.body.appendChild(moduleDiv);
		umenu(menuDiv, _menu, _menuCallback, _options); 
	};

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