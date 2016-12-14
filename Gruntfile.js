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
        from: '<%= secrets.testEmailSender %>',
        to: '<%= secrets.testEmailSender %>',
        subject: 'Yo',
        src: ['test/email.html']
      },
      bulk: {
        from: '<%= secrets.testEmailSender %>',
        to: '<%= secrets.testEmailSender %>',
        subject: 'Hey',
        src: ['test/*.html']
      }
    }

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['postmark']);

};
