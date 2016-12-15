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
    },

    "postmark-servers": {
      options: {
        accountToken: '<%= secrets.accountToken %>',
      },
      build: {
        name: "testing-server-" + new Date().valueOf(),
        smtpApiActivated: true,

        // NOTE complete list of server attributes:
        // http://developer.postmarkapp.com/developer-api-servers.html#create-server
      }
    },

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['postmark', 'postmark-templates', 'postmark-servers']);

};
