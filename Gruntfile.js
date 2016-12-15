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
        name: "testing-template-node-js-" + new Date().valueOf(),
        subject: "Testing grunt-postmark-templates",
        // NOTE these are read from filesystem. globbing not supported
        htmlFile: 'test/email.html',
        textFile: 'test/email.txt',
      }
    }

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['postmark', 'postmark-templates']);

};
