/*
 * grunt-postmark-templates
 * push templates to a Postmark server for use with SendTemplatedEmail
 *
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = (grunt) => {
  const _ = require('lodash');
  const inquirer = require('inquirer');
  const table = require('table');

  grunt.registerMultiTask('postmark-templates-push', 'Push templates to Postmark', function() {
    this.results = {
      completed: 0,
      success: 0,
      failed: 0
    };
    this.localTemplates = [];
    var done = this.async();
    var options = this.options();
    var templates = options.templates;
    var serverToken = grunt.config('secrets.postmarkServerToken');

    if (!serverToken) {
      grunt.fail.warn('Missing Postmark server token \n');
    }

    if (!Array.isArray(templates)) {
      grunt.fail.warn('Templates config must be an array containing objects \n')
    }

    // Set up Postmark client
    var postmark = require('postmark');
    var client = new postmark.Client(serverToken);

    // Get templates from server
    client.getTemplates().then(result => {
      let review = [];

      // Validate template objects and parse local templates
      templates.forEach((template) => {
        validateTemplate(template);

        // Determine template's Alias or ID
        const identifier = getIdentifier(template);
        const existingTemplate = _.find(result.Templates, identifier);

        // Throw error if template with ID is not on server
        if (identifier.TemplateId && _.isEmpty(existingTemplate)) {
          grunt.fail.fatal(`${template.name}: This template has an ID that is not on your Postmark server. You’ll need to use a correct ID or enter an alias to push this template.`)
        }

        // Gather email content
        const htmlBody = template.htmlBody ? grunt.file.read(template.htmlBody) : '';
        const textBody = template.textBody ? grunt.file.read(template.textBody) : '';

        // Temporarily store this template's info
        this.localTemplates.push({
          ...identifier,
          New: _.isEmpty(existingTemplate),
          Name: template.name,
          Subject: template.subject,
          HtmlBody: htmlBody,
          TextBody: textBody
        });

        // Add template to review list
        const reviewChangeType = existingTemplate ? 'Modified'.yellow : 'Added'.green;
        review.push([reviewChangeType, template.name, template.alias || `ID: ${template.id}`]);
      });

      // Show files that are changing
      printReview(review);

      // Ask user to confirm push
      confirmPush(done);
    }).catch(error => {
      grunt.fail.fatal(error);
      done(false);
    });

    /**
     * [getIdentifier description]
     * @param  {[type]} template [description]
     * @return {[type]}          [description]
     */
    var getIdentifier = (template) => {
      if (template.alias) return { Alias: template.alias };
      if (template.id) return { TemplateId: template.id };
    }

    /**
     * Ask user to confirm push
     * @param  {Function} done
     */
    var confirmPush = (done) => {
      inquirer.prompt([{
        type: 'confirm',
        name: 'push',
        default: false,
        message: 'Are you sure you want to push these templates to Postmark?'
      }]).then(answers => {
        if (answers.push) {
          grunt.log.writeln('Right on. Pushing your templates to Postmark...');

          this.localTemplates.forEach((template, index) => {
            pushTemplate(template, done)
          });
        } else {
          grunt.log.writeln('Canceling template push.');
          done();
        }
      });
    }

    /**
     * Add a new template or modify an existing one
     * @param  {Object}   template
     * @param  {Function} done
     */
    var pushTemplate = (template, done) => {
      if (template.New) {
        // Add new template
        client.createTemplate(template).then(response => {
          pushComplete({
            success: true,
            response,
            template,
            done
          });
        }).catch(response => {
          pushComplete({
            success: false,
            response,
            template,
            done
          });
        });
      } else {
        // Modify existing template
        const identifier = template.Alias || template.TemplateId;
        client.editTemplate(identifier, template).then(response => {
          pushComplete({
            success: true,
            response,
            template,
            done
          });
        }).catch(response => {
          pushComplete({
            success: true,
            response,
            template,
            done
          });
        });
      }
    }

    /**
     * Execute each time a template is pushed
     * @param  {Object} result
     */
    var pushComplete = (result) => {
      const { success, response, template, done } = result;

      // Update counters
      this.results.completed++;
      this.results[success ? 'success' : 'failed']++;

      // Log errors to the console
      if (!success) {
        grunt.log.writeln(`${template.Name}: ${response.toString()}`.red);
      }

      // Last template pushed
      if (this.results.completed === this.localTemplates.length) {
        // Log results
        grunt.log.writeln(`${this.results.success} templates were pushed successfully.`.green);
        grunt.log.writeln(`${this.results.failed} ${grunt.util.pluralize(this.results.failed, 'template/templates')} failed. Please see the output above for more details.`.red);

        done();
      }
    }

    /**
     * Prints changed files to the console
     * @param  {Array} review List of changed files
     */
    var printReview = (review) => {
      let output = [['Type'.gray, 'Template'.gray, 'Alias'.gray], ...review]
      grunt.log.writeln(table.table(output, { border: table.getBorderCharacters('norc')}));
    }

    /**
     * Validate the template configuration
     * @param  {Object} template
     */
    var validateTemplate = (template) => {
      if (!template.alias && !template.id) {
        grunt.fail.fatal('One of your templates is missing an alias and id. Either of these are required in order to push your templates. Aliases are recommended so it’s easier to track the same template across multiple servers. Check out https://postmarkapp.com/support/article/1117-how-do-i-use-a-template-alias for more details.');
      }

      const identifier = template.alias || template.id;

      if (!template.name) {
        grunt.fail.fatal(`${identifier}: Please enter a name field.`);
      }

      if (!template.subject) {
        grunt.fail.fatal(`${template.name}: Please enter a subject field.`);
      }

      if (!template.htmlBody && !template.textBody) {
        grunt.fail.fatal(`${template.name}: Please enter either an htmlBody, textBody, or both.`);
      }
    }
  });
};
