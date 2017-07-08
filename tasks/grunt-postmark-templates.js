/*
 * grunt-postmark-templates
 * push templates to a Postmark server for use with SendTemplatedEmail
 *
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function (grunt) {
  grunt.registerMultiTask('postmark-templates-upload', 'Create or update Postmark templates', function () {
    var done = this.async();
    var options = this.options();
    var template = this.data;

    var serverToken = options.serverToken || grunt.config('secret.postmark.server_token');

    if (!serverToken) {
      grunt.fail.warn('Missing Postmark server token \n');
    }

    if (!template.Name) {
      grunt.fail.warn('Missing required template property "Name" \n');
    }

    if (!template.Subject) {
      grunt.fail.warn('Missing required template property "Subject" \n');
    }

    if (!template.HtmlBody) {
      grunt.log.error('Missing template property "HtmlBody" \n');
    }

    if (!template.TextBody) {
      grunt.log.error('Missing template property "TextBody" \n');
    }

    var postmark = require('postmark');
    var client = new postmark.Client(serverToken);

    // read the referenced files, but hold on to the original filenames
    var expanded = Object.assign({}, template);

    if (template.TemplateId) {
      client.editTemplate(template.TemplateId, expanded, function (err, response) {
        if (err && err.code === 1101) {
          grunt.log.warn('Template ' + template.TemplateId + ' not found, so attempting create');
          delete template.TemplateId;
          delete expanded.TemplateId;
          client.createTemplate(expanded, function (err, response) {
            grunt.log.writeln('Template ' + template.Name + ' created: ' + JSON.stringify(response.TemplateId));
            handleResponse(err, response, done, template);
          });
        } else {
          grunt.log.writeln('Template ' + template.Name + ' updated: ' + JSON.stringify(response.TemplateId));
          handleResponse(err, response, done, template);
        }
      });
    } else {
      client.createTemplate(expanded, function (err, response) {
        grunt.log.writeln('Template ' + template.Name + ' created: ' + JSON.stringify(response.TemplateId));
        handleResponse(err, response, done, template);
      });
    }

  });

  function handleResponse(err, response, done, template) {
    if (err){
      errorMessage(err);
      done();
    } else {
      template.TemplateId = response.TemplateId;
      // compile the templates for use by the `postmark-templates-output` task
      var updatedTemplates = grunt.config.get('updatedTemplates') || {};
      updatedTemplates[template.Name] = template;
      grunt.config.set('updatedTemplates', updatedTemplates);

      done();
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

  grunt.registerTask('postmark-templates-output', 'Write out the resulting template IDs', function () {
    var options = this.options({
      cleanOutput: false
    });
    var updatedTemplates = grunt.config('updatedTemplates');
    var oldTemplates = grunt.file.read(options.outputFile);

    Object.keys(updatedTemplates).forEach(function (updatedTemplateKey) {
      updatedTemplates[updatedTemplateKey] = Object.assign(
        oldTemplates[updatedTemplateKey] || {},
        updatedTemplates[updatedTemplateKey]
      );

      if (options.cleanOutput) {
        delete updatedTemplates[updatedTemplateKey].HtmlBody;
        delete updatedTemplates[updatedTemplateKey].TextBody;
      }
    });

    grunt.file.write(options.outputFile, JSON.stringify(updatedTemplates, null, 2));
    grunt.log.writeln("Updated template information written to " + options.outputFile);

  });

  // you can also get a JSON report of uploaded templates
  grunt.registerTask('postmark-templates', ['postmark-templates-upload', 'postmark-templates-output']);
};
