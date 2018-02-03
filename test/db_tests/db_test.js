var chai = require('chai');
var request = require('request');
var assert = chai.assert;
var expect = chai.expect;
var controllers = require('../../database/controllers/dbm');

var emptyData = {};

var incompleteData = {
    "badge": null,
    "first": "Rory",
    "last": "Eats",
    "email": "123@gmail.com",
    "phone": "(555)555-5555",
    "signature": "Rory Eats",
    "ecName": "Hello HowareU",
    "ecRel": "Father",
    "ecPhone": "(555)444-4444"
};

var trueData = {
    "badge": '9090909090',
    "first": "Rory",
    "last": "Eats",
    "email": "123@gmail.com",
    "phone": "(555)555-5555",
    "signature": "Rory Eats",
    "ecName": "Hello HowareU",
    "ecRel": "Father",
    "ecPhone": "(555)444-4444"
};

describe('DB TEST', function(){

    /*
    -------------createUser Tests-------------
    */
    describe('createUser Empty Dataset', function(){
       it('Empty JSON object Should Cause Fail', function(done){
           controllers.createUser(emptyData).done(function(results){
               expect(results.result).to.equal(false);
               done();
           });
       });
    });

    describe('createUser Incomplete Dataset', function(){
        it('Null Data Entry Should Cause Fail', function(done){
            controllers.createUser(incompleteData).done(function(results){
                expect(results.result).to.equal(false);
                done();
            });
        });
    });

    describe('createUser Complete Dataset', function(){
        it('Complete Data should create new User', function(done){
            controllers.createUser(trueData).done(function(results){
                expect(results.result).to.equal(true);
                done();
            });
        });
    });

    describe('validateUser with badge', function(){
      it('Return the userData object as specified by createUser input', function(done){
        controllers.validateUser(trueData['badge']).done(function(results){
          expect(results['badge']).to.equal(trueData['badge']);
          done();
        });
      });
    });

    describe('validateUser with email', function(){
      it('Return the userData object as specified by createUser input', function(done){
        controllers.validateUser(trueData['email']).done(function(results){
          expect(results['email']).to.equal(trueData['email']);
          done();
        });
      });
    });

    describe('validateUser no user exists', function(){
      it('Return undefined', function(done){
        controllers.validateUser('U DONT EXIST').done(function(results){
          expect(results).to.equal(undefined);
          done();
        });
      });
    });

    describe('createUser primary Key violation', function(){
        it('Same complete data should cause primary key fail', function(done){
            controllers.createUser(trueData).done(function(results){
                expect(results.result).to.equal(false);
                done();
            });
        });
    });

    describe('deleteUser', function(){
       it('Remove New User by id', function(done){
          controllers.deleteUser(trueData.badge).done(function(results){
             expect(results).to.equal(true);
             done();
          });
       });
    });

/*
    -------------getUsers Tests-------------
    --Note: Mocha did not like undefined variables being passed as arguments
    --Uncomment to see results.
*/

/*
var startDate;
var endDate;
    //Should return full list
    controllers.getUsers(startDate, endDate).done(function(results, err){
        console.log(results);
    });

    //Should Return False
    startDate = '2000-01-01';
    controllers.getUsers(startDate, endDate).done(function(results, err){
        console.log(results);
    });

    //Should Return empty
    endDate = '2000-01-02';
    controllers.getUsers(startDate, endDate).done(function(results, err){
        console.log(results);
    });

    //Should Return subset of data
    startDate = '2018-02-02'
    endDate = '2018-02-03';
    controllers.getUsers(startDate, endDate).done(function(results, err){
        console.log(results);
    });*/

    describe('modifyUser invalid badge id', function(){
        it('Should not update and return status false', function(done){
            controllers.modifyUser('fake badge id', {'password': 'fake'}).done(function(results){
                expect(results.result).to.equal(false);
                done();
            });
        });
    });

    describe('modifyUser + valid badge id + valid attribute field + null value', function(){
        it('Should not update table attribute cannot be null, return status false', function(done){
            controllers.modifyUser('1234567', {'first': null}).done(function(results){
                expect(results.result).to.equal(false);
                done();
            });
        });
    });

    describe('modifyUser + valid badge id + valid attribute field + null value', function(){
        it('Should update table attribute can be null, return status true', function(done){
            controllers.modifyUser('1234567', {'password': null}).done(function(results){
                expect(results.result).to.equal(true);
                done();
            });
        });
    });

    describe('modifyUser + valid badge id + valid attribute field + value', function(){
        it('Should update table attribute, return status true', function(done){
            controllers.modifyUser('1234567', {'password': 'fart'}).done(function(results){
                expect(results.result).to.equal(true);
                done();
            });
        });
    });
});