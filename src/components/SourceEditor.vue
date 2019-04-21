<template>
  <div>
    <editor
      v-model="value"
      @init="editorInit"
      :lang="lang"
      :theme="theme"
      :width="innerWidth"
      :height="innerHeight" />
  </div>
</template>

<script>
  /* eslint-disable */
  import Editor from 'vue2-ace-editor';

  require('brace/mode/html');
  require('brace/mode/javascript');
  require('brace/mode/less');
  require('brace/mode/php');
  require('brace/mode/markdown');
  require('brace/theme/ambiance');
  require('brace/theme/chrome');

  export default {

    components: {
      Editor
    },

    mounted() {
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('onrotationchange', () => this.resize());
    },


    methods: {

      editorInit(editor) {
        this.editor = editor;
        this.resize();
      },

      resize() {

        const { width, height } = this.$el.getBoundingClientRect();

        this.innerWidth = width;
        this.innerHeight = height;

        this.editor.resize();

      }

    },

    props: {
      lang: '',
      language: 'text',
      content: ''
    },

    data () {

      const { innerWidth, innerHeight } = window || {};

      return {
        editor: null,
        theme: 'ambiance',
        innerWidth,
        innerHeight: innerHeight - 70
      };

    },

    computed: {

      value: {

        get: function() {

          return this.content;

        },

        set: function(value) {

          this.$emit('update:source', value);

        }

      }

    }

  }
</script>
