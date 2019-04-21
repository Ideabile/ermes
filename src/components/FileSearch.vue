<template>
    <div>
        <ul class="button-group">
            <li>
                <AutoSuggest :original="user" ref="user" v-on:update="(value) => fillSuggestions('user', value)" placeholder="Fill User" />
            </li>
            <li>
                <AutoSuggest :original="repo" ref="repo" v-on:update="(value) => fillSuggestions('repo', value)" placeholder="Set Repo" />
            </li>
            <li>
                <AutoSuggest :original="path" ref="path" v-on:update="(value) => fillSuggestions('path', value)" placeholder="Set Path" />
            </li>
        </ul>
    </div>
</template>

<style scoped>
  div {
    display: flex;
  }
 .button-group {
     display: inline-block;
 }
</style>

<script>
 /* eslint-disable */

 import axios from 'axios';
 import AutoSuggest from './Autosuggest';

 export default {

     components: {
         AutoSuggest
     },

     props: [ 'user', 'repo', 'path' ],

     methods: {

         async fillSuggestions(type, value) {

             if (!value) return;
             this.$emit(`update:${type}`, value);

             const filter = type === 'repo' && this.user ? `+user:${this.user}` : '';

             // This a wired exception.
             let endpoint;
             switch(type){
                 case 'user':
                     endpoint = [
                         'search/users',
                         `?q=${value}`
                     ];
                     this.$emit('update:repo', '');
                     this.$emit('update:path', '');
                     break;

                 case 'repo':
                     endpoint = [
                         'search/repositories',
                         '?q=',
                         `${value}+user:${this.user}`
                     ];
                     this.$emit('update:path', '');
                     break;

                 case 'path':
                     endpoint = [
                         'search/code',
                         `?q=+repo:${this.user}/${this.repo}+filename:${value}`
                     ];
                     break;

             }

             const url = `https://api.github.com/${endpoint.join('')}`;

             try {

                 const { data } = await axios.get(url);
                 this.$refs[type].suggestions = data.total_count && data.total_count > 0 ? data.items.map(el => {

                     switch(type) {
                             case 'user':
                             return { value: el.login, label: el.login };
                             case 'repo':
                             return { value: el.name, label: el.name };
                             case 'path':
                             return { value: el.path, label: el.path};
                     }

                 }) : [];

             } catch(e){

             }


         }

     }

 }

</script>
