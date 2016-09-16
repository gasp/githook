/**
 * Created by florian on 9/15/16.
 */

var queueing = require('../../lib/queueing.js');
var sinon = require('sinon');

describe('a queueing tests suite', function () {

  var element = ['script', 'folder'];
  queueing.enqueue(element);

  it('has an element in queue', function () {
    expect(queueing.getLength()).toEqual(1);
  });

  it('is this element', function () {
    expect(queueing.isFind(element)).toEqual(true);
  });

  it('is the queue\'s string version', function () {
    expect(queueing.getString()).toEqual('script,folder');
  });

  it('is does not contains this element', function () {
    var element2 = ['script2', 'folder2'];
    expect(queueing.isFind(element2)).toEqual(false);
  });

  it('has a second element', function () {
    queueing.enqueue(['script3', 'folder3']);
    expect(queueing.getLength()).toEqual(2);
  });

  it('is the first element of the queue', function () {
    expect(queueing.dequeue()).toEqual(element);
  });

  it('lost the element getted', function () {
    expect(queueing.getLength()).toEqual(1);
  });

  it('is not full', function () {
    expect(queueing.isFull()).toEqual(false);
  });

  it('is full', function () {
    var el;
    for (var i = 0; i <= queueing.maxSize; i++) {
      el = ['script' + i, 'folder' + i];
      queueing.enqueue(el);
    }
    expect(queueing.isFull()).toEqual(true);
  });

  it('is empty', function () {
    queueing.clearList();
    expect(queueing.getLength()).toEqual(0);
  });

  it('is the next element', function () {
    var e = ['script-e', 'folder-e'];
    queueing.enqueue(e);
    var el = queueing.next();
    expect(el).toEqual(e);
  });

  it('is an event when enqueue', function () {
    var spy = sinon.spy();
    queueing.on('enqueue', spy);

    var el = ['script-e', 'folder-e'];
    queueing.enqueue(el);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, el);
  });

  it('is an event when next method call', function () {
    queueing.clearList();
    var el = ['script-e', 'folder-e'];
    queueing.enqueue(el);

    var spy = sinon.spy();
    queueing.on('next', spy);

    queueing.next();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, el);
  });

  it('is nothing in queue', function () {
    var el = queueing.dequeue();
    expect(el).toEqual(false);
  });

});