var express = require('express');
var config = require('./local_modules/config');
var router = express.Router({
});

var api = require('./routes/api');

var app = express();

app.use('/api', api);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('');
});

module.exports = app;
