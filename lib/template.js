/* jshint node: true, esversion: 6 */

// usage: template({title: 'githook', body: 'welcome'});
const fs = require('fs');
var layout = '';
fs.readFile(__dirname + '/../templates/layout.html', 'utf8', (err, data) => {
  if (err) throw err;
  layout = data;
});

const gen = (content)=> {
  if (typeof content === 'undefined') throw 'gen: content cannot be undefined';
  content.title = content.title || 'githook';
  content.body = content.body || 'welcome';
  return ((title, body) => {
    // i know that I shouldn't use eval, but didn't find any workaround
    /* jshint ignore:start */
    return eval('`' + layout + '`');
    /* jshint ignore:end */
  })(content.title, content.body);
};

module.exports = gen;
