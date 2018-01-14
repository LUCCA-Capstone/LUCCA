var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/adminLogin', function(req, res) {
  var path = require('path');
  var adminFilePath = path.resolve(__dirname, '..', 'views', 'adminLogin.html');
  res.sendFile(adminFilePath);
});

module.exports = router;
