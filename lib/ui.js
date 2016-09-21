/**
 * Created by florian on 9/14/16.
 */

var version = require('./../package').version;
var delivering = require('./delivering.js');
var queueing = require('./queueing');
var process = require('./process');
var ui = {};

ui.routing = function (request, response) {
  if (request.url === '/') {
    ui.home(request, response);
  } /*else if(request.url === '/restart') {
   queueing.clearList();
   }*/ else {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('Page not found');
  }
};


ui.home = function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  response.write('hook ' + version + '!\n');
  response.write('status: ' + (process.isRunning() ? 'running' : 'idle') + '\n');
  if (process.isRunning()) {
    for (var index_process in process.list) {
      response.write(getResume(index_process, process.list[index_process].command));
    }
  }
  response.write('deliveries: ' + delivering.getLength() + '\n');
  response.write('queue: ' + queueing.getLength() + '\n');
  for (var index_queueing in queueing.list) {
    response.write(getResume(index_queueing, queueing.list[index_queueing]));
  }

  response.write(request.method + ' ' + request.url + '\n');

  response.end('This service is used for github webhooks');
};

function getResume(index, list) {
  var script = list[0].match(/([^:\\/]*?)(?:\.([^ :\\/.]*))?$/i)[1];
  var env = list[1].split('/')[list[1].split('/').length - 2];
  return index + ': ' + script + ' on ' + env + '\n';
}

module.exports = ui;