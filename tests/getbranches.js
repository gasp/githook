/* jshint node: true, jasmine: true */

'use strict';

var getbranches = require('../lib/getbranches');
var folders = [
  'envlocal'
];
var repositories = {
  'bo': 'client.videodesk.com',
  'cache': 'module',
  'front': 'module-front',
  'website': 'front-demo'
};

describe('getbranches', function() {
  var generatedTree = null;
  getbranches('/Users/gaspard/VideoDesk/workplace/', folders, repositories, function (tree) {
    generatedTree = tree;
  });

  it('tests on my envllocal', function () {
    var result = [
      {
        path: '/Users/gaspard/VideoDesk/workplace/envlocal/bo',
        branch: 'release-1.8.2'
      },
      {
        path: '/Users/gaspard/VideoDesk/workplace/envlocal/cache',
        branch: ['master']
      },
      {
        path: '/Users/gaspard/VideoDesk/workplace/envlocal/front',
        branch: ['release-1.8.3']
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

  });
});
