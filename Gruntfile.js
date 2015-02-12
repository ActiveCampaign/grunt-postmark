/*
 * grunt-postmark
 * ttps://github.com/derekrushforth/grunt-postmark.git
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
      }
    }

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['postmark']);

};
