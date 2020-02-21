const pool = require('./db_connect');

module.exports = function () {
  return {
    select: function(query, callback){
      pool.query(query, list, function (err, result) {
        if (err) return callback(err);
        return callback(null, result);
      });
    },
    select: function(query, list, callback){
      pool.query(query, list, function (err, result) {
        if (err) return callback(err);
        return callback(null, result);
      });
    },
    pool: pool
  }
};