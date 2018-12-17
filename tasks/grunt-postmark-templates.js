/*
 * grunt-postmark-templates
 * push templates to a Postmark server for use with SendTemplatedEmail
 *
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function (grunt) {
  var DEFAULT_EPHEMERAL_UPLOAD_RESULTS_PROPERTY = 'postmark-templates-upload-results';
  var DEFAULT_OUTPUT_FILE_NAME = 'templates.json';
  var DEFAULT_CLEAN_OUTPUT = false;

  grunt.registerTask('postmark-templates-parse', 'Parse Postmark templates for update', function () {
    var options = this.options({
      inputFile: DEFAULT_OUTPUT_FILE_NAME
    });
    var templateObjects = grunt.file.readJSON(options.inputFile || DEFAULT_OUTPUT_FILE_NAME);

    grunt.config.set('postmark-templates-upload', Object.assign(
      templateObjects,
      {
        options: grunt.config.get('postmark-templates-upload.options')
      }
    ));
  });

  grunt.registerMultiTask('postmark-templates-upload', 'Create or update Postmark templates', function () {
    var done = this.async();
    var options = this.options({
      ephemeralUploadResultsProperty: DEFAULT_EPHEMERAL_UPLOAD_RESULTS_PROPERTY
    });
    var ephemeralUploadResultsProperty = options.ephemeralUploadResultsProperty || DEFAULT_EPHEMERAL_UPLOAD_RESULTS_PROPERTY;
    var template = this.data;

    var serverToken = options.serverToken || grunt.config('secret.postmark.server_token');

    if (!serverToken) {
      grunt.fail.warn('Missing Postmark server token \n');
    }

    if (!template.name) {
      grunt.fail.warn('Missing required template property "name" \n');
    }

    if (!template.subject) {
      grunt.fail.warn('Missing required template property "subject" \n');
    }

    if (!template.htmlBody && !template.htmlSrc) {
      grunt.log.error('Missing template property "htmlBody" or "htmlSrc"\n');
    }

    if (!template.textBody && !template.textSrc) {
      grunt.log.error('Missing template property "textBody" or "textSrc"\n');
    }

    var postmark = require('postmark');
    var client = new postmark.Client(serverToken);

    // read the referenced files, but hold on to the original filenames
    var expanded = {
      Name: template.name,
      Subject: template.subject,
      HtmlBody: template.htmlBody || grunt.file.read(template.htmlSrc),
      TextBody: template.textBody || grunt.file.read(template.textSrc),
      TemplateId: template.templateId,
      TemplateAlias: template.templateAlias
    };

    var templateIdentifier = expanded.TemplateId || expanded.TemplateAlias;

    function printResponse (response) {
      return JSON.stringify(response.TemplateId + (response.Alias ? ' [alias: ' + response.Alias + ']' : ''));
    }

    if (templateIdentifier) {
      client.editTemplate(templateIdentifier, expanded, function (err, response) {
        if (err && err.code === 1101) {
          grunt.log.warn('Template ' + templateIdentifier + ' not found, so attempting create');
          delete template.templateId;
          delete expanded.TemplateId;
          delete template.templateAlias;
          delete expanded.TemplateAlias;
          client.createTemplate(templateIdentifier, function (err, response) {
            grunt.log.writeln('Template ' + expanded.Name + ' created: ' + printResponse(response));
            handleResponse(err, done, response, template, ephemeralUploadResultsProperty);
          });
        } else {
          grunt.log.writeln('Template ' + expanded.Name + ' updated: ' + printResponse(response));
          handleResponse(err, done, response, template, ephemeralUploadResultsProperty);
        }
      });
    } else {
      client.createTemplate(expanded, function (err, response) {
        grunt.log.writeln('Template ' + expanded.Name + ' created: ' + printResponse(response));
        handleResponse(err, done, response, template, ephemeralUploadResultsProperty);
      });
    }
  });

  function handleResponse(err, done, response, template, ephemeralUploadResultsProperty) {
    if (err){
      errorMessage(err);
      done();
    } else {
      template.templateId = response.TemplateId;
      template.templateAlias = response.Alias;
      // compile the templates for use by the `postmark-templates-output` task
      var updatedTemplates = grunt.config.get(ephemeralUploadResultsProperty) || {};
      updatedTemplates[template.name] = template;
      grunt.config.set(ephemeralUploadResultsProperty, updatedTemplates);

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
      cleanOutput: DEFAULT_CLEAN_OUTPUT,
      outputFile: DEFAULT_OUTPUT_FILE_NAME,
      ephemeralUploadResultsProperty: DEFAULT_EPHEMERAL_UPLOAD_RESULTS_PROPERTY
    });
    var ephemeralUploadResultsProperty = options.ephemeralUploadResultsProperty || DEFAULT_EPHEMERAL_UPLOAD_RESULTS_PROPERTY;
    var outputFile = options.outputFile || DEFAULT_OUTPUT_FILE_NAME;
    var cleanOutput = options.cleanOutput || DEFAULT_CLEAN_OUTPUT;
    var updatedTemplates = grunt.config(ephemeralUploadResultsProperty);
    var oldTemplates = grunt.file.exists(outputFile)
      ? grunt.file.read(outputFile)
      : {};

    Object.keys(updatedTemplates).forEach(function (updatedTemplateKey) {
      updatedTemplates[updatedTemplateKey] = Object.assign(
        oldTemplates[updatedTemplateKey] || {},
        updatedTemplates[updatedTemplateKey]
      );

      if (cleanOutput) {
        delete updatedTemplates[updatedTemplateKey].htmlBody;
        delete updatedTemplates[updatedTemplateKey].textBody;
        delete updatedTemplates[updatedTemplateKey].htmlSrc;
        delete updatedTemplates[updatedTemplateKey].textSrc;
      }
    });

    grunt.file.write(outputFile, JSON.stringify(updatedTemplates, null, 2));
    grunt.log.writeln("Updated template information written to " + outputFile);
  });

  // you can also get a JSON report of uploaded templates
  grunt.registerTask('postmark-templates-from-targets', ['postmark-templates-upload', 'postmark-templates-output']);
  grunt.registerTask('postmark-templates-from-file', ['postmark-templates-parse', 'postmark-templates-from-targets']);
  grunt.registerTask('postmark-templates', ['postmark-templates-from-targets']);
};
