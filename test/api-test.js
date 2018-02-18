var chai = require('chai');
var request = require('request');
var fs = require('fs');
var assert = chai.assert;
var expect = chai.expect;
var controllers = require('../database/controllers/dbm');
var db = require('../database/models');
var cert = fs.readFileSync('test/cert/certificate.pem')
  
var user = {
	"badge": '666',
	"first": "User",
	"last": "test",
	"email": "test@gmail.com",
	"phone": "(555)555-5555",
	"signature": "User Tester",
	"ecName": "Hardcore",
	"ecRel": "Father",
	"ecPhone": "(555)444-4444"
};
var admin = {
	"badge": '777',
	"first": "Admin",
	"last": "tester",
	"email": "admin@gmail.com",
	"phone": "(555)555-5555",
	"signature": "Admin Tester",
	"ecName": "Softcore",
	"ecRel": "Mom",
	"ecPhone": "(555)333-3333"
};
var testStation = {
	sId: '666',
	name: 'test station',
	description: 'machine for testing',
	registered: true,
	certCN: 'localhost'
};
var testStationOne = {
	sId: '777',
	name: 'test station One',
	description: 'Machine for test',
	registered: true,
	certCN: 'localhost'
};
		

describe('Connect to DB for testing', function () {
	describe('Connect to DB', function () {
		it('Should connect to the database', function (done) {
			db.sequelize
				.authenticate()
				.then(() => {
					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});

	// Create testing environment for user-access

	describe('createStation', function () {
    it('Create a station with given info', function (done) {
      controllers.createStation(testStation).then(function (results) {
        expect(results.result).to.equal(true);
        controllers.getStation(testStation.sId).then(station => {
          expect(station.sId).to.equal(testStation.sId);
          expect(station.name).to.equal(testStation.name);
          expect(station.description).to.equal(testStation.description);
          expect(station.registered).to.equal(testStation.registered);
          done();
        });
      });
		});
		it('Create a station one with given info', function (done) {
      controllers.createStation(testStationOne).then(function (results) {
        expect(results.result).to.equal(true);
        controllers.getStation(testStationOne.sId).then(station => {
          expect(station.sId).to.equal(testStationOne.sId);
          expect(station.name).to.equal(testStationOne.name);
          expect(station.description).to.equal(testStationOne.description);
          expect(station.registered).to.equal(testStationOne.registered);
          done();
        });
      });
		});
		it('Complete Data should create new User', function (done) {
			controllers.createUser(user).done(function (results) {
				expect(results.result).to.equal(true);
				done();
			});
		});
		it('Complete Data should create new User', function (done) {
			controllers.createUser(admin).done(function (results) {
				expect(results.result).to.equal(true);
				done();
			});
		});
		it('Should update admin to have admin status, return status true', function (done) {
			controllers.modifyUser(admin.badge, { 'status': 'Admin' }).done(function (results) {
				expect(results.result).to.equal(true);
				done();
			});
		});
		it('give privileges to user to test station one', function(done){
      controllers.grantPrivileges(user.badge, testStationOne.sId).then(results => {
        expect(results.result).to.equal(true);
        done();
      });
		});
		it('give privileges to admin test station', function(done){
      controllers.grantPrivileges(admin.badge, testStation.sId).then(results => {
        expect(results.result).to.equal(true);
        done();
      });
		});
		it('give privileges to admin test station one', function(done){
      controllers.grantPrivileges(admin.badge, testStationOne.sId).then(results => {
        expect(results.result).to.equal(true);
        done();
      });
    });
	});
		
	
	// Test user-access api
	describe('/POST station-heartbeat', function () {	
		it('should add user to cache', function(done) {
			request.post({url:'https://localhost:3000/api/user-access', ca:cert, headers:{'sid': testStation.sId,'badge': user.badge,'station-state': 'disabled'}}, 
				function(error, response, body){
					if (error) {console.error(error);}
					expect(response.statusCode).to.equal(200);
					done();
				}
			);	
		});
		it('shouldd grant user in cache access to machine', function(done) {
			request.post({url:'https://localhost:3000/api/user-access', ca:cert, headers:{'sid': testStation.sId, 'badge': admin.badge, 'station-state': 'disabled'}}, 
				function(error, response, body){
					if(error) {console.error(error);}
					expect(response.statusCode).to.equal(200);
					expect(response.headers).to.have.property('station-state', 'enabled');
					expect(response.headers).to.have.property('badge', user.badge);
					done();
				}
			);
		});
		it('should give admin access to machine', function (done) {
			request.post({url:'https://localhost:3000/api/user-access', ca:cert, headers:{'sid': testStation.sId, 'badge': admin.badge, 'station-state': 'disabled'}},
			 	function(error, response, body) {
					if (error) {console.error(error);}
					expect(response.statusCode).to.equal(200);
					expect(response.headers).to.have.property('station-state', 'enabled');
					done()
				}
			);
		});
		it('should log admin off of machine', function(done) {
			request.post({url:'https://localhost:3000/api/user-access', ca:cert, headers:{'sid': testStation.sId, 'badge': admin.badge, 'station-state': 'enabled'}}, 
				function(error, response, body) {
					if (error) {console.error(error);}
					expect(response.statusCode).to.equal(200);
					expect(response.headers).to.have.property('station-state', 'disabled');
					done();
				}
			);
		});
		it('should log user off of machine', function(done) {
			request.post({url:'https://localhost:3000/api/user-access', ca:cert, headers:{'sid': testStation.sId, 'badge': user.badge, 'station-state': 'enabled'}},
				function(error, response, body) {
					if (error) {console.error(error);}
					expect(response.statusCode).to.equal(200);
					expect(response.headers).to.have.property('station-state', 'disabled');
					done();
				}
			);
		});
		it('should log user on to machine', function(done) {
			request.post({url:'https://localhost:3000/api/user-access', ca:cert, headers:{'sid': testStationOne.sId,'badge': user.badge, 'station-state': 'disabled'}}, 
				function(error, response, body) {
					if (error) {console.error(error);}
					expect(response.statusCode).to.equal(200);
					expect(response.headers).to.have.property('station-state', 'enabled');
					done();
				}
			);
		});	
	});
	
	
	//Remove up user, admin, database, and database one
	describe('clean up', function () {
		it('Remove New User by id', function (done) {
			controllers.deleteUser(admin.badge).done(function (results) {
				expect(results).to.equal(true);
				done();
			});
		});	
		it('Remove New User by id', function (done) {
			controllers.deleteUser(user.badge).done(function (results) {
				expect(results).to.equal(true);
				done();
			});
		});
		it('Should delete the station with given ID', function (done) {
      controllers.deleteStation(testStation.sId).then(function (result) {
        expect(result.result).to.equal(true);
        controllers.getStation(testStation.sId).then(function (result) {
          expect(result).to.equal(undefined);
          done();
        });
      });
		});
		it('Should delete the station with given ID', function (done) {
      controllers.deleteStation(testStationOne.sId).then(function (result) {
        expect(result.result).to.equal(true);
        controllers.getStation(testStationOne.sId).then(function (result) {
          expect(result).to.equal(undefined);
          done();
        });
      });
		});
	});

});