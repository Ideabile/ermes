<template>
  <div v-bind:class="{ active }">
    <button v-on:click="focus" >{{ value || placeholder }}</button>
    <div class="suggest">
      <input ref="input" v-on:blur="blur" v-model="value" />
      <ul
        <li v-for="suggestion in suggestions">{{ suggestion }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
  .suggest {
    display: none;
  }
  .active .suggest {
    display: block;
  }
</style>

<script>
 /* eslint-disable */

  export default {

    props: [
      'originalValue',
      'placeholder'
    ],

    data() {

      return {

        value: this.originalValue || '',
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
        this.timeout = setTimeout(() => this.$emit('update:value', this.value), 500);

      }

    },

    methods: {

      blur() {
        this.active = false;
      },

      focus() {

        this.active = true;
        this.$refs.input.focus();

      }

    }

  }
</script>
