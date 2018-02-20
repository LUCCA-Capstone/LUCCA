var express = require('express');
var router = express.Router();
var path = require('path');
var dbAPI = require('../database/controllers/dbm.js');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const { check, validationResult } = require('express-validator/check');

module.exports = function (passport) {

  /* GET home page. */
  router.get('/', function (req, res) {
    res.render('HomePage.njk', { authenticated: req.isAuthenticated() });
  });


  router.get('/adminLogin', function (req, res) {
    res.render('adminLogin.njk', { authenticated: req.isAuthenticated() });
  });


  router.post('/adminLogin', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/adminLogin'
  }));


  router.get('/adminRegister', function (req, res) {
    res.render('adminRegister.njk', { authenticated: true });
  });


  router.post('/adminRegister', [
    check('email')
      .exists()
      .isEmail().withMessage('Please enter valid email')
      .trim()
      .normalizeEmail(),

    check('password')
      .exists()
      .isLength({ min: 8 })
      .withMessage('Passwords must be at least 8 characters long'),

    check('reenterpassword', 'Re-enter password field must have the same value as the password field')
      .exists()
      .custom((value, { req }) => value === req.body.password),
  ], checkRegistration, passport.authenticate('register', {
    successRedirect: '/adminLogin',
    failureRedirect: '/adminRegister'
  }));


  router.get('/adminReset', checkAuth, function (req, res) {
    res.render('adminReset.njk', { authenticated: true });
  });


  router.post('/adminReset', checkAuth, passport.authenticate('reset', {
    successRedirect: '/adminLogin',
    failureRedirect: '/adminReset'
  }));

  /* GET registration page. Should be directed here from /badgein if/when the
   *     user badging in is not yet registered. Renders RISK liabilty form data
   *     for user to fill out. 
   * *******************************************************************************************/
  router.get('/registration/:badge', function (req, res) {
    res.render('registration.njk', { authenticated: req.isAuthenticated() });
  });


  /* POST registration page. Uses form data to create a new user in the database.
   *      temporarily outputs the results of dbAPI method to console until alerts can be added.
   * ********************************************************************************************/
  router.post('/registration/:badge', jsonParser, function (req, res) {
    if (!req.body) {
      //400 Bad Request
      return res.sendStatus(400);
    }

    //Add badge passed as query string into body of parsed JSON object
    req.body.badge = req.params.badge;

    //Add mailing list signup as boolean (i.e. true instead of "on")
    req.body.mailingList = (req.body.mailingList === undefined) ? false : true;

    //pass JSON object to createUser database method to add newly registered user
    dbAPI.createUser(req.body).done(function (results) {
      console.log(results);  //output results to console for now for dev purposes only
      //TODO: I will research reasonable ways to deal with errors and update later
    });
    res.redirect('/badgein');
  });


  router.get('/badgein', getBadgeIn);


  router.post('/badgein', jsonParser, postBadgeIn, getBadgeIn);


  router.get('/badgeinSuccess', function (req, res) {
    res.render('badgeinSuccess.njk', { authenticated: req.isAuthenticated() });
  });


  router.post('/badgeinSuccess', jsonParser, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    res.redirect('/badgein');
  });


  router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });


  router.get('/userManagement', checkAuth, function (req, res) {
    dbAPI.getUsers().then(function (ret) {
      res.render('userManagement.njk', { obj: ret, authenticated: true });
    });
  });


  router.post('/userManagement', checkAuth, function (req, res) {
    dbAPI.validateUser(req.body.userInput).then(function (ret) {
      console.log(ret.dataValues);
      res.render('userManagement.njk', { obj: [ret.dataValues], authenticated: true });
    });
  });


  router.get('/stationManagement/:filter', checkAuth, jsonParser, getStnMngmnt);


  router.post('/stationManagement/:filter', checkAuth, jsonParser, postStnMngr, getStnMngmnt);


  router.get('/eventsLog/:class', checkAuth, jsonParser, getEvents);


  router.post('/eventsLog/:class', checkAuth, jsonParser, postEvents, getEvents);


  router.post('/userManagement/deleteUser/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var DeletedBadge = req.params.badge;
    dbAPI.deleteUser(DeletedBadge).then(function (result) {
      console.log(result);
      console.log("user is deleted successfully");
    });
    res.redirect('/userManagement');
  });


  router.post('/userManagement/confirmUser/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var BagdeID = req.params.badge;
    dbAPI.modifyUser(BagdeID, { confirmation: true }).then(function (result) {
      if (result == undefined) {
        console.log("Error");
      }
      else {
        console.log("confirmation changed successfully");
      }
    });
    res.redirect('/userManagement');
  });


  router.post('/userManagement/deletePrivilege/:badge/:station', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var BagdeID = req.params.badge;
    var StationID = req.params.station;
    dbAPI.removePrivileges(BagdeID, StationID).then(function (result) {
      console.log(result);
    });
    res.redirect('/userManagement');
  });


  router.post('/userManagement/grantPrivilege/:badge/:station', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var BagdeID = req.params.badge;
    var StationID = req.params.station;
    dbAPI.grantPrivileges(BagdeID, StationID).then(function (result) {
      console.log(result);
    });
    res.redirect('/userManagement');

  });


  router.post('/userManagement/promoteUser/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var BagdeID = req.params.badge;

    dbAPI.validateUser(BagdeID).then(function (ret) {
      console.log(ret.dataValues);
      console.log("USER STATUS " + ret.status);

      if (ret.status == "User" && ret.status != "Admin") {
        dbAPI.modifyUser(BagdeID, { status: "Manager" }).then(function (result) {
          if (result == undefined) {
            console.log("Error");
          }
          else {
            console.log("promotion changed successfully");
          }
        });
      }
      res.redirect('/userManagement');

    });

  });


  router.post('/userManagement/demoteManager/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var BagdeID = req.params.badge;

    dbAPI.validateUser(BagdeID).then(function (ret) {
      console.log(ret.dataValues);
      console.log("USER STATUS " + ret.status);

      if (ret.status == "Manager" && ret.status != "Admin") {
        dbAPI.modifyUser(BagdeID, { status: "User" }).then(function (result) {
          if (result == undefined) {
            console.log("Error");
          }
          else {
            console.log("demotion changed successfully");
          }
        });
      }
      res.redirect('/userManagement');

    });

  });


  router.get('/userManagement/:badge', checkAuth, function (req, res) {
    var BadgeNumber = req.params.badge;
    //dbAPI.grantPrivileges(BadgeNumber, '1');
    Promise.all([
      dbAPI.getStations(undefined),
      dbAPI.getPrivileges(BadgeNumber),
      dbAPI.validateUser(BadgeNumber)
    ])
      .then(
        ([allStations, trainedStation, userInfo]) => {
          var flag = new Boolean(false);
          for (var i = 0; i < allStations.length; ++i) {
            for (var j = 0; j < trainedStation.length; ++j) {
              if (allStations[i].sId === trainedStation[j].sId) {
                allStations[i].trained = true;
                flag = true;
              }
            }
            if (flag != true) {
              allStations[i].trained = false;
            }
            flag = false;
          }
          console.log(allStations);
          res.render('userManagementBadge.njk', { authenticated: true, user: userInfo.dataValues, allStations });
        }
      )
      .catch(
        err => {
          console.warn("something went wrong:", err);
          res.status(500).send(err);
        }
      );
  });

  return router;
}


