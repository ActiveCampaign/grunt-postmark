/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  grunt.initConfig({
    secrets: grunt.file.exists('secrets.json') ? grunt.file.readJSON('secrets.json') : {},

    /* Postmark
    ------------------------------------------------- */
    postmark: {
      options: {
        serverToken: '<%= secrets.serverToken %>'
      },
      email: {
        from: '<%= secrets.testSender %>',
        to: '<%= secrets.testRecipient %>',
        subject: 'Yo',
        src: ['test/email.html']
      },
      bulk: {
        from: '<%= secrets.testSender %>',
        to: '<%= secrets.testRecipient %>',
        subject: 'Hey',
        src: ['test/*.html']
      }
    },

    // you can either specify the template configuration here, or in templates.json
    'postmark-templates': grunt.file.exists('templates.json') ? grunt.file.readJSON('templates.json') : {
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
    }

  });

  grunt.loadTasks('tasks');

  // you can also get a JSON report of uploaded templates (default filename: templates-output.json)
  grunt.registerTask('templates-logged', ['postmark-templates', 'postmark-templates-output']);

  grunt.registerTask('default', ['postmark', 'postmark-templates']);

};
