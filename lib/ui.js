/**
 * Created by florian on 9/14/16.
 */

var version = require('./../package').version;
var delivering = require('./delivering.js');
var ui = {};

ui.routing = function (request, response) {
  if(request.url === '/') {
    ui.home(request, response);

  } else if(request.url === '/restart') {
    queueing = require('./queueing');
    queueing.clearQueue();
  } else {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('Page not found');
  }
};



ui.home = function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  response.write('hook ' + version + '!\n');
  response.write('status: ' + (running ? 'running' : 'idle') + '\n');
  if (running) {
    var cscript = current[0].match(/([^:\\/]*?)(?:\.([^ :\\/.]*))?$/i)[1];
    var cenv = current[1].split('/')[current[1].split('/').length - 2];
    response.write('-: ' + cscript + ' on ' + cenv + '\n');
  }
  response.write('deliveries: ' + delivering.deliveries.length + '\n');
  response.write('queue: ' + queue.length + '\n');
  for (var i = 0; i < queue.length; i++) {
    // regex from http://stackoverflow.com/questions/1818310/regular-expression-to-remove-a-files-extension
    var script = queue[i][0].match(/([^:\\/]*?)(?:\.([^ :\\/.]*))?$/i)[1];
    var env = queue[i][1].split('/')[queue[i][1].split('/').length - 2];
    response.write(i + ': ' + script + ' on ' + env + '\n');
  }

  response.write(request.method + ' ' + request.url + '\n');

  response.end('This service is used for github webhooks');
};



module.exports = ui;