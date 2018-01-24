const Regs = require('../models').RegInfo;

module.exports = {
    selectAll(req, res) {
        return Regs.findAll()
            .then(users => res.status(200).send(users))
            .catch(error => res.status(400).send(error));
    },
}