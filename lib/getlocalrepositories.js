/* jshint node: true */

'use strict';

var fs = require('fs');
var path = require('path');

// get branches
// @param config {obj}
//  rootidr {string} root dir
//  environments  {array of strings} environments folders
//  repositories  {associative array of strings} bo => client.videodesk.com
// @return {array}
//  path {string} local repository full path
//  branch {string} which branch the repo is on

var getlocalrepositories = function (config) {
  var rootdir = config.root;
  var environments = config.environments;
  var repositories = config.repositories;
  var localrepositories = [];
  for (var i = 0; i < environments.length; i++) {
    if (isEnv(rootdir, environments[i], repositories)) {
      for (var repo in repositories) {
        if (repositories.hasOwnProperty(repo)) {
          var repoPath = path.join(rootdir, environments[i], repo);
          // FIXME if there is no repo in this path, ignore it.
          var isRepo = false;
          try {
            var dotgit = fs.statSync(repoPath + '/.git/');
            if (dotgit.isDirectory()) {
              isRepo = true;
            }
          } catch (e) {
            console.log('git error: %s is not a git repository', repoPath);
          }
          if (!isRepo) {
            break;
          }
          var head = fs.readFileSync(repoPath + '/.git/HEAD', {flag:'r'}).toString();
          var re = /([\w\-\.]+)$/gm;
          //var re = /ref\:\ refs\/heads\/([\w\-\.]+)/g;
          // var re = /ref\:\ refs\/(heads)\/(.*)\\n$/g;
          //var re = /ref\:\ refs\/heads\/([a-z0-9\\-]*)\\n$/gm;
          // fixme: wrong regex: put away 'feature/' in branch feature/1234
          var branch = head.match(re);
          localrepositories.push({
            path: repoPath,
            branch: branch[0],
            repo: repo, // cute name like bo
            repository: repositories[repo] // ugly name like client.videodesk.com
          });
        }
      }
    }
  }
  // FIXME this is just a debug
  for (i = 0; i < localrepositories.length; i++) {
    console.log(localrepositories[i].path, localrepositories[i].branch);
  }

  return localrepositories;
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

module.exports = getlocalrepositories;
