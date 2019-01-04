/*
 * grunt-postmark-templates-config.js
 * Creates a template JSON config to be used with the template pushing workflow.
 *
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = (grunt) => {
  const { prompt } = require('inquirer');
  const { Spinner } = require('cli-spinner');
  const spinner = new Spinner();
  spinner.setSpinnerString(18);

  grunt.registerTask('postmarkTemplatesConfig', 'Create a template JSON config from a Postmark server', function() {
    this.templateConfig = [];
    this.requestCount = 0;
    this.totalTemplates = 0;

    const done = this.async();
    const { serverToken, outputFile } = this.options();

    if (!serverToken) {
      grunt.fail.warn('Please enter a server token. This can be found under the credentials tab on your Postmark server');
      done(false);
    }

    if (!outputFile) {
      grunt.fail.warn('Please specify an output file.');
      done(false);
    }

    // Set up Postmark client
    const postmark = require('postmark');
    const client = new postmark.Client(serverToken);

    // Show spinner
    spinner.setSpinnerTitle('%s Fetching your templates from Postmark...');
    spinner.start();

    // Get templates from Postmark
    client.getTemplates().then(response => {
      this.totalTemplates = response.TotalCount;

      // Stop if there are no templates on this server
      if (this.totalTemplates === 0) {
        spinner.stop(true);
        grunt.log.writeln('There are no templates on this server.');
        done();
      }

      // Show some feedback
      spinner.stop(true);
      grunt.log.writeln(`${this.totalTemplates} ${grunt.util.pluralize(this.totalTemplates, 'template was/templates were')} found on this server.`);
      spinner.setSpinnerTitle('%s Fetching each template’s info from Postmark. Hang tight...');
      spinner.start();

      // Lookup each template
      response.Templates.forEach(template => {
        getTemplate(template, done);
      });

    }).catch(error => {
      spinner.stop(true);
      grunt.fail.fatal(error);
      done(false);
    });


    /**
     * Fetch template info from Postmark
     * @param  {Object}   template
     * @param  {Function} done
     */
    const getTemplate = (template, done) => {
      client.getTemplate(template.TemplateId).then(response => {
        const { outputFile } = this.options();

        this.requestCount++;
        this.templateConfig.push(templateObject(response));

        // If this is the last template
        if (this.requestCount === this.totalTemplates) {
          spinner.stop(true);

          // If output file exists
          if (grunt.file.exists(outputFile)) {
            // Ask user to confirm overwrite
            prompt([{
              type: 'confirm',
              name: 'overwrite',
              default: false,
              message: `${outputFile} already exists. Are you sure you want to overwrite it?`
            }]).then(answers => {
              // If user answered yes
              if (answers.overwrite) {
                writeFile(outputFile, done);
              } else {
                grunt.log.writeln('Canceling operation.');
                done();
              }
            });
          } else {
            writeFile(outputFile, done);
          }
        }
      }).catch(error => {
        grunt.fail.fatal(error);
        done(false);
      });
    }

    /**
     * Write template config file to path
     * @param  {String}   outputFile
     * @param  {Function} done
     */
    const writeFile = (outputFile, done) => {
      grunt.file.write(outputFile, JSON.stringify(this.templateConfig, null, 2));
      grunt.log.writeln(`The template config has been saved to ${outputFile}.\n\nNOTE: Before using the config with the "postmarkPushTemplates" task, be sure to update the htmlBody and textBody fields so they reference a local template.`.green);
      done();
    }

    /**
     * Generate a template model
     * @param  {Object} template
     * @return {Object}
     */
    const templateObject = (template) => ({
      name: template.Name,
      alias: template.Alias ? template.Alias : undefined,
      id: !template.Alias ? template.TemplateId : undefined,
      subject: template.Subject,
      htmlBody: '/path/to/file.html',
      textBody: '/path/to/file.txt'
    });

  });
};
