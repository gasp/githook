/* jshint node: true */

'use strict';

var http = require('http');
var ui = require('./ui.js');
var queueing = require('./queueing.js');
var process = require('./process.js');
var delivering = require('./delivering.js');
var scheduling = require('./scheduling');

var server = http.createServer(function (request, response) {

  if (request.method === 'GET') {
    ui.routing(request, response);

  } else if (request.method === 'HEAD') {
    response.end();

  } else if (request.method === 'POST') {
    var isThisAGithubDelivery = (typeof(request.headers['x-github-event']) === 'string');

    if (isThisAGithubDelivery) {

      console.log('[' + (new Date().toString()) + '] queue length: ' + queueing.getLength() + ' ');

      if (queueing.isFull()) {
        response.end('queue too long, aborting' + queueing.getString());
        return;
      }

      delivering.newOrder(request, function (commands) {
        var index;
        for (index in commands) {
          scheduling.addCommandOnQueue(commands[index]);
        }
      });

      if (process.isAvailable()) {
        response.write('processsing');
      }
      else {
        response.write('a process is already running, this command will be delayed');
      }

      response.write('\n\nthis hook has been running ' + delivering.getLength() + ' times since launch');
      response.write('\n\nthere are ' + queueing.getLength() + ' items in queue');
      response.write('\n' + queueing.getString());
      response.end();
    } else {
      response.end('This does not come from github');
    }
  } else {
    response.end('Unknown method ' + request.method);
  }
});

module.exports = server;
