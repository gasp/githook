/**
 * Created by florian on 9/15/16.
 */

// var sys = require('sys');
var fs = require('fs');
var logger = {};

logger.log = function (error, stdout, stderr) {
  // sys.puts(stdout);
  fs.appendFile('hook.log', stdout, function (err) {
    if (err) throw err;
  });
};

module.exports = logger;