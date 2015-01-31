dusty.module = dusty.module || {};
dusty.module.iem = (function() {
	var lastSeqNum = 0;
	var refreshDelay = 30000;
	var oldMinutes = 15;

	var _init = function() {
		dusty.core.modules.push('IEM');
		console.log('Loaded module: dusty.module.iem');
		var div = document.createElement('div');
		div.id = 'iem';
		div.className = 'light';
		document.body.appendChild(div);
		React.render(<Iem />, document.getElementById('iem'));
	};

	var Iem = React.createClass({
		getInitialState: function() {
			var self = this;
			self.fetchIemData();
			var iemTimer = setInterval(function() {
				console.log('refresh iem data');
				self.fetchIemData();
			}, refreshDelay);
			return { messages: [] };
		},
		handleIemData: function(data) {
			console.log('handle');
			console.log(data);
			if (data.messages && data.messages.length) {
				tmpLastSeqNum = data.messages[data.messages.length - 1].seqnum;
				if (!isNaN(tmpLastSeqNum)) {
					lastSeqNum = tmpLastSeqNum;
				}
			}
			this.state.messages = this.state.messages.concat(data.messages);
			this.setState(this.state);
		},
		fetchIemData: function() {
			var self = this;
			var url = 'http://weather.im/iembot-json/room/botstalk?seqnum=' + lastSeqNum + '&callback=?';
			var requestId = dusty.core.netrequests.length;
			dusty.core.netrequests.push({ ts: new Date().getTime(), status: 0 });
			$.getJSON(url, null, function(data) {
				self.handleIemData(data);
			})
			.done(function() {
				dusty.core.netrequests[requestId].status = ((new Date().getTime() - dusty.core.netrequests[requestId].ts) < 5000)
					? 1 : .6;
			})
			.fail(function() {
				dusty.core.netrequests[requestId].status = 0;
			});
		},
		render: function() {
			console.log('render');
			var self = this;
			var messages = null;
			if (this.state.messages) {
				messages = this.state.messages.map(function(m) {
					var fm = _formatMessage(m);
					if (fm) {
						return (
							<IemMessage message={fm} />
						);
					}
				});
			}

			return (
				<div>
					<ol>{messages}</ol>
				</div>
			);
		}
	});

	var IemMessage = React.createClass({
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
			return (<li className={className}>
					<div className="message" dangerouslySetInnerHTML={{__html: this.props.message.text}} onClick={this.handleClick}></div>
				</li>);
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

		var tsHtml =
			'<span class="timestamp"><span class="ts-ends">[</span>' +
			moment(m.ts).format('HH:mm') + 'Z<span class="ts-ends">] </span></span>';

		var fm = {
			code: code,
			time: m.ts,
			old: moment.utc(moment()).subtract(oldMinutes, "minute").format('X') > moment(m.ts + 'Z').format('X'),
			text: tsHtml + $(m.message).text(),
			url: $(m.message).find('a').attr('href'),
			local: (dusty.core.cwa && $(m.message).text().slice(0, 3) === dusty.core.cwa)
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
			var index = dusty.modules.indexOf('IEM');
			if (index > -1) {
				dusty.modules.splice(index, 1);
			}
		},
		update: function() { update(); }
	};
}());