<template>
  <a-config-provider
    :theme="{
      token: {
        // colorPrimary: 'red',
      },
    }"
  >
    <http-client />
  </a-config-provider>
</template>
<script lang="ts" setup>
import HttpClient from './components/HttpClient.vue';
</script>

<style></style>
