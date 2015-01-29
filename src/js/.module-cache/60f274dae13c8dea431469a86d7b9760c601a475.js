dusty.module = dusty.module || {};
dusty.module.iem = (function() {
	var _init = function() {
		dusty.core.modules.push('IEM');
		console.log('Loaded module: dusty.module.iem');
		$('body').append($('<div />', { id: 'iem' }));
		React.render(React.createElement(IemList, null), document.getElementById('iem'));
		_update();
	};

	var IemList = React.createClass({displayName: 'IemList',
		render: function() {
			return (
				React.createElement("div", null, 
					React.createElement("ol", null)
				)
			);
		}
	});

	var lastSeqNum = 0;
	var _isFilteredType = function(code) {
		return (code == 'RER' || code == 'WSW' || code == 'MWW' || code == 'PNS' || code == 'HWO' || code == 'NPW' || code == 'FLS' || code == 'CFW' || code == 'SMW' || code == 'MWS' || code == 'FFA'
		|| code == 'ADM' || code == 'FLW' || code == 'RFD' || code == 'RFW' || code == 'SPE');
	};
	var _isFilteredLsr = function(msg) {
		return (msg.indexOf('reports TSTM WND') > -1 || msg.indexOf('reports HEAVY RAIN') > -1 || msg.indexOf('reports SLEET') > -1 || msg.indexOf('reports MARINE') > -1);
	}
	var _isAllowedWfo = function(msg) {
		var wfo = msg.replace('K', '');
		return (wfo == 'BOU' || wfo == 'GJT' || wfo == 'PUB' || wfo == 'LOT' || wfo == 'ILX' || wfo == 'DVN' || wfo == 'DMX' || wfo == 'DDC' || wfo == 'GLD' || wfo == 'TOP' || wfo == 'ICT'
			|| wfo == 'MPX' || wfo == 'EAX' || wfo == 'SGF' || wfo == 'LSX' || wfo == 'GID' || wfo == 'LBF' || wfo == 'OAX' || wfo == 'ABR' || wfo == 'UNR' || wfo == 'FSD' || wfo == 'CYS' 
			|| wfo == 'OUN' || wfo == 'TSA' || wfo == 'AMA' || wfo == 'FWD' || wfo == 'LUB' || wfo == 'MAF');
	}

	var _update = function() {
		var url = 'http://weather.im/iembot-json/room/botstalk?seqnum={{lastSeqNum}}&callback=?';

		// Truncate older messages to keep things fast
		if ($('#displayIem li').length > 100) {
			var count = 0;
			$('#displayIem li').each(function() {
				count++;
				if (count > 100) { $(this).remove(); }
			});
		}

		url = url.replace('{{lastSeqNum}}', lastSeqNum);
		$.getJSON(url, null, function(data) {
			var tmpCode = '';
			$.each(data.messages, function() {
				var tmpMessage = $(this)[0];
				if (tmpMessage == null || tmpMessage.product_id == null || !tmpMessage.product_id.length) { return; }
				var tmpProductData = tmpMessage.product_id.split('-');
				if (tmpProductData[3] !== null && tmpProductData[3].length >= 3) { tmpCode = tmpProductData[3].substring(0, 3); }
				if (tmpProductData[1] === 'KWNS') { tmpCode += '|SPC'; }
				//if (_isFilteredType(tmpCode)) { return; }
				//if (_isFilteredLsr(tmpMessage.message)) { return; }
				//if ((tmpCode == 'AFD' || tmpCode == 'NOW' || tmpCode == 'LSR') && !_isAllowedWfo(tmpProductData[1])) { return; }
				//if ((tmpCode == 'WCN' || tmpCode == 'SVS') && (tmpMessage.message.indexOf('cancels') > -1 || tmpMessage.message.indexOf('continues'))) { return; }

				// Speaker Queue stuff testing
				// Parse abbreviations

				if (tmpCode == 'LSR') {
					var parsedText = tmpProductData[1] + $('<div/>').html(tmpMessage.message).find('a').text();
					parsedText = parsedText.replaceAll('Co', 'county');
					parsedText = parsedText.replaceAll('TSTM', 'thunder storm');
					parsedText = parsedText.replaceAll('WND', 'wind');
					parsedText = parsedText.replaceAll('DMG', 'damage');
					parsedText = parsedText.replaceAll('GST', 'gust');
					parsedText = parsedText.replaceAll('MPH', 'miles per hour');
					parsedText = parsedText.replaceAll('KY', 'Kentucky');
					//speakerQueue.push( { 'text': 'There is a new local storm report. ' + parsedText, 'alert': false });
				}

				if (tmpCode == 'TOR') {
					//speakerQueue.push( { 'text': 'The national weather service has issued a tornado warning. ' + parsedText, 'alert': true });
				}

				var li = $('<li/>', { 'class': tmpCode }).addClass('shadow');
				$('#iem > ol').prepend(
						li.append($('<div/>', { 'class': 'iemTimestamp', 'text': '[' + moment(tmpMessage.ts).format('HH:mm') + 'Z]' }))
						.append($('<div/>', { 'class': 'iemMessage', 'html': tmpMessage.message }))
				);
			});

			if (data.messages.length > 0) {
				tmpLastSeqNum = data.messages[data.messages.length - 1].seqnum;
				if (!isNaN(tmpLastSeqNum)) {
					lastSeqNum = tmpLastSeqNum;
				}
			}
		});
	};

	// Start the module
	_init();

	return {
		init: function() {
			_init();
		},
		dispose: function() {
			var index = dusty.modules.indexOf('IEM');
			if (index > -1) {
				dusty.modules.splice(index, 1);
			}
		},
		update: function() { update(); }
	};
}());