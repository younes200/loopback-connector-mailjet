## loopback-connector-mailjet

Loopback connector module which allow to send emails via Mailjet.

## 1. Installation

````sh
npm install loopback-connector-mailjet --save
````

## 2. Configuration

datasources.json

    {
        "mailjet": {
            "connector": "loopback-connector-mailjet",
            "apiKey": "${MAILJET_API_KEY}",
            "apiSecret":"${MAILJET_API_SECRET}"
        }
    }

model-config.json

    {
        "Email": {
            "dataSource": "mailjet",
            "public": false
        }
    }

Additionaly you can set defaults or connection options

    {
        "mailjet": {
            "connector": "loopback-connector-mailjet",
            "apikey": "[your api key here]",
            "default": {
                "fromEmail": "contact@interactive-object.com",
                "fromName": "Anna"
            },
            "options": {
                "url": "api.mailjet.com", 
                "version": "v3.1",
                perform_api_call: false
            },
            
        }
    }

## 3. Use

Basic option same as built in Loopback. Returns a Promise

    loopback.Email.send({
        to: "to@to.com",
        from: "fron@from.com",
        subject: "subject",
        text: "text message",
        html: "html <b>message</b>",
        headers : {
            "X-My-Header" : "My Custom header"
        }
    })
    .then(function(response){})
    .catch(function(err){});


Basic option for templates

    loopback.Email.send({
        to: "to@to.com",
        from: "fron@from.com",
        subject: "subject",
        templateId: "11111",
        templateVars: {
          "VAR": "VALUE"
        }
    })
    .then(function(response){})
    .catch(function(err){});

## License
Copyright (c) 2016 [Interactive Object](https://www.interactive-object.com) . Licensed under the MIT license.
