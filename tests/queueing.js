/**
 * Created by florian on 9/15/16.
 */

var queueing = require('../lib/queueing.js');

describe('a queueing tests suite', function () {

  var element = ['script','folder'];
  queueing.addToQueue(element);

  it('has an element in queue', function () {
    expect(queueing.getLength()).toEqual(1);
  });

  it('is "element"', function () {
    expect(queueing.findInQueue(element)).toEqual(true);
  });

  it('is does not contains "element2"', function () {
    var element2 = ['script2', 'folder2'];
    expect(queueing.findInQueue(element2)).toEqual(false);
  });

  it('has an second element', function () {
    var element3 = ['script3', 'folder3'];
    queueing.addToQueue(element3);
    expect(queueing.getLength()).toEqual(2);
  });

  it('has an element remove', function () {
    queueing.RemoveFirstToQueue();
    expect(queueing.getLength()).toEqual(1);
  });

});