var checkAuth = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}


/*getStnMngmnt will render a table of all stations that match filter parameter.
  *    If filter == "registered", only registered stations will be displayed (i.e. registered = true)
  *    If filter == "unregistered", only unregistered stations will be displayed (i.e. registered = false)
  *    Otherwise, all stations will be displayed sorted with unregistered stations first.
  *    If "messageType" and "message" are defined in req, it will trigger alert message passing in DOM.
  *********************************************************************************************************/
function getStnMngmnt(req, res) {
  //set filter based on query parameter passed in
  var filter = req.params.filter;
  filter = (filter === "registered") ? true : (filter === "unregistered") ? false : undefined;

  var data = {
    messageType: req.messageType,
    message: req.message,
    authenticated: true
  }

  //get results from database that match filter
  dbAPI.getStations(filter).then(function (ret) {
    if (ret !== false && ret !== undefined) {
      ret.sort(function (a, b) {
        return (a.registered === b.registered) ? 0 : a.registered ? 1 : -1;
      });
      //display sorted array of stations, unregistered stations first
      data.obj = ret;
    } else {
      //display error to user if no database using alert message on page
      data.obj = ret;
      data.messageType = 'error';
      data.message = "There was a problem communicating with the database.\
                      Please contact the DB administrator."
    }
    res.render('stationManagement.njk', data);
  });
}


/*postStnMngr serves two purposes: if req.body JSON contains a "delete" element, then the
 *     user pushed a "delete" button and the station referenced by "sId" element is deleted from tables.
 *     Otherwise, the station identified by "sId" is updated to values in JSON body and registered = true.
 *     Implements message passing: signals success or failure to "next" in "req.messageType" and "req.message"
 ***************************************************************************************************************/
