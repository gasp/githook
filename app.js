var server = require('./lib/server');
var scheduling = require('./lib/scheduling');

var port = 4004;
server.listen(port);
console.log('listening on '+ port);

scheduling.init();