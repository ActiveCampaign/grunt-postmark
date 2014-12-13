# grunt-postmark v0.0.1  [![Code Climate](https://codeclimate.com/github/derekrushforth/grunt-postmark/badges/gpa.svg)](https://codeclimate.com/github/derekrushforth/grunt-postmark)

> Send emails through Postmark using GruntJS. You can use this to test your email templates.

## Getting Started

This plugin requires that you have a [Postmark](http://postmarkapp.com) account.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-postmark --save-dev
```

After the plugin is installed, it can be enabled in your Gruntfile:

```js
grunt.loadNpmTasks('grunt-postmark');
```

## Postmark task
_Run this task with the `grunt postmark` command._

### Options


#### serverToken
Your postmark server token can be found on your server’s credentials page.

Type: `String`


#### from
This is the from address you are using to send the email. This must be a confirmed address that's set up on Postmark’s sender signatures.

Type: `String`


#### to
The address you’re sending to.

Type: `String`


####  subject

Type: `String`


### Examples

#### Options specified through target

```javascript
grunt.initConfig({
  postmark: {
     email: {
       serverToken: 'postmark server token'
       from: 'you@youremail.com',
       to: 'you@youremail.com',
       subject: 'Yo',
       src: ['test/email.html']
     }
   }
});```

#### Options support global and target
Options specified through a target will always take precedence over global options.

```javascript
grunt.initConfig({
  postmark: {
     options: {
       serverToken: 'postmark server token'
       from: 'you@youremail.com',
       to: 'you@youremail.com',
       subject: 'Yo'
     },
     email: {
       to: 'joe@youremail.com',
       src: ['test/email.html']
     },
     digest: {
       subject: 'Yo',
       src: ['test/email.html', 'test/email2.html]
     }
   }
});```