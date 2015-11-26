/* jshint node: true */

'use strict';

var fs = require('fs');
var path = require('path');

var getbranches = function (rootdir, folders, repositories, cb) {
  var repos = [];
  for (var i = 0; i < folders.length; i++) {
    if (isEnv(rootdir, folders[i], repositories)) {
      for (var repo in repositories) {
        if (repositories.hasOwnProperty(repo)) {
          var repoPath = path.join(rootdir, folders[i], repo);
          var head = fs.readFileSync(repoPath + '/.git/HEAD', {flag:'r'}).toString();
          var re = /([\w\-\.]+)$/gm;
          //var re = /ref\:\ refs\/heads\/([\w\-\.]+)/g;
          // var re = /ref\:\ refs\/(heads)\/(.*)\\n$/g;
          //var re = /ref\:\ refs\/heads\/([a-z0-9\\-]*)\\n$/gm;
          var branch = head.match(re);
          repos.push({
            path: repoPath,
            branch: branch[0]
          });
        }
      }
    }
  }
  cb(repos);
};


// check if the folder points to an env
// it should exist and contain bo, cache, front and website
// @return {bool}
var isEnv = function (rootdir, folder, repositories) {
  var repos = [];
  var envPath = path.join(rootdir, folder);
  var envStats = fs.statSync(envPath);
  if (!envStats.isDirectory()) {
    console.log(envPath + ' does not exist');
    return false;
  }

  for (var repo in repositories) {
    if (repositories.hasOwnProperty(repo)) {
      var repoPath = path.join(envPath, repo);
      var repoStats = fs.statSync(repoPath);
      if (!repoStats.isDirectory()) {
        console.log(repoPath + ' does not exist');
        return false;
      }
      if (!fs.existsSync(repoPath + '/.git/HEAD')) {
        console.log(repoPath + ' does not has git');
        return false;
      }
      return true;
    }
  }
  return false;
};

module.exports = getbranches;
