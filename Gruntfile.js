/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  grunt.initConfig({

    /* Postmark
    ------------------------------------------------- */
    postmark: {
      options: {
        serverToken: 'POSTMARK_API_TEST'
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
