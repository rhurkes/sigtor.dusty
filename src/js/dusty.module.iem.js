dusty.module = dusty.module || {};
dusty.module.iem = (function() {
	var lastSeqNum = 0;
	var refreshDelay = 30000;
	var oldMinutes = 15;
	var messageMax = 100;
	var _name = 'iem';

	var _init = function() {
		dusty.modules.push(_name);
		console.log('Loaded module: dusty.module.' + _name);
		var div = document.createElement('div');
		div.id = _name;
		div.className = 'module';
		document.body.appendChild(div);
		React.render(React.createElement(Iem, null), document.getElementById(_name));
	};

	var Iem = React.createClass({displayName: "Iem",
		getInitialState: function() {
			var self = this;
			self.fetchIemData();
			var iemTimer = setInterval(function() {
				self.fetchIemData();
			}, refreshDelay);
			return { messages: [] };
		},
		handleIemData: function(data) {
			if (data.messages && data.messages.length) {
				tmpLastSeqNum = data.messages[data.messages.length - 1].seqnum;
				if (!isNaN(tmpLastSeqNum)) {
					lastSeqNum = tmpLastSeqNum;
				}
			}

			var messages = [];
			for (var i = 0; i < data.messages.length; i++) {
				var fm = _formatMessage(data.messages[i]);
				if (fm) {
					messages.push(fm);
				}
			}

			this.state.messages = this.state.messages.concat(messages);
			if (this.state.messages.length > messageMax) {
				this.state.messages = this.state.messages.slice(this.state.messages.length - messageMax);
			}
			this.setState(this.state);
		},
		fetchIemData: function() {
			var self = this;
			var url = 'http://weather.im/iembot-json/room/botstalk?seqnum=' + lastSeqNum + '&callback=?';
			var requestId = dusty.netrequests.length;
			dusty.netrequests.push({ ts: new Date().getTime(), status: 0 });
			$.getJSON(url, null, function(data) {
				self.handleIemData(data);
			})
			.done(function() {
				dusty.netrequests[requestId].status = ((new Date().getTime() - dusty.netrequests[requestId].ts) < 5000)
					? 1 : .6;
			})
			.fail(function() {
				dusty.netrequests[requestId].status = 0;
			});
		},
		render: function() {
			var messages = this.state.messages.map(function(m) {
				return (
					React.createElement(IemMessage, {message: m})
				);
			});

			return (
				React.createElement("div", null, 
					React.createElement("ol", null, messages)
				)
			);
		}
	});

	var IemMessage = React.createClass({displayName: "IemMessage",
		handleClick: function() {
			if (this.props.message.url) {
				window.open(this.props.message.url);
			}
		},
		render: function() {
			var className = this.props.message.code;
			if (this.props.message.local) {
				className += ' local';
			}
			if (this.props.message.old) {
				className += ' old';
			}
			return (React.createElement("li", {className: className}, 
					React.createElement("div", {className: "message", dangerouslySetInnerHTML: {__html: this.props.message.text}, onClick: this.handleClick})
				));
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
		if (_isFilteredType(code)) { return; }
		//if (_isFilteredLsr(m.message)) { return; }
		if ((code == 'AFD' || code == 'NOW' || code == 'LSR') && !_isAllowedWfo(product[1])) { return; }
		if ((code == 'WCN' || code == 'SVS') && (m.message.indexOf('cancels') > -1 || m.message.indexOf('continues'))) { return; }

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
			dusty.speakerQueue.push( { 'text': 'local storm report. ' + parsedText, 'alert': false });
		}

		if (code == 'TOR') {
			dusty.speakerQueue.push( { 'text': 'The national weather service has issued a tornado warning. ' + parsedText, 'alert': true });
		}

		var tsHtml =
			'<span class="timestamp"><span class="ts-ends">[</span>' +
			moment(m.ts).format('HH:mm') + 'Z<span class="ts-ends">] </span></span>';

		var fm = {
			code: code,
			time: m.ts,
			old: moment.utc(moment()).subtract(oldMinutes, "minute").format('X') > moment(m.ts + 'Z').format('X'),
			text: tsHtml + $(m.message).text(),
			url: $(m.message).find('a').attr('href'),
			local: (dusty.cwa && $(m.message).text().slice(0, 3) === dusty.cwa)
		}

		return fm;
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