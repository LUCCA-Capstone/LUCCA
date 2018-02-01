var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var db = require('../database/controllers/dbm')

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

      if(password !== req.body.reenterpassword) {
        console.log('Passwords do not match in form');
        return done(null, false);
      }
      
      if (user.status === 'Admin') {
        console.log('Cannot register an existing admin or change their password')
        return done(null, false);
      }

      var newAdminCreds = {
        password: bCrypt.hashSync(password),
        status: 'Admin'
      }
      
      db.modifyUser(user.badge, newAdminCreds).then(function(result){
        db.validateUser(user.badge).then(function(newUser){
          return done(null, newUser);
        });
      });
    });
  }
);