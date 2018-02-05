<template>
    <div>
        <input type="text" v-model="user" />
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

 export default {

     props: [ 'user', 'repo', 'path' ]

 }

</script>
