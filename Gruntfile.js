/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function (grunt) {
  var secret = grunt.file.readJSON('secrets.json');
  var config = grunt.file.readJSON('config.json');

  grunt.initConfig({
    secret: secret,
    config: config,

    /* Postmark
     ------------------------------------------------- */
    postmark: {
      options: {
        serverToken: "<%= secret.postmark.server_token %>",
      },
      email: {
        from: "<%= config.postmark.from %>",
        to: "<%= config.postmark.to %>",
        subject: "<%= config.postmark.subject %>",
        src: ['test/email.html']
      },
      bulk: {
        from: "<%= config.postmark.from %>",
        to: "<%= config.postmark.to %>",
        subject: "<%= config.postmark.subject %>",
        src: ['test/*.html']
      }
    },

    // you can either specify the template configuration here, or in templates.json
    'postmark-templates-upload': config.templates && config.templates
      ? config.templates.output_file || config.templates.file
      : {
        test_email: {
          name: 'testing-postmark-templates-js1-' + new Date().valueOf(),
          subject: 'Testing grunt-postmark-templates',
          htmlBody: 'test/email.html',
          textBody: 'test/email.txt',
        },
        test_email_again: {
          name: 'testing-postmark-templates-js2-' + new Date().valueOf(),
          subject: 'Testing grunt-postmark-templates',
          htmlBody: 'test/email.html',
          textBody: 'test/email.txt',
        }
      },

    'postmark-templates-output': {
      options: {
        outputFile: '<%= config.templates.output_file || config.templates.file %>',
        cleanOutput: '<%= config.templates.clean_output %>'
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['postmark', 'postmark-templates']);

};
