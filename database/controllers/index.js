const dbm = require('./dbm');

module.exports = {
    dbm,
};


/*

//Mock JSON object with User + Registration info.
//To test that proper creation works.
var tempD = {
    "badge": '1010101010',
    "firstName": "We are Real",
    "lastName": "But We are Also fake",
    "status": "User",
    "email": "eeeetssssss@know.com",
    "signature": "this is a signature",
    "date": "01-04-2000",
    "phone": "(555)1234-5555",
    "ecName": "dude",
    "ecRelation": "Yo",
    "ecPhone": "(313)123-4220"
}

//This is just a simple test to create a user.
//The .done() call is used to wait for the DB interaction to finish before
// executing the if statement.
dbm.createUser(tempD).done(function(test){
   if(test.result) {
       //dbm.deleteUser(tempD.badge).done();  --Uncomment if you want to delete user after creation
       console.log(test.detail);
   }
   else
       console.log(test.detail);
   process.exit();
});

*/
