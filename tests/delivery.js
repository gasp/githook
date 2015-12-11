/* jshint node: true, jasmine: true */

// creates its own server instance on 4003
// and tests it with a fake delivery payload

var http = require('http');
var server = require('../server');
var port = 4003;

server.listen(port);

var querystring = require('querystring');
var postData = JSON.stringify({
  'ref': 'master',
  'repository': {
    'name': 'front-demo'
  },
  'sender': {
    'login': 'testnode'
  }
});

var options = {
  hostname: 'localhost',
  port: port,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length,
    'x-github-event': 'test'
  }
};

describe('a delivery', function() {
  it('connects to the server', function (done) {
    var req = http.request(options, function(res) {
      // console.log('STATUS: ' + res.statusCode);
      // console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        // console.log('BODY: ' + chunk);
      });
      res.on('end', function() {
        // console.log('No more data in response.');
        server.close(function () {
          console.log('server closed');
          done();
        });
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(postData);
    req.end();
  });
});
