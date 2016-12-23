/*
 * grunt-postmark-templates
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  'use strict';

  grunt.registerMultiTask('postmark-templates', 'Create or update PostMark template', function() {

    var done = this.async();
    var options = this.options();
    var _data = this.data;
    var tmplName = _data.name || this.target;

    var serverToken = options.serverToken || _data.serverToken || grunt.config('secrets.serverToken') || grunt.config('secret.postmark.server_token');

    // Check for server token
    if (!serverToken) {
      grunt.fail.warn('Missing required option "serverToken" \n');
    }

    if (!tmplName) {
      grunt.fail.warn('Missing required property "name" \n');
    }

    if (!_data.subject) {
      grunt.fail.warn('Missing required property "subject" \n');
    }

    // Postmark lib
    var postmark = require('postmark');
    var client = new postmark.Client(serverToken);
    var htmlBody = _data.htmlBody || options.htmlBody;
    var textBody = _data.textBody || options.textBody;

    if (_data.htmlFile) {
      htmlBody = grunt.file.read(_data.htmlFile);
    }
    if (_data.textFile) {
      textBody = grunt.file.read(_data.textFile);
    }
    client.createTemplate({
        name: tmplName,
        textBody: textBody,
        htmlBody: htmlBody,
        subject: _data.subject,
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
      var name = response.Name;
      successMessage(name, templateId);
      done({name: name, templateId: templateId});
    }
  }

  function errorMessage(response) {
    grunt.log.warn('Error response: ' + JSON.stringify(response));
  }

  function successMessage(name, templateId) {
    grunt.log.writeln('Template ' + name + ' pushed: ' + JSON.stringify(templateId));

  }

};
