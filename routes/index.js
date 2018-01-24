var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('HomePage.njk');
});

router.get('/adminLogin', function(req, res) {
  res.render('adminLogin.njk');
});

router.get('/badgein', function(req, res) {
  res.render('badgein.njk');
});

router.get('/registration', function(req, res) {
  res.render('registration.njk');
});

module.exports = router;
