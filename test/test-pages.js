var chai = require('chai');
var request = require('request');
var assert = chai.assert;
var expect = chai.expect;


describe('Page status', function () {
  describe('Main page', function() {
    it('status', function(done) {
      request('http://localhost:3000/', function(error, response, body) {
        if (error) { console.error(error); }
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('Admin login page', function() {
    it('status', function(done) {
      request('http://localhost:3000/adminLogin', function(error, response, body) {
        if (error) { console.error(error); }
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('Badge-in page', function() {
    it('status', function(done) {
      request('http://localhost:3000/badgein', function(error, response, body) {
        if (error) { console.error(error); }
        expect(response .statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('User registration page', function() {
    it('status', function(done) {
      request('http://localhost:3000/registration/00001', function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });
});