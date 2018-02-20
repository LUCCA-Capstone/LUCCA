"use strict";

//Private object
var _cache = Object.create(null);

module.exports = {

	
	save: (machine, user) => {
		var record = {
			user: user,
			start: new Date()
		};
		_cache[machine] = record;
		return _cache;
	},

	
	getMachine: (machine, time) => {
		var data = _cache[machine];
		if (typeof data != 'undefined') {
			
			let currentTime = new Date()
			let dif = Math.abs(currentTime - data.start) / 1000;
			
			if(dif  <= time) {
				return data.user;
			} else {
					delete _cache[machine];
					return null;
			};
		};
		return null;
	},

	
	delete: (machine) => {
		delete _cache[machine];
	}
};