const mysql = require('mysql');

module.exports = function () {
  var config = require('./db_config');
  var pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
  });

 
  pool.on('acquire', function (connection) {
    console.log(`Connection ${connection.threadId} acquired`);
  });

  pool.on('enqueue', function () {
    console.log('Waiting for available connection slot');
  });

  pool.on('release', function (connection) {
    console.log(`Connection ${connection.threadId} released`);
  });

  return pool;
}();