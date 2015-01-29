dusty.module = dusty.module || {};
dusty.module.iem = (function() {
	var lastSeqNum = 0;

	var _init = function() {
		dusty.core.modules.push('IEM');
		console.log('Loaded module: dusty.module.iem');
		var div = document.createElement('div');
		div.id = 'iem';
		document.body.appendChild(div);
		React.render(React.createElement(Iem, null), document.getElementById('iem'));
	};

	var Iem = React.createClass({displayName: 'Iem',
		getInitialState: function() {
			var self = this;
			self.fetchIemData();
			return { messages: [] };
			var iemTimer = setInterval(function() {
				console.log('firing mah timers');
				//self.fetchIemData();
			}, 1000);
		},
		handleIemData: function(data) {
			console.log('handle');
			console.log(data);
			this.state.messages = data.messages;
			this.setState(this.state);
		},
		fetchIemData: function() {
			var self = this;
			var url = 'http://weather.im/iembot-json/room/botstalk?seqnum=' + lastSeqNum + '&callback=?';
			console.log('fetch');
			$.getJSON(url, null, function(data) {
				self.handleIemData(data);
			});
		},
		render: function() {
			console.log('render');
			var self = this;
			var messages = null;
			if (this.state.messages) {
				messages = this.state.messages.map(function(m) {
					return (
						React.createElement(IemMessage, {message: _formatMessage(m)})
					);
				});
				// TODO move cleanup stuff somewhere besides render method
				if (this.state.messages.length > 0) {
					tmpLastSeqNum = this.state.messages[this.state.messages.length - 1].seqnum;
					if (!isNaN(tmpLastSeqNum)) {
						lastSeqNum = tmpLastSeqNum;
					}
				}
			}

			return (
				React.createElement("div", null, 
					React.createElement("ol", null, messages)
				)
			);
		}
	});

	var IemMessage = React.createClass({displayName: 'IemMessage',
		render: function() {
			return (this.props.message)
				? (React.createElement("li", {className: this.props.message.code}, 
						React.createElement("div", {className: "timestamp"}, 
							React.createElement("span", {className: "ts-ends"}, "["), this.props.message.time, React.createElement("span", {className: "ts-ends"}, "]")
						), 
						React.createElement("div", {className: "message", dangerouslySetInnerHTML: {__html: this.props.message.html}})
					))
				: null;
		}
	});

	var _isFilteredType = function(code) {
		return (code == 'RER' || code == 'WSW' || code == 'MWW' || code == 'PNS' || code == 'HWO' || code == 'NPW' || code == 'FLS' || code == 'CFW' || code == 'SMW' || code == 'MWS' || code == 'FFA'
		|| code == 'ADM' || code == 'FLW' || code == 'RFD' || code == 'RFW' || code == 'SPE');
	};

	var _isFilteredLsr = function(msg) {
		return (msg.indexOf('reports TSTM WND') > -1 || msg.indexOf('reports HEAVY RAIN') > -1 || msg.indexOf('reports SLEET') > -1 || msg.indexOf('reports MARINE') > -1);
	};

	var _isAllowedWfo = function(msg) {
		var wfo = msg.replace('K', '');
		return (wfo == 'BOU' || wfo == 'GJT' || wfo == 'PUB' || wfo == 'LOT' || wfo == 'ILX' || wfo == 'DVN' || wfo == 'DMX' || wfo == 'DDC' || wfo == 'GLD' || wfo == 'TOP' || wfo == 'ICT'
			|| wfo == 'MPX' || wfo == 'EAX' || wfo == 'SGF' || wfo == 'LSX' || wfo == 'GID' || wfo == 'LBF' || wfo == 'OAX' || wfo == 'ABR' || wfo == 'UNR' || wfo == 'FSD' || wfo == 'CYS' 
			|| wfo == 'OUN' || wfo == 'TSA' || wfo == 'AMA' || wfo == 'FWD' || wfo == 'LUB' || wfo == 'MAF');
	};

	var _formatMessage = function(m) {
		if (m == null || m.product_id == null || !m.product_id.length) { return; }

		var code = '';
		var product = m.product_id.split('-');
		if (product[3] !== null && product[3].length >= 3) { code = product[3].substring(0, 3); }
		if (product[1] === 'KWNS') { code += '|SPC'; }
		//if (_isFilteredType(code)) { return; }
		//if (_isFilteredLsr(m.message)) { return; }
		//if ((code == 'AFD' || code == 'NOW' || code == 'LSR') && !_isAllowedWfo(product[1])) { return; }
		//if ((code == 'WCN' || code == 'SVS') && (m.message.indexOf('cancels') > -1 || m.message.indexOf('continues'))) { return; }
		// Speaker Queue stuff testing
		// Parse abbreviations
		if (code == 'LSR') {
			var parsedText = product[1] + $('<div/>').html(m.message).find('a').text();
			parsedText = parsedText.replaceAll('Co', 'county');
			parsedText = parsedText.replaceAll('TSTM', 'thunder storm');
			parsedText = parsedText.replaceAll('WND', 'wind');
			parsedText = parsedText.replaceAll('DMG', 'damage');
			parsedText = parsedText.replaceAll('GST', 'gust');
			parsedText = parsedText.replaceAll('MPH', 'miles per hour');
			parsedText = parsedText.replaceAll('KY', 'Kentucky');
			//speakerQueue.push( { 'text': 'There is a new local storm report. ' + parsedText, 'alert': false });
		}

		if (code == 'TOR') {
			//speakerQueue.push( { 'text': 'The national weather service has issued a tornado warning. ' + parsedText, 'alert': true });
		}

		return {
			code: code,
			time: moment(m.ts).format('HH:mm') + 'Z',
			html: m.message
		};
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