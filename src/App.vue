<template>
  <div class="app">
    <Editor v-model="state"></Editor>
  </div>
</template>
<script>
import { provide, ref } from "vue";
import Editor from "./packages/editor";
import data from "./data.json";
import { registerConfig as config } from "./utils/editor-config";
export default {
  components: {
    Editor,
  },
  setup() {
    const state = ref(data);
    provide("config", config);
    return {
      state,
    };
  },
};
</script>
<style lang="scss">
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
