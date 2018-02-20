var express = require('express');
var db = require('../database/controllers/dbm');
var stationLog = require('../lib/station-log');
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
        res.status(403).send('Forbidden');
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
});

//Usage:  Check if station is registered or not.
//Arguments:
//         station-id - Station Id which will be passed in the header of the request
//Exceptions: 403 Forbidden
//Description:  This function will set a cached/un-cached stations
// status to disabled and then return 200 ok if all checks pass.
router.post('/local-reset', function(req, res){
	var cert = req.socket.getPeerCertificate();
  var hObject = req.headers;
  var sid = hObject['station-id'];

	if(sid && cert.subject){
    db.getStation(sid).then(results => {
      if(results){
        if(results['registered'] && cert.subject.CN === results['certCN']){
          if(stationLog.updateMachine(sid, 'disabled')){
           db.logEvent('station-reset', 'Station: ' + sid + ' reset button activated').then(function(){
             res.sendStatus(200);
           });
          }else{
            db.logEvent('station-reset', 'Station: ' + sid + ' cache error').then(function(){
              res.sendStatus(500);
            });
          }
        }else{
          db.logEvent('station-reset', 'Unregistered Station or invalid Cert').then(function() {
            res.sendStatus(403);
          });
        }
      }else{
        db.logEvent('station-reset', 'Station: ' + sid + ' not found').then(function() {
        res.sendStatus(403);
        });
      }
    }).catch(err => {
      db.logEvent('station-reset error', err).then(function() {
      res.sendStatus(500);
      });
    });
  }else{
    res.sendStatus(400);
  }
});

//Usage:  Check stations current state.
//Arguments:
//         station-id - The id for the station which will be passed in the header of the request
//Exceptions: 403 Forbidden
//Description:  This function will look to see what status a station is
// suppose to be in.  It will then return to the station whether it is suppose
// to be disabled or enabled.  A response of 200 ok will be returned if all checks
// are passed or a response of 403 Forbidden will be returned if any check fails.
router.get('/last-state', function(req, res){
  var cert = req.socket.getPeerCertificate();
  var hObject = req.headers;
  var sid = hObject['station-id'];

  if(sid && cert.subject){
    db.getStation(sid).then(results => {
      if(results){
        if(results['registered'] && cert.subject.CN === results['certCN']){
          //Store station object
          let obj = stationLog.getMachine(sid);

          //If station was in shared cache return
          //whether the station was enabled or disabled.
          if(obj){
            console.log(obj);
            if(obj.status === 'enabled'){
              db.logEvent('station-status request', 'Station: ' + sid + ' enabled and in use by: ' + obj.user).then(function(){
                res.set({
                  'Content-Type': 'text/plain',
                  'station-state': 'enabled',
                  'user-id-string': obj.user
                });
                console.log('obj found + enabled');
                res.sendStatus(200);
              });
            }else{
              db.logEvent('station-status request', 'Station: ' + sid + ' disabled.').then(function(){
                res.set({
                  'Content-Type': 'text/plain',
                  'station-state': 'disabled',
                });
                console.log('obj found + disabled');
                res.sendStatus(200);
              });
            }
          //If station was not found add it to the stations
          //shared cache and return status.
          }else{
            if(stationLog.addMachine(sid)){
              db.logEvent('station-status request', 'Station: ' + sid + ' disabled and added to the cache.').then(function(){
                res.set({
                  'Content-Type': 'text/plain',
                  'station-state': 'disabled',
                });
                console.log('Did we add something to the cache?');
                res.sendStatus(200);
              });
            }else{
              db.logEvent('station-status request', 'Station: ' + sid + ' has an unknown state and is unable to be add to cache').then(function(){
                res.sendStatus(500);
              });
            }
          }
        }else{
          db.logEvent('station-status request', 'Station: ' + sid + ' not registered').then(function(){
            console.log('Not Reg');
            res.sendStatus(403);
          });
        }
      }else{
        db.logEvent('station-status request', 'Station: ' + sid + ' cannot be found.').then(function(){
          console.log('Empty Results');
          res.sendStatus(403);
        });
      }
    }).catch(err => {
      db.logEvent('station-status request', err).then(function(){
      console.log(err);
      res.sendStatus(500);
      });
    });
  }else{
    console.log('No sid or Cert');
    res.sendStatus(400);
  }
});

module.exports = router;
