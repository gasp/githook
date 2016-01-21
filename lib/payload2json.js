/* jshint node: true */

'use strict';

// getting the payload
// req @stream
// cb @function with an argument as json
var payload2json = function (req, cb) {
  var body = '';
  var json = {};
  req.addListener('error', function(e) {
    console.error('payload got a error', e);
    cb({});
  });

  req.addListener('data', function(chunk) {
    body += chunk;
  });

  req.addListener('end', function(chunk) {
    if (chunk) {
      body += chunk;
    }
    try {
      json = JSON.parse(body);
    } catch (e) {
      console.error('payload got a error parsing', e, body);
    }
    cb(json);
  });
};
module.exports = payload2json;
