/**
 * Created by florian on 9/16/16.
 */


var queueing = require('./queueing.js');
var process = require('./process.js');

var scheduling = {};

scheduling.init = function () {

  queueing.on('enqueue', function () {
    queueing.next();
  });

  queueing.on('next', function (command) {
    if (command && process.isAvailable()) {
      var p = process.run(command, function (err, result) {
        queueing.next();
      });
      if (p !== false) {
        console.log(new Date().toString());
        console.log(' running ' + command[1] + ', ' + queueing.getLength() + ' in queue');
      } else {
        console.log("process can't start");
      }
    }
  });
};

module.exports = scheduling;
