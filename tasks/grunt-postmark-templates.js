/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  'use strict';

  grunt.registerMultiTask('postmark-templates', 'Push templates', function() {

    var done = this.async();
    var options = this.options();
    var _data = this.data;

    // Check for server token
    if (!options.serverToken && !_data.serverToken) {
      grunt.fail.warn('Missing Postmark server token \n');
    }

    // Postmark lib
    var postmark = require('postmark');
    var client = new postmark.Client(options.serverToken || _data.serverToken);

    client.createTemplate({
        name: _data.name || options.name,
        textBody: _data.textBody || options.textBody,
        htmlBody: _data.htmlBody || options.htmlBody,
        subject: _data.subject || options.subject,
    }, function(err, response) {
      handleResponse(err, response, done);
    });

  });

  function handleResponse(err, response, done) {
    if (err){
      errorMessage(err);
      done();
    } else {
      var templateId = response.TemplateId;
      successMessage(templateId);
      done(templateId);
    }
  }

  function errorMessage(response) {
    grunt.log.warn('Error response: ' + JSON.stringify(response));
  }

  function successMessage(templateId) {
    grunt.log.writeln('Template pushed: ' + JSON.stringify(templateId));
  }

};
