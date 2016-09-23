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
    for (var indexProcess in process.list) {
      var dateDiffString = getDateStringDiffWithNow(process.list[indexProcess].createdAt.getTime());
      response.write(getResume(indexProcess, process.list[indexProcess].command) + ' [runTime: ' + dateDiffString + ']\n');
    }
  }
  response.write('deliveries: ' + delivering.getLength() + '\n');
  response.write('queue: ' + queueing.getLength() + '\n');
  for (var indexQueueing in queueing.list) {
    response.write(getResume(indexQueueing, queueing.list[indexQueueing]));
  }

  response.write(request.method + ' ' + request.url + '\n');

  response.end('This service is used for github webhooks');
};

function getResume(index, list) {
  var script = list[0].match(/([^:\\/]*?)(?:\.([^ :\\/.]*))?$/i)[1];
  var env = list[1].split('/')[list[1].split('/').length - 2];
  return index + ': ' + script + ' on ' + env;
}

function getDateStringDiffWithNow(dateProcessInMs) {
  var dateNowInMs = (new Date()).getTime();
  var dateDiffInMs = dateNowInMs - dateProcessInMs;

  dateDiffInMs = dateDiffInMs / 1000;
  var seconds = Math.floor(dateDiffInMs % 60);
  dateDiffInMs = dateDiffInMs / 60;
  var minutes = Math.floor(dateDiffInMs % 60);
  dateDiffInMs = dateDiffInMs / 60;
  var hours = Math.floor(dateDiffInMs % 24);
  var days = Math.floor(dateDiffInMs / 24);

  return pad2(days) + '-' + pad2(hours) + ':' + pad2(minutes) + ':' + pad2(seconds);
}

function pad2(number) {
  return (number < 10 ? '0' : '') + number;
}

module.exports = ui;