/* jshint node: true */

'use strict';

var sys = require('sys');
var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');

var payload2json = require('./lib/payload2json');
var getbranches = require('./lib/getbranches');
var repository2folder = require('./lib/repository2folder');
var config = require('./config');

var running = false;
var queue = [];
var version = '0.2.12';
var deliveries = [];

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  if(req.method === 'HEAD') {
    res.end();
    return;
  }
  res.write('hook ' + version + '!\n');
  res.write('deliveries: ' + deliveries.length + '\n');
  res.write('queue: ' + queue.length + '\n');
  res.write(req.method + ' ' + req.url + '\n');

  if(req.method === 'GET' && req.url === '/') {
    res.end('This service is used for github webhooks');
    return;
  }

  if(req.method !== 'POST') {
    res.end('Unknown method ' + req.method);
    return;
  }

  var isThisAGithubDelivery = (typeof(req.headers['x-github-event']) === 'string');
  if(!isThisAGithubDelivery) {
    res.end('This does not come from github');
    return;
  }

  if(queue.length > 16) {
    res.end('queue too long, aborting'  + queue.join(','));
    return;
  }

  var delivery = {
    id: req.headers['x-github-delivery'] || Math.floor(Math.random()*1000),
  };

  payload2json(req, function (payload) {
    deliver(delivery, payload);
  });

  if(!running) {
    res.write('processsing');
  }
  else {
    res.write('a process is already running, this command will be delayed');
  }

  res.write('\n\nthis hook has been running ' + deliveries.length + ' times since launch');
  res.write('\n\nthere are ' + queue.length + ' items in queue');
  res.write('\n' + queue.join(','));
  res.end();

  delivery.delayed = (running === true);
  deliveries.push(delivery);
});

// make the delivery
// @param {object} delivery (having an id)
// @param {object} payload parsed payload package
function deliver(delivery, payload) {
  var repository = '';
  var branch = '';
  var sender = '';
  var mod = ''; // bo, cache, front, website
  try {
    // ref is the branch
    // when it is a merge (or PR), the base_ref is what we need
    // otherwise base_ref is null
    branch = payload.base_ref || payload.ref;
    repository = payload.repository.name;
    sender = payload.sender.login;
  } catch (e) {
    console.log('payload not correctly parsed');
    return false;
  }

  delivery.sender = sender;

  var folders = getAffectedFolders(repository, branch);
  console.log(getAffectedFolders, folders);
  // queue for each folder
  for (var i = 0; i < folders.length; i++) {
     // folders[i].repo is bo, cache, front, website
    console.log('addToQueue:' + 'scripts/' + mod + '.sh ' + folders[i].path);
    addToQueue('scripts/' + folders[i].repo + '.sh ' + folders[i].path);
  }
}

// getAffectedFolders
// within a list of folders, pick the ones that have the same repository
// and the same branch, yet they should be updated
// @param repository {string}
// @param branch {string}
// @return {object}.path {string} path of the repository instance
// @return {object}.branch {string} name of the branch
// @return {object}.repository {string} long repo name (?)
// @return {object}.repo {string} short repo name
function getAffectedFolders(repository, branch) {
  var folders = [];
  for (var i = 0; i < config.folders.length; i++) {
    var env = config.root + '/' + config.folders[i];

    for (var repo in config.repositories) {
      if (config.repositories.hasOwnProperty(repo)) {

        if (getbranches(config) === branch) {
          console.log(getbranches(config), branch)
          folders.push({
            path: env + '/' + repo,
            branch: branch, // is this needed?
            repository: repository, // is this needed?
            repo: repo // cute name
          });
        }
      }
    }
  }
  return folders;
}

function log(error, stdout, stderr) {
  // sys.puts(stdout);
  fs.appendFile('hook.log', stdout, function (err) {
    if (err) throw err;
  });
}

function addToQueue(script) {
  queue.push(script);
  runWhenAvailable();
}

// run a task
function run() {
  if(queue.length < 1) {
    return false;
  }
  var argument = [];
  argument.push(queue.pop());
  console.log(new Date().toString());
  console.log(' running ' + argument[0] + ', ' + queue.length + ' in queue');
  var process = spawn('bash', argument);
  running = true;
  process.on('close', function (code) {
    console.log(new Date().toString());
    console.log('child process exited with code ' + code);
    running = false;
  });
}

function runWhenAvailable() {
  // a process is already running
  if(running) {
    // retry in 10 sec
    setTimeout(runWhenAvailable, 10000);
    return;
  }
  // queue is empty
  if(queue.length < 1) {
    console.log('idle');
    return;
  }
  run();
}

module.exports = server;
