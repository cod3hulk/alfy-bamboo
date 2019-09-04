'use strict';
const alfy = require('alfy');
const alfredNotifier = require('alfred-notifier');
const fuzzy = require('fuzzy');
const url = require('url');
const fs = require('fs');
const axios = require('axios');

alfredNotifier();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

const home = process.env.HOME || process.env.USERPROFILE;
const configFile = process.argv[3] || `${home}/.alfy-bamboo.json`
const configs = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const fuzzy_options = {
  extract: function(e) {
    return e.name;
  }
};
const config = {
  auth: {
    username: configs.user,
    password: configs.password
  },
  params: {
    'max-results': 1000,
    json: true
  }
}

axios.get(
  `${configs.host}/rest/api/latest/plan`,
  config
).then(res => {
  return res.data.plans.plan
}).then(plans => {
  return fuzzy.filter(alfy.input, plans, fuzzy_options)
}).then((filteredPlans) => {
  return filteredPlans.map(plan => {
    return {
      title: plan.original.name,
      subtitle: plan.original.shortName,
      arg: `https:\/\/${url.parse(plan.original.link.href).hostname}/browse/${plan.original.key}`
    }
  });
}).then(res => {
  alfy.output(res)
})

