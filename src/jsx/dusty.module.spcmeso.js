// TODO move modules in modules directory
// TODO gps location resize
// TODO resize
// TODO organize this better

dusty.module = dusty.module || {};
dusty.module.spcmeso = (function() {
	var _name = 'spcmeso';
	var _width = 1000;
	var _height = 750;
	var _baseUrl = 'http://www.spc.noaa.gov/exper/mesoanalysis/s{{sector}}/{{parama}}/{{paramb}}.gif?';
	var _state = { sector: 19, isPreset: false };
	var _radarPresent = false;
	var _hiwaysPresent = false;
	var _refreshDelay = 60000;
	var img = document.createElement('img');
	var img2 = document.createElement('img');
	var imgbg = document.createElement('img');
	var imghiways = document.createElement('img');
	var imgradar = document.createElement('img');
	var params = document.createElement('div');
	var position = document.createElement('div');

	var _menuCallback = function(resp) {
		switch (resp.data.type) {
			case 'sector':
				_state.sector = resp.data.number;
				break;
			case 'togglehiways':
				_hiwaysPresent = !_hiwaysPresent;
				imghiways.src = _baseUrl.replace('{{sector}}', _state.sector).replace('{{parama}}', 'hiway').replace('{{paramb}}', 'hiway');
				imghiways.style.display = (_hiwaysPresent) ? 'block' : 'none';
				break;
			case 'toggleradar':
				_radarPresent = !_radarPresent;
				imgradar.src = _baseUrl.replace('{{parama}}', 'rgnlrad').replace('{{paramb}}', 'rgnlrad').replace('{{sector}}', _state.sector) + (new Date().getTime());
				imgradar.style.display = (_radarPresent) ? 'block' : 'none';
				break;
			case 'presets':
				_state.isPreset = true;
				switch (resp.data.value) {
					case 'sfc1':
						_state.param1 = 'mcon';
						_state.p1label = 'Short Fuse Composite 1 (Moisture Convergence/Theta-E Advection)';
						_state.p2label = 'Theta-E Adv';
						_state.param2 = 'thea';
						break;
					case 'sfc2':
						_state.param1 = 'lr3c_sf';
						_state.p1label = 'Short Fuse Composite 2 (LLLR/0-3 MLCAPE/Crossover)';
						_state.p2label = 'Crossover';
						_state.param2 = 'xover';
						break;
				}
				break;
			case 'param1':
				_state.isPreset = false;
				_state.param1 = resp.data.value;
				_state.p1label = resp.label || resp.data.value;
				break;
			case 'param2':
				_state.isPreset = false;
				_state.param2 = resp.data.value;
				_state.p2label = resp.label || resp.data.value;
				break;
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
			id: 'general', label: 'General', children: [
			]
		},
		'hiways': {
			id: 'hiways', label: 'Toggle Cities/Hiways', data: { type: 'togglehiways' }
		},
		'radar': {
			id: 'radar', label: 'Toggle Radar', data: { type: 'toggleradar' }
		},
		'sector': {
			id: 'sector', label: 'Sector', children: [
				{ id: 'National', data: { type: 'sector', number: 19 }},
				{ id: 'NW', data: { type: 'sector', number: 11 }},
				{ id: 'SW', data: { type: 'sector', number: 12 }},
				{ id: 'N Plns', data: { type: 'sector', number: 13 }},
				{ id: 'C Plns', data: { type: 'sector', number: 14 }},
				{ id: 'MW', data: { type: 'sector', number: 20 }},
				{ id: 'S Plns', data: { type: 'sector', number: 15 }},
				{ id: 'NE', data: { type: 'sector', number: 16 }},
				{ id: 'EC', data: { type: 'sector', number: 17 }},
				{ id: 'SE', data: { type: 'sector', number: 18 }}
			]
		},
		'presets': {
			id: 'presets', label: 'Presets', children: [
				{ id: 'sfc1', label: 'Short Fuse Composite 1', data: { type: 'presets', value: 'sfc1' }},
				{ id: 'sfc2', label: 'Short Fuse Composite 2', data: { type: 'presets', value: 'sfc2' }}
			]
		},
		'param1': {
			id: 'parameter1', label: 'First Parameter', children: [
				{ id: 'observations1', label: 'Observations', children: [
					{ id: 'bigsfc1', label: 'Sfc Obs', data: { type: 'param1', value: 'bigsfc' }},
					{ id: '1kmv1', label: 'Vis Sat', data: { type: 'param1', value: '1kmv' }},
					{ id: 'rgnlrad1', label: 'Radar', data: { type: 'param1', value: 'rgnlrad' }}
				] },
				{ id: 'basicsfc1', label: 'Basic Sfc', children: [
					{ id: 'pmsl1', label: 'Pressure/Wind', data: { type: 'param1', value: 'pmsl' }},
					{ id: 'ttd1', label: 'Temp/Wind/Td', data: { type: 'param1', value: 'ttd' }},
					{ id: 'mcon1', label: 'Moisture Conv', data: { type: 'param1', value: 'mcon' }},
					{ id: 'thea1', label: 'Theta-E Adv', data: { type: 'param1', value: 'thea' }},
					{ id: 'mxth1', label: 'Mixing Ratio', data: { type: 'param1', value: 'mxth' }},
					{ id: 'pchg1', label: '2HR Pressure', data: { type: 'param1', value: 'pchg' }},
					{ id: 'temp_chg_sf1', label: '3HR Temp', data: { type: 'param1', value: 'temp_chg_sf' }},
					{ id: 'dwpt_chg_sf1', label: '3HR Dewpoint', data: { type: 'param1', value: 'dwpt_chg_sf' }},
					{ id: 'mixr_chg_sf1', label: '3HR Mixing Ratio', data: { type: 'param1', value: 'mixr_chg_sf' }},
					{ id: 'thte_chg_sf1', label: '3HR Theta-E', data: { type: 'param1', value: 'thte_chg_sf' }}

				] },
				{ id: 'basicua1', label: 'Basic UA', children: [
					{ id: '9251', label: '925mb', data: { type: 'param1', value: '925mb' }},
					{ id: '8501', label: '850mb', data: { type: 'param1', value: '850mb' }},
					{ id: '7001', label: '700mb', data: { type: 'param1', value: '700mb' }},
					{ id: '5001', label: '500mb', data: { type: 'param1', value: '500mb' }},
					{ id: '3001', label: '300mb', data: { type: 'param1', value: '300mb' }},
					{ id: 'dlcp1', label: 'Deep Moist Conv', data: { type: 'param1', value: 'dlcp' }},
					{ id: 'sfnt1', label: 'Sfc Front', data: { type: 'param1', value: 'sfnt' }},
					{ id: 'tadv_sf1', label: '850 Temp Adv', data: { type: 'param1', value: 'tadv_sf' }},
					{ id: '7tad_sf1', label: '700 Temp Adv', data: { type: 'param1', value: '7tad_sf' }},
					{ id: '9fnt1', label: '925 Front', data: { type: 'param1', value: '9fnt' }},
					{ id: '8fnt_sf1', label: '850 Front', data: { type: 'param1', value: '8fnt_sf' }},
					{ id: '7fnt_sf1', label: '700 Front', data: { type: 'param1', value: '7fnt_sf' }},
					{ id: '98ft1', label: '925-850 Front', data: { type: 'param1', value: '98ft' }},
					{ id: '857f_sf1', label: '850-700 Front', data: { type: 'param1', value: '857f_sf' }},
					{ id: '75ft_sf1', label: '700-500 Front', data: { type: 'param1', value: '75ft_sf' }},
					{ id: 'vadv_sf1', label: '700-400 Diff VA', data: { type: 'param1', value: 'vadv_sf' }},
					{ id: 'padv_sf1', label: '400-250 Pot VA', data: { type: 'param1', value: 'padv_sf' }},
					{ id: 'ddiv_sf1', label: '850-250 Diff Div', data: { type: 'param1', value: 'ddiv_sf' }},
					{ id: 'ageo_sf1', label: '300 Jet Circ', data: { type: 'param1', value: 'ageo_sf' }},
					{ id: '500mb_chg_sf1', label: '12HR 500 Height', data: { type: 'param1', value: '500mb_chg_sf' }}
				] },
				{ id: 'kinematics1', label: 'Kinematics', children: [
					{ id: 'icon_sf1', label: 'Inst Contr Rate', data: { type: 'param1', value: 'icon_sf' }},
					{ id: 'trap_sf1', label: 'Sfc Fluid Trap', data: { type: 'param1', value: 'trap_sf' }},
					{ id: 'vtm_sf1', label: 'VTM', data: { type: 'param1', value: 'vtm_sf' }},
					{ id: 'dvvr_sf1', label: 'Div/Vort', data: { type: 'param1', value: 'dvvr_sf' }},
					{ id: 'def_sf1', label: 'Def/Axes Dil', data: { type: 'param1', value: 'def_sf' }},
					{ id: 'trap_500_sf1', label: '500 Fluid Trap', data: { type: 'param1', value: 'trap_500_sf' }},
					{ id: 'trap_250_sf1', label: '250 Fluid Trap', data: { type: 'param1', value: 'trap_250_sf' }}
				] },
				{ id: 'thermodynamics1', label: 'Thermodynamics', children: [
					{ id: 'sbcp1', label: 'SBCAPE', data: { type: 'param1', value: 'sbcp' }},
					{ id: 'mlcp1', label: 'MLCAPE', data: { type: 'param1', value: 'mlcp' }},
					{ id: 'mucp1', label: 'MUCAPE', data: { type: 'param1', value: 'mucp' }},
					{ id: 'ncap1', label: 'Normalized CAPE', data: { type: 'param1', value: 'ncap' }},
					{ id: 'dcape1', label: 'Downdraft CAPE', data: { type: 'param1', value: 'dcape' }},
					{ id: 'muli_sf1', label: 'SB LIs', data: { type: 'param1', value: 'muli_sf' }},
					{ id: 'kidx1', label: 'K Index', data: { type: 'param1', value: 'kidx' }},
					{ id: 'laps_sf1', label: 'Lapse Rates', data: { type: 'param1', value: 'laps_sf' }},
					{ id: 'lllr_sf1', label: 'Low-level Lapse Rates', data: { type: 'param1', value: 'lllr_sf' }},
					{ id: 'lclh_sf1', label: 'LCL', data: { type: 'param1', value: 'lclh_sf' }},
					{ id: 'lfch_sf1', label: 'LFC', data: { type: 'param1', value: 'lfch_sf' }},
					{ id: 'lfrh_sf1', label: 'LCL-LFC RH', data: { type: 'param1', value: 'lfrh_sf' }},
					{ id: 'sbcp_chg_sf1', label: '3HR SBCAPE', data: { type: 'param1', value: 'sbcp_chg_sf' }},
					{ id: 'sbcn_chg1', label: '3HR SBCIN', data: { type: 'param1', value: 'sbcn_chg' }},
					{ id: 'mlcp_chg_sf1', label: '3HR MLCAPE', data: { type: 'param1', value: 'mlcp_chg_sf' }},
					{ id: 'mucp_chg_sf1', label: '3HR MUCAPE', data: { type: 'param1', value: 'mucp_chg_sf' }},
					{ id: 'lllr_chg_sf1', label: '3HR LLLR', data: { type: 'param1', value: 'lllr_chg_sf' }},
					{ id: 'laps_chg_sf1', label: '6HR LR', data: { type: 'param1', value: 'laps_chg_sf' }}
				] },
				{ id: 'windshear1', label: 'Wind Shear', children: [
					{ id: 'eshr1', label: 'Eff Shear', data: { type: 'param1', value: 'eshr' }},
					{ id: 'shr61', label: '0-6 Shear', data: { type: 'param1', value: 'shr6' }},
					{ id: 'shr81', label: '0-8 Shear', data: { type: 'param1', value: 'shr8' }},
					{ id: 'shr11', label: '0-1 Shear', data: { type: 'param1', value: 'shr1' }},
					{ id: 'brns1', label: 'BRN Shear', data: { type: 'param1', value: 'brns' }},
					{ id: 'effh_sf1', label: 'Eff SRH', data: { type: 'param1', value: 'effh_sf' }},
					{ id: 'srh31', label: '0-3 SRH', data: { type: 'param1', value: 'srh3' }},
					{ id: 'srh11', label: '0-1 SRH', data: { type: 'param1', value: 'srh1' }},
					{ id: 'llsr1', label: '0-2 SR Wind', data: { type: 'param1', value: 'llsr' }},
					{ id: 'mlsr1', label: '4-6 SR Wind', data: { type: 'param1', value: 'mlsr' }},
					{ id: 'ulsr1', label: '9-11 SR Wind', data: { type: 'param1', value: 'ulsr' }},
					{ id: 'alsr1', label: 'Anvil SR Wind', data: { type: 'param1', value: 'alsr' }},
					{ id: 'mnwd1', label: '850-300 Mean Wind', data: { type: 'param1', value: 'mnwd' }},
					{ id: 'xover1', label: '850/500 Crossover', data: { type: 'param1', value: 'xover' }},
					{ id: 'srh3_chg1', label: '3HR 0-3 SRH', data: { type: 'param1', value: 'srh3_chg' }},
					{ id: 'shr1_chg1', label: '3HR 0-1 SRH', data: { type: 'param1', value: 'shr1_chg' }},
					{ id: 'shr6_chg1', label: '3HR 0-6 Shear', data: { type: 'param1', value: 'shr6_chg' }}
				] },
				{ id: 'compositeindices1', label: 'Composite Indices', children: [
					{ id: 'scp1', label: 'Supercell Comp', data: { type: 'param1', value: 'scp' }},
					{ id: 'lscp1', label: 'Supercell Comp (LM)', data: { type: 'param1', value: 'lscp' }},
					{ id: 'stor_sf1', label: 'Fixed Sig Tor', data: { type: 'param1', value: 'stor_sf' }},
					{ id: 'stpc_sf1', label: 'Eff Sig Tor', data: { type: 'param1', value: 'stpc_sf' }},
					{ id: 'sigt11', label: 'Cond Sig Tor 1', data: { type: 'param1', value: 'sigt1' }},
					{ id: 'sigt21', label: 'Cond Sig Tor 2', data: { type: 'param1', value: 'sigt2' }},
					{ id: 'nstp1', label: 'Non-Supercell Tor', data: { type: 'param1', value: 'nstp' }},
					{ id: 'sigh1', label: 'Sig Hail', data: { type: 'param1', value: 'sigh' }},
					{ id: 'sars11', label: 'SARS Hail Size', data: { type: 'param1', value: 'sars1' }},
					{ id: 'sars21', label: 'SARS Sig Hail %', data: { type: 'param1', value: 'sars2' }},
					{ id: 'dcp1', label: 'Derecho Comp', data: { type: 'param1', value: 'dcp' }},
					{ id: 'cbsig1', label: 'Craven/Brooks', data: { type: 'param1', value: 'cbsig' }},
					{ id: 'brn_sf1', label: 'BRN', data: { type: 'param1', value: 'brn_sf' }},
					{ id: 'mcsm1', label: 'MCS Maint', data: { type: 'param1', value: 'mcsm' }},
					{ id: 'mbcp1', label: 'Microburst Comp', data: { type: 'param1', value: 'mbcp' }},
					{ id: 'ehi11', label: '0-1 EHI', data: { type: 'param1', value: 'ehi1' }},
					{ id: 'ehi31', label: '0-3 EHI', data: { type: 'param1', value: 'ehi3' }},
					{ id: 'vgp31', label: '0-3 VGP', data: { type: 'param1', value: 'vgp3' }}
				] },
				{ id: 'multiparameterfields1', label: 'Multi-Parameter Fields', children: [
					{ id: 'cpsh_sf1', label: 'MUCAPE/Eff Shear', data: { type: 'param1', value: 'cpsh_sf' }},
					{ id: 'comp_sf1', label: 'MULI/Crossover', data: { type: 'param1', value: 'comp_sf' }},
					{ id: 'lcls_sf1', label: 'LCL/0-1 SRH', data: { type: 'param1', value: 'lcls_sf' }},
					{ id: 'lr3c_sf1', label: 'LLLR/0-3 MLCAPE', data: { type: 'param1', value: 'lr3c_sf' }},
					{ id: '3cvr1', label: 'Vort/0-3 MLCAPE', data: { type: 'param1', value: '3cvr' }},
					{ id: 'tdlr_sf1', label: 'Dewpoint/Mid Lapse', data: { type: 'param1', value: 'tdlr_sf' }},
					{ id: 'hail1', label: 'Hail Parameters', data: { type: 'param1', value: 'hail' }},
					{ id: 'qlcs1_sf1', label: 'QLCS 1', data: { type: 'param1', value: 'qlcs1_sf' }},
					{ id: 'qlcs2_sf1', label: 'QLCS 2', data: { type: 'param1', value: 'qlcs2_sf' }}
				] },
				{ id: 'heavyrain1', label: 'Heavy Rain', children: [
					{ id: 'pwtr_sf1', label: 'Precipitable Water', data: { type: 'param1', value: 'pwtr_sf' }},
					{ id: 'tran_sf1', label: '850 Moist Trans', data: { type: 'param1', value: 'tran_sf' }},
					{ id: 'prop_sf1', label: 'Upwind Prop Vector', data: { type: 'param1', value: 'prop_sf' }},
					{ id: 'peff_sf1', label: 'Precip Pot Place', data: { type: 'param1', value: 'peff_sf' }},
				] },
				{ id: 'winterweather1', label: 'Winter Weather', children: [
					{ id: 'ptyp1', label: 'Precip Type', data: { type: 'param1', value: 'ptyp' }},
					{ id: 'fztp1', label: 'Near-Freeze Sfc T', data: { type: 'param1', value: 'fztp' }},
					{ id: 'swbt1', label: 'Sfc Wet-Bulb T', data: { type: 'param1', value: 'swbt' }},
					{ id: 'fzlv_sf1', label: 'Freezing Level', data: { type: 'param1', value: 'fzlv_sf' }},
					{ id: 'thck1', label: 'Critical Thickness', data: { type: 'param1', value: 'thck' }},
					{ id: 'epvl_sf1', label: '800-750 EPVg', data: { type: 'param1', value: 'epvl_sf' }},
					{ id: 'epvm_sf1', label: '650-500 EPVg', data: { type: 'param1', value: 'epvm_sf' }},
					{ id: 'les1_sf1', label: 'Lake Effect Snow 1', data: { type: 'param1', value: 'les1_sf' }},
					{ id: 'les2_sf1', label: 'Lake Effect Snow 2', data: { type: 'param1', value: 'les2_sf' }},
					{ id: 'snsq1', label: 'Snow Squall', data: { type: 'param1', value: 'snsq' }}
				] },
				{ id: 'fireweather1', label: 'Fire Weather', children: [
					{ id: 'sfir1', label: 'RH/T/Wind', data: { type: 'param1', value: 'sfir' }},
					{ id: 'fosb1', label: 'Fosberg', data: { type: 'param1', value: 'fosb' }},
					{ id: 'lhan1', label: 'Low Haines', data: { type: 'param1', value: 'lhan' }},
					{ id: 'mhan1', label: 'Mid Haines', data: { type: 'param1', value: 'mhan' }},
					{ id: 'hhan1', label: 'High Haines', data: { type: 'param1', value: 'hhan' }},
					{ id: 'lasi_sf1', label: 'Low At Sev', data: { type: 'param1', value: 'lasi_sf' }}
				] }
			]
		},
		'param2': {
			id: 'parameter2', label: 'Second Parameter', children: [
				{ id: 'none', label: 'NONE', data: { type: 'param2', value: 'none' }},
				{ id: 'observations2', label: 'Observations', children: [
					{ id: 'bigsfc2', label: 'Sfc Obs', data: { type: 'param2', value: 'bigsfc' }},
					{ id: '1kmv2', label: 'Vis Sat', data: { type: 'param2', value: '1kmv' }},
					{ id: 'rgnlrad2', label: 'Radar', data: { type: 'param2', value: 'rgnlrad' }}
				] },
				{ id: 'basicsfc2', label: 'Basic Sfc', children: [
					{ id: 'pmsl2', label: 'Pressure/Wind', data: { type: 'param2', value: 'pmsl' }},
					{ id: 'ttd2', label: 'Temp/Wind/Td', data: { type: 'param2', value: 'ttd' }},
					{ id: 'mcon2', label: 'Moisture Conv', data: { type: 'param2', value: 'mcon' }},
					{ id: 'thea2', label: 'Theta-E Adv', data: { type: 'param2', value: 'thea' }},
					{ id: 'mxth2', label: 'Mixing Ratio', data: { type: 'param2', value: 'mxth' }},
					{ id: 'pchg2', label: '2HR Pressure', data: { type: 'param2', value: 'pchg' }},
					{ id: 'temp_chg_sf2', label: '3HR Temp', data: { type: 'param2', value: 'temp_chg_sf' }},
					{ id: 'dwpt_chg_sf2', label: '3HR Dewpoint', data: { type: 'param2', value: 'dwpt_chg_sf' }},
					{ id: 'mixr_chg_sf2', label: '3HR Mixing Ratio', data: { type: 'param2', value: 'mixr_chg_sf' }},
					{ id: 'thte_chg_sf2', label: '3HR Theta-E', data: { type: 'param2', value: 'thte_chg_sf' }}

				] },
				{ id: 'basicua2', label: 'Basic UA', children: [
					{ id: '9252', label: '925mb', data: { type: 'param2', value: '925mb' }},
					{ id: '8502', label: '850mb', data: { type: 'param2', value: '850mb' }},
					{ id: '7002', label: '700mb', data: { type: 'param2', value: '700mb' }},
					{ id: '5002', label: '500mb', data: { type: 'param2', value: '500mb' }},
					{ id: '3002', label: '300mb', data: { type: 'param2', value: '300mb' }},
					{ id: 'dlcp2', label: 'Deep Moist Conv', data: { type: 'param2', value: 'dlcp' }},
					{ id: 'sfnt2', label: 'Sfc Front', data: { type: 'param2', value: 'sfnt' }},
					{ id: 'tadv_sf2', label: '850 Temp Adv', data: { type: 'param2', value: 'tadv_sf' }},
					{ id: '7tad_sf2', label: '700 Temp Adv', data: { type: 'param2', value: '7tad_sf' }},
					{ id: '9fnt2', label: '925 Front', data: { type: 'param2', value: '9fnt' }},
					{ id: '8fnt_sf2', label: '850 Front', data: { type: 'param2', value: '8fnt_sf' }},
					{ id: '7fnt_sf2', label: '700 Front', data: { type: 'param2', value: '7fnt_sf' }},
					{ id: '98ft2', label: '925-850 Front', data: { type: 'param2', value: '98ft' }},
					{ id: '857f_sf2', label: '850-700 Front', data: { type: 'param2', value: '857f_sf' }},
					{ id: '75ft_sf2', label: '700-500 Front', data: { type: 'param2', value: '75ft_sf' }},
					{ id: 'vadv_sf2', label: '700-400 Diff VA', data: { type: 'param2', value: 'vadv_sf' }},
					{ id: 'padv_sf2', label: '400-250 Pot VA', data: { type: 'param2', value: 'padv_sf' }},
					{ id: 'ddiv_sf2', label: '850-250 Diff Div', data: { type: 'param2', value: 'ddiv_sf' }},
					{ id: 'ageo_sf2', label: '300 Jet Circ', data: { type: 'param2', value: 'ageo_sf' }},
					{ id: '500mb_chg_sf2', label: '12HR 500 Height', data: { type: 'param2', value: '500mb_chg_sf' }}
				] },
				{ id: 'kinematics2', label: 'Kinematics', children: [
					{ id: 'icon_sf2', label: 'Inst Contr Rate', data: { type: 'param2', value: 'icon_sf' }},
					{ id: 'trap_sf2', label: 'Sfc Fluid Trap', data: { type: 'param2', value: 'trap_sf' }},
					{ id: 'vtm_sf2', label: 'VTM', data: { type: 'param2', value: 'vtm_sf' }},
					{ id: 'dvvr_sf2', label: 'Div/Vort', data: { type: 'param2', value: 'dvvr_sf' }},
					{ id: 'def_sf2', label: 'Def/Axes Dil', data: { type: 'param2', value: 'def_sf' }},
					{ id: 'trap_500_sf2', label: '500 Fluid Trap', data: { type: 'param2', value: 'trap_500_sf' }},
					{ id: 'trap_250_sf2', label: '250 Fluid Trap', data: { type: 'param2', value: 'trap_250_sf' }}
				] },
				{ id: 'thermodynamics2', label: 'Thermodynamics', children: [
					{ id: 'sbcp2', label: 'SBCAPE', data: { type: 'param2', value: 'sbcp' }},
					{ id: 'mlcp2', label: 'MLCAPE', data: { type: 'param2', value: 'mlcp' }},
					{ id: 'mucp2', label: 'MUCAPE', data: { type: 'param2', value: 'mucp' }},
					{ id: 'ncap2', label: 'Normalized CAPE', data: { type: 'param2', value: 'ncap' }},
					{ id: 'dcape2', label: 'Downdraft CAPE', data: { type: 'param2', value: 'dcape' }},
					{ id: 'muli_sf2', label: 'SB LIs', data: { type: 'param2', value: 'muli_sf' }},
					{ id: 'kidx2', label: 'K Index', data: { type: 'param2', value: 'kidx' }},
					{ id: 'laps_sf2', label: 'Lapse Rates', data: { type: 'param2', value: 'laps_sf' }},
					{ id: 'lllr_sf2', label: 'Low-level Lapse Rates', data: { type: 'param2', value: 'lllr_sf' }},
					{ id: 'lclh_sf2', label: 'LCL', data: { type: 'param2', value: 'lclh_sf' }},
					{ id: 'lfch_sf2', label: 'LFC', data: { type: 'param2', value: 'lfch_sf' }},
					{ id: 'lfrh_sf2', label: 'LCL-LFC RH', data: { type: 'param2', value: 'lfrh_sf' }},
					{ id: 'sbcp_chg_sf2', label: '3HR SBCAPE', data: { type: 'param2', value: 'sbcp_chg_sf' }},
					{ id: 'sbcn_chg2', label: '3HR SBCIN', data: { type: 'param2', value: 'sbcn_chg' }},
					{ id: 'mlcp_chg_sf2', label: '3HR MLCAPE', data: { type: 'param2', value: 'mlcp_chg_sf' }},
					{ id: 'mucp_chg_sf2', label: '3HR MUCAPE', data: { type: 'param2', value: 'mucp_chg_sf' }},
					{ id: 'lllr_chg_sf2', label: '3HR LLLR', data: { type: 'param2', value: 'lllr_chg_sf' }},
					{ id: 'laps_chg_sf2', label: '6HR LR', data: { type: 'param2', value: 'laps_chg_sf' }}
				] },
				{ id: 'windshear2', label: 'Wind Shear', children: [
					{ id: 'eshr2', label: 'Eff Shear', data: { type: 'param2', value: 'eshr' }},
					{ id: 'shr62', label: '0-6 Shear', data: { type: 'param2', value: 'shr6' }},
					{ id: 'shr82', label: '0-8 Shear', data: { type: 'param2', value: 'shr8' }},
					{ id: 'shr12', label: '0-1 Shear', data: { type: 'param2', value: 'shr1' }},
					{ id: 'brns2', label: 'BRN Shear', data: { type: 'param2', value: 'brns' }},
					{ id: 'effh_sf2', label: 'Eff SRH', data: { type: 'param2', value: 'effh_sf' }},
					{ id: 'srh32', label: '0-3 SRH', data: { type: 'param2', value: 'srh3' }},
					{ id: 'srh12', label: '0-1 SRH', data: { type: 'param2', value: 'srh1' }},
					{ id: 'llsr2', label: '0-2 SR Wind', data: { type: 'param2', value: 'llsr' }},
					{ id: 'mlsr2', label: '4-6 SR Wind', data: { type: 'param2', value: 'mlsr' }},
					{ id: 'ulsr2', label: '9-11 SR Wind', data: { type: 'param2', value: 'ulsr' }},
					{ id: 'alsr2', label: 'Anvil SR Wind', data: { type: 'param2', value: 'alsr' }},
					{ id: 'mnwd2', label: '850-300 Mean Wind', data: { type: 'param2', value: 'mnwd' }},
					{ id: 'xover2', label: '850/500 Crossover', data: { type: 'param2', value: 'xover' }},
					{ id: 'srh3_chg2', label: '3HR 0-3 SRH', data: { type: 'param2', value: 'srh3_chg' }},
					{ id: 'shr1_chg2', label: '3HR 0-1 SRH', data: { type: 'param2', value: 'shr1_chg' }},
					{ id: 'shr6_chg2', label: '3HR 0-6 Shear', data: { type: 'param2', value: 'shr6_chg' }}
				] },
				{ id: 'compositeindices2', label: 'Composite Indices', children: [
					{ id: 'scp2', label: 'Supercell Comp', data: { type: 'param2', value: 'scp' }},
					{ id: 'lscp2', label: 'Supercell Comp (LM)', data: { type: 'param2', value: 'lscp' }},
					{ id: 'stor_sf2', label: 'Fixed Sig Tor', data: { type: 'param2', value: 'stor_sf' }},
					{ id: 'stpc_sf2', label: 'Eff Sig Tor', data: { type: 'param2', value: 'stpc_sf' }},
					{ id: 'sigt12', label: 'Cond Sig Tor 1', data: { type: 'param2', value: 'sigt1' }},
					{ id: 'sigt22', label: 'Cond Sig Tor 2', data: { type: 'param2', value: 'sigt2' }},
					{ id: 'nstp2', label: 'Non-Supercell Tor', data: { type: 'param2', value: 'nstp' }},
					{ id: 'sigh2', label: 'Sig Hail', data: { type: 'param2', value: 'sigh' }},
					{ id: 'sars12', label: 'SARS Hail Size', data: { type: 'param2', value: 'sars1' }},
					{ id: 'sars22', label: 'SARS Sig Hail %', data: { type: 'param2', value: 'sars2' }},
					{ id: 'dcp2', label: 'Derecho Comp', data: { type: 'param2', value: 'dcp' }},
					{ id: 'cbsig2', label: 'Craven/Brooks', data: { type: 'param2', value: 'cbsig' }},
					{ id: 'brn_sf2', label: 'BRN', data: { type: 'param2', value: 'brn_sf' }},
					{ id: 'mcsm2', label: 'MCS Maint', data: { type: 'param2', value: 'mcsm' }},
					{ id: 'mbcp2', label: 'Microburst Comp', data: { type: 'param2', value: 'mbcp' }},
					{ id: 'ehi12', label: '0-1 EHI', data: { type: 'param2', value: 'ehi1' }},
					{ id: 'ehi32', label: '0-3 EHI', data: { type: 'param2', value: 'ehi3' }},
					{ id: 'vgp32', label: '0-3 VGP', data: { type: 'param2', value: 'vgp3' }}
				] },
				{ id: 'multiparameterfields2', label: 'Multi-Parameter Fields', children: [
					{ id: 'cpsh_sf2', label: 'MUCAPE/Eff Shear', data: { type: 'param2', value: 'cpsh_sf' }},
					{ id: 'comp_sf2', label: 'MULI/Crossover', data: { type: 'param2', value: 'comp_sf' }},
					{ id: 'lcls_sf2', label: 'LCL/0-1 SRH', data: { type: 'param2', value: 'lcls_sf' }},
					{ id: 'lr3c_sf2', label: 'LLLR/0-3 MLCAPE', data: { type: 'param2', value: 'lr3c_sf' }},
					{ id: '3cvr2', label: 'Vort/0-3 MLCAPE', data: { type: 'param2', value: '3cvr' }},
					{ id: 'tdlr_sf2', label: 'Dewpoint/Mid Lapse', data: { type: 'param2', value: 'tdlr_sf' }},
					{ id: 'hail2', label: 'Hail Parameters', data: { type: 'param2', value: 'hail' }},
					{ id: 'qlcs1_sf2', label: 'QLCS 1', data: { type: 'param2', value: 'qlcs1_sf' }},
					{ id: 'qlcs2_sf2', label: 'QLCS 2', data: { type: 'param2', value: 'qlcs2_sf' }}
				] },
				{ id: 'heavyrain2', label: 'Heavy Rain', children: [
					{ id: 'pwtr_sf2', label: 'Precipitable Water', data: { type: 'param2', value: 'pwtr_sf' }},
					{ id: 'tran_sf2', label: '850 Moist Trans', data: { type: 'param2', value: 'tran_sf' }},
					{ id: 'prop_sf2', label: 'Upwind Prop Vector', data: { type: 'param2', value: 'prop_sf' }},
					{ id: 'peff_sf2', label: 'Precip Pot Place', data: { type: 'param2', value: 'peff_sf' }},
				] },
				{ id: 'winterweather2', label: 'Winter Weather', children: [
					{ id: 'ptyp2', label: 'Precip Type', data: { type: 'param2', value: 'ptyp' }},
					{ id: 'fztp2', label: 'Near-Freeze Sfc T', data: { type: 'param2', value: 'fztp' }},
					{ id: 'swbt2', label: 'Sfc Wet-Bulb T', data: { type: 'param2', value: 'swbt' }},
					{ id: 'fzlv_sf2', label: 'Freezing Level', data: { type: 'param2', value: 'fzlv_sf' }},
					{ id: 'thck2', label: 'Critical Thickness', data: { type: 'param2', value: 'thck' }},
					{ id: 'epvl_sf2', label: '800-750 EPVg', data: { type: 'param2', value: 'epvl_sf' }},
					{ id: 'epvm_sf2', label: '650-500 EPVg', data: { type: 'param2', value: 'epvm_sf' }},
					{ id: 'les1_sf2', label: 'Lake Effect Snow 1', data: { type: 'param2', value: 'les1_sf' }},
					{ id: 'les2_sf2', label: 'Lake Effect Snow 2', data: { type: 'param2', value: 'les2_sf' }},
					{ id: 'snsq2', label: 'Snow Squall', data: { type: 'param2', value: 'snsq' }}
				] },
				{ id: 'fireweather2', label: 'Fire Weather', children: [
					{ id: 'sfir2', label: 'RH/T/Wind', data: { type: 'param2', value: 'sfir' }},
					{ id: 'fosb2', label: 'Fosberg', data: { type: 'param2', value: 'fosb' }},
					{ id: 'lhan2', label: 'Low Haines', data: { type: 'param2', value: 'lhan' }},
					{ id: 'mhan2', label: 'Mid Haines', data: { type: 'param2', value: 'mhan' }},
					{ id: 'hhan2', label: 'High Haines', data: { type: 'param2', value: 'hhan' }},
					{ id: 'lasi_sf2', label: 'Low At Sev', data: { type: 'param2', value: 'lasi_sf' }}
				] }
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
		imgradar.style.display = 'none';
		imghiways.style.display = 'none';
		imgdiv.appendChild(imgbg);
		imgdiv.appendChild(img);
		imgdiv.appendChild(img2);
		imgdiv.appendChild(imgradar);
		imgdiv.appendChild(imghiways);
		params.id = 'spcmeso-params';
		div.appendChild(params);
		div.appendChild(imgdiv);
		position.id = 'spcmeso-position';
		div.appendChild(position);
		document.body.appendChild(div);
		_loadImages();
	};

	var _loadImages = function() {
		_setGpsLocation();
		var now = new Date().getTime();
		var bgurl = _baseUrl.replace('{{sector}}', _state.sector).replace('{{parama}}', 'cnty').replace('{{paramb}}', 'cnty');
		if (imgbg.src.indexOf(bgurl) === -1) {
			imgbg.src = bgurl;
		}

		if (_hiwaysPresent) {
			if (imghiways.src.indexOf('s' + _state.sector) === -1) {
				imghiways.src = _baseUrl.replace('{{sector}}', _state.sector).replace('{{parama}}', 'hiway').replace('{{paramb}}', 'hiway');
			}
		}

		if (_state.param1) {
			var param1a = _state.param1.replace('_sf', '');
			params.innerText = 'Parameters: ' + _state.p1label;
			var url = _baseUrl.replace('{{sector}}', _state.sector).replace('{{parama}}', param1a).replace('{{paramb}}', _state.param1);
			if (img.src.indexOf(url) === -1) {
				img.src = url + now;
			}
		}

		if (_state.param2) {
			if (_state.param1) {
				params.innerText += ', ' + _state.p2label;
			} else {
				params.innerText = 'Parameters: ' + _state.p2label;
			}
			var param2a = _state.param2.replace('_sf', '');
			img2.style.display = (_state.param2 === 'none') ? 'none' : 'block';
			url = _baseUrl.replace('{{sector}}', _state.sector).replace('{{parama}}', param2a).replace('{{paramb}}', _state.param2);
			if (img2.src.indexOf(url) === -1) {
				img2.src = url + now;
			}
		}

		if (_state.isPreset) {
			params.innerText = 'Parameters: ' + _state.p1label;
		}
	}

	function _setGpsLocation() {
		if (!dusty.location || !dusty.location.lat || !dusty.location.lon) { return; }
		setMap(_state.sector);
		var xy = lalo_xy(dusty.location.lat, dusty.location.lon);
		var xsys = xy_pix(xy[0], xy[1]);
		xsys = scalePosition(1000, xsys);
		var radius = 4;
		position.style.top = xsys[1] - radius + 'px';
		position.style.left = xsys[0] - radius + 'px';
		position.style.display = 'block';
	}

	// Borrowed some math from SPC's carto.js
	var cart = {};
	var rad = 0.01745;
	var pi = 3.1416;
	var RRR = 6371;

	function scalePosition(imgWidth, xsys) {
		var ratio = imgWidth / 1000;	// Assume a scale that preserves ratio	
		return [xsys[0] * ratio, xsys[1] * ratio];
	}

	function initmap(clat, clon, slat1, slat2, slon, zoom, hgt, wid, meshsize) {
		var xyvals = new Array();
		cart['reflat1'] = slat1;
		cart['reflat2'] = slat2;
		cart['reflon'] = slon;
		var term1 = Math.log(Math.cos(d2r(cart['reflat1'])) / Math.cos(d2r(cart['reflat2'])));
		var term2 = Math.log(Math.tan(d2r(45.0 - (cart['reflat1']/2.0))) / Math.tan(d2r(45.0 - (cart['reflat2']/2.0))));
		cart['coneconst'] = (term2 == 0) ? 1 : term1/term2;
		cart['clat'] = clat;
		cart['clon'] = clon;
		cart['gridsize'] = meshsize;
		cart['xshift'] = 0;
		cart['yshift'] = 0;
		cart['scrnwid'] = wid;
		cart['scrnlen'] = hgt;
		cart['xscle'] = zoom;
		cart['yscle'] = zoom;
		xyvals = lalo_xy(clat, clon);
		cart['xxl'] = xyvals[0];
		cart['yyl'] = xyvals[1];
	}

	function lalo_xy(lat, lon) {
		var theta = d2r(lon - cart['reflon']) * cart['coneconst'];
		var term1 = RRR * Math.cos(d2r(cart['reflat1']));
		var term2 = Math.pow(Math.tan(d2r(45.0 - cart['reflat1']/2.0)), cart['coneconst']);
		var psi = term1 / (cart['coneconst'] * term2);
		var rho1 = psi * term2;
		var rho = psi * Math.pow((Math.tan(d2r(45.0 - lat / 2.0))), cart['coneconst']);
		var x = (1 / cart['gridsize']) * rho * Math.sin(theta);
		var y = (1 / cart['gridsize']) * (rho1 - rho * Math.cos(theta));
		return Array(x, y);
	}

	function xy_pix(x, y) {
		var xs = ((((x - cart['xxl']) * cart['xscle'])) + (cart['scrnwid'] / 2)) + cart['xshift'];
		var ys = ((((y - cart['yyl']) * cart['yscle'])) - (cart['scrnlen'] / 2)) - cart['yshift'];
		return Array(xs, -ys);
	}

	function d2r(val) {
		return val * rad;
	}

	function r2d(val) {
		return val / rad;
	}

	function setMap(sectornum) {
		if (sectornum == 11) { initmap(44.60, -114.05, 20, 60, -100, 21.4, 750, 1000, 40); }
		if (sectornum == 12) { initmap(35.70, -112.75, 20, 60, -100, 19.8, 750, 1000, 40); }
		if (sectornum == 13) { initmap(44.95, -96.95, 20, 60, -100, 23.9, 750, 1000, 40); }
		if (sectornum == 14) { initmap(37.95, -97.35, 20, 60, -100, 24.2, 750, 1000, 40); }
		if (sectornum == 15) { initmap(31.91, -97.05, 20, 60, -100, 20.5, 750, 1000, 40); }
		if (sectornum == 16) { initmap(43.60, -79.8, 20, 60, -100, 20.5, 750, 1000, 40); }
		if (sectornum == 17) { initmap(36.85, -82.35, 20, 60, -100, 23.7, 750, 1000, 40); }
		if (sectornum == 18) { initmap(30.1, -86.25, 20, 60, -100, 20.5, 750, 1000, 40); }
		if (sectornum == 19) { initmap(38.15, -96.80, 20, 60, -100, 8.9, 750, 1000, 40); }
		if (sectornum == 20) { initmap(39.2, -91.75, 20, 60, -100, 23.15, 750, 1000, 40); }
	}

	var _spcmesoTimer = setInterval(function() {
		_loadImages();
		_setGpsLocation();
		if (_radarPresent) {
			imgradar.src = _baseUrl.replace('{{parama}}', 'rgnlrad').replace('{{paramb}}', 'rgnlrad').replace('{{sector}}', _state.sector) + (new Date().getTime());
		}
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