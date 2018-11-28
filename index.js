'use strict';
const alfy = require('alfy');
const alfredNotifier = require('alfred-notifier');
const fuzzy = require('fuzzy');
const fs = require('fs');
const rp = require('request-promise');
const Promise = require('bluebird');
const url = require('url');

alfredNotifier();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

const home = process.env.HOME || process.env.USERPROFILE;
const configFile = process.argv[3] || `${home}/.alfy-bamboo.json`
const configs = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const options = configs.map(function(config) {
  const auth = new Buffer(`${config.user}:${config.password}`).toString('base64')
  return {
    uri: `${config.host}/rest/api/latest/plan`,
    headers: {
      'Authorization': `Basic ${auth}`
    },
    qs: {
      'query': alfy.input,
      'max-results': 1000
    },
    json: true
  }
});

const fuzzy_options = {
  extract: function(e) {
    return e.name;
  }
};

Promise.map(options, function(option) {
  return rp(option)
    .then(function(data) {
      return fuzzy.filter(alfy.input, data.plans.plan, fuzzy_options);
    });
}).then(function(plans) {
  const items = plans.reduce(function(a,b) {
    return a.concat(b);
  }).map(plan => ({
    title: plan.original.name,
    subtitle: plan.original.shortName,
    arg: `https:\/\/${url.parse(plan.original.link.href).hostname}/browse/${plan.original.key}`
  }));

  alfy.output(items);
});
