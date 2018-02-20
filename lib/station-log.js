"use strict";

//Private object
var _stationObj = Object.create(null);

module.exports = {

	addMachine: (machine) => {
		if(!machine || _stationObj[machine]) {
			return null;
		};
		var station = {
			user: null,
			status: 'disabled'
		};
		_stationObj[machine] = station;
		return _stationObj[machine];
	},

	updateMachine: (machine, setState) => {
		if(machine){
			if(_stationObj[machine]){
				_stationObj[machine].user = null;
				_stationObj[machine].status = setState;
			}else{
				module.exports.addMachine(machine);
			}
			return true;
		}
		return false;
	},

	
	getMachine: (machine) => {
		if (typeof _stationObj[machine] != 'undefined') {
			return _stationObj[machine];
		};
		return null
	},


	addUser: (userToAdd, machine) => {
		if(typeof _stationObj[machine] != 'undefined' && userToAdd) {
			_stationObj[machine].user = userToAdd;
			_stationObj[machine].status = 'enabled'
			return _stationObj[machine];
		};	
		return false;
	},
	
	
	removeUser: (userToRemove, machine) => {
		if(typeof _stationObj[machine] != 'undefined' && userToRemove) {
			if(_stationObj[machine].user === userToRemove) {
				_stationObj[machine].user = null;
				_stationObj[machine].status = 'disabled';
				return _stationObj[machine];
			} else {
					return null;
			}
		};
		return null
	},

};