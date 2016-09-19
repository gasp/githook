/**
 * Created by florian on 9/14/16.
 */

var events = require('events');
var queueing = new events.EventEmitter();

queueing.list = []; // array of tasks. Each task is an array of bash arguments
queueing.maxSize = 16;

/**
 * @returns {Number}
 */
queueing.getLength = function () {
  return queueing.list.length;
};

/**
 * @returns {boolean}
 */
queueing.isFull = function () {
  return (queueing.getLength() > queueing.maxSize);
};

/**
 * @returns {string}
 */
queueing.getString = function () {
  return queueing.list.join(',');
};

/**
 * @param command
 * @returns {boolean}
 */
queueing.isFind = function (command) {
  for (var i = 0; i < queueing.list.length; i++) {
    if (queueing.list[i][0] === command[0] && queueing.list[i][1] === command[1]) {
      return true;
    }
  }
  return false;
};

/**
 * @param command
 */
queueing.enqueue = function (command) {
  queueing.list.push(command);
  queueing.emit('enqueue', command);
};

queueing.dequeue = function () {
  if (queueing.getLength() >= 1) {
    return queueing.list.shift();
  } else {
    return false;
  }
};

queueing.next = function () {
  var element = queueing.dequeue();
  if (element !== false) {
    queueing.emit('next', element);
    return element;
  } else {
    console.log('[%s]  >> 0 element in queue', (new Date().toString()));
    return false;
  }
};

queueing.clearList = function () {
  queueing.list = [];
};

module.exports = queueing;
