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

    client.createServer({
        name: _data.name || options.name,
        color: _data.color || options.color || "Turquoise",
        smtpApiActivated: _data.smtpApiActivated || options.smtpApiActivated || true,
        trackOpens: _data.trackOpens || options.trackOpens || false,
        trackLinks: _data.trackLinks || options.trackLinks || "none",

        // TODO: handle other attributes
    }, function(err, response) {
      handleResponse(err, response, done);
    });

  });

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
