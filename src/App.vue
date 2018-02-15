<template>
    <div id="app">
        <div class="edit" :class="{ pr: submittingPR }" v-if="fetched">
            <div class="edit__pr__modal">
                <b>Describe your changes</b>
                <textarea ref="commitMessage"></textarea>
                <a class="button" v-on:click="save">Create Pull Request</a>
            </div>
            <div class="edit__bar">
                <h1 class="logo">
                    <b>Ermes</b>
                    <span>a github editor, for everyone.</span>
                    <Credits />
                </h1>

                <div class="edit__bar--right">
                    <div>
                        <a class="button" v-on:click="createPullRequest">Send Changes</a>
                    </div>
                </div>

                <div class="edit__bar--left">
                    <FileSearch
                        @update:user="val => setFileSearch('user', val)"
                        :user="user"
                        @update:repo="val => setFileSearch('repo', val)"
                        :repo="repo"
                        @update:path="val => setFileSearch('path', val, true)"
                        :path="path" />
                    <div>
                        <a class="button" :class="{ hide: !fileChanged }" v-on:click="fetchSource">Change file</a>
                    </div>
                </div>
            </div>

            <div class="edit__body">
                <SourceEditor
                    class="edit__body__source"
                    ref="editor"
                    @update:source="setSource"
                    :content="content"
                    :lang="language"/>
                <Preview
                    class="edit__body__preview"
                    ref="wysiwyg"
                    :content="content"
                    :lang="language"/>
            </div>
        </div>
        <div v-if="!fetched">
            <div v-html="readme" class="intro markdown-body"></div>
            <Credits />
        </div>
    </div>
</template>

<style scoped>
 .hide {
     display: none;
 }
 .logo {
     line-height: 13px;
     font-size: 13px;
     padding: 0 10px;
 }

 .logo span {
     color: #666;
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
     vertical-align: middle;
     margin: 0 5px 0 5px;
 }

 .edit__bar--left {
     float: left;
 }

 .edit__bar--right {
     float: right;
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

 .edit__body__source {
     width: 50%;
     min-height: 100%;
     float: left;
 }

 .edit__body__preview {
     width: calc(50% - 40px);
     max-height: calc(87vh);
     overflow-y: scroll;
     float: right;
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
     margin: 60px 100px;
 }

 ul.nav li {
     display: inline-block;
     padding: 10px;
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
 import Credits from '@/components/Credits'

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
         FileSearch,
         Credits
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
             fileChanged: false,
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

             if (type === 'path' && value !== '' && autofetch) {
                 this.fileChanged = true;
             }
         },

         defferedFetchSource(seconds = 1000) {
             if (this._timeout) clearTimeout(this._timeout);
             this._timeout = setTimeout(() => this.fetchSource(), seconds);
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
                 this.fileChanged = false;

                 setTimeout(() => this.bindScrolling());

                 window.document.body.classList.remove('loading');

             } catch(e) {


                 console.log(e);

             }


         },

         bindScrolling() {
             //const editorBox = this.$refs.editor.$el.querySelector('.ace_scrollbar-inner').getBoundingClientRect();
             //const wysiwygBox = this.$refs.wysiwyg.$el.querySelector('.markdown-body').getBoundingClientRect();
             //this.$refs.editor.editor.session.on("changeScrollTop", (value) => {
             //});
             //this.$refs.wysiwyg.$el.addEventListener('scroll', () => console.log('preview scroll'));
         },

         setSourceFromUrlHash() {
             if (!window.location.hash) {
                 window.document.body.classList.remove('loading');
                 return;
             }

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
