/*
 * grunt-postmark-servers
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  'use strict';

  grunt.registerTask('postmark-servers', 'Create server', function() {

    var done = this.async();

    // default options (attempting to disable all hooks)
    var options = this.options({
      color: "turquoise",
      smtpApiActivated: true,
      trackOpens: false,
      trackLinks: 'none',
      DeliveryHookUrl: '',
      InboundHookUrl: '',
      BounceHookUrl: '',
      OpenHookUrl: '',
    });

    var accountToken = grunt.config('secrets.accountToken') || options.accountToken;
    // Check for account token
    if (!accountToken) {
      grunt.fail.warn('Missing required config property "accountToken" \n');
    }

    if (!options.name) {
      grunt.fail.warn('Missing required server property "name" \n');
    }

    // Postmark lib
    var postmark = require('postmark');
    var client = new postmark.AdminClient(accountToken);

    // TODO use merge for default options
    client.createServer(options, function(err, response) {
      // NOTE if a server with the specified name already exists, we get this response:
      // {"status":422,"message":"This server name already exists.","code":603}
      if (err && err.status == 422){
        existingServer(client, options.name, done);
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
