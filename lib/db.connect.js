const mysql = require('mysql');

module.exports = function () {
  var config = require('./db.config');
  var pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true,
    connectionLimit: 150
  });

  return pool;
}();