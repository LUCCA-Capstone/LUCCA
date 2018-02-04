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
*/


var startDate;
var endDate;

    describe('getUser + two undefined dates', function(){
        it('Should return full set of users', function(done){
            controllers.getUsers(startDate, endDate).done(function(results){
                //console.log(results);
                expect(results).to.have.length.above(1);
                //expect(results.result).to.equal(true);
                done();
                startDate = '2000-01-01';
            });
        });
    });

    describe('getUser + one undefined date', function(){
        it('Should return false', function(done){
            controllers.getUsers(startDate, endDate).done(function(results){
                expect(results).to.equal(false);
                done();
                endDate = '2000-01-02'
            });
        });
    });

    describe('getUser + two dates + out of range', function(){
        it('Should return empty set of data', function(done){
            controllers.getUsers(startDate, endDate).done(function(results){
                expect(results).to.have.length(0);
                done();
                startDate = '2018-02-02';
                endDate = '3000-02-04';
            });
        });
    });

    describe('getUser + two dates + in range', function(){
        it('Should return subset of data', function(done){
            controllers.getUsers(startDate, endDate).done(function(results){
                expect(results).to.have.length.above(0);
                done();
            });
        });
    });

/*
    -------------getUsers Tests-------------
*/

    //Should return full list of stations - both registered and unregistered
    describe('GetStations: ALL', function(){
        it('Return all stations (currently 6)', function(done){
        controllers.getStations().then(function(results){
            expect(results).to.have.length.above(3);
            done();
            });
        });
    });

    //Should return list of registered stations only
    describe('GetStations: true', function(){
        it('Return REGISTERED stations (currently 3)', function(done){
        controllers.getStations(true).then(function(results){
            expect(results).to.have.length.above(1);
            done();
            });
        });
    });

    //Should return list of registered stations only
    describe('GetStations: specific (registered)', function(){
        it('Verify a station known to be registered is returned ("WOOOOOO")', function(done){
        controllers.getStations(true).then(function(results){
            var containsWOOOOOO = false;
            //look for the name of a station that is known to be registered 
            results.forEach(element => {
                if (element.name === "WOOOOOO") {
                    containsWOOOOOO = true;
                };
            });
            expect(containsWOOOOOO).to.equal(true);
            done();
            });
        });
    });

    //Should return only stations that are NOT registered
    describe('GetStations: false', function(){
        it('Return UNREGISTERED stations (currently 3)', function(done){
        controllers.getStations(false).then(function(results){
            expect(results).to.have.length.above(1);
            done();
            });
        });
    });

    //Should return list of registered stations only
    describe('GetStations: specific (unregistered)', function(){
        it('Verify a station known to be UNREGISTERED is returned ("Hacksaw")', function(done){
        controllers.getStations(false).then(function(results){
            var containsHacksaw = false;
            //look for the name of a station that is known to be registered 
            results.forEach(element => {
                if (element.name === "Hacksaw") {
                    containsHacksaw = true;
                };
            });
            expect(containsHacksaw).to.equal(true);
            done();
            });
        });
    });

/*
     -------------Note-------------
     Please Write any new tests above the modifyUser Tests
     as the last modifyUser test calls the process.exit() command
     to close DB connection.

     Thanks!
 */

/*
    -------------modifyUser Tests-------------
*/

    describe('modifyUser invalid badge id', function(){
        it('Should not update and return status false', function(done){
            controllers.modifyUser('fake badge id', {'password': 'fake'}).done(function(results){
                expect(results.result).to.equal(false);
                done();
            });
        });
    });

    describe('modifyUser + valid badge id + valid attribute field + null value', function(){
        it('Should not update table.  Desired update attribute cannot be null.  Return status false', function(done){
            controllers.modifyUser('1234567', {'first': null}).done(function(results){
                expect(results.result).to.equal(false);
                done();
            });
        });
    });

    describe('modifyUser + valid badge id + valid attribute field + null value', function(){
        it('Should update table.  Desired attribute can be null.  Return status true', function(done){
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

    describe('modifyUser + valid badge id + invalid attribute field', function(){
        it('Should not update table attribute.  Return status true', function(done){
            controllers.modifyUser('1234567', {'passowrd': 'lalala'}).done(function(results){
                expect(results.result).to.equal(true);
                done();
                process.exit();
            });
        });
    });
});