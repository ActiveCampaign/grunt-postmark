/*
 * grunt-postmark-templates
 * push templates to a Postmark server for use with SendTemplatedEmail
 *
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = (grunt) => {
  const { find, isEmpty } = require('lodash');
  const { prompt } = require('inquirer');
  const { table, getBorderCharacters } = require('table');

  grunt.registerMultiTask('postmark-templates-push', 'Push templates to Postmark', function() {
    this.review = {
      files: [],
      modified: 0,
      added: 0
    };
    this.results = {
      success: 0,
      failed: 0
    };
    this.localTemplates = [];

    const done = this.async();
    const { serverToken, showConfirmation = true } = this.options();
    const { templates } = this.data;

    if (!serverToken) {
      grunt.fail.warn('Please enter a server token. This can be found under the credentials tab on your Postmark server');
    }

    if (!Array.isArray(templates)) {
      grunt.fail.warn('Templates config must be an array containing objects \n')
    }

    // Set up Postmark client
    var postmark = require('postmark');
    var client = new postmark.Client(serverToken);

    // Get templates from server
    client.getTemplates().then(result => {
      // Validate template objects and parse local templates
      templates.forEach((template) => {
        validateTemplate(template);

        // Determine template's Alias or ID
        const identifier = getIdentifier(template);
        const existingTemplate = find(result.Templates, identifier);

        // Throw error if template ID is not on server
        if (identifier.TemplateId && isEmpty(existingTemplate)) {
          grunt.fail.fatal(`${template.name}: This template has an ID that is not on your Postmark server. You’ll need to use a correct ID or enter an alias to push this template.`);
        }

        // Gather email content
        const htmlBody = template.htmlBody ? grunt.file.read(template.htmlBody) : '';
        const textBody = template.textBody ? grunt.file.read(template.textBody) : '';

        // Temporarily store this template's info
        this.localTemplates.push({
          ...identifier,
          New: isEmpty(existingTemplate),
          Name: template.name,
          Subject: template.subject,
          HtmlBody: htmlBody,
          TextBody: textBody
        });

        // Update change counters
        existingTemplate ? this.review.modified++ : this.review.added++;

        // Add to changed file list
        const reviewChangeType = existingTemplate ? 'Modified'.yellow : 'Added'.green;
        this.review.files.push([reviewChangeType, template.name, template.alias || `ID: ${template.id}`]);
      });

      // Show files that are changing
      printReview();

      if (showConfirmation) {
        confirmPush(done);
      } else {
        grunt.log.writeln('Hang tight. Pushing your templates to Postmark.')
        pushTemplates(done);
      }
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
      prompt([{
        type: 'confirm',
        name: 'push',
        default: false,
        message: 'Are you sure you want to push these templates to Postmark?'
      }]).then(answers => {
        if (answers.push) {
          grunt.log.writeln('Right on. Pushing your templates to Postmark...');

          pushTemplates(done);
        } else {
          grunt.log.writeln('Canceling template push.');
          done();
        }
      });
    }

    /**
     * Push all the templates
     * @param  {Function} done [description]
     */
    var pushTemplates = (done) => {
      this.localTemplates.forEach((template, index) => {
        pushTemplate(template, done)
      });
    }

    /**
     * Push a specific template
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
            success: false,
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
      this.results[success ? 'success' : 'failed']++;
      const completed = this.results.success + this.results.failed;

      // Log any errors to the console
      if (!success) {
        grunt.log.writeln(`${template.Name}: ${response.toString()}`.red);
      }

      // Last template pushed
      if (completed === this.localTemplates.length) {
        // Show summary of results
        grunt.log.writeln(`${this.results.success} ${grunt.util.pluralize(this.results.success, 'template was/templates were')} pushed successfully.`.green);

        // Show failures
        if (this.results.failed) {
          grunt.log.writeln(`${this.results.failed} ${grunt.util.pluralize(this.results.failed, 'template was/templates were')} not pushed. Please see the output above for more details.`.red);
        }

        done();
      }
    }

    /**
     * Prints changed files to the console
     */
    var printReview = () => {
      const { files, added, modified } = this.review;

      // Changed template table
      const list = [
        ['Type'.gray, 'Name'.gray, 'Alias'.gray],
        ...files
      ];

      grunt.log.writeln(table(list, { border: getBorderCharacters('norc')}));

      // Show how many templates were added or modified
      if (added > 0) {
        grunt.log.writeln(`${added} ${grunt.util.pluralize(added, 'template/templates')} will be added.`.green);
      }

      if (modified > 0) {
        grunt.log.writeln(`${modified} ${grunt.util.pluralize(modified, 'template/templates')} will be modified.`.yellow);
      }
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
