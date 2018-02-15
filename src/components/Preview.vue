<template>
    <div>
        <div v-html="htmlData" class="markdown-body"></div>
    </div>
</template>

<style scoped>
 div {
 }
</style>

<script>
 /* eslint-disable */
 import markdown from 'markdown-it';
 require('github-markdown-css/github-markdown.css');

 const md = markdown({
  html: true,
  linkify: true,
  typographer: true
 });

 export default {

     props: {
         lang: { default: 'markdown' },
         content: { default: '' }
     },

     watch: {
         content() {
             if (!this.lang === 'markdown') return;
             this.htmlData = md.render(this.content);
         }
     },

     data () {

         const { innerWidth, innerHeight } = window || {};
         const htmlData = this.lang === 'markdown' ? md.render(this.content) : this.content;

         return {
             htmlData,
             innerWidth,
             innerHeight
         };

     }

 }
</script>

<style scoped>
</style>
