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
  // FIXME: This is a nasty hack that needs to be fixed before shipping
  if (Object.keys(cert).length === 0) {
    cert = {
      'subject': {
        'CN' : 'localhost:3001'
      }
    }
  };
  db.getStation(headerObj['station-id']).then(function(station) {
    if(!station) {
      //console.log('Received a user-access action from an unknown station-id: ' + headerObj['station-id']);
      return res.sendStatus(403);
    } 
    else if (!station.registered) {
      db.logEvent('station', undefined, "Received a user-access action from an unregistered station advertising station-id " + headerObj['station-id'] ).catch(err=> {;
        console.log(err);
      });
      //console.log('Received a user-access action from an offline station with station-id: ' + headerObj['station-id']);
      return res.sendStatus(403); 
    }
    else if (station.certCN !== cert.subject.CN) {
      db.logEvent('station', headerObj['station-id'], "Received a user-access action with a mismatched cert CN for station-id: (expected '" + station.certCN + "', received '" + cert.subject.CN + "')").catch(err => {
        console.log(err);
      });
      //console.log('Received a user-access action with a mismatched cert CN for station-id: ' + headerObj['station-id']);
      return res.sendStatus(403);
    } 
    var checkMachine = stationLog.getMachine(headerObj['station-id']);
    if(checkMachine === null) {
      checkMachine = stationLog.addMachine(headerObj['station-id']);
    };
    var userWaiting = cache.getMachine(headerObj['station-id'], timer);
    db.getLoggedIn(bodyObj).then(function(person) {
      if(!person) {
        //console.log('Received a user-access action from station-id ' + headerObj['station-id'] + ' for an unknown user with badge: ' + bodyObj);
        return res.sendStatus(403);
      }
      else if (person.status === 'Admin') {
        res.locals.obj = {
          'status': person.status,
          'user': person.last+','+person.first, 
          'badge': person.badge,
          'station': headerObj['station-id'],
          'destination': null, 
          'userInCache': null,
          'access': true
        };
        if(userWaiting && headerObj['station-state'] === 'Disabled'){
          res.locals.obj.destination = 'cache',
          res.locals.obj.userInCache = userWaiting;
          next();
        } else {
         res.locals.obj.destination = 'log';
         next(); 
        }
      } 
      else if (person.status === 'Manager') {
        res.locals.obj = {
          'status': person.status,
          'user': person.last+','+person.first, 
          'badge': person.badge,
          'station': headerObj['station-id'],
          'destination': null, 
          'userInCache': null,
          'access': false
        };
        if(userWaiting && headerObj['station-state'] === 'Disabled') {
          db.getPrivileges(bodyObj).then(function(privs) {
            var canLogOntoMachine = false;
            if(!privs) {
              // FIXME: Add logging for this event
              //console.log('Received a user-access action from station-id ' + headerObj['station-id'] + ' for a manager without station privileges from manager with badge: ' + bodyObj);
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
                // FIXME: Add logging for this event
                //console.log('Received a user-access action from station-id ' + headerObj['station-id'] + ' for a manager without station privileges from manager with badge: ' + bodyObj);
                return res.sendStatus(403);
              };
            };
          }).catch((error) => {
            console.log(error);
            return res.sendStatus(500, error);
          });
        } else if (userWaiting === null && headerObj['station-state'] === 'Disabled') {
          db.getPrivileges(bodyObj).then(function(privs) {
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
            console.log(error);
            return res.sendStatus(500, error);
          });
        } else {
          res.locals.obj.destination = 'log';
          next();
        }
      }
      else if (person.status === 'User') {
        res.locals.obj = {
          'status': person.status,
          'user': person.last+','+person.first, 
          'badge': person.badge,
          'station': headerObj['station-id'],
          'destination': null,
          'access': false
        };
        db.getPrivileges(bodyObj).then(function(privs) {
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
          console.log(error);
          return res.sendStatus(500, error);
        });
      } else {
        //console.log('Received a user-access action from station-id ' + headerObj['station-id'] + ' for a user without station privileges from user with badge: ' + bodyObj);
        return res.sendStatus(403);
      }
    }).catch((error) => {
          console.log(error);
        return res.sendStatus(500, error);
    });
  }).catch((error) => {
          console.log(error);
      return res.sendStatus(500, error);
  });
});


