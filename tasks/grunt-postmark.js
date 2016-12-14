/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

module.exports = function(grunt) {

  'use strict';

  grunt.registerMultiTask('postmark', 'Send emails through Postmark', function() {

    var done = this.async();
    var options = this.options();
    var _data = this.data;

    // Check for server token
    if (!options.serverToken && !_data.serverToken) {
      grunt.fail.warn('Missing Postmark server token \n');
    }

    // Postmark lib
    var postmark = require('postmark');
    var client = new postmark.Client(options.serverToken || _data.serverToken);

    if (this.files.length > 0) {

      var message = {
        'From': _data.from || options.from,
        'To': _data.to || options.to,
        'Subject': _data.subject || options.subject
      };

      // If there are multiple source files
      if (this.filesSrc.length > 1) {
        var messages = [];

        // Iterate through each file
        this.filesSrc.forEach(function(path) {
          // Read the file and push it to messages array
          var obj = clone(message);
          obj.HtmlBody = grunt.file.read(path);
          messages.push(obj);
        });

        // Send batch message
        client.sendEmailBatch(messages, function(err, response) {
          handleResponse(err, response, done);
        });

      } else {
        // Read file contents
        message.HtmlBody = grunt.file.read(this.filesSrc);

        // Send single message
        client.sendEmail(message, function(err, response) {
          handleResponse(err, response, done);
        });
      }

    } else {
      // Warn about no files being passed to task
      grunt.log.warn('No src file found \n');
    }

  });


  function handleResponse(err, response, done) {
    var _ = err ? errorMessage(err) : successMessage(response);
    done();
  }

  function errorMessage(response) {
    grunt.log.warn('Error response: ' + JSON.stringify(response));
  }

  function successMessage(response) {
    grunt.log.writeln('Email sent successfully:');
    grunt.log.writeln(JSON.stringify(response));
  }

  function clone(obj) {
     return JSON.parse(JSON.stringify(obj));
  }

};
