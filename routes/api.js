var express = require('express');
var router = express.Router();


// log request
router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next(); 
});

//TODO: Check if a user is permitted to use station 
router.route('/user-access')
.post(function(err, req, res, next) {
    var stationState = 'Enabled';
    if(!req.body || req.body.length === 0 || req.body.length > 200) {
        console.error(err.stack);
        res.set({
            'Content-Typer': 'text/plain',
            'Station-State': stationState = 'Disabled'
        });
        res.status(400).send('Bad Request');
    } else {
        res.set({
            'Content-Type': 'text/plain',
            'User-Id-String': req.body.id,
            'Station-State': stationState
        });
        res.status(200).send('OK');
    }        
});

router.route('/local-reset')
.post(function(req, res) {
    //TODO: Is this going to be logged in the database?
    // is there anything else necessary here?
    console.log(req.body, 'This is a reset');
});

router.route('/last-state')
.get(function(req, res) { 
    //TODO Figure out what goes here ?
    // does this check the database to see 
    // the last state of the station was?
});

router.route('station-heartbeat')
.post(function(err, req, res, next) {
    // What is the proper way to verify station-IDs?

    // This is based on status 200 'OK'
    res.set({
        'Date': new Date().toString();
    });
    res.status(200).send('OK');    
});












