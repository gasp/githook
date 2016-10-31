/* jshint node: true, esversion: 6 */

const version = require('./../package').version;
const delivering = require('./delivering.js');
const queueing = require('./queueing');
const process = require('./process');
const url = require('url');
const scheduling = require('./scheduling');
const template = require('./template');

var ui = {};

ui.routing = function (request, response) {
  if (request.url === '/' || request.url === '/home') {
    ui.home(request, response);

  } else if (url.parse(request.url, true).path.substring(0, 13) === '/kill_process') {
      ui.killProcess(request, response);

  } else if (url.parse(request.url, true).path.substring(0, 16) === '/restart_process') {
      ui.RestartProcess(request, response);

  } else {
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.end(template({body: 'Page not found'}));
  }
};


ui.home = function (request, response) {

  let body = '<div>status: ' + (process.isRunning() ? 'running' : 'idle') + '</div>';
  if (process.isRunning()) {
    for (var indexProcess in process.list) {
      var dateDiffString = getDateStringDiffWithNow(process.list[indexProcess].createdAt.getTime());
      var buttonKillProcess = '<form method="get" action="/kill_process/' + process.list[indexProcess].process.pid +'" style="display: inline"><input type="submit" value="Kill"></form>';
      var buttonRestartProcess = '<form method="get" action="/restart_process/' + process.list[indexProcess].process.pid +'" style="display: inline"><input type="submit" value="Restart"></form>';
      body += '<div>' + getResume(indexProcess, process.list[indexProcess].command) + ' [runTime: ' + dateDiffString + '] ' + buttonKillProcess + buttonRestartProcess +  '</div>';
    }
  }
  body += 'deliveries: ' + delivering.getLength() + '<br>';
  body += 'queue: ' + queueing.getLength() + '<br>';
  for (var indexQueueing in queueing.list) {
    body += getResume(indexQueueing, queueing.list[indexQueueing]) + '<br>';
  }

  body += `<code>${request.method} ${request.url}</code>`;
  body += `<footer>This service is used for github webhooks and is powered by <b>hook ${version}</b></footer>`;
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end(template({body: body}));
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
