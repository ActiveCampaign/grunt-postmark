/*
 * grunt-postmark-templates
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  'use strict';

  grunt.registerTask('postmark-templates', 'create or update a set of templates', function() {
    var templates = grunt.config('templates') || grunt.config('postmark-templates');
    templates = templates || grunt.file.exists('templates.json') ? grunt.file.readJSON('templates.json') : null;

    grunt.config.set('_postmark-template', templates);
    grunt.task.run('_postmark-template');
  });

  grunt.registerMultiTask('_postmark-template', 'Create or update PostMark template', function() {

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

    if (_data.htmlBody) {
      htmlBody = grunt.file.read(htmlBody);
    }
    if (_data.textBody) {
      textBody = grunt.file.read(textBody);
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
      var result = {name: name, templateId: templateId};
      grunt.config.merge('updatedTemplates', result);
      successMessage(name, templateId);
      done(result);
    }
  }

  function errorMessage(response) {
    grunt.log.warn('Error response: ' + JSON.stringify(response));
  }

  function successMessage(name, templateId) {
    grunt.log.writeln('Template ' + name + ' pushed: ' + JSON.stringify(templateId));

  }

};
