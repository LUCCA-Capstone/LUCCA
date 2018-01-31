//Bryan Mikkelson, 01-28-2018, LUCCA Project
//Updated - 01-30-2018
const user = require('../models').user;
const db = require('../models');

/*
    This module will store all the methods for accessing/updating/removing
    user data in the database.
 */
module.exports = {

    //Usage: Returns Error Type as String Definitions
    //Arguments:
    //          err - The error that caused the issue
    //          rs  - JSON return object
    //Exceptions: None
    //Descriptions: Multiple Errors can occur when talking
    // to a DB.  This Function will return which type of
    // error it was so the error can be properly logged.
    errorHandling(err, rs){
        if(err instanceof db.sequelize.ConnectionError){
         rs.result = false;
         rs.detail = 'Connection Error';
        }else if(err instanceof db.sequelize.DatabaseError){
            rs.result = false;
            rs.detail = 'Database Error';
        }else if(err instanceof db.sequelize.QueryError){
            rs.result = false;
            rs.detail = 'Query Error';
        }else if(err instanceof db.sequelize.ValidationError){
            rs.result = false;
            rs.detail = 'Validation Error';
        }else{
            rs.result = false;
            rs.detail = err;
        }

        return rs;
    },

    //Usage: Returns User data from X-date to Y-date
    //Arguments:
    //          from - Start Date
    //          to   - End Date
    //Exceptions:  ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will return all User data from
    // the given start date to the given end date.  If start date
    // is undefined then all users will be returned.
    getUsers(from, to){
        if(from === undefined && to === undefined){
            //Return all results
            return user.findAll({
                raw: true
            }).then(users =>{
                return users;
        }).catch(err =>{
                return false;
        });
        }else{
            var start = '\'' + from + '%\'';  //Date format should be year-month-day (ex. 2000-01-01)
            var stop = '\'' + to + '%\'';     //Date format should be year-month-day (ex. 2000-01-01)

            //Return only results between start date and stop date.
            return db.sequelize.query("SELECT * FROM \"public\".\"users\"" +
                " where \"public\".\"users\".\"createdAt\" between " +
                start + " AND " + stop, {raw: true}
            ).then(results => {
                //Strips out all unneeded information that is returned
                //from the query above and only keeps the user data
                var resultsJson = results[0];
            return resultsJson;

        }).catch(err => {
            return false;
        });
        }
    },

    //Usage: Add a new User to the DB
    //Arguments:
    //         userData - JSON object storing all user data.
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will take as argument a JSON object
    // with all required user data and then store that data in a backend DB.
    createUser(userData){
      var returnStatus = {result: true, detail: 'Success'};

      return user.create({
          badge: userData.badge,               //badge#
          first: userData.firstName,           //first name
          last: userData.lastName,             //last name
          email: userData.email,               //email
          phone: userData.phone,               //users phone #
          signature: userData.signature,       //users signature
          ecSignature: userData.ecSignature,   //emergency contact signature
          ecName: userData.ecName,             //emergency contact name
          ecRel: userData.ecRelation,          //emergency contact relation
          ecPhone: userData.ecPhone,           //emergency contact phone #
          mailingList: userData.mls,           //mailing list sign-up
          createdAt: new Date(),               //date user was added to the DB
          updatedAt: new Date()                //most recent update to users profile
      }).then(function(){
          //New User added Successfully
          return returnStatus;
      }).catch(err => {
          //An Error occured when trying to add a new user
          return module.exports.errorHandling(err, returnStatus);
      });
    },

    //Usage: Modifies a user's data in the DB
    //Arguments:
    //          bId - User's badge id to identify User
    //          userData - Attribute(s) to be modified
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will first query the DB to find
    // the user based off their badge id.  It will then update
    // all attributes in the DB from the attributes from the userData
    // argument.
    modifyUser(bId, userData){
        return true;
    },

    //Usage: Determines if a User can or cannot use a station
    //Arguments:
    //          sId - Station Id or undefined
    //          uId - User's identification (badge or email)
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will tell the user-access API
    // whether or not a user has access to use a machine or not.
    validateUser(sId, uId){
      return true;
    },

    //Usage: Remove a user from the DB
    //Arguments:
    //         bId - User's badge id.
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will take a user's badge id
    // and then completely remove them from the database except for
    // and logs with their badge id.
    //
    //NOTE:  This Method is still incomplete!  Only Use
    //       for testing purposes.
    deleteUser(bId){
        return user.destroy({
            where: {
                badge: bId
            }
        }).then(function(){
            return true;
        }).catch(err =>{
            return false;
        });
    },

    //Usage:  Return's a JSON Object of all stations a user has access to.
    //Arguments:
    //          bId - The badge id for the user
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Descriptions:  This function will take a user's badge # and return
    // a JSON object with all the stations the user has been trained on and
    // can use.
    getPrivileges(bId){
        return true;
    },

    //Usage:  Update's a users account to grant access to a station
    //Arguments:
    //         bId -  The badge id for the user
    //         sId -  The station id
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will update a user's
    // station privileges to 'trained'
    grantPrivileges(bId, sId){
      return true;
    },

    //Usage:  Update's a users account to remove access to a station
    //Arguments:
    //         bId -  The badge id for the user
    //         sId -  The station id
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will update a user's
    // station privileges to 'untrained'
    removePrivileges(bId, sId){
        return true;
    },

    //Usage: Returns a list of registered or unregistered stations
    //Arguments:
    //         registered - True value indicates to return registered stations
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function returns a JSON object of all stations.
    // If the registered value is true then only the registered stations are returned.
    // Otherwise, it only returns unregistered stations.
    getStations(registered){
        return true;
    },

    //Usage:  Add's a new station to the DB
    //Arguments:
    //         stationData - A JSON object with all station data
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will take a station data JSON object
    // and add the new station to the database.
    createStation(stationData){
        return true;
    },

    //Usage:  Modifies the data of a station in the database
    //Arguments:
    //         sId - Station id used to identify which station to modify
    //         stationData -  New data to be added/updated
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will modify all values passed in the stationData
    // argument for the matching station id.
    modifyStation(sId, stationData){
      return true;
    },

    //Usage:  Removes a stations from the database
    //Arguments:
    //          sId - Station id used to identify which station to remove
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will remove any instance of the station in the
    // DB based off the passed in station id argument.
    deleteStation(sId){
        return true;
    },

    //Usage:  Log's all database related events.
    //Arguments:
    //         eventClass - Event Identifier (badge in, badge out, ...)
    //         event      - Stringed description of the event
    //         date       - Date in which the event occurred.
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will record all interactivity between
    // the users and the database.  As well as all errors that occurred.
    logEvent(eventClass, event, date){
        return true;
    },

    //Usage:  Returns All, or some, events.
    //Arguments:
    //         eventClass - Event Identifier (badge in, badge out, ...)
    //         from       - Starting date
    //         to         - Ending date
    //Exceptions: ConnectionError, DatabaseError, QueryError,
    // ValidationError, Other
    //Description:  This function will return a JSON object with all the events
    // that match the eventClass argument.
    // Additionally, this function will allow for requesting events
    // during a specific date range.  If both from and to are left undefined then all
    // results are returned.
    getEvent(eventClass, from, to){
        return true;
    },
}