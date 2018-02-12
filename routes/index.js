var express = require('express');
var router = express.Router();
var path = require('path');
var dbAPI = require('../database/controllers/dbm.js');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();


module.exports = function (passport) {

  /* GET home page. */
  router.get('/', function (req, res) {
    res.render('HomePage.njk');
  });

  router.get('/adminLogin', function (req, res) {
    res.render('adminLogin.njk');
  });

  router.post('/adminLogin', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/adminLogin'
  }));

  router.get('/adminRegister', function(req, res){
    res.render('adminRegister.njk');
  });

  router.post('/adminRegister', passport.authenticate('register', {
    successRedirect: '/adminLogin',
    failureRedirect: '/adminRegister'
  }));

  router.get('/adminReset', function (req, res) {
    res.render('adminReset.njk');
  });

  router.post('/adminReset', passport.authenticate('reset', {
    successRedirect: '/adminLogin',
    failureRedirect: '/adminReset'
  }));

  router.get('/badgein', function (req, res) {
    res.render('badgein.njk');
  });

  /* GET registration page. Should be directed here from /badgein if/when the
   *     user badging in is not yet registered. Renders RISK liabilty form data
   *     for user to fill out. 
   * *******************************************************************************************/
  router.get('/registration/:badge', function (req, res) {
    res.render('registration.njk');
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

  router.post('/badgein', jsonParser, function (req, res) {
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
        console.log('You logged in succesfully');
        console.log(BadgeNumber);

        res.redirect('/badgeinSuccess');
      }
    });
  });

  router.get('/badgeinSuccess', function (req, res) {
    res.render('badgeinSuccess.njk');
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

  router.get('/userManagement', function (req, res) {
    dbAPI.getUsers('2000-01-01', '3000-01-01').then(function (ret) {
      res.render('userManagement.njk', { obj: ret });
    });
  });

  router.post('/userManagement', function (req, res) {
    dbAPI.validateUser(req.body.userInput).then(function (ret) {
      console.log(ret.dataValues);
      res.render('userManagement.njk', { obj: [ret.dataValues] });
    });
  });

  /*GET stationManagment route will render a table of all stations that match filter parameter.
   *    If filter == "registered", only registered stations will be displayed (i.e. registered = true)
   *    If filter == "unregistered", only unregistered stations will be displayed (i.e. registered = false)
   *    Otherwise, all stations will be displayed sorted with unregistered stations first.
   *********************************************************************************************************/
  router.get('/stationManagement/:filter', jsonParser, function (req, res, next) {
    //set filter based on query parameter passed in
    var filter = req.params.filter;
    filter = (filter === "registered") ? true : (filter === "unregistered") ? false : undefined;

    //get results from database that match filter
    dbAPI.getStations(filter).then(function(ret) {
      //display ordered with unregistered stations first
      /* UNCOMMENT THIS CODE WHEN TRAVIS HAS ACCESS TO A DATABASE SO RESULTS ARE SORTED
       * ret.sort(function(a,b) {
       *   return (a.registered === b.registered) ? 0 : a.registered ? 1 : -1;
       * });
      */
      res.render('stationManagement.njk', {obj: ret});
    });
  });

  /*POST stationManagement serves two purposes: if user req.body JSON contains a "delete" element,
   *     then the user pushed a "delete" button and the station referenced by "sId" element is deleted from tables.
   *     Otherwise, the station identified by "sId" is updated to values in JSON body and registered = true.
   ***************************************************************************************************************/
  router.post('/stationManagement/:filter', jsonParser, function (req, res) {
    if (!req.body) {
      //400 Bad Request
      return res.sendStatus(400);
    }

    if(req.body.delete === "true") {
      dbAPI.deleteStation(req.body.sId).then(function(ret) {
        res.redirect('/stationManagement/' + req.params.filter);
      });
    } else {
      //convert registered string to a boolean & new date before updating in tables
      req.body.registered = (req.body.registered === "true") ? true : false;
      req.body.updatedAt = new Date();
      dbAPI.modifyStation(req.body.sId, req.body).then(function (ret) {
        res.redirect('/stationManagement/' + req.params.filter);
      });
    }
  });

  return router;
}

var checkAuth = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
