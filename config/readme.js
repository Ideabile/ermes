const path = require('path')
const fs = require('fs')
const markdown = require('markdown-it')()

module.exports = markdown.render(fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8'));
