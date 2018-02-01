var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var db = require('../database/controllers/dbm')

var validPassword = function(user_pass, password){
  return bCrypt.compareSync(password, user_pass);
}

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    db.validateUser(username).then(function(user){
      if(user === undefined){
        console.log('User not found, no log in for you');
        return done(null, false);
      }

      if(!validPassword(user.password, password)){
        console.log('Invalid password');
        return done(null, false);	
      }

      return done(null, user);
    });
  }
);