/* jshint node: true, jasmine: true */

'use strict';

var repository2folder = require('../lib/repository2folder');

describe('repository2folder', function() {
  var haystack = {
    'one': 'un',
    'two': 'deux',
    'three': 'trois'
  };
  it('finds a repo', function() {
    expect(repository2folder('deux', haystack)).toBe('two');
    expect(repository2folder('trois', haystack)).toBe('three');
  });
  it('throws an error when not found', function () {
    var hasError = false;
    try {
      repository2folder('quatre', haystack);
    } catch (e) {
      hasError = true;
    }
    expect(hasError).toBeTruthy();
  });
});
