var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');

router.post('/api/user-access', function(req, res) {
    var stationState = 'Enabled';
    
    if(!req.body || req.body.length === 0 || req.body > 200) {
        stationState = 'Disabled';
        res.set({
            'Content-Type': 'text/plain',
            'Station-State': stationState,
            'Status': res.status(400)
          });
    }
    
    else if(stationState.includes('Enabled')) {
        res.set({
            'Content-Type': 'text/plain',
            'User-ID-String': req.body.id,
            'Station-State': stationState,
            'Status': res.status(200)
          });
    }
});