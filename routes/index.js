/******************************************************************
  * Copyright (c) 2018 Daniel Eynis, Bishoy Hanna, Bryan Mikkelson,
  * Justin Moore, Huy Nguyen, Michael Olivas, Andrew Wood          
  * This program is licensed under the "MIT License".              
  * Please see the file LICENSE in the source                      
  * distribution of this software for license terms.               
/******************************************************************/

var express = require('express');
var router = express.Router();
var path = require('path');
var dbAPI = require('../database/controllers/dbm.js');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const { check, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

module.exports = function (passport) {

  /* GET home page. */
  router.get('/', function (req, res) {
    res.redirect('/badgein');
  });


  router.get('/adminLogin', function (req, res) {
    res.render('adminLogin.njk', { authenticated: req.isAuthenticated() });
  });


  router.post('/adminLogin', [
    check('email')
      .exists()
      .isEmail().withMessage('Please enter valid email')
      .trim()
      .normalizeEmail(),

    check('password')
      .exists(),
  ], checkRegistration, passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/adminLogin'
  }));


  router.get('/adminRegister', checkAuth, function (req, res) {
    res.render('adminRegister.njk', { authenticated: true });
  });


  router.post('/adminRegister', checkAuth, [
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


  router.post('/adminReset', checkAuth, [
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
  ], checkRegistration, passport.authenticate('reset', {
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
  router.post('/registration/:badge', [
    check('badge')
      .exists()
      .custom(value => {
        return dbAPI.validateUser(value).then(user => {
          if (user != undefined)
            throw new Error('The badge you provided is already in use');
        });
      }),

    check('first').exists().withMessage('Please enter first name'),

    check('last').exists().withMessage('Please enter last name'),

    check('email')
      .exists()
      .isEmail().withMessage('Please enter valid email')
      .trim()
      .normalizeEmail()
      .custom(value => {
        return dbAPI.validateUser(value).then(user => {
          if (user != undefined)
            throw new Error('The email you provided is already in use');
        });
      }),

    check('phone')
      .exists()
      .isMobilePhone('any').withMessage('Please enter valid phone number'),

    check('signature').exists().withMessage('Please enter signature'),

    check('ecSignature').exists(),

    check('ecName').exists().withMessage('Please enter emergency contact name'),

    check('ecRel').exists().withMessage('Please enter emergency contact relationship'),

    check('ecPhone')
      .exists()
      .isMobilePhone('any').withMessage('Please enter valid emergency contact phone number'),
  ], checkRegistration, jsonParser, function (req, res) {
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
      if (!results.result) {
        req.flash('error', results.detail);
        req.flash('error', 'Email or badge number may already be in use');
        res.redirect(req.path);
      } else {
        req.flash('success', "Thank you, " + req.body.first + ", you have registered. Please badge in to use the lab.");
        res.redirect('/badgein');
      }
    });
  });


  router.get('/badgein', getBadgeIn);


  router.post('/badgein', [
    check('badgeNumber')
      .exists()
      .isNumeric().withMessage('Only numeric badge numbers allowed')
      .trim()
  ], checkRegistration, jsonParser, postBadgeIn);


  router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });


  router.get('/userManagement', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }

    Promise.all([
      dbAPI.getUsers(undefined),
      dbAPI.getStations()

    ])
      .then(
        ([allUsers, allStations]) => {
          var data = {
            users: allUsers,
            stations: allStations,
            authenticated: true
          }

          res.render('userManagement.njk', data);
        }
      )
      .catch(
        err => {
          console.warn("something went wrong:", err);
          res.status(500).send(err);
        }
      );
  });

  router.post('/userManagement', checkAuth, jsonParser, function (req, res) {
    //Parse valid date objects for accurage searching in database
    var dateRangeArray = req.body.dateFilter ? req.body.dateFilter.split(" - ") : undefined;
    var startRange = (dateRangeArray && dateRangeArray[0]) ? Date.parse(dateRangeArray[0]) : undefined;
    var endRange = (dateRangeArray && dateRangeArray[1]) ? Date.parse(dateRangeArray[1]) : undefined;
    var startDate = startRange ? new Date(startRange) : undefined;
    var endDate = undefined;

    /*newDate(endRange) will return the user's requested end date at 00:00:00. We add a day so that
     *when we search the database, we search through the end of today (i.e. until tomorrow at 00:00.*/
    if (endRange !== undefined) {
      endDate = new Date(endRange);
      endDate.setDate(endDate.getDate() + 1);
    }

    Promise.all([
      dbAPI.getUsers(startDate, endDate),
      dbAPI.getPrivilegedStationUsers(req.body.stationSelector),
      dbAPI.getStations()
    ])

      .then(
        ([usersByDate, privUsers, allStations]) => {
          if (!usersByDate) {
            const err = "Interal error: Unable to get users."
            req.flash('error', err);
            res.status(500).send(err + "via the /userManagement (post) route.");
            res.redirect('/userManagement');
          }

          /*Filter by most specific items first to limit number of comparisons. Also, if user didn't
          *provide a particular input, no comparisons happen at that step. Must check all provided input, 
          *however; cannot return match prematurely as later filter may weed it out.*/
          var stationMatchesArray = new Array();
          var badgeFilter = req.body.badgeInput
            ? usersByDate.filter(x =>
              x.badge.indexOf(req.body.badgeInput) > -1)
            : usersByDate;
          var nameFilter = req.body.nameInput
            ? badgeFilter.filter(x =>
              (x.first + " " + x.last)
                .toUpperCase()
                .indexOf(req.body.nameInput.toUpperCase()) > -1)
            : badgeFilter;
          var statusFilter = undefined; //specified below; too complex for ternery operator

          var data = {
            stations: allStations,
            authenticated: true
            //users get added below
          }

          if (req.body.statusSelector === "All" || req.body.statusSelector === "" || req.body.statusSelector === undefined) {
            //User did not specify search by status or explicity chose "All" statuses
            statusFilter = nameFilter;
          } else {
            //User specified a particular status by which we should search
            statusFilter = nameFilter.filter(x => x.status === req.body.statusSelector);
          }


          if (req.body.stationSelector === "All" || req.body.stationSelector === "" || req.body.stationSelector === undefined) {
            //User did not specify search by station, or explicitly chose "All" stations
            data.users = statusFilter;
          } else {
            //If user specified a particular station, iterate over getPrivilegedStationUsers results
            privUsers.forEach(function (privElement) {
              statusFilter.forEach(function (statusElement) {
                if (privElement.badge == statusElement.badge) {
                  stationMatchesArray.push(privElement);
                }
              });
            });

            data.users = stationMatchesArray;
          }

          res.send(data);
        }
      )

      .catch(
        err => {
          req.flash('error', err.details);
          res.status(500).send(err);
          res.redirect('/userManagement');
        }
      )
  });


  router.get('/stationManagement/:filter', checkAuth, jsonParser, getStnMngmnt);


  router.post('/stationManagement/:filter', checkAuth, jsonParser, postStnMngr, getStnMngmnt);


  router.get('/eventsLog/:class', checkAuth, jsonParser, getEvents);


  router.post('/userManagement/deleteUser/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var DeletedBadge = req.params.badge;
    if(DeletedBadge===req.user.badge)
    {
      req.flash('error', 'Not allowed to delete yourself as an Admin');      
      res.redirect('/userManagement/' + DeletedBadge);
      return; 
    }
    dbAPI.deleteUser(DeletedBadge).then(function (result) {
      console.log("user is deleted successfully");
    });
    req.flash('success', 'The user has been successfully deleted from the system');
    req.flash('fade_out', '3000');
    res.redirect('/userManagement');
  });


  router.post('/userManagement/confirmUser/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var badgeID = req.params.badge;
    dbAPI.modifyUser(badgeID, { confirmation: true }).then(function (result) {
      if (result == undefined) {
        console.log("Error");
      }
      else {
        console.log("confirmation changed successfully");
      }
    });
    req.flash('success', 'This user is confirmed successfully');
    req.flash('fade_out', '3000');
    res.redirect('/userManagement/' + badgeID);
  });


  router.post('/userManagement/deletePrivilege/:badge/:station', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var badgeID = req.params.badge;
    var StationID = req.params.station;
    dbAPI.removePrivileges(badgeID, StationID).then(function (result) {
      console.log(result);
    });
    req.flash('success', 'The users access to the selected station has been revoked');
    req.flash('fade_out', '3000');
    res.redirect('/userManagement/' + badgeID);
  });


  router.post('/userManagement/grantPrivilege/:badge/:station', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var badgeID = req.params.badge;
    var StationID = req.params.station;
    dbAPI.grantPrivileges(badgeID, StationID).then(function (result) {
      console.log(result);
    });
    req.flash('success', 'The user has been successfully granted access to the selected station');
    req.flash('fade_out', '3000');
    res.redirect('/userManagement/' + badgeID);

  });


  router.post('/userManagement/promoteUser/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var badgeID = req.params.badge;

    dbAPI.validateUser(badgeID).then(function (ret) {
      if (ret.status == "User" && ret.status != "Admin") {
        dbAPI.modifyUser(badgeID, { status: "Manager" }).then(function (result) {
          if (result == undefined) {
            req.flash("error", "Internal error: unable to promote " + badgeID);
          }
          else {
            req.flash("success", "Successfully promoted user associated with Badge number " + badgeID);
          }
          res.redirect('/userManagement/' + badgeID);
        }); //end modifyUserCall
      } else {
        req.flash("success", "Success! That user was already a Manager.");
        res.redirect('/userManagement/' + badgeID);
      }
    }); //end validateUser call
  });


  router.post('/userManagement/demoteManager/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var badgeID = req.params.badge;

    dbAPI.validateUser(badgeID).then(function (ret) {
      console.log(ret.dataValues);
      console.log("USER STATUS " + ret.status);

      if (ret.status == "Manager" && ret.status != "Admin") {
        dbAPI.modifyUser(badgeID, { status: "User" }).then(function (result) {
          if (result == undefined) {
            console.log("Error");
          }
          else {
            console.log("demotion changed successfully");
          }
        });
      }
      req.flash('success', 'The Manager has been successfully demoted to User status');
      req.flash('fade_out', '3000');
      res.redirect('/userManagement/' + badgeID);

    });

  });


  router.post('/userManagement/demoteAdmin/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    let badgeID = req.params.badge;
    if(badgeID===req.user.badge)
    {
      req.flash('error', 'Not allowed to demote yourself from being an Admin');      
      res.redirect('/userManagement/' + badgeID);
      return; 
    }
    dbAPI.validateUser(badgeID).then(function (ret) {

      if (ret.status == "Admin") {
        dbAPI.modifyUser(badgeID, { status: "Manager", password: null }).then(function (result) {
          if (result == undefined) {
            console.log("Error could not demote admin");
          }
          else {
            let adminName = req.user.first + ' ' + req.user.last;
            let adminEmail = req.user.email;
            let adminBadge = req.user.badge;
            dbAPI.logEvent('administration', adminBadge, `Admin ${adminName} (${adminEmail}) has demoted user with badge ID: ${badgeID} to Manager status`);
            dbAPI.logEvent('privilege', badgeID, `User with badge ID: ${badgeID} has been demoted to Manager status`);
          }
        });

      }
      req.flash('success', 'The Admin has been successfully demoted to Manager status');
      req.flash('fade_out', '3000');
      res.redirect('/userManagement/' + badgeID);
    });
  });


  router.post('/userManagement/badgeOutUser/:badge', checkAuth, function (req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }
    var badgeID = req.params.badge;

    dbAPI.validateUser(badgeID).then(function (ret) {

      if (ret.loggedIn === true) {
        dbAPI.modifyUser(badgeID, { loggedIn: false }).then(function (result) {
          if (result == undefined) {
            console.log("Error");
          }
          else {
            console.log("user Badged out successfully");

          }
        });
      }
      req.flash('success', 'The user has been successfully badged out of the lab');
      req.flash('fade_out', '3000');
      res.redirect('/userManagement/' + badgeID);

    });

  });

  router.get('/userManagement/getPrivilegedStationUsers/:sid', checkAuth, function (req, res) {

    Promise.all([
      dbAPI.getPrivilegedStationUsers(req.params.sid),
      dbAPI.getStations()

    ])
      .then(
        ([allUsers, allStations]) => {
          var data = {
            users: allUsers,
            stations: allStations,
            authenticated: true
          }

          res.render('userManagement.njk', data);
        }
      )
      .catch(
        err => {
          console.warn("something went wrong:", err);
          res.status(500).send(err);
        }
      );
  });

  router.get('/userManagement/:badge', checkAuth, function (req, res) {
    var BadgeNumber = req.params.badge;
    Promise.all([
      dbAPI.getStations(undefined),
      dbAPI.getPrivileges(BadgeNumber),
      dbAPI.validateUser(BadgeNumber)
    ])
      .then(
        ([allStations, trainedStation, userInfo]) => {
          // console.log(allStations);
          console.log(trainedStation);
          var flag = new Boolean(false);
          for (var i = 0; i < allStations.length; ++i) {
            for (var j = 0; j < trainedStation.length; ++j) {
              if (allStations[i].sId === trainedStation[j].sId) {
                allStations[i].trained = true;
                allStations[i].trainedDate = trainedStation[j].updatedAt;
                flag = true;
              }
            }
            if (flag != true) {
              allStations[i].trained = false;
            }
            flag = false;
          }
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

router.post('/userManagement/updateUserInfo/:badge', [
  check('email')
    .exists()
    .isEmail().withMessage('Please enter valid email')
    .trim()
    .normalizeEmail()
    .custom(value => {
      return dbAPI.validateUser(value).then(user => {
        if (user != undefined)
          throw new Error('The email you provided is already in use');
      });
    })
    .optional(),

  check('phone')
    .isMobilePhone('any').withMessage('Please enter valid phone number')
    .optional(),

  check('ecPhone')
    .isMobilePhone('any').withMessage('Please enter valid emergency contact phone number')
    .optional(),
], function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let mappedErrors = errors.mapped();
    for (let val in mappedErrors) {
      req.flash('error', mappedErrors[val]['msg']);
    }
  } else {
    dbAPI.modifyUser(req.params.badge, req.body);
    req.flash('success', 'Successfully updated user info');
  }
  res.redirect('/userManagement/' + req.params.badge);
});


var checkAuth = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}


/*getStnMngmnt will render a table of all stations that match filter parameter.
  *    If filter == "registered", only registered stations will be displayed (i.e. registered = true)
  *    If filter == "unregistered", only unregistered stations will be displayed (i.e. registered = false)
  *    Otherwise, all stations will be displayed sorted with unregistered stations first.
  *********************************************************************************************************/
function getStnMngmnt(req, res) {
  //set filter based on query parameter passed in
  var data = { authenticated: true }
  var filter = req.params.filter;

  filter = (filter === "registered") ? true : (filter === "unregistered") ? false : undefined;

  //get results from database that match filter
  dbAPI.getStations(filter).then(function (ret) {
    if (ret !== false && ret !== undefined) {
      ret.sort(function (a, b) {
        return (a.registered === b.registered) ? 0 : a.registered ? 1 : -1;
      });
      //display sorted array of stations, unregistered stations first
      data.obj = ret;
    } else {
      //display error to user if no database
      data.obj = ret;
      req.flash('error', "There was a problem communicating with the database. Please contact the DB administrator.")
    }
    res.render('stationManagement.njk', data);
  });
}


/*postStnMngr serves two purposes: if req.body JSON contains a "delete" element, then the
 *     user pushed a "delete" button and the station referenced by "sId" element is deleted from tables.
 *     Otherwise, the station identified by "sId" is updated to values in JSON body and registered = true.
 ***************************************************************************************************************/
function postStnMngr(req, res, next) {
  if (!req.body) {
    //400 Bad Request
    return res.sendStatus(400);
  }

  if (req.body.delete === "true") {
    //delete station referenced by sId in body
    dbAPI.deleteStation(req.body.sId).then(function (ret) {
      if (ret.result === true) {
        req.flash('sucess', req.body.name + " has been successfully deleted.");
      } else {
        req.flash('error', "Internal problem - unable to delete " + req.body.name + ".");
      }
      next();
    });
  } else {
    //convert registered string to a boolean & give new update date
    req.body.registered = (req.body.registered === "true") ? true : false;

    //update station referenced by sId in body
    dbAPI.modifyStation(req.body.sId, req.body).then(function (ret) {
      //prepare to pass success message to next()
      if (ret.result === true) {
        req.flash('success', req.body.name + " has been succesfully updated.");
      } else {
        req.flash('error', "Internal problem - unable to update " + req.body.name + ".");
      }
      next();
    });
  }
}


function getBadgeIn(req, res) {
  res.render('badgein.njk', { authenticated: req.isAuthenticated() });
}

function postBadgeIn(req, res, next) {
  if (!req.body) {
    return res.sendStatus(400);
  }

  var badgeNumber = req.body.badgeNumber;

  dbAPI.validateUser(badgeNumber).then(function (result) {
    // this checks if the badge number is not in the database
    if (result == undefined) {
      // go to the registration page
      res.redirect('/registration/' + badgeNumber);
    } else {
      var BadgeInFlag = result.loggedIn;
      if (BadgeInFlag === false) {
        req.flash('success', 'You successfully badged into the lab!');
        req.flash('fade_out', '3000');
        dbAPI.logEvent("user traffic", badgeNumber, 'User clocked in to lab');
        dbAPI.modifyUser(badgeNumber, { loggedIn: true });
        res.redirect('/badgein');
      }
      else if (BadgeInFlag === true) {
        req.flash('success', 'You successfully badged out the lab!');
        req.flash('fade_out', '3000');
        dbAPI.logEvent("user traffic", badgeNumber, 'User clocked out of lab');
        dbAPI.modifyUser(badgeNumber, { loggedIn: false });
        res.redirect('/badgein');
      }
    }
  });
}


/*getEvents will render a table of all events that match the query parameter passed on this GET request.
  *    If req.params.class parameter matches an event class, on that those types of events will be displayed.
  *    Otherwise, all events will be displayed sorted with the most recent events first.
  *********************************************************************************************************/
function getEvents(req, res) {
  var filterClass = getFilterClass(req.params.class);
  var data = { authenticated: true }

  dbAPI.getEvents(filterClass).then(function (ret) {
    //if array of results returned from database, sort with most recent date at top
    if (Array.isArray(ret)) {
      ret.sort(function (a, b) {
        return (a.eventDate > b.eventDate) ? -1 : (a.eventDate < b.eventDate) ? 1 : 0;
      });
    }
    data.obj = ret;
    res.render('eventsLog.njk', data);
  }).
    catch(err => {
      req.flash('error', "Internal connection problem. Please contact the DB administrator.");
      res.render('eventsLog.njk', data);
    });
};


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

    const allData = matchedData(req);
    for (let val in allData) {
      req.flash(val, allData[val]);
    }

    if (req.body.mailingList != undefined) {
      req.flash('mailingList', 'checked');
    }

    res.redirect(req.path);
  } else {
    next();
  }
}