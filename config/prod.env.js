'use strict'

const README = JSON.stringify({ content: require('./readme') });

module.exports = {
  NODE_ENV: '"production"',
  URL_BASE: '"http://www.ideabile.com/ermes/"',
  README
}
