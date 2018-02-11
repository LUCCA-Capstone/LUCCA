var express = require('express');
var db = require('../database/controllers/dbm');
var router = express.Router();

// log request
router.use(function(req, res, next) {
    console.log('%s %s', req.method, req.url);
    next(); 
});

router.post('/user-access', function(req, res) {
    var stationState = 'Enabled';
    if(!req.body || req.body.length === 0 || req.body.length > 200) {
        res.set({
            'Content-Typer': 'text/plain',
            'Station-State': stationState = 'Disabled'
        });
        res.status(403).send('FORBIDDEN');
    } else {
			db.getUsers('2131415')/then(function(user) {
				console.log(user);
			})
        res.set({
            'Content-Type': 'text/plain',
            'User-Id-String': req.body.id,
            'Station-State': stationState
        });
        res.status(200).send('OK');
    }        
});

router.post('/station-heartbeat', function(req, res) {
	var headerObj = req.headers;
	if('sid' in headerObj) {
		var stationId = headerObj['sid'];
		db.getStation(stationId).then(function(station) {
			if(station) {
				res.set({
					'Content-Type': 'text/plain',
					'Date': new Date().toString()
				});
				res.sendStatus(200);
	} else {
		var newStation = {
			sId: stationId,
			name: 'none',
			description: 'none',
			registered: false
		};
		db.createStation(newStation).then(function(result) {
			if(result) {
				res.set({
					'Content-Type': 'text/plain',
					'Date': new Date().toString()
				});
				res.sendStatus(200);
			}
			}).catch((error) => {
			//Internal error in database
				res.sendStatus('Database error', error);
			});
			}
		}).catch((error) => {
			//Internal error in database
			res.sendStatus('Database error', error);
		});
	} else {
		res.sendStatus(403);
	}
})
module.exports = router;
