/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function (grunt) {
  var secret = grunt.file.readJSON('secrets.json');
  var config = grunt.file.readJSON('config.json');

  grunt.initConfig({
    secret: secret,
    config: config,

    /* Postmark
     ------------------------------------------------- */
    postmark: {
      options: {
        serverToken: "<%= secret.postmark.server_token %>"
      },
      email: {
        from: "<%= config.postmark.from %>",
        to: "<%= config.postmark.to %>",
        subject: "<%= config.postmark.subject %>",
        src: ["test/email.html"]
      },
      bulk: {
        from: "<%= config.postmark.from %>",
        to: "<%= config.postmark.to %>",
        subject: "<%= config.postmark.subject %>",
        src: ["test/*.html"]
      }
    },

    "postmark-templates-upload": {
      options: {
        ephemeralUploadResultsProperty: "<%= config.templates && config.templates.ephemeralUploadResultsProperty %>",
        serverToken: "<%= secret.postmark.server_token %>"
      },
      test_email: {
        name: "testing-postmark-templates-js1-" + new Date().valueOf(),
        subject: "Testing grunt-postmark-templates",
        htmlSrc: "test/email.html",
        textSrc: "test/email.txt"
      },
      test_email_again: {
        name: "testing-postmark-templates-js2-" + new Date().valueOf(),
        subject: "Testing grunt-postmark-templates (again)",
        htmlSrc: "test/email.html",
        textSrc: "test/email.txt"
      },
      test_email_inline_body: {
        name: "testing-postmark-templates-js3-" + new Date().valueOf(),
        subject: "Testing grunt-postmark-templates (inline body)",
        htmlBody: "<html><body><h1>Another email test</h1></body></html>",
        textBody: "Hello from grunt-postmark-templates\n"
      }
    },

    "postmark-templates-output": {
      options: {
          cleanOutput: "<%= config.templates && config.templates.cleanOutput %>",
          outputFile: "<%= config.templates && config.templates.outputFile || config.templates && config.templates.file %>",
          ephemeralUploadResultsProperty: "<%= config.templates && config.templates.ephemeralUploadResultsProperty %>"
      }
    },

    "postmark-templates-parse": {
      options: {
        inputFile: "<%= config.templates && config.templates.inputFile || config.templates && config.templates.file %>"
      }
    }
  });

  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["postmark", "postmark-templates"]);

};
