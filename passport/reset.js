var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var db = require('../database/controllers/dbm')

var validPassword = function(user_pass, password){
  return bCrypt.compareSync(password, user_pass);
}

module.exports = new LocalStrategy({ 
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'password'
  },
  function(req, username, password, done) {
    db.validateUser(username).then(function(user){
      if(user === undefined){
        console.log('User does not already exist, error in registration');
        return done(null, false);
      } 
      
      if (!validPassword(user.password, password)) {
        console.log('Password provided does not match one in database');
        return done(null, false);
      }

      if (user.status !== 'Admin') {
        console.log('Can only reset account which are already admin!')
        return done(null, false);
      }

      var newAdminCreds = {
        password: bCrypt.hashSync(req.body.newPassword),
      }
      
      db.modifyUser(user.badge, newAdminCreds).then(function(result){
        db.validateUser(user.badge).then(function(newUser){
          return done(null, newUser);
        });
      });
    });
  }
);