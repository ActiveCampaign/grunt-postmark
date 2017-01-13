/*
 * grunt-postmark-templates
 * push templates to a Postmark server for use with SendTemplatedEmail
 *
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  'use strict';

  grunt.registerMultiTask('postmark-templates', 'Create or update Postmark templates', function() {

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
            grunt.log.writeln('Template ' + template.name + ' created: ' + JSON.stringify(response.TemplateId));
          });
        } else {
          grunt.log.writeln('Template ' + template.name + ' updated: ' + JSON.stringify(response.TemplateId));
          handleResponse(err, response, done, template);
        }
      });
    } else {
      client.createTemplate(expanded, function(err, response) {
        grunt.log.writeln('Template ' + template.name + ' created: ' + JSON.stringify(response.TemplateId));
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
      // append this record to the result array, used by postmark-templates-output task
      var upd = grunt.config.get('updatedTemplates') || {};
      var tname = template.name;
      delete template.name;
      upd[tname] = template;
      grunt.config.set('updatedTemplates', upd);

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

  // invoke this task after postmark-templates to get an output file containing the resulting template IDs
  // this is in the same format as the postmark-templates config.

  grunt.registerTask('postmark-templates-output', 'writes out the resulting template IDs', function() {

    var options = this.options({
      filename: "templates-output.json"
    });

    var results = grunt.config('updatedTemplates');

    grunt.file.write(options.filename, JSON.stringify(results, null, 2));

    grunt.log.writeln("Updated template information written to " + options.filename);

  });

};
