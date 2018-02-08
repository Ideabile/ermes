<template>
    <div>
        <div v-html="htmlData"></div>
    </div>
</template>

<style scoped>
 div {
     margin: 30px 20px;
 }
</style>

<script>
 /* eslint-disable */
 import markdown from 'markdown-it';
 require('github-markdown-css/github-markdown.css');

 const md = markdown();

 export default {

     props: {
         lang: { default: 'markdown' },
         content: { default: '' }
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
