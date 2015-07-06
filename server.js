'use strict';

var sys = require('sys');
var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');

var running = false;
var iterator = 0;
var queue = [];
var port = 4004;
var version = '0.2.8';

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  if(req.method === 'HEAD') {
    res.end();
    return;
  }
  res.write('hook ' + version + '!\n');
  res.write('iterator: ' + iterator + '\n');
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

  var isThisAGithubDelivery = !(typeof(req.headers['x-github-event']) === 'undefined');
  if(!isThisAGithubDelivery) {
    res.end('This does not come from github');
    return;
  }

  if(queue.length > 16) {
    res.end('queue too long, aborting'  + queue.join(','));
    return;
  }
  payload2json(req, function (payload) {
    var repository = '';
    var branch = '';
    var env = ''; // env4, env9
    var mod = ''; // bo, cache, front, website
    try {
      branch = payload.ref;
      repository = payload.repository.name;
    } catch (e) {
      console.log('payload not correctly parsed')
    }

    switch (branch) {
      case 'refs/heads/dom':
        env = 'env4';
        break;
      case 'refs/heads/master-dev':
        env = 'env9';
        break;
      default:
    }

    switch (repository) {
      case 'client.videodesk.com':
        mod = 'bo';
        break;
      case 'module':
        mod = 'cache';
        break;
      case 'module-front':
        mod = 'front';
        break;
      case 'front-demo':
        mod = 'website';
        break;
      default:
    }
    if(env.length && mod.length) {
      addToQueue('scripts/' + env + '-' + mod + '.sh');
    }
  });

  if(!running) {
    res.write('processsing');
  }
  else {
    res.write('a process is already running, this command will be delayed');
  }

  res.write('\n\nthis hook has been running ' + iterator + ' times since launch');
  res.write('\n\nthere are ' + queue.length + ' items in queue');
  res.write('\n' + queue.join(','));
  res.end();
  iterator ++;
});

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

// getting the payload
// req @stream
// cb @function with an argument as json
function payload2json (req, cb) {
  var body = '';
  var json = {};
  req.addListener('error', function(e) {
    console.error('payload got a error', e);
    cb({});
  });

  req.addListener('data', function(chunk) {
    console.log('got a chunk');
    body += chunk;
  });

  req.addListener('end', function(chunk) {
    console.log('ended');
    if (chunk) {
      body += chunk;
    }
    try {
      json = JSON.parse(body);
    } catch (e) {
      console.error('payload got a error parsing', e);
    }
    cb(json);
  });
}

server.listen(port);
console.log('listening on '+ port);