//handle cache
router.post('/user-access', function(req, res, next) {
  if(res.locals.obj.destination === 'cache' && res.locals.obj.access && (res.locals.obj.status === 'Admin' || res.locals.obj.status === 'Manager')){
    let anyOneOnMachine = stationLog.getMachine(req.headers['station-id']);
    let amIonMoreThanOneMachine = stationLog.getAll();
    if(anyOneOnMachine.badge !== null) {
      //console.log('Received a user-access action from station-id ' + req.headers['station-id'] + ' that would have granted station training to : ' + bodyObj + ' but another user is currently logged on to the station');
      return res.sendStatus(403);
    }
    for(element in amIonMoreThanOneMachine) {
      if (amIonMoreThanOneMachine[element].badge === res.locals.obj.userInCache['badge']) {
        //console.log('Received a user-access action from station-id ' + req.headers['station-id'] + ' that would have granted station training to : ' + bodyObj + ' but that user is logged in elsewhere');
        return res.sendStatus(403);
      };
    };
    db.grantPrivileges(res.locals.obj.userInCache['badge'], req.headers['station-id']).then(function(approval) {
      let user = res.locals.obj.badge;
      let userInCache = res.locals.obj.userInCache['badge'];
      let station = res.locals.obj.station;
      db.logEvent('privilege', userInCache, 'Granted training on station with id ' + station + ' (by ' + user + ')').catch(err => {
        console.log(err);
      });
      cache.delete(req.headers['station-id']);
      stationLog.addUser(res.locals.obj.userInCache['user'], res.locals.obj.userInCache['badge'], req.headers['station-id']);
      res.set({
        'Content-Type': 'text/plain',
        'station-state': 'Enabled',
        'User-ID-String': res.locals.obj.userInCache['user']
      });
      return res.sendStatus(200);
    }).catch(err => {
      console.log(err);
      return res.sendStatus(500);
    });
  } 
  else if(res.locals.obj.destination === 'cache' && !res.locals.obj.access) {
    let amIonMoreThanOneMachine = stationLog.getAll();
    let anyOneOnMachine = stationLog.getMachine(req.headers['station-id']);
    if(anyOneOnMachine.badge !== null) {
      //console.log('Received station-access action from station-id ' + req.headers['station-id'] + ' for user with badge ' + res.locals.obj.badge + ', but the station is in use by someone else');
      return res.sendStatus(403);
    }
    for(element in amIonMoreThanOneMachine) {
      if (amIonMoreThanOneMachine[element].badge === res.locals.obj.badge) {
        //console.log('Received station-access action from station-id ' + req.headers['station-id'] + ' for user with badge ' + res.locals.obj.badge + ', but that user is using another station already');
        return res.sendStatus(403);
      };
    };
    cache.save(res.locals.obj.user, res.locals.obj.badge, req.headers['station-id']);
    //console.log('Received station-access action from station-id ' + req.headers['station-id'] + ' for user with badge ' + res.locals.obj.badge + ', who does not have station training. Adding user to the training request cache.');
    return res.sendStatus(403);
  } else {
    next();
  };
});


// handle log on
router.post('/user-access', function(req, res, next) {
  if(res.locals.obj.destination === 'log' && req.headers['station-state'] === 'Disabled') {
    var anyOneOnMachine = stationLog.getMachine(req.headers['station-id']);
    var amIonMoreThanOneMachine = stationLog.getAll();
    for(element in amIonMoreThanOneMachine) {
      if (amIonMoreThanOneMachine[element].badge === res.locals.obj.badge) {
        //console.log('Received station-access request to check out station-id ' + req.headers['station-id'] + ' for user with badge ' + res.locals.obj.badge + ', but this user is using another station already');
        return res.sendStatus(403);
      };
    };
    if(anyOneOnMachine.user === null) {
      stationLog.addUser(res.locals.obj.user, res.locals.obj.badge, req.headers['station-id']);
      let user = res.locals.obj.badge;
      let station = res.locals.obj.station;
      db.logEvent('user traffic', user, 'Accepted a user-access action on station with ID ' + station + ' (station activated by user)').then(function(){
      });
      res.set({
        'Content-Type': 'text/plain',
        'station-state': 'Enabled',
        'User-ID-String': res.locals.obj.user
      })
      return res.sendStatus(200);
    } else {
      //console.log('Received station-access request to check out station-id ' + req.headers['station-id'] + ' for user with badge ' + res.locals.obj.badge + ', but the station is already in use by someone else');
      return res.sendStatus(403);
    }
  } 
  next();
});


