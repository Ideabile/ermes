<template>
    <div>
        <wysiwyg v-model="htmlData"></wysiwyg>
    </div>
</template>

<script>
 /* eslint-disable */
 import Vue from 'vue';
 import Wysiwyg from "vue-wysiwyg";
 import markdown from 'markdown-it';
 require('vue-wysiwyg/dist/vueWysiwyg.css');

 const md = markdown();

 Vue.use(Wysiwyg);

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
