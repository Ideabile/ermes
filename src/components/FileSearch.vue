<template>
  <div>
    <AutoSuggest v-bind:originalValue="user" ref="autosuggestUser" placeholder="Fill User" />
    <input type="text" v-model="repo" />
    <input type="text" v-model="path" />
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

    mounted() {

      this.$refs.autosuggestUser.$on('update:value', (value) => this.fetchSuggest('user', value));

    },

    methods: {

      async fetchSuggest(type, value) {

        const url = `//api.github.com/search/users?q=${value}`;

        try {

          const { data } = await axios.get(url);
          this.$refs.autosuggestUser.suggestions = data.total_count && data.total_count > 0 ? data.items.map(el => el.login) : [];

        } catch(e){

        }


      }

    }

  }

</script>
