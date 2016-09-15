/* jshint node: true */

'use strict';

var http = require('http');
var payload2json = require('./payload2json');
var ui = require('./ui.js');
var queueing = require('./queueing.js');
var delivering = require('./delivering.js');

var server = http.createServer(function (request, response) {

  if (request.method === 'GET') {
    ui.routing(request, response);

  } else if (request.method === 'HEAD') {
    response.end();

  } else if (request.method === 'POST') {
    var isThisAGithubDelivery = (typeof(request.headers['x-github-event']) === 'string');

    if (isThisAGithubDelivery) {

      if (queueing.isFull()) {
        response.end('queue too long, aborting' + queueing.getQueueString());
      }

      delivering.newOrder(request, function(commands) {
        var index;
        for (index in commands) {
          if (queueing.findInQueue(commands[index]) === false) {
            console.log('addToQueue:' + commands[index][0] + ' ' + commands[index][1]);
            queueing.addToQueue(commands[index]);
          }
        }
      });

      if (!queueing.isRunning) {
        response.write('processsing');
      }
      else {
        response.write('a process is already running, this command will be delayed');
      }

      response.write('\n\nthis hook has been running ' + delivering.getLength() + ' times since launch');
      response.write('\n\nthere are ' + queueing.getLength() + ' items in queue');
      response.write('\n' + queueing.getQueueString());
      response.end();
    } else {
      response.end('This does not come from github');
    }
  } else {
    response.end('Unknown method ' + request.method);
  }
});

module.exports = server;
