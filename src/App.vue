<template>
    <div id="app">
        <div class="edit" v-if="content !== ''">
            <img alt="Ermes" src="/static/logo.png" class="logo" height="30px"/>
            <User class="user" />
            <FileSearch v-bind:user="user" v-bind:repo="repo" v-bind:path="path" />
            <ul class="nav">

                <li
                    class="nav-item"
                    v-on:click="switchMode('source')">Source</li>

                <li
                    v-if="isHtml"
                    class="nav-item"
                    v-on:click="switchMode('wysiwyg')">WYSIWYG</li>

                <li
                    v-bind:class="{ active: localState === 'saved', saving: localState === 'saving' }">Saved</li>

                <li
                    v-on:click="createPullRequest()"
                    v-bind:class="{ active: hasChanged }">Create Pull Request</li>

            </ul>

            <SourceEditor class="editor" v-if="mode === 'source'" :content="content" :lang="language"></SourceEditor>
            <Wysiwyg v-if="mode === 'wysiwyg'" ref="wysiwyg" :content="content" :lang="language"></Wysiwyg>

        </div>
        <div class="file" v-if="!content">
            <div class="logo">
                <img alt="Ermes" src="/static/logo.png"/>
            </div>
            <div class="branding">
                <h1>Ermes</h1>
                <p>
                    Ermes is an editor <i>Hosted in Github</i> made for <i>Github</i>.
                </p>
                <p>
                    The idea is empower static-websites contributions by enabling login-free for thoose websites hosted in the popular version control service.
                </p>
                <p>
                    Just add your button For your website
                    <br/>
                    <br/>
                    <a href="http://localhost:8080/#/Ideabile/monera/README.md">
                        <img alt="" src="/static/edit.svg"/>
                    </a>
                    <h2>Markdown</h2>
                    <pre>
                        <code>[![Build Status](/static/edit.svg)](http://localhost:8080/#/Ideabile/monera/README.md)</code>
                    </pre>
                    <h2>HTML</h2>
                    <pre>
                        <code>
                        &#x3C;a href=&#x22;http://localhost:8080/#/Ideabile/monera/README.md&#x22;&#x3E;
                          &#x3C;img alt=&#x22;&#x22; src=&#x22;/static/edit.svg&#x22;/&#x3E;
                        &#x3C;/a&#x3E;
                        </code>
                    </pre>
                </p>
            </div>
            <button v-on:click="fetchSource()">Fetch</button>
        </div>
    </div>
</template>

<script>
 /* eslint-disable */
 import axios from 'axios'
 import SourceEditor from '@/components/SourceEditor'
 import User from '@/components/User'
 import FileSearch from '@/components/FileSearch'
 import Wysiwyg from '@/components/Wysiwyg'
 import Turndown from 'turndown'

 const turndownService = new Turndown();

 export default {

     name: 'app',

     components: {
         SourceEditor,
         Wysiwyg,
         User,
         FileSearch
     },

     data() {
         return {
             content: '',
             path: 'README.md',
             user: 'Ideabile',
             repo: 'monera',
             mode: 'source',
             localState: 'saved',
             hasChanged: false
         }
     },

     mounted() {
         window.addEventListener("hashchange", () => this.setSourceFromUrlHash(), false);
         this.setSourceFromUrlHash();
     },

     computed: {

         language: {

             get() {

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

         setSourceFromUrlHash() {
             const hash = window.location.hash.substr(1)

             const hashHasAllRequirements = (
                 (!!hash && hash.length > 1) &&
                 hash.match(/\//g).length > 0
             );

             const [ empty, user, repo, ...path] = hashHasAllRequirements ? hash.split('/') : [];

            this.user = user || '';
            this.repo = repo || '';
            this.path = path.join('/') || '';

             if (user && repo && path) {
                 this.fetchSource();
             } else {
                 this.content = '';
             }
         },

         switchMode(mode) {

             if (!this.isHtml) return;

             if (mode === 'source' && this.mode === 'wysiwyg') {
                 this.content = this.language === 'markdown' ? turndownService.turndown(this.$refs.wysiwyg.htmlData) : this.$refs.wysiwyg.htmlData;
             }

             this.mode = mode;

         },

         createPullRequest() {
         },

         setSource(value) {

             this.content = value;

         },

         async save() {

             try {

                 const { user, repo, path, content } = this;

                 const data = {
                     user,
                     repo,
                     desc: 'Try out',
                     files: [
                         { path, content }
                     ]
                 };

                 axios.post('https://xrbhog4g8g.execute-api.eu-west-2.amazonaws.com/prod/prb0t', JSON.stringify(data));

             } catch(e) {
                 console.log(e);
             }

         },

         async fetchSource() {

             const url = `//api.github.com/repos/${this.user}/${this.repo}/contents/${this.path}`;

             try {

                 const { data } = await axios.get(url) || {};
                 this.content = atob(data.content);

             } catch(e) {

                 console.log(e);

             }

         }
     }
 }
</script>

<style scoped>
 #app {
     font-family: Helvetica, sans-serif;
     font-size: 0.8em;
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

 .logo {
     float: left;
 }

 ul.nav li {
     display: inline-block;
     padding: 10px;
     border: 1px solid #e4e4e4;
     border-bottom: 0;
     background: #f6f6f6;
 }
</style>
