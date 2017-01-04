/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  grunt.initConfig({
    secrets: grunt.file.exists('secrets.json') ? grunt.file.readJSON('secrets.json') : {},
    templates: grunt.file.exists('templates.json') ? grunt.file.readJSON('templates.json') : null,

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
    'postmark-templates': {
      test_email_file: {
        name: 'testing-postmark-templates-js-' + new Date().valueOf(),
        subject: 'Testing grunt-postmark-templates',
        // NOTE these are read from filesystem. globbing not supported
        htmlBody: 'test/email.html',
        textBody: 'test/email.txt',
      }
    }

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['postmark', 'postmark-templates']);

};
