var express = require('express');
var db = require('../database/controllers/dbm');
var cache = require('../lib/cache');
var config = require('../local_modules/config');
var stationLog = require('../lib/station-log');
var router = express.Router();

// returns timer used for caching
var timer = config.get('General', 'badge_override_interval')

router.post('/user-access', function(req, res, next) {
  if(!req.body || req.body.length === 0 || req.body.length > 200) {
		res.set({
				'Content-Type': 'text/plain',
    });
		return res.sendStatus(400);
	};

	if(!req.headers['station-id'] || !req.headers['station-state']) {
		return res.sendStatus(400);
  };

  var headerObj = req.headers;
  var bodyObj = req.body;
  var cert = req.socket.getPeerCertificate();
  // Until a better solution is found this is used for chai testing
  if (Object.keys(cert).length === 0) {
    cert = {
      'subject': {
        'CN' : 'localhost:3001'
      }
    }
  };
  db.getStation(headerObj['station-id']).then(function(station) {
    if(!station) {
      return res.sendStatus(403);
    } 
    else if (!station.registered) {
      if (station.certCN !== cert.subject.CN) {
        db.modifyStation(headerObj['station-id'], {certCN: cert.subject.CN}).then(function(response) {
          db.logEvent('station management', "Heartbeat for unregistered station with ID '" + headerObj['station-id'] + "' provided a new station CN. Changing to '" + cert.subject.CN + "'");
        });
      }
      return res.sendStatus(403); 
    }
    else if (station.certCN !== cert.subject.CN) {
      db.logEvent('station management', "Heartbeat for station with ID '" + stationId + "' had mismatched CN on client certificate (expected '" + station.certCN + "', received '" + cert.subject.CN + "')").then(function(response) {
      });
      return res.sendStatus(403);
    } 
    var checkMachine = stationLog.getMachine(headerObj['station-id']);
    if(checkMachine === null) {
      checkMachine = stationLog.addMachine(headerObj['station-id']);
    };
    var userWaiting = cache.getMachine(headerObj['station-id'], timer);

    db.validateUser(bodyObj.badge).then(function(person) {
      if(!person) {
        return res.sendStatus(403);
      }
      else if (person.dataValues.status === 'Admin') {
        res.locals.obj = {
          'status': person.dataValues.status,
          'user': person.dataValues.last+','+person.dataValues.first, 
          'badge': person.dataValues.badge,
          'destination': null, 
          'userInCache': null,
          'access': true
        };
        if(userWaiting && headerObj['station-state'] === 'disabled'){
          res.locals.obj.destination = 'cache',
          res.locals.obj.userInCache = userWaiting;
          next();
        } else {
         res.locals.obj.destination = 'log';
         next(); 
        }
      } 
      else if (person.dataValues.status === 'Manager') {
        res.locals.obj = {
          'status': person.dataValues.status,
          'user': person.dataValues.last+','+person.dataValues.first, 
          'badge': person.dataValues.badge,
          'destination': null, 
          'userInCache': null,
          'access': false
        };
        if(userWaiting && headerObj['station-state'] === 'disabled') {
          db.getPrivileges(bodyObj.badge).then(function(privs) {
            var canLogOntoMachine = false;
            if(!privs) {
              return res.sendStatus(403);
            }
            else {
              for(let element of privs) {
                if(element.sId === headerObj['station-id']) {res.locals.obj.access = true;}
              };
              if(res.locals.obj.access) {
                res.locals.obj.destination = 'cache'
                res.locals.obj.userInCache = userWaiting
                next();
              } else {
                return res.sendStatus(403);
              };  
            };
          }).catch((error) => {
            return res.sendStatus(500, error);
          });
        } else if (userWaiting === null && headerObj['station-state'] === 'disabled') {
          db.getPrivileges(bodyObj.badge).then(function(privs) {
            var canLogOntoMachine = false;
            if(!privs) {
              res.locals.obj.destination = 'cache';
              next();
            }
            else {
              for(let element of privs) {
                if(element.sId === headerObj['station-id']) {
                  canLogOntoMachine = true;
                };
              } 
              if(canLogOntoMachine) {
                res.locals.obj.destination = 'log';
                next();
              } else {
                res.locals.obj.destination = 'cache';
                next();
              } 
            }
          }).catch((error) => {
            return res.sendStatus(500, error);
          });
        } else {
          res.locals.obj.destination = 'log';
          next();
        }
      }
      else if (person.dataValues.status === 'User') {
        res.locals.obj = {
          'status': person.dataValues.status,
          'user': person.dataValues.last+','+person.dataValues.first, 
          'badge': person.dataValues.badge,
          'destination': null,
          'access': false
        };
        db.getPrivileges(bodyObj.badge).then(function(privs) {
          var canLogOntoMachine = false;
          if(!privs) {
            res.locals.obj.destination = 'cache'
            next();
          }
          else {
            for(let element of privs) {
              if(element.sId === headerObj['station-id']) {canLogOntoMachine = true;}
            };
            if(canLogOntoMachine) {
              res.locals.obj.destination = 'log'
              next();
            } else {
              res.locals.obj.destination = 'cache'
              next();
            };  
          };
        }).catch((error) => {
          return res.sendStatus(500, error);
        });
      } else {
        return res.sendStatus(403);
      }
    }).catch((error) => {
        return res.sendStatus(500, error);
    });
  }).catch((error) => {
      return res.sendStatus(500, error);
  });
});


