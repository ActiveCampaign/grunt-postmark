/*
 * grunt-postmark
 * ttps://github.com/derekrushforth/grunt-postmark.git
 */

module.exports = function(grunt) {

  grunt.initConfig({

    /* JSHint
    ------------------------------------------------- */
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },


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
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint', 'postmark']);

};
