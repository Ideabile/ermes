<template>
    <div>
        <div v-if="!!token">
            is Logged in
        </div>
        <div v-else>
            <p>Anonymous user</p>
            <img src="/static/anonymous.svg" width="20px" />
        </div>
    </div>
</template>

<style scoped>
 * > div {
     margin: 3px 5px 0 0;
 }

 p {
     display: block;
     float: left;
     padding: 0 5px;
     line-height: 20px;
     margin: 0;
 }
</style>

<script>
 /* eslint-disable */
 export default {

     data() {

         const token = window.localStorage.getItem('githubToken');

         return {

             user: 'Anonymous',
             token

         };

     },

     mounted() {



     }

 }

</script>
