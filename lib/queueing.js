/**
 * Created by florian on 9/14/16.
 */

//var spawn = require('child_process').spawn;
var queueing = {};

queueing.queue = []; // array of tasks. Each task is an array of bash arguments
queueing.isRunning = false;
queueing.current = []; // chat command is currently running

/**
 * @returns {Number}
 */
queueing.getLength = function () {
  return queueing.queue.length;
};

/**
 * @returns {boolean}
 */
queueing.isFull = function () {
  return (queueing.getLength() > 16);
};

/**
 * @returns {string}
 */
queueing.getQueueString = function () {
  return queueing.queue.join(',');
};

/**
 * @param command
 * @returns {boolean}
 */
queueing.findInQueue = function (command) {
  for (var i = 0; i < queueing.queue.length; i++) {
    if (queueing.queue[i][0] === command[0] && queueing.queue[i][1] === command[1]) {
      return true;
    }
  }
  return false;
};

/**
 * @param command
 */
queueing.addToQueue = function (command) {
  queueing.queue.push(command);
  //queueing.run();
};

queueing.RemoveFirstToQueue = function () {
  return queueing.queue.shift();
};

queueing.run = function () {
  if (process.isAvailable()) {
    var p = process.run();
    process.onClosed(p);
  }
};


module.exports = queueing;