/**
 * Created by florian on 9/14/16.
 */

var version = require('./../package').version;
var delivering = require('./delivering.js');
var queueing = require('./queueing');
var process = require('./process');
var url = require('url');
var scheduling = require('./scheduling');
var ui = {};

ui.routing = function (request, response) {
  if (request.url === '/') {
    ui.home(request, response);

  } else if (url.parse(request.url, true).path.substring(0, 13) === '/kill_process') {
      ui.killProcess(request, response);

  } else if (url.parse(request.url, true).path.substring(0, 16) === '/restart_process') {
      ui.RestartProcess(request, response);

  } else {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('Page not found');
  }
};


ui.home = function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});

  response.write('hook ' + version + '!<br>');
  response.write('status: ' + (process.isRunning() ? 'running' : 'idle') + '<br>');
  if (process.isRunning()) {
    for (var indexProcess in process.list) {
      var dateDiffString = getDateStringDiffWithNow(process.list[indexProcess].createdAt.getTime());
      var buttonKillProcess = '<form method="get" action="/kill_process/' + process.list[indexProcess].process.pid +'" style="display: inline"><input type="submit" value="Kill"></form>';
      var buttonRestartProcess = '<form method="get" action="/restart_process/' + process.list[indexProcess].process.pid +'" style="display: inline"><input type="submit" value="Restart"></form>';
      response.write('<div>' + getResume(indexProcess, process.list[indexProcess].command) + ' [runTime: ' + dateDiffString + '] ' + buttonKillProcess + buttonRestartProcess +  '<br></div>');
    }
  }
  response.write('deliveries: ' + delivering.getLength() + '<br>');
  response.write('queue: ' + queueing.getLength() + '<br>');
  for (var indexQueueing in queueing.list) {
    response.write(getResume(indexQueueing, queueing.list[indexQueueing]) + '<br>');
  }

  response.write(request.method + ' ' + request.url + '<br>');

  response.end('This service is used for github webhooks');
};

ui.killProcess = function (request, response) {
  var processId = url.parse(request.url, true).path.substring(14).replace('?','');

  process.kill(processId, function (result) {
    if(!result) {
      console.log('[%s] Process not found : %d', (new Date().toString()), processId);
    } else {
      console.log('[%s]  >> kill process (%s)', (new Date().toString()), processId);
      queueing.next();
    }

    response.writeHead(301, {Location: '/'});
    response.end();
  });

};

ui.RestartProcess = function (request, response) {
  var processId = url.parse(request.url, true).path.substring(17).replace('?','');
  var command = process.getCommand(processId);

  process.kill(processId, function (result) {
    if(!result) {
      console.log('[%s] Process not found : %d',(new Date().toString()) , processId);
    } else {
      console.log('[%s]  >> kill process (%s)', (new Date().toString()), processId);
      queueing.next();
      scheduling.addCommandOnQueue(command);
      console.log('[%s]  >> Process (%s) readd to queue', (new Date().toString()), processId);
    }

    response.writeHead(301, {Location: '/'});
    response.end();
  });

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