// Checking for compabitility
if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
	console.log('Error! Dusty will not run in this browser: missing file APIs');
}

dusty = { 'core': {} };
dusty.core.modules = [];
dusty.core.netqueue = [];
dusty.core.currentModuleIndex = 0;
dusty.core.netrequests = [];	// 0: slow, 1: normal, -1: failure
dusty.core.netstatus = 1;		// 0: poor, 1: ok, -1: bad

// Testing stuff
//dusty.core.cwa = 'DDC';
// TODO get offline.js stuff working

var _lastCwaIndex = 0;

$(document).ready(function() {
	// 1 sec global timer
	setInterval(function() {
		// Clock
		clock.text(moment.utc(new Date()).format('HH:mm') + 'Z');

		// Request status
		updateNetStatus();
	}, 1000);

	// Clock timer
	var clock = $('#clock-value');
	clock.text(moment.utc(new Date()).format('HH:mm') + 'Z');
	setInterval(function() {
		
	}, 1000);

	// Request status
	var updateNetStatus = function() {
		var count = 0;
		var sum = 0;
		for (var i = dusty.core.netrequests.length - 1; i > 0; i--) {
			sum += dusty.core.netrequests[i].status;
			count++;
			if (count === 5) { break; }
		}
		var pct = sum / count;
		if (pct >= .9 || count === 0) {
			dusty.core.netstatus = 1;
			$('#net-value')
				.text('ok')
				.removeClass()
				.addClass('ok');
		} else if (pct >= .6) {
			dusty.core.netstatus = 0;
			$('#net-value')
				.text('poor')
				.removeClass()
				.addClass('poor');
		} else {
			dusty.core.netstatus = -1;
			$('#net-value')
				.text('bad')
				.removeClass()
				.addClass('bad');
		}
	};

	// Geolocation timer
	var setLocation = function(position) {
		var needUpdate = !dusty.core.location && dusty.config.cwacheck;
		dusty.core.location = { lat: position.coords.latitude, lon: position.coords.longitude };
		$('#location-value').text(numeral(dusty.core.location.lat).format('0.000') +
			',' + numeral(dusty.core.location.lon).format('0.000'));
		if (needUpdate) {
			updateCwa();
		}
	};
	navigator.geolocation.getCurrentPosition(setLocation);
	setInterval(function() {
		navigator.geolocation.getCurrentPosition(setLocation);
	}, 10000);

	// Update CWA
	if (dusty.config.cwacheck) {
		updateCwa();
		setInterval(function() {
			updateCwa();
		}, 60000);
	}

	// Autoload scripts
	for (var i = 0; i < dusty.config.modules.length; i++) {
		(function(d, t) {
		    var g = d.createElement(t),
		        s = d.getElementsByTagName(t)[0];
		    g.src = 'js/' + dusty.config.modules[i] + '.js';
		    s.parentNode.insertBefore(g, s);
		}(document, 'script'));
	}

	// Key bindings
	KeyboardJS.on('h', function() { alert('TODO help screen'); });
	KeyboardJS.on('tab', function() { alert('TODO switching modules'); });
});

var updateCwa = function() {
	if (!dusty.core.location) { return;}

	// Check last known CWA, since it shouldn't change often
	if (isPointInPoly(buildCwaPolygon(_lastCwaIndex), { x: dusty.core.location.lon, y: dusty.core.location.lat })) {
		dusty.core.cwa = cwas.features[_lastCwaIndex].properties.WFO;
		$('#cwa-value').text(dusty.core.cwa);
		return;
	}

	for (var i = 0; i < cwas.features.length; i++) {
		if (isPointInPoly(buildCwaPolygon(i), { x: dusty.core.location.lon, y: dusty.core.location.lat })) {
			_lastCwaIndex = i;
			dusty.core.cwa = cwas.features[i].properties.WFO;
			$('#cwa-value').text(dusty.core.cwa);
			return;
		}
	}
};

var buildCwaPolygon = function(cwaIndex) {
	var polygon = [];
	for (var i = 0; i < cwas.features[cwaIndex].geometry.coordinates[0].length; i++) {
		polygon.push({
			x: cwas.features[cwaIndex].geometry.coordinates[0][i][0],
			y: cwas.features[cwaIndex].geometry.coordinates[0][i][1]
		});
	}
	return polygon;
};