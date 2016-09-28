/**
 * Created by florian on 9/16/16.
 */


var queueing = require('./queueing.js');
var process = require('./process.js');

var scheduling = {};

scheduling.init = function () {

  queueing.on('enqueue', function () {
    if (queueing.getLength() >= 1 && process.isAvailable()) {
      queueing.next();
    }
  });

  queueing.on('next', function (command) {
    if (command && process.isAvailable()) {
      var processing = process.isProcessingThisCommand(command);
      if (processing === false) {
        var p = process.run(command, function (err, result) {
          console.log('[%s]  >> Queue next', (new Date().toString()));
          queueing.next();
        });
        if (p !== false) {
          console.log('[%s] Running %s (pid:%d) ', (new Date().toString()), command[1], p.pid);
        } else {
          console.log("process can't start");
        }
      } else {
        processing.on('close', function () {
          scheduling.addCommandOnQueue(command);
        });
      }
    }
  });
};

scheduling.addCommandOnQueue = function (command) {
  if (!queueing.isFind(command)) {
    console.log('[' + (new Date().toString()) + '] AddToQueue:' + command[0] + ' ' + command[1]);
    queueing.enqueue(command);
  }
};

module.exports = scheduling;
