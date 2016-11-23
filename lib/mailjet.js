"use strict";
var assert = require('assert');
var _ = require('lodash');
var Q = require('q');


var Mailer = function Mailer() {};
var Mailjet = require('node-mailjet')

const log = require('debug')('challengiz:connector:mailjet')


/* eslint-disable no-unused-vars */
var mailjetInstance = {};
var mailjetSettings = {};
/* eslint-enable no-unused-vars */

var MailjetConnector = function MailjetConnector(settings) {
  assert(typeof settings === 'object', 'cannot init connector without settings');
  assert(typeof settings.apiKey === 'string', 'cannot init connector without api key');
  assert(typeof settings.apiSecret === 'string', 'cannot init connector without api secret');

  if (settings.apiKey && settings.apiSecret) {
    this.mailjet = Mailjet.connect(settings.apiKey, settings.apiSecret); //eslint-disable-line
  }

  this.mailjetSettings = settings;
  mailjetSettings = this.mailjetSettings;

  mailjetInstance = this.mailjet;
};

MailjetConnector.initialize = function (dataSource, callback) {
  dataSource.connector = new MailjetConnector(dataSource.settings);
  callback();
};

MailjetConnector.prototype.DataAccessObject = Mailer;

/**
 * Send transactional email with options
 * Full list of options are available here: https://www.npmjs.com/package/sendgrid#available-params
 *
 * @param {Object} options
 * {
 *   from: { name: "John", email: "john@cellarise.com" },
 *   to: "mail@cellarise.com",
 *   subject: "Test mail",
 *   text: "Plain text message",
 *   html: "<b>Html messages</b> here"
 * }
 *
 * @param {Function} cb callback
 * @returns {Function} deferred promise
 */
Mailer.send = function (options, cb) { // eslint-disable-line
  var dataSource = this.dataSource,
    connector = dataSource.connector,
    deferred = Q.defer(),
    emailData = {},
    request;

  var fn = function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
    return cb && cb(err, result);
  };



  assert(connector, 'Cannot send mail without a connector!');

  if (connector.mailjet) {

    //email from param
    if (_.isString(options.from)) {
      emailData.FromEmail = options.from;
    } else if (_.isObject(options.from)) {
      emailData.FromName = options.from.name;
      if (options.from.hasOwnProperty('address')) {
        emailData.FromEmail = options.from.address;
      } else if (options.from.hasOwnProperty('email')) {
        emailData.FromEmail = options.from.email;
      }
      delete options.from;
    } else {
      if (mailjetSettings.default.fromName) {
        emailData.FromName = mailjetSettings.default.fromName;
      }
      if (mailjetSettings.default.fromEmail) {
        emailData.FromEmail = mailjetSettings.default.fromEmail || '';
      }
    }
    

    //email to param
    if (_.isString(options.to)) {
      options.to = _.map(options.to.split([',', ';']),
        function (email) {
          return {
            "Email": email
          };
        })
    }


    if (_.isArray(options.to)) {
      emailData.Recipients = options.to;
    } else {
      log('invalid format for "to"', options.to)
      throw new Error('invalid format for "to"');
    }
    delete options.to;


    if (options.html) {
      emailData["Html-part"] = options.html
      delete options.html;
    }

    if (options.text) {
      emailData["Text-part"] = options.text
      delete options.text;
    }

    if (options.subject) {
      emailData["Subject"] = options.subject
      delete options.subject;
    }


    if (_.isObject(options.headers)) {
      emailData["Headers"] = options.headers;
      delete options.subject;
    }

    if (options.templateId) {
      emailData["MJ-TemplateID"] = options.templateId
      emailData["MJ-TemplateLanguage"] = true
      delete options.templateId;
    }

    if (_.isObject(options.templateVars)) {
      emailData["Vars"] = options.templateVars
      delete options.templateVars;
    }

    //merge the rest of the options
    emailData = _.merge(emailData, options)

    connector.mailjet.post("send").request(emailData)
      .then(result => {
        log(result.body);
        fn(null, result.body);
      })
      .catch(err => {
        log("send failed with statusCode", err.statusCode);
        fn(err);
      })

    /*attachments
    if (R.is(Array, options.attachments)) {
      R.forEach(function eachFile(fileConfig) {
        sendgridEmail.addAttachment(fileConfig);
      }, options.attachments);
    }
    if (options.files) {
      R.forEach(function eachFile(fileConfig) {
        sendgridEmail.addAttachment(fileConfig);
      }, options.files);
    }*/


  } else {
    process.nextTick(function nextTick() { // eslint-disable-line
      fn(null, options);
    });
  }
  return deferred.promise;
};

Mailer.subscribe = function (options, cb) {

  var dataSource = this.dataSource,
    connector = dataSource.connector,
    deferred = Q.defer(),
    emailData = {},
    request;

  var fn = function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
    return cb && cb(err, result);
  };

  assert(connector, 'Cannot subscribe mail without a connector!');

  if (connector.mailjet) {

    if (!options.email) {
      throw new Error('Email required');
    }

    connector.mailjet
      .post("contact")
      .action("managemanycontacts")
      .request({
        "ContactsLists": [{
          "ListID": options.contactsListId,
          "action": "addnoforce"
      }],
        "Contacts": [{
          "Email": options.email
        }]
      }).then(result => {
        fn(null, result);
      })
      .catch(err => {
        log(err)
        fn(err);
      })

  }
}

Mailer.unsubscribe = function (options, cb) {

  var dataSource = this.dataSource,
    connector = dataSource.connector,
    deferred = Q.defer(),
    emailData = {},
    request;

  var fn = function (err, result) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(result);
    }
    return cb && cb(err, result);
  };

  assert(connector, 'Cannot unsubscribe mail without a connector!');

  if (connector.mailjet) {

    if (!options.email) {
      throw new Error('Email required');
    }

    connector.mailjet
      .post("contact")
      .action("managemanycontacts")
      .request({
        "ContactsLists": [{
          "ListID": options.contactsListId,
          "action": "remove"
      }],
        "Contacts": [{
          "Email": options.email
        }]
      }).then(result => {
        fn(null, result);
      })
      .catch(err => {
        log(err)
        fn(err);
      })

  }
}


/**
 * Send an email instance using instance
 */

Mailer.prototype.subscribe = function (fn) {
  return this.constructor.subscribe(this, fn);
};


/**
 * Send an email instance using instance
 */

Mailer.prototype.unsubscribe = function (fn) {
  return this.constructor.unsubscribe(this, fn);
};

/**
 * Subscrive instance using instance
 */

Mailer.prototype.send = function protoSend(fn) {
  return this.constructor.send(this, fn);
};


/**
 * Export the connector class
 */
module.exports = MailjetConnector;