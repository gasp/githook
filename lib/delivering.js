/**
 * Created by florian on 9/15/16.
 */

var fs = require('fs');
var config;
try {
  fs.accessSync( __dirname + '/../config.local.json', fs.F_OK);
  config = require('./../config.local.json');
} catch (e) {
  config = require('./../config.json');
}
var getlocalrepositories = require('./getlocalrepositories');
var payload2json = require('./payload2json');
var delivering = {};

delivering.deliveries = [];
delivering.delivery = [];

delivering.newOrder = function (request, callback) {
  delivering.delivery = {
    id: request.headers['x-github-delivery'] || Math.floor(Math.random() * 1000)
  };

  payload2json(request, function (payload) {
    var folders = delivering.getFoldersDelivery(payload);

    var commands = [];
    for (var i = 0; i < folders.length; i++) {
      // folders[i].repo is bo, cache, front, website
      var command = [
        __dirname + '/../scripts/' + folders[i].repo + '.sh',
        folders[i].path
      ];
      commands.push(command);
    }

    delivering.addToDeliveries(delivering.delivery);
    callback(commands);
  });
};

delivering.addToDeliveries = function (deliveryToAdd) {
  delivering.deliveries.push(deliveryToAdd);
};

delivering.getLength = function () {
  return delivering.deliveries.length;
};

// make the delivery
// @param {object} payload parsed payload package
delivering.getFoldersDelivery = function (payload) {
  var delivery = delivering.delivery;
  var repository = '';
  var branch = '';
  var sender = '';
  var message = '[no head message]'; //push message
  try {
    // ref is the branch, in case of a merge, ref is the destination branch
    branch = payload.ref;
    repository = payload.repository.name;
    sender = payload.sender.login || payload.pusher.name || 'anonymous';
    if (payload.head_commit && payload.head_commit.message) {
      message = payload.head_commit.message.match(/^.*$/m)[0];
    }
  } catch (e) {
    console.log('payload not correctly parsed', payload);
    return false;
  }

  delivery.sender = sender;
  console.log('[%s] Delivering "%s" - by %s', (new Date().toString()), message, sender);

  var folders = getAffectedFolders(repository, branch);
  console.log('[%s] %d affected folders', (new Date().toString()), folders.length);
  return folders;
};

/**
 *  getAffectedFolders
 *  within a list of folders, pick the ones that have the same repository
 *  and the same branch, yet they should be updated
 *  @param plrepository {string} payload repository raw name (front-demo, module)
 *  @param plbranch {string} payload branch name (master, master-dev)
 *  @return {array of object}.path {string} path of the repository instance
 *  @return {array of object}.branch {string} name of the branch
 *  @return {array of object}.repository {string} long repo name (?)
 *  @return {array of object}.repo {string} short repo name
 */
function getAffectedFolders(plrepository, plhead) {
  var folders = [];
  // TODO: store this and do not access file system at each query
  // a timer would be a good idea, let's say 5 to 15 minutes
  var repositories = getlocalrepositories(config);

  for (var i = 0; i < repositories.length; i++) {
    if (repositories[i].repository === plrepository &&
      repositories[i].head === plhead) {
      folders.push(repositories[i]);
    }
  }
  return folders;
}

module.exports = delivering;
