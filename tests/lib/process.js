/**
 * Created by florian on 9/16/16.
 */

var process = require('../../lib/process.js');

describe('a \'process\' tests suite', function () {

  it('is initial value', function () {
    expect(process.list).toEqual([]);
    expect(process.numberMax).toEqual(2);
  });

  it('is number of process at start', function () {
    expect(process.numberCurrent()).toEqual(0);
  });

  it('is availability of process', function () {
    expect(process.isAvailable()).toEqual(true);
  });

  it('is run process', function (done) {
    var command = ['./tests/lib/sleep.sh', __dirname];
    var pended = 0;
    var callback = function (err, p) {
      // console.log(p.pid);
      pended++;
      if (pended > 1) {
        expect(process.numberCurrent()).toEqual(0);
        done();
      }
    };
    var p = process.run(command, callback);
    // p.stdout.on('data', function (data) {
    //   console.log('stdout', data.toString());
    // });
    //
    // p.stderr.on('data', function (data) {
    //   console.log('stderr', data.toString());
    // });
    expect(process.numberCurrent()).toEqual(1);

    process.run(command, callback);
    expect(process.numberCurrent()).toEqual(2);
  });

  it('is run max process', function (done) {
    var command = ['./tests/lib/sleep.sh', __dirname];
    var callback = function (err, p) {};

    process.run(command, callback);
    expect(process.numberCurrent()).toEqual(1);

    process.run(command, callback);
    expect(process.numberCurrent()).toEqual(2);

    process.run(command, callback);
    expect(process.numberCurrent()).toEqual(2);

    process.run(command, callback);
    expect(process.numberCurrent()).toEqual(2);

    setTimeout(function() {
      // wait end process
      expect(process.numberCurrent()).toEqual(0);
      done();
    }, 3000);
  });

  it('is run other process after some time', function (done) {
    var command = ['./tests/lib/sleep.sh', __dirname];
    var callback = function (err, p) {};

    process.run(command, callback);
    expect(process.numberCurrent()).toEqual(1);

    process.run(command, callback);
    expect(process.numberCurrent()).toEqual(2);

    process.run(command, callback);
    expect(process.numberCurrent()).toEqual(2);

    process.run(command, callback);
    expect(process.numberCurrent()).toEqual(2);

    setTimeout(function() {
      expect(process.numberCurrent()).toEqual(0);

      process.run(command, callback);
      expect(process.numberCurrent()).toEqual(1);

      setTimeout(function() {
        process.run(command, callback);
        expect(process.numberCurrent()).toEqual(2);

        setTimeout(function() {
          expect(process.numberCurrent()).toEqual(1);

          setTimeout(function() {
            done();
          }, 3000);
        }, 1200);
      }, 1000);
    }, 3000);
  }, 15000);

  it('is run process with buggy command', function (done) {
    var command = ['./tests/lib/buggy.sh', __dirname];
    var callback = function (code, p) {
      // console.log(p.pid);
      // console.log(code);
      expect(code).not.toEqual(0);
      if (code !== 0) {
        expect(process.numberCurrent()).toEqual(0);
        done();
      }
    };
    var p = process.run(command, callback);
    expect(process.numberCurrent()).toEqual(1);

    // p.stderr.on('data', function (data) {
    //   console.log('stderr', data.toString());
    // });

  });

});