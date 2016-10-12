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
        from: 'you@youremail.com',
        to: 'you@youremail.com',
        subject: 'Yo',
        src: ['test/email.html']
      },
      bulk: {
        from: 'you@youremail.com',
        to: 'you@youremail.com',
        subject: 'Hey',
        src: ['test/*.html']
      }
    }

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['postmark']);

};
