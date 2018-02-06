<template>
    <div>
        <ul class="button-group">
            <li>
                <AutoSuggest v-bind:original="user" ref="users" v-on:update="(value) => fillSuggestions('users', value)" placeholder="Fill User" />
            </li>
            <li>
                <AutoSuggest v-bind:original="repo" ref="repo" v-on:update="(value) => fillSuggestions('repo', value)" placeholder="Set Repo" />
            </li>
            <li>
                <AutoSuggest v-bind:original="path" ref="path" v-on:update="(value) => fillSuggestions('path', value)" placeholder="Set Path" />
            </li>
        </ul>
    </div>
</template>

<style scoped>
 div {
     line-height: 30px;
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

             const searchEndPoint = type === 'repo' ? 'repository' : type;
             const url = `//api.github.com/search/${searchEndPoint}?q=${value}${filter}`;

             try {

                 const { data } = await axios.get(url);
                 this.$refs[type].suggestions = data.total_count && data.total_count > 0 ? data.items.map(el => el.login || el.name) : [];

             } catch(e){

             }


         }

     }

 }

</script>
