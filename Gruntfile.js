/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  grunt.initConfig({
    secrets: grunt.file.readJSON('secrets.json'),

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

    "postmark-templates": {
      options: {
        serverToken: '<%= secrets.serverToken %>',
      },
      build: {
        name: "testing-template-node-js" + Date(),
        subject: "{{subject}}",
        textBody: "text body for template {{id}}!",
        htmlBody: "{{content}}",
      }
    }

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['postmark', 'postmark-templates']);

};
