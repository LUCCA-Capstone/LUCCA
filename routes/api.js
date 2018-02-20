var express = require('express');
var db = require('../database/controllers/dbm');
var config = require('../local_modules/config')
var cache = require('../lib/cache');
var router = express.Router();

var timer = config.get('General', 'badge_override_interval')

router.post('/user-access', function(req, res) {
	if(!req.body || req.body.length === 0 || req.body.length > 200) {
		// body sanity check
		res.set({
				'Content-Type': 'text/plain',
				'Station-State': 'Disabled'
		});
		res.sendStatus(403);
	};

	if(!req.headers.badge || !req.headers.sid || !req.headers['station-state']) {
		// check the necessary headers are provided for future processing
		res.sendStatus(403);
	};

	// TODO check if user is already logged in to another machine
	// the piece can be extracted because if the user is on another
	// machine then there is no need to perform all the checks
	// this will *might* require a module that contains all users
	// currently loogged into a machine.
	
	var headerObj = req.headers;

	db.getStation(headerObj.sid).then(function(station) {
		//check if machine is in database
		!station ? res.sendStatus(403) : console.log(station);
		db.validateUser(headerObj.badge).then(function(user) {
			//check if user accesing machine exist
		 	!user ? res.sendStatus(403) : console.log(user);
			if (user.dataValues.status === 'Admin') {
				!user.dataValues.status ? res.sendStatus(503) : console.log(user.dataValues.status)
				// check cache to see if there is a user on the machine
				var userWaiting = cache.getMachine(headerObj.sid, timer);
				if (userWaiting === null && headerObj['station-state'] === 'disabled') {
					//there is no user in cache and the machine is 'disabled'
					//put the admin on the machine	
					// call station module HERE //to update station with current user and change to enabled
					res.set({
						'Content-Type': 'text/plain',
						'Station-State': 'enabled',
						'badge':  headerObj.badge
					});
					res.sendStatus(200);
				} else if (headerObj['station-state'] === 'enabled') {
					//assumption is the admin is logging of from the machine
					res.set({
						'Content-Type': 'text/plain',
						'Station-State': 'disabled'
					});
					res.sendStatus(200);
				} else {
					// grant privilages to the user	
					db.grantPrivileges(userWaiting, headerObj.sid).then(function(result) {
						cache.delete(headerObj.sid);
						//call station module HERE //to update station with current user and change to enabled
						res.set("Connection", "close");
						!result ? res.sendStatus(403) : res.set({
																							'Content-Type': 'text/plain',
																							'Station-state': 'enabled', 
																							'badge': userWaiting
																						});
						// remove user from module
						res.sendStatus(200);
					});
				};
			} else if (user.dataValues.status === 'User' || user.dataValues.status === 'Manager') {
				// handle user
				// Assumption is the user is logging off the machine
				//this needs to check if a user is on the machine
				if (headerObj['station-state'] === 'enabled') {
					// call station module HERE //to update station disabled and remove user
					res.set({
						'Content-Type': 'text/plain',
						'Station-State': 'disabled'
					});
					res.sendStatus(200);
				} else {
					db.getPrivileges(headerObj.badge).then(function(obj) {
						if (obj) {
							for (let element of obj) {
								if (element.sId === headerObj.sid) {
									res.set({
										'Content-Type': 'text/plain',
										'Station-State': 'enabled',
										'badge': headerObj.badge
									});
									return res.sendStatus(200);
									// call station module HERE //to update station with current user and change to enabled
								}; 	
							};
							// user does not have access to this machine put them in cache
							let check = cache.save(headerObj.sid, headerObj.badge);
							res.sendStatus(200);
						} else {
							// user does not have access to any machines put them in cache
							let check = cache.save(headerObj.sid, headerObj.badge);
							res.sendStatus(200);
						}
					});
				};
			} else {
				// Unusable data is returned from database
				res.sendStatus(503);
			};
		});
	});
});

router.post('/station-heartbeat', function(req, res) {
  var headerObj = req.headers;
  if('station-id' in headerObj) {
    var stationId = headerObj['station-id'];
    var cert = req.socket.getPeerCertificate();
    db.getStation(stationId).then(function(station) {
      if(station) { // There is a matching station-id in the database
        if (!station.registered) {
          if (station.certCN != cert.subject.CN) { // existing unregistered station with mismatched cert name
            db.modifyStation(stationId, {certCN: cert.subject.CN}).then(function(response) {
              db.logEvent('station management', "Heartbeat for unregistered station with ID '" + stationId + "' provided a new station CN. Changing to '" + cert.subject.CN + "'");
            });
          } // else nothing to change, the station simply isn't registered yet
          res.status(403).send('Forbidden');
        } else { // heartbeat is from an existing registered station
          if (station.certCN != cert.subject.CN) { // existing registered cert with mismatched cert
            db.logEvent('station management', "Heartbeat for station with ID '" + stationId + "' had mismatched CN on client certificate (expected '" + station.certCN + "', received '" + cert.subject.CN + "')").then(function(response) {
              res.status(403).send('Forbidden');
            });
          } else { // heartbeat is from existing registered station and cert matches
            res.set({
              'Content-Type': 'text/plain',
              'Date': new Date().toString()
            });
            res.sendStatus(200);
          }
        }
      } else { // This heartbeat is from a new station we haven't seen before
        var newStation = {
          sId: stationId,
          name: 'none',
          description: 'none',
          registered: false,
          certCN: cert.subject.CN
        };
        db.createStation(newStation).then(function(result) {
          if(result) {
            db.logEvent('station management', "Unrecognized heartbeat created a new unregistered station with ID '" + stationId + "', certificate CN '" + cert.subject.CN + "'").then(function(logResult) {
              res.set({
                'Content-Type': 'text/plain',
                'Date': new Date().toString()
              });
              res.sendStatus(403);
            });
          }
        });
      }
    }).catch((error) => {
      //Internal error in database
      console.log();
      res.sendStatus(500, error);
    });
  } else {
    res.sendStatus(401);
  }
})
module.exports = router;