//handle cache
router.post('/user-access', function(req, res, next) {
  if(res.locals.obj.destination === 'cache' && res.locals.obj.access && (res.locals.obj.status === 'Admin' || res.locals.obj.status === 'Manager')){
    let anyOneOnMachine = stationLog.getMachine(req.headers['station-id']);
    let amIonMoreThanOneMachine = stationLog.getAll();
    if(anyOneOnMachine.badge !== null) {
      return res.sendStatus(403);
    }
    for(element in amIonMoreThanOneMachine) {
      if (amIonMoreThanOneMachine[element].badge === res.locals.obj.userInCache['badge']) {
        return res.sendStatus(403);
      };
    };
    db.grantPrivileges(res.locals.obj.userInCache['badge'], req.headers['station-id']).then(function(approval) {
      cache.delete(req.headers['station-id']);
      stationLog.addUser(res.locals.obj.userInCache['user'], res.locals.obj.userInCache['badge'], req.headers['station-id']);
      res.set({
        'Content-Type': 'text/plain',
        'station-state': 'enabled',
        'User-ID-String': res.locals.obj.userInCache['user']
      })
      return res.sendStatus(200);
    });
  } 
  else if(res.locals.obj.destination === 'cache' && !res.locals.obj.access) {
    let amIonMoreThanOneMachine = stationLog.getAll();
    let anyOneOnMachine = stationLog.getMachine(req.headers['station-id']);
    if(anyOneOnMachine.badge !== null) {
      return res.sendStatus(403);
    }
    for(element in amIonMoreThanOneMachine) {
      if (amIonMoreThanOneMachine[element].badge === res.locals.obj.badge) {
        return res.sendStatus(403);
      };
    };
    cache.save(res.locals.obj.user, res.locals.obj.badge, req.headers['station-id']);
    return res.sendStatus(403);
  } else {
    next();
  };
});


// handle log on
router.post('/user-access', function(req, res, next) {
  if(res.locals.obj.destination === 'log' && req.headers['station-state'] === 'disabled') {
    var anyOneOnMachine = stationLog.getMachine(req.headers['station-id']);
    var amIonMoreThanOneMachine = stationLog.getAll();
    for(element in amIonMoreThanOneMachine) {
      if (amIonMoreThanOneMachine[element].badge === res.locals.obj.badge) {
        return res.sendStatus(403);
      };
    };
    if(anyOneOnMachine.user === null) {
      stationLog.addUser(res.locals.obj.user, res.locals.obj.badge, req.headers['station-id']);
      res.set({
        'Content-Type': 'text/plain',
        'station-state': 'enabled',
        'User-ID-String': res.locals.obj.user
      });
      return res.sendStatus(200);
    } else {
      return res.sendStatus(403);
    }
  } 
  next();
});


//handle log off
router.post('/user-access', function(req, res, next) {
  if(res.locals.obj.destination === 'log' && req.headers['station-state'] === 'enabled') {
    var amIonThisMachine = stationLog.getMachine(req.headers['station-id']);
    if(amIonThisMachine.badge === res.locals.obj.badge) {
      stationLog.removeUser(res.locals.obj.badge, req.headers['station-id']);
      res.set({
        'Content-Type': 'text/plain',
        'station-state': 'disabled',
      });
      return res.sendStatus(200);
    } else {
      return res.sendStatus(403);
    }
  } 
  else {
    res.sendStatus(403);
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
