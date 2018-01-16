//Bryan Mikkelson, 01/16/2018, LUCCA Project

/*
    This is a simple test to confirm that the Mocha/Chai framework
    are properly working.

    To run a test simply enter in the command line: npm test
 */

//Use the Chai version of assert instead of the node.js version
var chai = require('chai');
var assert = chai.assert;

//Describe function will simply title the test and then run an anonymous
//Function
describe('Hello', function () {
    //It function will descibe what the test does and then run the test
    it('Should return Hello', function(){
        var word = 'Hello';

        /*
            Here we check if word == Hello
                -if it does: our test will pass
                -if it doesn't: our test will fail and we will get a message
                                that reads: word should be hello
         */
        assert.equal(word, 'Hello', 'word should be Hello');
    });
});