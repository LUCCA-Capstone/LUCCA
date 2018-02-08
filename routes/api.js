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
	if('sid' in headerObj){
		var stationID = headerObj['sid'];
		db.getStation(stationID).then(function(station) {
			if(station) {
				res.set({
					'Content-Type': 'text/plain',
					'Date': new Date().toString()
				});
				res.sendStatus(200).end();
			} else {
				var newStation = {
					sId: stationID,
					name: 'none',
					description: 'none',
					registered: false
				};
				db.createStation(newStation).then(function(result) {
					if(result){
						res.set({
							'Content-Type': 'text/plain',
							'Date': new Date().toString()
						});
						res.sendStatus(200).end()
					} else {
						//Internal Error in datbase
						res.send('Database error', error);
					}		
				}).catch(function(error) {
					//Internal Error in database
					res.send('Database error', error);
				});
			}
		}).catch(function(error) {
			//Internal Error in database
			res.send('Database error', error);
		});
	} else {
		// There was no sid attached to http header
		res.sendStatus(403);
	}; 
});
module.exports = router;