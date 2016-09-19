/**
 * Created by florian on 9/15/16.
 */

var spawn = require('child_process').spawn;
var process = {};

process.list = [];
process.numberMax = 2;

/**
 * @param child_process p
 */
var add = function (p) {
  process.list.push(p);
};

/**
 * @param child_process p
 */
var remove = function (p) {
  process.list.splice(process.list.indexOf(p), 1);
};

/**
 * @returns {Number}
 */
process.numberCurrent = function () {
  return process.list.length;
};

/**
 * @returns {boolean}
 */
process.isAvailable = function () {
  return (process.numberCurrent() < process.numberMax);
};

/**
 * @param command
 * @param callback
 *
 * @returns child_process p | false
 * @callback err, (apparently dead) child_process p
 */
process.run = function (command, callback) {
  if(process.isAvailable()) {
    var p = spawn('bash', command);
    add(p);

    p.on('close', function (code) {
      remove(p);

      // console.log(new Date().toString());
      // console.log('child process exited with code ' + code);

      if (code !== 0) {
        // prévoir des callback avec un message d'erreur
      }

      callback(code, p);
    });
    return p;
  }
  else {
    return false;
  }
};

module.exports = process;