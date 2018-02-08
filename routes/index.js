var express = require('express');
var router = express.Router();
var path = require('path');
var dbAPI = require('../database/controllers/dbm.js');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('HomePage.njk');
});

router.get('/adminLogin', function (req, res) {
  res.render('adminLogin.njk');
});

router.get('/badgein', function (req, res) {
  res.render('badgein.njk');
});

router.get('/registration/:badge', function (req, res) {
  res.render('registration.njk');
});

router.post('/registration/:badge', jsonParser, function (req, res) {
  if (!req.body) {
    //400 Bad Request
    return res.sendStatus(400);
  }

  //Add badge passed as query string into body of parsed JSON object
  req.body.badge = req.params.badge;

  //Add mailing list signup as boolean (i.e. true instead of "on")
  req.body.mailingList = (req.body.mailingList === undefined) ? false : true;

  /******************************************************************************
   * Should we add integrity checks here? (
   * e.g. the signature field must match the concatinated first name + last name
   *******************************************************************************/

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

      // popup message will apear here 
      res.redirect('/badgein');
    }

  });

});


router.get('/userManagement', function(req, res) {
  dbAPI.getUsers('2000-01-01', '3000-01-01').then(function(ret){
    // res.render('userManagement.njk', {obj: JSON.stringify(ret)});
    res.render('userManagement.njk', {obj: ret});
  })
});

router.post('/userManagement', function(req, res) {
  dbAPI.validateUser(req.body.userInput).then(function(ret){
    console.log(ret.dataValues);
    res.render('userManagement.njk', {obj: [ret.dataValues]});
  })
});



module.exports = router;
