<template>
  <div id="app">
    <div class="edit" :class="{ pr: submittingPR }" v-if="fetched">
      <div class="edit__pr__modal">
        <b>Describe your changes</b>
        <textarea ref="commitMessage"></textarea>
        <a class="button" v-on:click="save">Create Pull Request</a>
      </div>
      <h1 class="logo">
        <b>Ermes</b>
        <span>a github editor, for everyone.</span>
        <div class="credits">
          Open Sourced
          <a href="https://github.com/Ideabile/ermes">
            <img alt="GitHub logo" src="static/github.svg"/>
          </a> with ♥ and javascript by <a href="http://www.ideabile.com">Ideabile</a>
          </div>
      </h1>
      <div class="edit__bar">
        <div class="edit__bar--file">
          <FileSearch
          @update:user="val => setFileSearch('user', val)"
            :user="user"
            @update:repo="val => setFileSearch('repo', val)"
            :repo="repo"
            @update:path="val => setFileSearch('path', val, true)"
            :path="path" />
          <a class="button" v-on:click="createPullRequest">Send Changes</a>
        </div>
        <div class="edit__bar--left">
          <ul class="nav">
            <li
              class="nav-item"
              v-on:click="switchMode('source')">Source</li>

            <li
              v-if="isHtml"
              class="nav-item"
              v-on:click="switchMode('wysiwyg')">Preview</li>

          </ul>
        </div>
      </div>

      <div class="edit__body">
        <SourceEditor
          v-if="mode === 'source'"
          class="edit__body__source"
          @update:source="setSource"
          :content="content"
          :lang="language"/>

        <Preview
          v-if="mode === 'wysiwyg'"
          class="edit__body__preview"
          ref="wysiwyg"
          :content="content"
          :lang="language"/>
      </div>
    </div>
    <div v-if="!fetched">
      <div v-html="readme" class="intro markdown-body"></div>
      <div class="credits">
        Open Sourced
        <a href="https://github.com/Ideabile/ermes">
          <img alt="GitHub logo" src="http://www.ideabile.com/ermes/static/github.svg"/>
        </a> with ♥ and javascript by <a href="http://www.ideabile.com">Ideabile</a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .credits {
    height: 20px;
    line-height: 20px;
    text-align: center;
    margin: 10px;
    vertical-align: middle;
  }

  .credits img {
    height: 16px;
  }

  .logo {
    line-height: 13px;
    font-size: 13px;
    margin: 10px;
    min-width: calc(100% - 20px);
    .credits {
      display: none;
      @media(min-width: 40em) {
        display: inline;
      }
    }
  }

  .logo span {
    color: #666;
  }

  .logo img {
    height: 13px;
    vertical-align: middle;
  }

  .logo .credits {
    margin: 0 5px;
    font-size: 8px;
    line-height: 13px;
    float: right;
  }


  .edit {

  }

  .edit.pr:after {
    position: fixed;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    content: "";
    top: 0;
    left: 0;
    z-index: 10;
  }

  .edit__pr__modal {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    margin: -130px 0 0 -150px;
    background: #fff;
    border-radius: 4px;
    padding: 10px;
    z-index: 20;
    width: 300px;
    height: 260px;
    text-align: center;
  }

  .edit__pr__modal textarea {
    margin: 10px;
    width: 80%;
    height: 180px;
  }

  .edit.pr .edit__pr__modal {
    display: block;
  }

  .edit__bar{
    display: flex;
    flex-wrap: wrap;
    width: calc(100% - 10px);
    vertical-align: middle;
    margin: 0 5px 0 5px;
    overflow: hidden;
  }

  .edit__bar--file {
    min-width: 100%;
    display: flex;
    justify-content: space-between;
    margin: 4px;
    margin-bottom: 10px;

    @media(min-width: 40em) {
      margin-bottom: 4px;
      min-width: auto;
      margin-right: auto;
    }

    > a {
      margin: 0 4px;
    }
  }

  .edit__bar--left {
    @media(min-width: 40em) {
      margin-left: auto;
    }
  }

  .edit__bar--right {
    width: 50%;
    margin: 5px 0 0 0;
  }

  .edit__bar--right > *{
    display: inline-flex;
    margin: 4px;
    line-height: 43px;
    float: left;
  }

  .edit__body {
    clear: both;
  }

  .branding {
    margin: 20px;
    max-width: 100%;
  }


  .try-out {
    text-align: center;
  }

  .try-out > * {
    display: inline-block;
    vertical-align: middle;
  }

  .try-out > h3 {
    display: inline;
    float: inherit;
    line-height: 0.3px;
    padding: 0 20px;
  }

  ul.nav {
    display: inline-block;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .editor {
    border: 1px solid #e4e4e4;
    display: flex;
    flex-flow:column;
  }

  .intro {
    margin: 4em 2em;
    @media(min-width: 40em) {
      margin: 4em auto;
      max-width: 40em;
    }
  }

  ul.nav li {
    display: inline-block;
    padding: 4px 10px;
    font-size: .9em;
    border: 1px solid #e4e4e4;
    border-bottom: 0;
    background: #f6f6f6;
    cursor: pointer;
  }
</style>
<script>
  /* eslint-disable */
  import axios from 'axios'
  import SourceEditor from '@/components/SourceEditor'
  import User from '@/components/User'
  import FileSearch from '@/components/FileSearch'
  import Preview from '@/components/Preview'

  function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  }

  require('github-markdown-css/github-markdown.css');

  export default {

    name: 'app',

    components: {
      SourceEditor,
      Preview,
      User,
      FileSearch
    },

    data() {
      return {
        content: '',
        path: 'README.md',
        user: 'Ideabile',
        repo: 'ermes',
        mode: 'source',
        localState: 'saved',
        submittingPR: false,
        hasChanged: false,
        fetched: false,
        baseUrl: process.env.URL_BASE,
        readme: process.env.README.content
      }
    },

    mounted() {
      window.addEventListener("hashchange", () => this.setSourceFromUrlHash(), false);
      this.setSourceFromUrlHash();
    },

    computed: {

      language: {

        get() {

          if (!this.path) return null;

          let ext = this.path.split('.')[1];
          ext = !!ext ? ext.toLowerCase() : '';

          switch ( ext ) {

            case 'php':
            case 'html':

              return ext;

            case 'md':
              return 'markdown';

            case 'js':
              return 'javascript';

          }

          return 'text';


        }

      },

      isHtml: {

        get() {

          return this.language === 'html' || this.language === 'markdown';

        }

      }

    },

    methods: {

      setFileSearch(type, value, autofetch = false) {

        this[type] = value;

        if (type === 'path' && autofetch) this.fetchSource();

      },

      async fetchSource() {

        if (!this.user && !this.repo && !this.path) return;

        const url = `https://api.github.com/repos/${this.user}/${this.repo}/contents/${this.path}`;
        window.document.body.classList.add('loading');

        try {

          const { data } = await axios.get(url) || {};
          window.location.hash = `#/${this.user}/${this.repo}/${this.path}`;
          this.content = b64DecodeUnicode(data.content);
          this.hasChanged = false;
          this.fetched = true;
          window.document.body.classList.remove('loading');

        } catch(e) {

          console.log(e);

        }

      },

      setSourceFromUrlHash() {
        if (!window.location.hash) {
          return window.document.body.classList.remove('loading');
        };
        const hash = window.location.hash.substr(1)

        const hashHasAllRequirements = (
          (!!hash && hash.length > 1) &&
          hash.match(/\//g).length > 0
        );

        const [ empty, user, repo, ...path] = hashHasAllRequirements ? hash.split('/') : [];

        this.user = user || '';
        this.repo = repo || '';
        this.path = path.join('/') || '';


        this.fetchSource();

      },

      switchMode(mode) {

        if (!this.isHtml) return;

        this.mode = mode;

      },

      createPullRequest() {

        if (!this.hasChanged) return;
        this.submittingPR = true;

      },

      setSource(value) {

        if (this.content === value) return;
        this.hasChanged = true;
        this.content = value;

      },

      async save() {

        const { user, repo, path, content } = this;
        this.submittingPR = false;

        try {

          const data = {
            user,
            repo,
            desc: this.$refs.commitMessage.value || 'Ermes contribution',
            files: [
              { path, content }
            ]
          };

          axios.post('https://xrbhog4g8g.execute-api.eu-west-2.amazonaws.com/prod/prb0t', JSON.stringify(data));

        } catch(e) {
          console.log(e);
        }

      },

    }
  }
</script>
