var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var db = require('../database/controllers/dbm');

var validPassword = function (user_pass, password) {
  return bCrypt.compareSync(password, user_pass);
}

module.exports = new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'email',
  passwordField: 'password'
},
  function (req, username, password, done) {
    db.validateUser(username).then(function (user) {
      if (user === undefined) {
        req.flash('error', 'Email or password is incorrect');
        return done(null, false);
      }

      if (!validPassword(user.password, password)) {
        req.flash('error', 'Email or password is incorrect');
        return done(null, false);
      }

      return done(null, user);
    });
  }
);