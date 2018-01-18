var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
});

router.get('/adminLogin', function(req, res) {
  var adminFilePath = path.resolve(__dirname, '..', 'views', 'adminLogin.html');
  res.sendFile(adminFilePath);
});


router.get('/badgein', function(req, res) {
  var UserSignInPath = path.resolve(__dirname, '..', 'views', 'UserSignIn.html');
  res.sendFile(UserSignInPath);
});

module.exports = router;