//handle log off
router.post('/user-access', function(req, res, next) {
  if(res.locals.obj.destination === 'log' && req.headers['station-state'] === 'Enabled') {
    var amIonThisMachine = stationLog.getMachine(req.headers['station-id']);
    if(amIonThisMachine.badge === res.locals.obj.badge) {
      stationLog.removeUser(res.locals.obj.badge, req.headers['station-id']);
      res.set({
        'Content-Type': 'text/plain',
        'station-state': 'Disabled',
      });
      let user = res.locals.obj.badge;
      let station = res.locals.obj.station;
      db.logEvent('user traffic', user, 'Accepted a user-access action on station with ID ' + station + ' (user done with station)').then(function(){
      });
      return res.sendStatus(200);
    } else {
      //console.log('Received station-access request to check in station-id ' + req.headers['station-id'] + ' for user with badge ' + res.locals.obj.badge + ', but this user is not currently using this station');
      return res.sendStatus(403);
    }
  } else {
    //console.log('Received station-acces request from station-id ' + req.headers['station-id'] + ' which fell through to last-case route handling, but headers do not match');
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
              db.logEvent('station', stationId, "Heartbeat for unregistered station with ID '" + stationId + "' provided a new station CN. Changing to '" + cert.subject.CN + "'");
            });
          } // else nothing to change, the station simply isn't registered yet
          res.status(403).send('Forbidden');
        } else { // heartbeat is from an existing registered station
          if (station.certCN != cert.subject.CN) { // existing registered cert with mismatched cert
            db.logEvent('station', stationId, "Heartbeat for station with ID '" + stationId + "' had mismatched CN on client certificate (expected '" + station.certCN + "', received '" + cert.subject.CN + "')").then(function(response) {
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
            db.logEvent('station', stationId, "Unrecognized heartbeat created a new unregistered station with ID '" + stationId + "', certificate CN '" + cert.subject.CN + "'").then(function(logResult) {
              res.set({
                'Content-Type': 'text/plain',
                'Date': new Date().toString()
              });
              res.sendStatus(403);
            });
          }
        });
      }
    }).catch(err => {
      //Internal error in database
      console.log(err);
      res.sendStatus(500);
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
           db.logEvent('user traffic', undefined, 'Station with ID ' + sid + ' deactivated (reset button pressed)').then(function(){
             res.sendStatus(200);
           });
          }else{
            db.logEvent('internal error', 'route handler for /api/local-reset', 'A cache lookup error occured while trying to process an API event, likely due to an empty or missing station-id header').then(function(){
              res.sendStatus(500);
            });
          }
        }else{
          db.logEvent('station', sid, 'local-reset API action received from an invalid source; station is either offline, or offered a certificate with a mismatched Canonical Name').then(function() {
            res.sendStatus(403);
          });
        }
      }else{
        db.logEvent('station', undefined, 'local-reset API action received from an unknown station ID: ' + sid).catch(err => {
          console.log(err);
        });
        res.sendStatus(403);
      }
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
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
          db.logEvent('station', sid, 'Received a last-state request, responding with station state found in cache');
          //Store station object
          let obj = stationLog.getMachine(sid);

          //If station was in shared cache return
          //whether the station was enabled or disabled.
          if(obj){
            if(obj.status === 'enabled'){
              res.set({
                'Content-Type': 'text/plain',
                'station-state': 'Enabled',
                'user-id-string': obj.user
              });
              res.sendStatus(200);
            }else{
              res.set({
                'Content-Type': 'text/plain',
                'station-state': 'Disabled',
              });
              res.sendStatus(200);
            }
          //If station was not found add it to the stations
          //shared cache and return status.
          }else{
            if(stationLog.addMachine(sid)){
              res.set({
                'Content-Type': 'text/plain',
                'station-state': 'Disabled',
              });
              res.sendStatus(200);
            }else{
              res.sendStatus(500);
            }
          }
        }else{
          db.logEvent('station', undefined, 'Received last-state request with a bad certificate CN').then(function(){
            res.sendStatus(403);
          });
        }
      }else{
        db.logEvent('station', undefined, 'Received last-state request from an unknown station').then(function(){
          console.log('Empty Results');
          res.sendStatus(403);
        });
      }
    }).catch(err => {
      console.log('Caught an error while attempting to retrieve station info from database:\n' + err);
      res.sendStatus(500);
    });
  }else{
    res.sendStatus(400);
  }
});

module.exports = router;
