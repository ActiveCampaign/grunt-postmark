/*
 * grunt-postmark-templates
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  'use strict';

  grunt.registerTask('postmark-templates', 'create or update a set of templates', function() {
    var templates = grunt.config('templates') || grunt.config('postmark-templates');
    templates = templates || (grunt.file.exists('templates.json') ? grunt.file.readJSON('templates.json') : null);

    grunt.config.set('_postmark-template', templates);
    grunt.config.set('updatedTemplates', []);
    grunt.task.run('_postmark-template');
    grunt.task.run('_postmark-output');
  });

  grunt.registerMultiTask('_postmark-template', 'Create or update PostMark template', function() {

    var done = this.async();
    var options = this.options();
    var template = this.data;

    var serverToken = options.serverToken || grunt.config('secrets.serverToken') || grunt.config('secret.postmark.server_token');

    // Check for server token
    if (!serverToken) {
      grunt.fail.warn('Missing required option "serverToken" \n');
    }

    template.name = template.name || this.target;
    if (!template.name) {
      grunt.fail.warn('Missing required template property "name" \n');
    }

    if (!template.subject) {
      grunt.fail.warn('Missing required template property "subject" \n');
    }

    grunt.log.writeln('tmpl options: ' + JSON.stringify(options));
    grunt.log.writeln('template: ' + JSON.stringify(template));

    // Postmark lib
    var postmark = require('postmark');
    var client = new postmark.Client(serverToken);

    var expanded = Object.assign({}, template);

    if (expanded.htmlBody) {
      expanded.htmlBody = grunt.file.read(expanded.htmlBody);
    }
    if (expanded.textBody) {
      expanded.textBody = grunt.file.read(expanded.textBody);
    }
    
    client.createTemplate(expanded, function(err, response) {
      handleResponse(template, err, response, done);
    });

  });

  function handleResponse(template, err, response, done) {
    if (err){
      errorMessage(err);
      done();
    } else {
      template.templateId = response.TemplateId;
      // append this record to the result array
      var upd = grunt.config.get('updatedTemplates');
      upd.unshift(template);
      grunt.config.set('updatedTemplates', upd);

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

  grunt.registerTask('_postmark-output', 'writes out the resulting template IDs', function() {

    var options = this.options({
      filename: "templates-output.json"
    });

    var results = grunt.config('updatedTemplates');

    grunt.file.write(options.filename, JSON.stringify(results, null, 1));

    grunt.log.writeln("Updated template information written to " + options.filename);

  });

};
