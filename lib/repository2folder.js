/* jshint node: true */

'use strict';

// find folder within a repository
// needle and haystack design pattern
// @param {string} repository name
// @param {obj} repositories object
var repository2folder = function (repo, list) {
  var folder = false;
  for (var needle in list) {
    if (list.hasOwnProperty(needle)) {
      if (repo === list[needle]) {
        folder = needle;
      }
    }
  }

  if (!folder) throw 'unknown ' + repo;
  return folder;
};

module.exports = repository2folder;
