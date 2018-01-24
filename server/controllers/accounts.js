const Acc = require('../models').Accounts;

module.exports = {
    selectAll(req, res) {
        return Acc.findAll()
            .then(accounts => res.status(200).send(accounts))
    .catch(error => res.status(400).send(error));
    },

    /*logIn(req, res){
      return Acc.findOne({
          where: {email: req.body.email}
      }).then(admin => res.status(200).send(admin.email))
        .catch(error => res.status(400).send(error));
    },*/
}