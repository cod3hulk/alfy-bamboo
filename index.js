'use strict';
const alfy = require('alfy');
const alfredNotifier = require('alfred-notifier');
const fuzzy = require('fuzzy');

alfredNotifier();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const host = alfy.config.get('bamboo.host') || 'localhost'
const port = alfy.config.get('bamboo.port') || 8080;
const user = alfy.config.get('bamboo.user') || 'admin';
const password = alfy.config.get('bamboo.password') || 'admin';
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
