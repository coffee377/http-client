<template>
  <a-config-provider
    :theme="{
      token: {
        // colorPrimary: 'red',
      },
    }"
  >
    <http-client />
    <Chat />
  </a-config-provider>
</template>
<script lang="ts" setup>
import HttpClient from "./components/HttpClient.vue";
import Chat from "./components/Chat.vue";
</script>

<style></style>
