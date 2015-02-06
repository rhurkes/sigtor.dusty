// TODO ditch jquery as much as possible
// TODO not showing mod on first load - add to global timer
// TODO network status isn't working correctly
// Deal with mimetypes
// TODO bundle with python or node?
// TODO add title alerts
// Deal with max/min scaling of images

// Checking for compabitility
// TODO what is this file api stuff for?
if (!window.File || !window.FileReader || !window.FileList || !window.Blob || !supportsLocalStorage) {
	console.log('Dusty will not run in this browser, please see supported browsers in the documentation');
}

dusty = {};
dusty.modules = [];
dusty.notifications = [];
dusty.netqueue = [];
dusty.speakerQueue = [];
dusty.currentModuleIndex = 0;
dusty.netrequests = [];		// 0: slow, 1: normal, -1: failure
dusty.netstatus = 1;		// 0: poor, 1: ok, -1: bad
dusty.lastCwaIndex = 0;
dusty.menu = document.getElementById('menu');

var _lastCwaIndex = 0;

$(document).ready(function() {
	var clock = $('#clock-value');

	// 1 sec global timer
	setInterval(function() {
		clock.text(moment.utc(new Date()).format('HH:mm') + 'Z');	// Clock
		updateNetStatus();	// Request status
	}, 1000);

	// Clock
	clock.text(moment.utc(new Date()).format('HH:mm') + 'Z');

	// Request status
	var updateNetStatus = function() {
		var count = 0;
		var sum = 0;
		for (var i = dusty.netrequests.length - 1; i > 0; i--) {
			sum += dusty.netrequests[i].status;
			count++;
			if (count === 5) { break; }
		}
		var pct = sum / count;
		if (pct >= .9 || count === 0) {
			dusty.netstatus = 1;
			$('#net-value')
				.text('ok')
				.removeClass()
				.addClass('ok');
		} else if (pct >= .6) {
			dusty.netstatus = 0;
			$('#net-value')
				.text('poor')
				.removeClass()
				.addClass('poor');
		} else {
			dusty.netstatus = -1;
			$('#net-value')
				.text('bad')
				.removeClass()
				.addClass('bad');
		}
	};

	// Geolocation timer
	var setLocation = function(position) {
		var needUpdate = !dusty.location && dusty.config.cwacheck;
		dusty.location = { lat: position.coords.latitude, lon: position.coords.longitude };
		$('#location-value').text(numeral(dusty.location.lat).format('0.000') +
			',' + numeral(dusty.location.lon).format('0.000'));
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
	KeyboardJS.on('m', function() { switchModules(); });
	// TODO ugh need a way to access current module easily
	KeyboardJS.on('o', function() { dusty.module[dusty.modules[dusty.currentModuleIndex]].options(); });
});

dusty.notify = function(module) {
	if (dusty.modules[dusty.currentModuleIndex] !== module) {
		if (dusty.notifications.indexOf(module) === -1) {
			dusty.notifications.push(module);
		}
	}
}

var switchModules = function() {
	$('.module').hide();
	var index = (dusty.currentModuleIndex < dusty.modules.length - 1) ? dusty.currentModuleIndex + 1 : 0;
	dusty.currentModuleIndex = index;
	// TODO have show/hide as part of the module?
	$('#' + dusty.modules[index]).show();
	$('#mod-value').text(dusty.modules[index]);
}

var updateCwa = function() {
	if (!dusty.location) { return;}

	// Check last known CWA, since it shouldn't change often
	if (isPointInPoly(buildCwaPolygon(_lastCwaIndex), { x: dusty.location.lon, y: dusty.location.lat })) {
		dusty.cwa = cwas.features[_lastCwaIndex].properties.WFO;
		$('#cwa-value').text(dusty.cwa);
		return;
	}

	for (var i = 0; i < cwas.features.length; i++) {
		if (isPointInPoly(buildCwaPolygon(i), { x: dusty.location.lon, y: dusty.location.lat })) {
			_lastCwaIndex = i;
			dusty.cwa = cwas.features[i].properties.WFO;
			$('#cwa-value').text(dusty.cwa);
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

var speakText = function(text, playEas) {
	if (!dusty.config.speech) { return; }

	spAmp = 100;
	spGap = 0;
	spPitch = 30;
	spSpeed =  140;
	if (playEas) {
		//$('audio#alert')[0].play();
		//setTimeout(function() { speak(text, { amplitude: spAmp, wordgap: spGap, pitch: spPitch, speed: spSpeed }); }, 27000);
	} else {
		speak(text, { amplitude: spAmp, wordgap: spGap, pitch: spPitch, speed: spSpeed });
	}
};