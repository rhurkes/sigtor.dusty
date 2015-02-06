// TODO passback parentid instead of requiring type?
// TODO maintain crumbs for title?
// TODO is large menu like SPC too much, do we need to render one menu at a time on demand?
function umenu(base, menu, callback, options) {
	var d = 'flex';
	var n = 'none';
	function cd() {
		return document.createElement('div');
	}

	// If no menu or callback is passed, remove any current menus
	if (!menu && !callback) {
		try {
			while (base.firstChild) {
    			base.removeChild(base.firstChild);
			}
		}
		catch(e) {}
		base.style.display = n;
		return;
	}

	function refreshButtons(criteria) {
		back.style.display = (!criteria) ? n : d;
		menuButtons.forEach(function(x) {
			x.style.display = (x.p === criteria) ? d : n;
		});
	}
	
	function createItem(item, parentId) {
		var el = cd();
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
	var back = cd();
	back.id = 'uback';
	back.className = 'ubtn';
	back.innerText = '<- Back';
	// TODO test for multi levels
	back.onclick = function() {
		title.innerText = '';
		refreshButtons(crumbs.pop());
	};
	var box = cd();
	box.id = 'ubox';
	var close = cd();
	close.id = 'uclose';
	close.className = 'ubtn';
	close.innerText = 'X Close';
	close.style.display = d;
	close.onclick = function() { umenu(base); }
	var title = cd();
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
		if (!x.p) { x.style.display = d; }
		x.onclick = function() {
			if (this.i.children) {
				title.innerText = this.i.label || this.id;
				crumbs.push(this.p);
				refreshButtons(this.id);
			}
			else {
				if (this.i.multi) {
					if (this.className.indexOf('usel') > -1) {
						this.className = 'ubtn';
						this.i.data.removed = true;
					} else {
						this.className = 'ubtn usel';
						this.i.data.removed = false;
					}
				} else {
					umenu(base);
				}
				callback(this.i);
			}
		};
	});
}