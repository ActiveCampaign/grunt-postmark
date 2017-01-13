/*
 * grunt-postmark-templates
 * push templates to a Postmark server for use with SendTemplatedEmail
 *
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  'use strict';

  // There are a number of different ways to populate this configuration object,
  // including gruntfile configuration for "postmark-templates",
  // or a templates.json file in your project.
  //
  // The object should have the following format, using the template name as the key.
  // Here is an example templates.json file from a Mailmason project:
  //
  // {
  //   "confirm_email": {
  //     "subject": "Please confirm your email",
  //     "htmlBody": "dist/confirm_email.html",
  //     "textBody": "dist/confirm_email.txt",
  //     "templateId": 1201660
  //   }
  // }
  //
  // templateId is optional; if present, the template with the given ID will be updated. This will prevent
  // proliferation of outdated versions of templates with the same name, and depending on how you're using
  // them, reduce the configuration overhead (for example publishing these templateIds to your backend).
  //
  // The postmark-templates task will write an output file in this format including the current templateId.
  // The default output file is named templates-output.json. You may ignore this file, or manually copy it
  // to templates.json after a successful run.

  grunt.registerTask('postmark-templates', 'create or update a set of templates', function() {
    var templates = grunt.config('templates') || grunt.config('postmark-templates');
    templates = templates || (grunt.file.exists('templates.json') ? grunt.file.readJSON('templates.json') : null);

    grunt.config.set('_postmark-template', templates);
    grunt.config.set('updatedTemplates', {});
    grunt.task.run('_postmark-template');
    grunt.task.run('_postmark-output');
  });

  grunt.registerMultiTask('_postmark-template', 'Create or update PostMark template', function() {

    var done = this.async();
    var options = this.options();
    var template = this.data;

    var serverToken = options.serverToken || grunt.config('secrets.serverToken') || grunt.config('secret.postmark.server_token');

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

    var postmark = require('postmark');
    var client = new postmark.Client(serverToken);

    // read the referenced files, but hold on to the original filenames
    var expanded = Object.assign({}, template);

    if (expanded.htmlBody) {
      expanded.htmlBody = grunt.file.read(expanded.htmlBody);
    }
    if (expanded.textBody) {
      expanded.textBody = grunt.file.read(expanded.textBody);
    }

    if (template.templateId) {
      client.editTemplate(template.templateId, expanded, function(err, response) {
        if (err && err.code === 1101) {
          grunt.log.warn('Template ' + template.templateId + ' not found, so attempting create');
          delete template.templateId;
          delete expanded.templateId;
          client.createTemplate(expanded, function(err, response) {
            handleResponse(err, response, done, template);
          });
        } else {
          handleResponse(err, response, done, template);
        }
      });
    } else {
      client.createTemplate(expanded, function(err, response) {
        handleResponse(err, response, done, template);
      });
    }

  });

  function handleResponse(err, response, done, template) {
    if (err){
      errorMessage(err);
      done();
    } else {
      template.templateId = response.TemplateId;
      // append this record to the result array
      var upd = grunt.config.get('updatedTemplates');
      var tname = template.name;
      delete template.name;
      upd[tname] = template;
      grunt.config.set('updatedTemplates', upd);

      successMessage(tname, template.templateId);
      done(template);
    }
  }

  function errorMessage(err) {
    if (err.message) {
      grunt.log.warn('Error: ' + err.message);
    } else {
      grunt.log.warn('Error: ' + JSON.stringify(err));
    }
  }

  function successMessage(name, templateId) {
    grunt.log.writeln('Template ' + name + ' pushed: ' + JSON.stringify(templateId));
  }

  grunt.registerTask('_postmark-output', 'writes out the resulting template IDs', function() {

    var options = this.options({
      filename: "templates-output.json"
    });

    var results = grunt.config('updatedTemplates');

    grunt.file.write(options.filename, JSON.stringify(results, null, 2));

    grunt.log.writeln("Updated template information written to " + options.filename);

  });

};
