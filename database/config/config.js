var config = require(__dirname + '/../../local_modules/config');

module.exports = {
  development: {
    username: config.get('Database', 'username'),
    password: config.get('Database', 'password'),
    database: config.get('Database', 'database'),
    host: config.get('Database', 'host'),
    port: config.get('Database', 'port'),
    dialect: config.get('Database', 'dialect'),
    logging: false
  }
};