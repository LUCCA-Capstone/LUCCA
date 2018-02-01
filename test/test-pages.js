var chai = require('chai');
var request = require('request');
var fs = require('fs');
var assert = chai.assert;
var expect = chai.expect;
var options = {
  baseUrl: 'https://localhost:3000',
  agentOptions: {
    ca: fs.readFileSync('test/cert/certificate.pem')
  }
};


describe('Page status', function () {
  describe('Main page', function() {
    it('status', function(done) {
      request.get('/',
        options,
        function(error, response, body) {
          if (error) { console.error(error); }
          expect(response.statusCode).to.equal(200);
          done();
        }
      );
    });
  });

  describe('Admin login page', function() {
    it('status', function(done) {
      request('/adminLogin',
        options,
        function(error, response, body) {
          if (error) { console.error(error); }
          expect(response.statusCode).to.equal(200);
          done();
        }
      );
    });
  });

  describe('Badge-in page', function() {
    it('status', function(done) {
      request('/badgein',
        options,
        function(error, response, body) {
          if (error) { console.error(error); }
          expect(response .statusCode).to.equal(200);
          done();
        }
      );
    });
  });

  describe('User registration page', function() {
    it('status', function(done) {
      request('/registration/00001', 
        options,
        function(error, response, body) {
          expect(response.statusCode).to.equal(200);
         done();
        }
      );
    });
  });
  describe('Badge-in Success page', function() {
    it('status', function(done) {
      request('/badgeinSuccess',
        options,
        function(error, response, body) {
        if (error) { console.error(error); }
        expect(response .statusCode).to.equal(200);
        done();
      });
    });
  });
  describe('User Management page', function() {
    it('status', function(done) {
      request('/userManagement',
        options,
        function(error, response, body) {
        if (error) { console.error(error); }
        expect(response .statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('Admin create new account', function() {
    it('status', function(done) {
      request('/adminRegister',
        options,
        function(error, response, body) {
        if (error) { console.error(error); }
        expect(response .statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('Admin reset account', function() {
    it('status', function(done) {
      request('/adminReset',
        options,
        function(error, response, body) {
        if (error) { console.error(error); }
        expect(response .statusCode).to.equal(200);
        done();
      });
    });
  });
});
