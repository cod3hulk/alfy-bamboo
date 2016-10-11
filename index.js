'use strict';
const alfy = require('alfy');
const alfredNotifier = require('alfred-notifier');
const fuzzy = require('fuzzy');
const fs = require('fs');

alfredNotifier();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const home = process.env.HOME || process.env.USERPROFILE;
const configFile = process.argv[3] || `${home}/.alfy-bamboo.json`
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const host = config.host || 'localhost'
const port = config.port || 8080;
const user = config.user || 'admin';
const password = config.password || 'admin';
const auth = new Buffer(`${user}:${password}`).toString('base64')

const options = {
  method: 'GET',
  query: {
    query: alfy.input
  },
  headers: {
    'Authorization': 'Basic ' + auth
  },
  maxAge: 300000
};

const fuzzy_options = {
  extract: function(e) {
    return e.name;
  }
}

alfy.fetch(`${host}:${port}/rest/api/latest/plan?max-result=1000`, options).then(data => {
  const items = fuzzy.filter(alfy.input, data.plans.plan, fuzzy_options)
    .map(x => ({
      title: x.original.name,
      arg: `${host}:${port}/browse/${x.original.key}`
    }));

  alfy.output(items);
});
