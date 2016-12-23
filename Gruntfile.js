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

    'postmark-servers': {
      options: {
        name: 'testing-server-' + new Date().valueOf(),
        smtpApiActivated: true,

        // NOTE complete list of server attributes:
        // http://developer.postmarkapp.com/developer-api-servers.html#create-server
      },
    },

    'postmark-templates': {
      build: {
        name: 'testing-template-node-js-' + new Date().valueOf(),
        subject: 'Testing grunt-postmark-templates',
        // NOTE these are read from filesystem. globbing not supported
        htmlFile: 'test/email.html',
        textFile: 'test/email.txt',
      }
    },

    // you can either specify the template configuration here, or in templates.json
    'update-templates': {
      'templates': {
        // key is used as template name
        test_email: {
          subject: 'Testing grunt postmark-update-templates task',
          htmlFile: 'test/email.html',
          textFile: 'test/email.txt',
        }
      }
    }

  });

  grunt.loadTasks('tasks');

  // test create of an existing server (by name),
  grunt.registerTask('duplicate-server', ['postmark-servers']);

  grunt.registerTask('update-templates', 'create or update a set of templates', function() {
    grunt.config.set('postmark-templates', grunt.config('templates') || grunt.config('update-templates.templates'));
    grunt.task.run('postmark-templates');
  });

  grunt.registerTask('default', ['postmark', 'postmark-templates', 'postmark-servers', 'duplicate-server']);

};
