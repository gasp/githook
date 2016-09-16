/**
 * Created by florian on 9/15/16.
 */

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

module.exports = process;