/*
 * grunt-postmark-templates
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
      grunt.fail.warn('Missing required option "serverToken" \n');
    }

    // Check for required attributes
    ['name', 'subject'].forEach(function(name){
      requiredProperty(name, options, _data);
    });

    // Postmark lib
    var postmark = require('postmark');
    var client = new postmark.Client(options.serverToken || _data.serverToken);
    var htmlBody = _data.htmlBody || options.htmlBody;
    var textBody = _data.textBody || options.textBody;

    if (_data.htmlFile) {
      htmlBody = grunt.file.read(_data.htmlFile);
    }
    if (_data.textFile) {
      textBody = grunt.file.read(_data.textFile);
    }
    client.createTemplate({
        name: _data.name || options.name,
        textBody: textBody,
        htmlBody: htmlBody,
        subject: _data.subject || options.subject,
    }, function(err, response) {
      handleResponse(err, response, done);
    });

  });

  function requiredProperty(name, options, data) {
    if (!data[name] && !options[name]) {
      grunt.fail.warn('Missing required property "' + name + '" \n');
    }
  }

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
