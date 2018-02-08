<template>
    <div id="app">
        <div class="edit" :class="{ pr: submittingPR }" v-if="content !== ''">
            <div class="edit__pr__modal">
                <b>Describe your changes</b>
                <textarea ref="commitMessage"></textarea>
                <a class="button" v-on:click="save">Create Pull Request</a>
            </div>
            <div class="edit__bar">
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

                <div class="edit__bar--right">
                    <img alt="Ermes" :src="`${baseUrl}static/logo.png`" class="logo" height="30px"/>
                    <FileSearch
                        @update:user="val => setFileSearch('user', val)"
                        :user="user"
                        @update:repo="val => setFileSearch('repo', val)"
                        :repo="repo"
                        @update:path="val => setFileSearch('path', val, true)"
                        :path="path" />
                    <a class="button" v-on:click="createPullRequest">Send Changes</a>
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
        <div class="intro" v-if="!content">
            <div class="logo">
                <img alt="Ermes" :src="`${baseUrl}static/logo.png`"/>
            </div>
            <div class="branding">
                <div class="try-out">
                    <h3>Just</h3>
                    <FileSearch
                        @update:user="val => setFileSearch('user', val)"
                        :user="user"
                        @update:repo="val => setFileSearch('repo', val)"
                        :repo="repo"
                        @update:path="val => setFileSearch('path', val)"
                        :path="path" />
                    <a class="button" v-on:click="fetchSource">Try!</a>
                </div>
                <div v-html="readme"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
 #app {
     font-family: Helvetica, sans-serif;
     font-size: 0.8em;
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
     height: 30px;
     vertical-align: middle;
     margin: 10px 5px 0 5px;
 }

 .edit__bar--left {
     float: left;
 }

 .edit__bar--right {
     float: right;
     vertical-align: middle;
 }

 .edit__bar--right > *{
     display: inline-block;
     float: left;
     margin: 4px;
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

 img.logo, .user {
     float: right;
 }

 ul.nav {
     list-style: none;
     margin: 0;
     padding: 0;
 }

 .editor {
     border: 1px solid #e4e4e4;
     display: flex;
     flex-flow:column;
 }

 .intro .logo {
     text-align: center;
     width: 100%;
 }

 .intro .logo img {
     height: 200px;
 }

 .branding .button {
     margin: 0 10px;
 }

 ul.nav li {
     display: inline-block;
     padding: 10px;
     border: 1px solid #e4e4e4;
     border-bottom: 0;
     background: #f6f6f6;
 }
</style>
<script>
 /* eslint-disable */
 import axios from 'axios'
 import SourceEditor from '@/components/SourceEditor'
 import User from '@/components/User'
 import FileSearch from '@/components/FileSearch'
 import Preview from '@/components/Preview'
 import Turndown from 'turndown'

 require('github-markdown-css/github-markdown.css');

 const turndownService = new Turndown();

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

             const url = `//api.github.com/repos/${this.user}/${this.repo}/contents/${this.path}`;

             try {

                 const { data } = await axios.get(url) || {};
                 window.location.hash = `#/${this.user}/${this.repo}/${this.path}`;
                 this.content = atob(data.content);
                 this.hasChanged = false;

             } catch(e) {

                 console.log(e);

             }

         },

         setSourceFromUrlHash() {
             if (!window.location.hash) return;
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
