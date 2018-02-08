# Ermes

> Ermes is an editor <i>Hosted in Github</i> made for <i>Github</i>.
asdasdas

Empowers static-websites by enabling login-free contributions for thoose websites hosted in the popular version control service.

Just link from your website with a simple button [![Edit](http://www.ideabile.com/ermes/static/edit.svg)](http://www.ideabile.com/ermes/#!/Ideabile/ermes/README.md)

## How to use it
You can just include a link in your website and point to the right repository informations.

### Markdown
``` markdown
[![Edit this page](http://www.ideabile.com/ermes/static/edit.svg)](http://www.ideabile.com/ermes/#/Ideabile/ermes/README.md)
```

### Html
```html
<a href="http://www.ideabile.com/ermes/#/Ideabile/ermes/README.md">
    <img alt="" :src="`${baseUrl}static/edit.svg`"/>
</a>
```


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```
