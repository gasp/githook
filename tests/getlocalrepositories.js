/* jshint node: true, jasmine: true */

'use strict';

var getlocalrepositories = require('../lib/getlocalrepositories');
var fakeConfig = {
  root: '/Users/gaspard/VideoDesk/workplace/',
  environments: [
    'envlocal'
  ],
  repositories: {
    'bo': 'client.videodesk.com',
    'cache': 'module',
    'front': 'module-front',
    'website': 'front-demo'
  }
};

describe('getlocalrepositories', function() {
  var generatedTree = getlocalrepositories(fakeConfig);

  it('tests on my envlocal', function () {
    var result = [
      {
        path: '/Users/gaspard/VideoDesk/workplace/envlocal/bo',
        branch: 'whatever'
      },
      {
        path: '/Users/gaspard/VideoDesk/workplace/envlocal/cache',
        branch: 'whatever'
      },
      {
        path: '/Users/gaspard/VideoDesk/workplace/envlocal/front',
        branch: 'whatever'
      },
      {
        path: '/Users/gaspard/VideoDesk/workplace/envlocal/website',
        branch: 'master'
      }
    ];
    expect(generatedTree[0].path).toEqual(result[0].path);
    expect(generatedTree[1].path).toEqual(result[1].path);
    expect(generatedTree[2].path).toEqual(result[2].path);
    expect(generatedTree[3].path).toEqual(result[3].path);
    expect(generatedTree[3].branch).toEqual(result[3].branch);
    expect(generatedTree[1].branch).not.toEqual(result[1].branch);
  });
});
