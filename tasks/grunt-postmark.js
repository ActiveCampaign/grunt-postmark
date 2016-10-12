/*
 * grunt-postmark
 * https://github.com/wildbit/grunt-postmark.git
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('postmark', 'Send emails through Postmark', function() {

    var done = this.async(),
        options = this.options(),
        _data = this.data;

    // Check for server token
    if (!options.serverToken && !_data.serverToken) { 
      grunt.fail.warn('Missing Postmark server token \n');
    }

    // Postmark lib
    var postmark = require('postmark')(options.serverToken || _data.serverToken);

    if (this.files.length > 0) {

      var message = {
        'From': _data.from || options.from, 
        'To': _data.to || options.to, 
        'Subject': _data.subject || options.subject
      };

      // Send batch API request based off number of emails
      if (this.filesSrc.length > 1) {
        // Send batch messages
        var messages = [];

        this.filesSrc.forEach(function(path) {
          var obj = clone(message);
          obj.HtmlBody = grunt.file.read(path);
          messages.push(obj);
        });

        postmark.batch(messages, function(err, response) {
          handleResponse(err, response, done);
        });

      } else {
        // Send single message
        message.HtmlBody = grunt.file.read(this.filesSrc);

        postmark.send(message, function(err, response) {
          handleResponse(err, response, done);
        });
      }
    
    } else {
      // Warn about no files being passed to task
      grunt.log.warn('No src file found \n');
    }

  });


  function handleResponse(err, response, done) {
    err ? errorMessage(err) : successMessage(response);
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
