/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function (grunt) {
  var secrets = grunt.file.readJSON("secrets.json");
  var config = grunt.file.readJSON("config.json");

  grunt.initConfig({
    secrets: secrets,
    config: config,

    /* Postmark
     ------------------------------------------------- */
    postmark: {
      options: {
        serverToken: "<%= secrets.postmarkServerToken %>"
      },
      email: {
        from: "<%= config.postmark.from %>",
        to: "<%= config.postmark.to %>",
        subject: "<%= config.postmark.subject %>",
        src: ["test/emails/email.html"]
      },
      bulk: {
        from: "<%= config.postmark.from %>",
        to: "<%= config.postmark.to %>",
        subject: "<%= config.postmark.subject %>",
        src: ["test/emails/*.html"]
      }
    },
    "postmark-templates-push": {
      options: {
        templates: "<%= config.templates %>"
      }
    }
  });

  grunt.loadTasks("tasks");
  grunt.registerTask("default", ["postmark"]);
};
