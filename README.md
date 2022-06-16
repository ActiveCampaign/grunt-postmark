# grunt-postmark

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

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

You'll need to add a [`config.json`](https://github.com/activecampaign/mailmason/wiki/Getting-Started#create-configjson-required) and a [`secrets.json`](https://github.com/activecampaign/mailmason/wiki/Getting-Started#create-secretsjson-optional) per the `mailmason` configuration.

## Postmark task
_Run this task with the `grunt postmark` command._

### Options

#### serverToken
Your server token can be found on your server’s credentials page on [Postmark’s](http://postmarkapp.com) app.

Type: `String`


#### from
This is the from address you are using to send the email. This must be a confirmed address that's set up on [Postmark’s](http://postmarkapp.com) sender signatures.

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
       serverToken: 'POSTMARK_API_TEST',
       from: 'you@youremail.com',
       to: 'you@youremail.com',
       subject: 'Yo',
       src: ['test/email.html']
     }
   }
});
```

#### Specify options through targets or globally
Options specified through a target will always take precedence over global options.

```javascript
grunt.initConfig({
  postmark: {
     options: {
       serverToken: 'POSTMARK_API_TEST',
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
       src: ['test/email.html', 'test/email2.html']
     }
   }
});
```

## Postmark templates task
_Run this task with the `grunt postmark-templates` command._

The `postmark-templates` task is an alias of the `postmark-templates-from-targets` task which is itself a two  stepped task – `postmark-templates-upload` followed by `postmark-templates-output`.

`postmark-templates` (`postmark-templates-from-targets`) is intended for programmatic usage from other grunt tasks.

### `postmark-templates-upload` Targets

#### name
The name of your template.

Type: `String`


#### subject
The subject line of your template.

Type: `String`

#### htmlSrc
A path to the generated HTML for your template. *Not used if `htmlBody` is specified.*

Type: `String`


#### textSrc
A path to the generated plain text for your template. *Not used if `textBody` is specified.*

Type: `String`

#### htmlBody
The generated HTML content of your template. *Not required if `htmlSrc` is specified.*

Type: `String`


#### textBody
The generated plain text content of your template. *Not required if `textSrc` is specified.*

Type: `String`


### `postmark-templates-upload` Options

#### serverToken
Your server token can be found on your server’s credentials page on [Postmark’s](http://postmarkapp.com) app.

Type: `String`


#### ephemeralUploadResultsProperty
This is the name of a temporary grunt task configuration property used to communicate the upload results between `postmark-templates-upload` and `postmark-templates-output` without having to write a temporary file. **This should be the same value as `ephemeralUploadResultsProperty` for `postmark-templates-output`.**

Type: `String`


### `postmark-templates-output` Options

#### outputFile
The name of a file to output the results of the upload to Postmark.

Type: `String`


#### cleanOutput
If `true`, do not export `htmlBody`, `htmlSrc`, `textBody` or `textSrc` in the specified `outputFile`.

Type: `Boolean`


#### ephemeralUploadResultsProperty
This is the name of a temporary grunt task configuration property used to communicate the upload results between `postmark-templates-upload` and `postmark-templates-output` without having to write a temporary file. **This should be the same value as `ephemeralUploadResultsProperty` for `postmark-templates-upload`.**

Type: `String`


### Example

```javascript
grunt.initConfig({
  'postmark-templates-upload': {
    options: {
      serverToken: 'POSTMARK_API_TEST',
      ephemeralUploadResultsProperty: 'temp'
    },
    test_email: {
      name: 'testing-postmark-templates-js1',
      subject: 'Testing grunt-postmark-templates',
      htmlSrc: 'test/email.html',
      textSrc: 'test/email.txt'
    },
    test_email_inline_body: {
      name: 'testing-postmark-templates-js3',
      subject: 'Testing grunt-postmark-templates (inline body)',
      htmlBody: '<html><body><h1>Another email test</h1></body></html>',
      textBody: 'Hello from grunt-postmark-templates\n'
    }
  },
  'postmark-templates-output': {
    options: {
        cleanOutput: true,
        outputFile: 'templates.json',
        ephemeralUploadResultsProperty: 'temp'
    }
  }
});
```

## Postmark templates (from file) task
_Run this task with the `grunt postmark-templates-from-file` command._

The `postmark-templates-from-file` task invokes the `postmark-templates` task with targets read from a JSON file (via `postmark-templates-parse`).

This task is intended for standalone, manual usage.


### `postmark-templates-parse` Options

#### inputFile
The name of a file that specifies templates for uploading to Postmark. These templates take the same shape as defined by `postmark-templates-upload`. This should usually be the same value as `outputFile` for `postmark-templates-output`.

Type: `String`


### Example

In your `Gruntfile`:

```javascript
grunt.initConfig({
  'postmark-templates-parse': {
    options: {
      inputFile: 'templates.json'
    }
  },
  'postmark-templates-upload': {
    options: {
      serverToken: 'POSTMARK_API_TEST',
      ephemeralUploadResultsProperty: 'temp'
    }
  },
  'postmark-templates-output': {
    options: {
      cleanOutput: true,
      outputFile: 'templates.json',
      ephemeralUploadResultsProperty: 'temp'
    }
  }
});
```

In the file specified by `inputFile`, in this case, `templates.json`:

```json
{
  "test_email": {
    "name": "testing-postmark-templates-js1",
    "subject": "Testing grunt-postmark-templates",
    "htmlSrc": "test/email.html",
    "textSrc": "test/email.txt"
  },
  "test_email_again": {
    "name": "testing-postmark-templates-js2",
    "subject": "Testing grunt-postmark-templates (again)",
    "htmlSrc": "test/email.html",
    "textSrc": "test/email.txt"
  },
  "test_email_inline_body": {
    "name": "testing-postmark-templates-js3",
    "subject": "Testing grunt-postmark-templates (inline body)",
    "htmlBody": "<html><body><h1>Another email test</h1></body></html>",
    "textBody": "Hello from grunt-postmark-templates\n"
  }
}
```