<template>
    <div v-bind:class="{ active }">
        <a class="button" v-on:click="focus" >{{ value || placeholder }}</a>
        <div class="suggest">
            <input ref="input" v-on:blur="blur" v-model="value" />
            <ul>
                <li v-for="suggestion in suggestions" v-on:click="setValue(suggestion.value)">{{ suggestion.label }}</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
 .active {
     position: relative;
 }

 input {
     margin: 4px 2px;
 }

 .suggest {
     display: none;
     position: absolute;
     top: calc(100% + 27px);
     left: 0;
     border: 1px solid #d4d4d4;
     background: linear-gradient(#f4f4f4, #ececec);;
     z-index: 10;
     padding: 4px;
     border-radius: 0 0 4px 4px;
 }
 .active .suggest {
     display: block;
 }

 ul {
     max-height: 100px;
     overflow-y: scroll;
     list-style: none;
     padding: 0;
     margin: 0;
 }

 ul li {
     display: block;
     height: 12px;
     background: linear-gradient(#f4f4f4, #ececec);;
     line-height: 12px;
     padding: 10px;
     border-top: 1px solid #d4d4d4;
     border-bottom: 1px solid #d4d4d4;
     width: 100%;
     text-align: left;
 }

 li:last-child {
     border: 0;
 }

 li:hover {
     background: linear-gradient(#ececec, #f4f4f4);
     cursor: pointer;
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

         original() {

             this.value = this.original;

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
