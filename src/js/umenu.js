// TODO passback parentid instead of requiring type?
function umenu(base, menu, callback, options) {
	// If no menu or callback is passed, remove any current menus
	if (!menu && !callback) {
		try {
			base.removeChild(document.getElementById('uback'));
			base.removeChild(document.getElementById('ubox'));
			base.removeChild(document.getElementById('uclose'));
			base.removeChild(document.getElementById('utitle'));
			// TODO iterate through nodelist
		}
		catch(e) {}
		base.style.display = 'none';
		return;
	}

	function refreshButtons(criteria) {
		back.style.display = (!criteria) ? 'none' : 'flex';
		menuButtons.forEach(function(x) {
			x.style.display = (x.p === criteria) ? 'flex' : 'none';
		});
	}
	
	function createItem(item, parentId) {
		var el = document.createElement('div');
		el.id = item.id;
		el.className = (item.selected) ? 'ubtn usel' : 'ubtn';
		el.innerText = item.label || item.id;
		el.p = parentId;
		el.i = item;
		box.appendChild(el);
		// Use recursion to call this function for all children
		if (item.children) {
			item.children.forEach(function(x) { createItem(x, item.id); });
		}
	}
	
	base.style.display = 'block';
	var back = document.createElement('div');
	back.id = 'uback';
	back.className = 'ubtn';
	back.innerText = '<- Back';
	// TODO test for multi levels
	back.onclick = function() {
		title.innerText = '';
		refreshButtons(crumbs.pop());
	};
	var box = document.createElement('div');
	box.id = 'ubox';
	var close = document.createElement('div');
	close.id = 'uclose';
	close.className = 'ubtn';
	close.innerText = 'X Close';
	close.style.display = 'flex';
	close.onclick = function() { umenu(base); }
	var title = document.createElement('div');
	title.id = 'utitle';
	base.appendChild(title);
	base.appendChild(back);
	base.appendChild(close);
	base.appendChild(box);

	// Start the recursive function with the items at the top of the hierarchy
	for (var prop in menu) {
		createItem(menu[prop]);
	}
	
	var menuButtons = Array.prototype.slice.call(document.querySelectorAll('#ubox div'));
	var crumbs = [];
	
	// After all the buttons have been created, show the top level of buttons (they won't have parents), and add click event
	menuButtons.forEach(function(x) {
		if (!x.p) { x.style.display = 'flex'; }
		x.onclick = function() {
			if (this.i.children) {
				title.innerText = '-' + this.id + '-';
				crumbs.push(this.p);
				refreshButtons(this.id);
			}
			else {
				if (this.i.multi) {
					if (this.className.indexOf('usel') > -1) {
						this.className = 'ubtn';
						this.i.info.removed = true;
					} else {
						this.className = 'ubtn usel';
						this.i.info.removed = false;
					}
				} else {
					umenu(base);
				}
				callback(this.i.info);
			}
		};
	});
}