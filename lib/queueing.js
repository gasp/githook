/**
 * Created by florian on 9/14/16.
 */

var spawn = require('child_process').spawn;
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
  queueing.run();
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

/**
 * @returns {Array}
 */
queueing.getProcess = function () {
  return process.list;
};


process = {};

process.list = [];
process.numberMax = 2;

/**
 * @returns {Number}
 */
process.used = function () {
  return process.list.length;
};

/**
 * @returns {boolean}
 */
process.isAvailable = function () {
  return (process.used() < process.numberMax);
};

/**
 * @param child_process p
 */
process.add = function (p) {
  process.list.push(p);
};

/**
 * @param child_process p
 */
process.remove = function (p) {
  process.list.splice(process.list.indexOf(p), 1);
};

/**
 * @returns child_process p
 */
process.run = function () {
  var args = queueing.RemoveFirstToQueue();
  console.log(new Date().toString());
  console.log(' running ' + args[1] + ', ' + queueing.getLength() + ' in queue');
  var p = spawn('bash', args);
  process.add(p);
  queueing.isRunning = true;
  queueing.current = args;
  return p;
};

/**
 * @param child_process p
 */
process.onClosed = function (p) {
  process.on('close', function (code) {
    process.remove(p);
    console.log(new Date().toString());
    console.log('child process exited with code ' + code);
    if (queueing.getLength() > 0) {
      queueing.run();
    } else {
      queueing.isRunning = false;
      console.log('idle');
    }
  });
};

module.exports = queueing;