var chai = require('chai');
var request = require('request');
var assert = chai.assert;
var expect = chai.expect;
var controllers = require('../database/controllers/dbm');
var db = require('../database/models');


// Test station
var stationData = {
	sId: '105',
	name: 'testing',
	description: 'testing',
	registered: true
}


describe('API TEST', function() {

	//Create Station for testing
	describe('createStation', function () {
	it('Create a station with given info', function (done) {
		controllers.createStation(stationData).then(function (results) {
				expect(results.result).to.equal(true);
				controllers.getStation(stationData.sId).then(station => {
					expect(station.sId).to.equal(stationData.sId);
					expect(station.name).to.equal(stationData.name);
					expect(station.description).to.equal(stationData.description);
					expect(station.registered).to.equal(stationData.registered);
					done();
				});
			});
		});
	});
	
	describe('/POST station-heartbeat', () => {
		it('should post if sID exist in request', (done) => {
			request.post({
				headers: {'sid': 1},
				url: 'http://localhost:3000/api/station-heartbeat'
			}, function(error, response, body) {
					expect(response.statusCode).to.equal(200);
					done();
			}); 
		}); 
		it('should post if sID exist in database', (done) => {
			request.post({
				headers: {'sid': stationData.sId},
				url: 'http://localhost:3000/api/station-heartbeat'
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(200);
				done();
			});
		});
		it('should not post if no sID is in request', (done) => {
			request.post({
				url: 'http://localhost:3000/api/station-heartbeat'
			}, function(error, response , body) {
				expect(response.statusCode).to.equal(403);
				done();
			});
		});
	});
	
	describe('deleteStation', function () {
		it('Should delete the station with given ID', function (done) {
			controllers.deleteStation(stationData.sId).then(function (result) {
				expect(result.result).to.equal(true);
				controllers.getStation(stationData.sId).then(function (result) {
					expect(result).to.equal(undefined);
					done();
				});
			});
		});
	});

});