function postStnMngr(req, res, next) {
  if (!req.body) {
    //400 Bad Request
    return res.sendStatus(400);
  }

  req.messageType = "success"; //temporarily assume success!

  if (req.body.delete === "true") {
    //delete station referenced by sId in body
    dbAPI.deleteStation(req.body.sId).then(function (ret) {
      if (ret.result === true) {
        req.message = req.body.name + " has been successfully deleted.";
      } else {
        req.messageType = "error";
        req.message = "Internal problem - unable to delete " + req.body.name + ".";
      }
      next();
    });
  } else {
    //convert registered string to a boolean & give new update date
    req.body.registered = (req.body.registered === "true") ? true : false;
    req.body.updatedAt = new Date();

    //update station referenced by sId in body
    dbAPI.modifyStation(req.body.sId, req.body).then(function (ret) {
      //prepare to pass success message to next()
      if (ret.result === true) {
        req.message = req.body.name + " has been succesfully updated.";
      } else {
        req.messageType = "error";
        req.message = "Internal problem - unable to update " + req.body.name + ".";
      }
      next();
    });
  }
}


function getBadgeIn(req, res) {
  var data = {
    messageType: req.messageType,
    message: req.message,
    authenticated: req.isAuthenticated()
  }

  res.render('badgein.njk', data);
}


function postBadgeIn(req, res, next) {
  if (!req.body) {
    return res.sendStatus(400);
  }

  var BadgeNumber = req.body.badgeNumber;

  dbAPI.validateUser(BadgeNumber).then(function (result) {
    console.log('BN = ' + BadgeNumber);

    // this checks if the badge number is not in the database
    if (result == undefined) {

      // go to the registration page
      res.redirect('/registration/' + BadgeNumber);

    }

    else {
      req.messageType = "success";
      req.message = "You successfully Badge In";
      dbAPI.logEvent("EPL Badge IN", BadgeNumber);
      next();
    }

  });
}


/*getEvents will render a table of all events that match the query parameter passed on this GET request.
  *    If req.params.class parameter matches an event class, on that those types of events will be displayed.
  *    Otherwise, all events will be displayed sorted with the most recent events first.
  *    If "messageType" and "message" are defined in req, it will trigger alert message passing in DOM.
  *********************************************************************************************************/
function getEvents(req, res) {
  var filterClass = getFilterClass(req.params.class);
  var data = {
    messageType: req.messageType,
    message: req.message,
    authenticated: true
  }

  dbAPI.getEvents(filterClass).then(function (ret) {
    //if array of results returned from database, sort with most recent date at top
    if (Array.isArray(ret)) {
      ret.sort(function (a, b) {
        return (a.eventDate > b.eventDate) ? -1 : (a.eventDate < b.eventDate) ? 1 : 0;
      });
    }

    //display error to user if no database using alert message on page
    data.obj = ret;
    res.render('eventsLog.njk', data);
  }).
    catch(err => {
      data.messageType = "error";
      data.message = "Internal connection problem. Please contact the DB administrator.";
      res.render('eventsLog.njk', data);
    });
};


/*postEvents will delete the event that corresponds to req.body.id in this POST, if it exists.
 *     Upon completion, will call "next" function to GET and display revised list of log entries.
 *     Implements message passing: signals success or failure to "next" in "req.messageType" and "req.message"
 ***************************************************************************************************************/
function postEvents(req, res, next) {
  if (!req.body) {
    //400 Bad Request
    return res.sendStatus(400);
  }

  req.messageType = "success"; //temporarily assume success!

  //delete station referenced by sId in body
  dbAPI.deleteEvent(req.body.id).then(function (ret) {
    if (ret.result === true) {
      req.message = "Log entry " + req.body.id + " has been deleted.";
    } else {
      req.messageType = "error";
      req.message = "Unable to delete " + req.body.id + ". \n" + ret.detail;
    }
    next();
  }).
    catch(err => {
      data.messageType = "error";
      data.message = "Internal connection problem. Please contact the DB administrator.";
      next();
    });
}


//Simple helper function returns event class type that corresponds to filter
function getFilterClass(filter) {
  switch (filter) {
    case "badgeIn":
      return "EPL Badge IN";
    case "generic":
      return "generic_event";
    case "different":
      return "different_event";
    case "statusReq":
      return "station-status request";
    case "stnReset":
      return "station-reset";
    case "stnMngmnt":
      return "station management";
    default:
      return undefined;
  }
}

function checkRegistration(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let mappedErrors = errors.mapped();
    for (let val in mappedErrors) {
      req.flash('error', mappedErrors[val]['msg']);
    }
    res.redirect('/adminRegister');
  } else {
    next();
  }
}
