/**
 * Created by florian on 9/15/16.
 */

'use strict';

var queueing = require('../lib/queueing.js');

describe('queueing', function() {

  it('test queue', function() {

    queueing.addToQueue('element');

    expect(queueing.getLength()).to.equal(1);
    expect(queueing.findInQueue('element')).to.equal(true);

  });

});