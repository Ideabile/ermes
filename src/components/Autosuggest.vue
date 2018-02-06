<template>
    <div v-bind:class="{ active }">
        <a class="button" v-on:click="focus" >{{ value || placeholder }}</a>
        <div class="suggest">
            <input ref="input" v-on:blur="blur" v-model="value" />
            <ul>
                <li v-for="suggestion in suggestions" v-on:click="setValue(suggestion)">{{ suggestion }}</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
 .active {
     position: relative;
 }
 .suggest {
     display: none;
     position: absolute;
     top: 100%;
     left: 0;
 }
 .active .suggest {
     display: block;
 }
</style>

<script>
 /* eslint-disable */

 export default {

     props: [
         'original',
         'placeholder'
     ],

     data() {

         return {

             value: this.original || '',
             suggestions: [],
             active: false

         };

     },

     watch: {

         originalValue() {

             this.value = this.originalValue;

         },

         value() {

             if (this.timeout) clearTimeout(this.timeout);
             this.timeout = setTimeout(() => this.$emit('update', this.value), 500);

         }

     },

     methods: {

         setValue(value) {

             this.value = value;

         },

         blur() {
             setTimeout(() => {
                this.active = false;
             }, 500);
         },

         focus() {

             this.active = true;
             setTimeout(() => this.$refs.input.focus(), 300);

         }

     }

 }
</script>
