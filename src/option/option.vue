<template>
  <div>
    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">Post URL</label>
        <input v-model="postUrl" class="form-control" type="text" />
      </div>
      <div class="mb-3">
        <label class="form-label">Content-type</label>
        <select v-model="postContentType" class="form-control">
          <option
            v-for="type in ['application/json', 'application/x-www-form-urlencoded']"
            :key="type"
            :value="type"
            :selected="type === postContentType"
          >{{ type }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Post data template (JSON)</label>
        <textarea v-model="postTemplate" class="form-control font-monospace" rows="10"></textarea>
        <div class="form-text">
          <code class="template-syntax">url</code>: Right-clicked link url
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">Fillter (Regexp)</label>
        <input v-model="regexp" class="form-control" type="text" />
      </div>
      <button type="submit" class="btn btn-primary">
        Save
      </button>
      <span v-if="saved" class="ps-3 text-success">Saved!</span>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import browser from 'webextension-polyfill';

export default defineComponent({
  setup() {
    const postUrl = ref('');
    const postTemplate = ref('');
    const postContentType = ref('');
    const regexp = ref('');
    const saved = ref(false);

    const getCurrentConfigures = async () => {
      const configures = await browser.runtime.sendMessage({ cmd: 'configures/get' });
      postUrl.value = configures.postUrl;
      postTemplate.value = configures.template;
      postContentType.value = configures.contentType;
      regexp.value = configures.regexp;
    };

    onMounted(getCurrentConfigures);

    const submit = async () => {
      saved.value = false;
      await browser.runtime.sendMessage({
        cmd: 'configures/save',
        postUrl: postUrl.value,
        template: postTemplate.value,
        contentType: postContentType.value,
        regexp: regexp.value,
      });
      await getCurrentConfigures();
      saved.value = true;
      setTimeout(() => {
        saved.value = false
      }, 1000);
    };

    return {
      postUrl,
      postTemplate,
      postContentType,
      regexp,
      saved,
      getCurrentConfigures,
      submit,
    }
  }
})
</script>

<style>
.template-syntax::before {
  content: '{{{ '
}
.template-syntax::after {
  content: ' }}}'
}
</style>
