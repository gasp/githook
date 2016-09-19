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

    // p.stdout.on('data', function (data) {
    //   console.log('stdout (' + p.pid + '): ', data.toString());
    // });
    // p.stderr.on('data', function (data) {
    //   console.log('stderr (' + p.pid + '): ', data.toString());
    // });

    p.on('close', function (code) {
      remove(p);

      console.log('[%s] Child Process closed with code %d (pid:%d) ', (new Date().toString()), code, p.pid);

      if (code !== 0) {
        // prévoir des callback avec un message d'erreur
      }

      callback(code, p);
    });

    p.on('disconnect', function () {
      console.log('[%s] Child Process disconnected (pid:%d) ', (new Date().toString()), p.pid);
    });
    p.on('error', function () {
      console.log('[%s] Child Process error (pid:%d) ', (new Date().toString()), p.pid);
    });
    p.on('message', function () {
      console.log('[%s] Child Process message (pid:%d) ', (new Date().toString()), p.pid);
    });
    return p;
  }
  else {
    console.log(' Process busy');
    return false;
  }
};

module.exports = process;