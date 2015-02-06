/*
	TODO list
	-bottom line not anchored to status bar when line is wrapped (small window)
	-if nothing in codewhitelist, allow everything
	-finish finding WFOs
	-check tornado watch/md/warning alerts/colors
*/

dusty.module = dusty.module || {};
dusty.module.iem = (function() {
	var lastSeqNum = 0;
	var refreshDelay = 30000;
	var oldMinutes = 15;
	var rawMax = 1000;
	var filteredMax = 100;
	var _name = 'iem';
	var fullname = 'dusty.module.iem';
	var RawStore = document.createElement('store');
	RawStore.messages = [];
	var needStoreUpdate = false;
	_url = 'http://weather.im/iembot-json/room/botstalk?seqnum={{lastSeqNum}}&callback=?';
	var filterStore = function() {
	    RawStore.dispatchEvent(new CustomEvent('filter'));
	}

	var _saveConfig = function() {
		storage.save(fullname, _config);
	};

	// Config init
	var _config = storage.load(fullname);
	_config.wfowhitelist = _config.wfowhitelist || [];
	_config.codewhitelist = _config.codewhitelist || [];
	_saveConfig();

	var _optionsCallback = function(data) {
		switch (data.type) {
			case 'codewhitelist':
				var index = _config.codewhitelist.indexOf(data.code);
				if (data.removed) {
					if (index > -1) {
						_config.codewhitelist.splice(index, 1);
						_saveConfig();
						needStoreUpdate = true;
					}
				}
				else {
					if (index === -1) {
						_config.codewhitelist.push(data.code);
						_saveConfig();
						needStoreUpdate = true;
					}
				}
				break;
			case 'wfowhitelist':
				var index = _config.wfowhitelist.indexOf(data.wfo);
				if (data.removed) {

				}
				else {

				}
				break;
		}
	};

	var _updateOptions = function() {
		// wfo whitelist
		for (var i = 0; i < _optionsMenu['wfowhitelist'].children.length; i++) {
			_optionsMenu['wfowhitelist'].children[i].selected = (_config.wfowhitelist.indexOf(_optionsMenu['wfowhitelist'].children[i].info.code) > -1);
		}

		// code whitelist
		for (var i = 0; i < _optionsMenu['codewhitelist'].children.length; i++) {
			_optionsMenu['codewhitelist'].children[i].selected = (_config.codewhitelist.indexOf(_optionsMenu['codewhitelist'].children[i].info.code) > -1);
		}
	};

	var _displayOptions = function() {
		if (dusty.menu.style.display && dusty.menu.style.display !== 'none') {
			umenu(dusty.menu);
			if (needStoreUpdate) {
				filterStore();
			}
		}
		else {
			_updateOptions();	// TODO technically only need to do this when updating the config and on init
			umenu(dusty.menu, _optionsMenu, _optionsCallback);
		}
	};

/*
				
				{ id: 'VNX', label: 'VNX Vance AFB', multi: true, info: { type: 'wfowhitelist', 'wfo': 'VNX' } },
				LBF? { id: 'LNX', label: 'LNX North Platte', multi: true, info: { type: 'wfowhitelist', 'wfo': 'LNX' } },
				{ id: 'TWX', label: 'TWX Topeka', multi: true, info: { type: 'wfowhitelist', 'wfo': 'TWX' } },
				{ id: 'UEX', label: 'UEX Hastings', multi: true, info: { type: 'wfowhitelist', 'wfo': 'UEX' } }
				lot, twc, mqt, dlh, tfx, sjt, boi, mox, unr, lix, abq, otx
				wants: vnx, inx, tul, tlx, okc, fdr, srx, sgf

*/
	var _optionsMenu = {
		'wfowhitelist': {
			id: 'WFO Whitelist', children: [
				{ id: 'ARX', label: 'ARX La Crosse', multi: true, info: { type: 'wfowhitelist', 'wfo': 'ARX' } },
				{ id: 'BOU', label: 'BOU Boulder', multi: true, info: { type: 'wfowhitelist', 'wfo': 'BOU' } },
				{ id: 'CYS', label: 'CYS Cheyenne', multi: true, info: { type: 'wfowhitelist', 'wfo': 'CYS' } },
				{ id: 'DVN', label: 'DVN Quad Cities', multi: true, info: { type: 'wfowhitelist', 'wfo': 'DVN' } },
				{ id: 'EAX', label: 'EAX Kansas City', multi: true, info: { type: 'wfowhitelist', 'wfo': 'EAX' } },
				{ id: 'GLD', label: 'GLD Goodland', multi: true, info: { type: 'wfowhitelist', 'wfo': 'GLD' } },
				{ id: 'ICT', label: 'ICT Wichita', multi: true, info: { type: 'wfowhitelist', 'wfo': 'ICT' } },
				{ id: 'OAX', label: 'OAX Omaha', multi: true, info: { type: 'wfowhitelist', 'wfo': 'OAX' } },
				{ id: 'FWD', label: 'FWD Ft Worth', multi: true, info: { type: 'wfowhitelist', 'wfo': 'FWD' } },
				{ id: 'DMX', label: 'DMX Des Moines', multi: true, info: { type: 'wfowhitelist', 'wfo': 'DMX' } },
				{ id: 'DDC', label: 'DDC Dodge City', multi: true, info: { type: 'wfowhitelist', 'wfo': 'DDC' } },
				{ id: 'MPX', label: 'MPX Minneapolis', multi: true, info: { type: 'wfowhitelist', 'wfo': 'MPX' } },
				{ id: 'ABR', label: 'ABR Abilene', multi: true, info: { type: 'wfowhitelist', 'wfo': 'ABR' } },
				{ id: 'AMA', label: 'AMA Amarillo', multi: true, info: { type: 'wfowhitelist', 'wfo': 'AMA' } },
				{ id: 'FSD', label: 'FSD Sioux Falls', multi: true, info: { type: 'wfowhitelist', 'wfo': 'FSD' } },
				{ id: 'PUB', label: 'PUB Pueblo', multi: true, info: { type: 'wfowhitelist', 'wfo': 'PUB' } }
			]
		},
		'codewhitelist': {
				id: 'Code Whitelist', children: [
					{ id: 'RER', label: 'RER', multi: true, info: { 'type': 'codewhitelist', 'code': 'RER' } },
					{ id: 'HWO', label: 'HWO', multi: true, info: { 'type': 'codewhitelist', 'code': 'HWO' } },
					{ id: 'WSW', label: 'WSW', multi: true, info: { 'type': 'codewhitelist', 'code': 'WSW' } },
					{ id: 'MWW', label: 'MWW', multi: true, info: { 'type': 'codewhitelist', 'code': 'MWW' } },
					{ id: 'PNS', label: 'PNS', multi: true, info: { 'type': 'codewhitelist', 'code': 'PNS' } },
					{ id: 'NPW', label: 'NPW', multi: true, info: { 'type': 'codewhitelist', 'code': 'NPW' } },
					{ id: 'FLS', label: 'FLS', multi: true, info: { 'type': 'codewhitelist', 'code': 'FLS' } },
					{ id: 'FFG', label: 'FFG', multi: true, info: { 'type': 'codewhitelist', 'code': 'FFG' } },
					{ id: 'CFW', label: 'CFW', multi: true, info: { 'type': 'codewhitelist', 'code': 'CFW' } },
					{ id: 'SMW', label: 'SMW', multi: true, info: { 'type': 'codewhitelist', 'code': 'SMW' } },
					{ id: 'MWS', label: 'MWS', multi: true, info: { 'type': 'codewhitelist', 'code': 'MWS' } },
					{ id: 'FFA', label: 'FFA', multi: true, info: { 'type': 'codewhitelist', 'code': 'FFA' } },
					{ id: 'ADM', label: 'ADM', multi: true, info: { 'type': 'codewhitelist', 'code': 'ADM' } },
					{ id: 'FLW', label: 'FLW', multi: true, info: { 'type': 'codewhitelist', 'code': 'FLW' } },
					{ id: 'RFD', label: 'RFD', multi: true, info: { 'type': 'codewhitelist', 'code': 'RFD' } },
					{ id: 'SPS', label: 'SPS', multi: true, info: { 'type': 'codewhitelist', 'code': 'SPS' } },
					{ id: 'RFW', label: 'RFW', multi: true, info: { 'type': 'codewhitelist', 'code': 'RFW' } },
					{ id: 'SPE', label: 'SPE', multi: true, info: { 'type': 'codewhitelist', 'code': 'SPE' } },
					{ id: 'VAA', label: 'VAA', multi: true, info: { 'type': 'codewhitelist', 'code': 'VAA' } },
					{ id: 'AVA', label: 'AVA', multi: true, info: { 'type': 'codewhitelist', 'code': 'AVA' } },
					{ id: 'NOW', label: 'NOW', multi: true, info: { 'type': 'codewhitelist', 'code': 'NOW' } },
					{ id: 'AFD', label: 'AFD', multi: true, info: { 'type': 'codewhitelist', 'code': 'AFD' } },
					{ id: 'LSR', label: 'LSR', multi: true, info: { 'type': 'codewhitelist', 'code': 'LSR' } }
				]
			}
		};

	var _init = function() {
		dusty.modules.push(_name);
		console.log('Loaded module: dusty.module.' + _name);
		var div = document.createElement('div');
		div.id = _name;
		div.className = 'module';
		document.body.appendChild(div);
		React.render(React.createElement(Iem, null), document.getElementById(_name));
	};

	var Iem = React.createClass({displayName: 'Iem',
		getInitialState: function() {
			var self = this;
			self.fetchIemData();
			var iemTimer = setInterval(function() {
				self.fetchIemData();
			}, refreshDelay);
			return { messages: [] };
		},
		componentWillMount: function() { RawStore.addEventListener('filter', this.filterStore.bind(this)); },
    	componentWillUnmount: function() { RawStore.removeEventListener('filter', this.filterStore.bind(this)); },
		filterStore: function() {
			this.state.messages = [];
			for (var i = 0; i < RawStore.messages.length; i++) {
				var fm = _formatMessage(RawStore.messages[i]);
				if (fm) {
					this.state.messages.push(fm);
				}
			}

			if (this.state.messages.length > filteredMax) {
				this.state.messages = this.state.messages.slice(this.state.messages.length - filteredMax);
			}
			this.setState(this.state);
			needStoreUpdate = false;
		},
		handleIemData: function(data) {
			if (data.messages && data.messages.length) {
				tmpLastSeqNum = data.messages[data.messages.length - 1].seqnum;
				if (!isNaN(tmpLastSeqNum)) {
					lastSeqNum = tmpLastSeqNum;
				}
			}

			RawStore.messages = RawStore.messages.concat(data.messages);
			if (RawStore.messages.length > rawMax) {
				RawStore.messages = RawStore.messages.slice(RawStore.messages.length - rawMax);
			}

			this.filterStore();
		},
		fetchIemData: function() {
			var self = this;
			var url = _url.replace('{{lastSeqNum}}', lastSeqNum);
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

	var IemMessage = React.createClass({displayName: 'IemMessage',
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
			if (this.props.message.important) {
				className += ' important';
			}
			return (
				React.createElement("li", {className: className}, 
					React.createElement("div", {className: "message", dangerouslySetInnerHTML: {__html: this.props.message.text}, onClick: this.handleClick})
				)
			);
		}
	});

	var _isFilteredLsr = function(msg) {
		// TODO set a speed limit override for TSTM WND?
		return (
			msg.indexOf('reports TSTM WND') > -1 ||
			msg.indexOf('reports NON-TSTM WND GST') > -1 ||
			msg.indexOf('reports HEAVY RAIN') > -1 ||
			msg.indexOf('reports SNOW') > -1 ||
			msg.indexOf('reports HEAVY SNOW') > -1 ||
			msg.indexOf('reports SLEET') > -1 ||
			msg.indexOf('reports MARINE') > -1 ||
			msg.indexOf('Summary Local Storm Report') > -1
		);
	};

	var _isAllowedWfo = function(msg) {
		var wfo = msg.replace('K', '');
		return (wfo == 'BOU' || wfo == 'GJT' || wfo == 'PUB' || wfo == 'LOT' || wfo == 'ILX' || wfo == 'DVN' || wfo == 'DMX' || wfo == 'DDC' || wfo == 'GLD' || wfo == 'TOP' || wfo == 'ICT'
			|| wfo == 'MPX' || wfo == 'EAX' || wfo == 'SGF' || wfo == 'LSX' || wfo == 'GID' || wfo == 'LBF' || wfo == 'OAX' || wfo == 'ABR' || wfo == 'UNR' || wfo == 'FSD' || wfo == 'CYS' 
			|| wfo == 'OUN' || wfo == 'TSA' || wfo == 'AMA' || wfo == 'FWD' || wfo == 'LUB' || wfo == 'MAF');
	};

	var _processSpeechMessage = function(m, code) {
		// TODO get rid of jQuery in here
		var parsedText = '';
		
		if (code === 'PTS|SPC') {
			parsedText = $(m.message).text();
			dusty.speakerQueue.push( { 'text': parsedText, 'alert': true });
		}

		// Parse abbreviations
		if (code == 'LSR') {
			var product = m.product_id.split('-');
			parsedText = product[1] + $('<div/>').html(m.message).find('a').text();
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
	}

	var _formatMessage = function(m) {
		if (m == null || m.product_id == null || !m.product_id.length) { return; }

		var code = '';
		var product = m.product_id.split('-');
		if (product[3] !== null && product[3].length >= 3) {
			code = product[3].substring(0, 3);
		}
		if (product[1] === 'KWNS') {
			code += '|SPC';
		}
		
		// codewhitelist filter - only process if at least one entry
		//if (_config.codewhitelist.length && _config.codewhitelist.indexOf(code) === -1) { return; }	// Real codewhitelist
		// TODO change this back when done testing
		if (_config.codewhitelist.indexOf(code) > -1) { return; }	// Temp treat as blacklist

		if (code === 'LSR' && _isFilteredLsr(m.message)) { return; }
		//if ((code == 'AFD','NOW','LSR') && !_isAllowedWfo(product[1])) { return; }
		//if ((code == 'WCN','SVS') && (m.message.indexOf('cancels') > -1 || m.message.indexOf('continues'))) { return; }

		// Assign important flag to important products
		var important = false;
		if (code === 'PTS|SPC') {
			important = true;
		}

		var tsHtml = '<span class="timestamp"><span class="ts-ends">[</span>' +
			moment(m.ts).format('HH:mm') + 'Z<span class="ts-ends">] </span></span>';

		var fm = {
			code: code,
			time: m.ts,
			old: moment.utc(moment()).subtract(oldMinutes, "minute").format('X') > moment(m.ts + 'Z').format('X'),
			text: tsHtml + $(m.message).text(),
			url: $(m.message).find('a').attr('href'),
			local: (dusty.cwa && $(m.message).text().slice(0, 3) === dusty.cwa),
			important: important
		}

		if (dusty.config.speech) {
			_processSpeechMessage(m, code);
		}

		return fm;
	};

	// Start the module
	_init();

	return {
		config: _config,
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