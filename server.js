/* jshint node: true */

'use strict';

var sys = require('sys');
var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');

var payload2json = require('./lib/payload2json');
var getlocalrepositories = require('./lib/getlocalrepositories');
var repository2folder = require('./lib/repository2folder');
var config = require('./config');

var running = false;
// array of tasks. Each task is an array of bash arguments
var queue = [];
var version = require('./package').version;
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
  for (var i = 0; i < queue.length; i++) {
    // regex from http://stackoverflow.com/questions/1818310/regular-expression-to-remove-a-files-extension
    var script = queue[i][0].match(/([^:\\/]*?)(?:\.([^ :\\/.]*))?$/i)[1];
    var env = queue[i][1].split('/')[queue[i][1].split('/').length -2];
    res.write(i + ': ' + script + ' on ' + env +'\n');
  }

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
  var message = '[no head message]'; //push message
  try {
    // ref is the branch
    // when it is a merge (or PR), the base_ref is what we need
    // otherwise base_ref is null
    branch = payload.base_ref || payload.ref;
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
  console.log('delivering "%s" - by %s', message, sender);

  var folders = getAffectedFolders(repository, branch);
  console.log('%d affected folders', folders.length);
  // queue for each folder
  for (var i = 0; i < folders.length; i++) {
     // folders[i].repo is bo, cache, front, website
    console.log('addToQueue:' + 'scripts/' + folders[i].repo + '.sh ' + folders[i].path);
    addToQueue([
      __dirname + '/scripts/' + folders[i].repo + '.sh',
      folders[i].path
    ]);
  }
}

// getAffectedFolders
// within a list of folders, pick the ones that have the same repository
// and the same branch, yet they should be updated
// @param plrepository {string} payload repository raw name (front-demo, module)
// @param plbranch {string} payload branch name (master, master-dev)
// @return {array of object}.path {string} path of the repository instance
// @return {array of object}.branch {string} name of the branch
// @return {array of object}.repository {string} long repo name (?)
// @return {array of object}.repo {string} short repo name
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
  var args = queue.shift();
  console.log(new Date().toString());
  console.log(' running ' + args[1] + ', ' + queue.length + ' in queue');
  var process = spawn('bash', args);
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
