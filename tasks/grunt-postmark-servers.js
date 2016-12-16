/*
 * grunt-postmark-servers
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  'use strict';

  grunt.registerMultiTask('postmark-servers', 'Create server', function() {

    var done = this.async();
    var options = this.options();
    var _data = this.data;

    // Check for account token
    if (!options.accountToken && !_data.accountToken) {
      grunt.fail.warn('Missing option "accountToken" \n');
    }

    // Postmark lib
    var postmark = require('postmark');
    var client = new postmark.AdminClient(options.accountToken || _data.accountToken);

    // Check for server name
    if (!_data.name && !options.name) {
      grunt.fail.warn('Missing required server property "name" \n');
    }

    var name = _data.name || options.name;

    client.createServer({
        name: name,
        color: _data.color || options.color || "Turquoise",
        smtpApiActivated: _data.smtpApiActivated || options.smtpApiActivated || true,
        trackOpens: _data.trackOpens || options.trackOpens || false,
        trackLinks: _data.trackLinks || options.trackLinks || "none",

        // TODO: handle other attributes
    }, function(err, response) {
      // NOTE if a server with the specified name already exists, we get this response:
      // {"status":422,"message":"This server name already exists.","code":603}
      if (err && err.status == 422){
        existingServer(client, name, done);
      } else {
        handleResponse(err, response, done);
      }
    });

  });

  // find the server with matching name and return its configuration
  function existingServer(client, name, done) {
    // listServers implements find-by-property
    client.listServers({name: name}, function(err, servers){
      if (err){
        grunt.log.warn('Error retrieving existing server: ' + JSON.stringify(err));
        done();
      } else {
        var server = servers.Servers[0];
        grunt.log.writeln('Server found: ' + JSON.stringify(server));
        done(server);
      }
    });
  }

  function handleResponse(err, response, done) {
    if (err){
      errorMessage(err);
      done();
    } else {
      var serverId = response.ID;
      successMessage(response);
      done(response);
    }
  }


  function errorMessage(err) {
    grunt.log.warn('Error creating server: ' + JSON.stringify(err));
  }

  function successMessage(response) {
    grunt.log.writeln('Server created: ' + JSON.stringify(response));
  }

};
