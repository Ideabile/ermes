<template>
    <div>
        <div class="edit__pr__modal">
            <b>Describe your changes</b>
            <textarea ref="commitMessage"></textarea>
            <a class="button" v-on:click="save">Create Pull Request</a>
        </div>
        <div class="edit__bar">
            <div class="edit__bar--left">
                <ul class="nav">

                    <li
                        class="nav-item"
                        v-on:click="switchMode('source')">Source</li>

                    <li
                        v-if="isHtml"
                        class="nav-item"
                        v-on:click="switchMode('wysiwyg')">Preview</li>

                </ul>
            </div>

            <div class="edit__bar--right">
                <img alt="Ermes" :src="`${baseUrl}static/logo.png`" class="logo" height="30px"/>
                <FileSearch
                    @update:user="val => setFileSearch('user', val)"
                    :user="user"
                    @update:repo="val => setFileSearch('repo', val)"
                    :repo="repo"
                    @update:path="val => setFileSearch('path', val, true)"
                    :path="path" />
                <a class="button" v-on:click="createPullRequest">Send Changes</a>
            </div>
        </div>

        <div class="edit__body">
            <SourceEditor
                v-if="mode === 'source'"
                class="edit__body__source"
                @update:source="setSource"
                :content="content"
                :lang="language"/>

            <Preview
                v-if="mode === 'wysiwyg'"
                class="edit__body__preview"
                ref="wysiwyg"
                :content="content"
                :lang="language"/>
        </div>
    </div>
</template>

<script>
 import SourceEditor from '@/components/SourceEditor'
 import User from '@/components/User'
 import FileSearch from '@/components/FileSearch'
 import Preview from '@/components/Preview'

 export default {

     props: {
         content: '',
         language: ''
     },

     components: {
         SourceEditor,
         User
     },

     data() {
         return {
             content: '',
         };
     }
 }
</script>
