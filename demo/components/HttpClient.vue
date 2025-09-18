<template>
  <div class="p-8 border rounded-lg border-red-500 border-dashed">
    <a-typography-paragraph v-if="!!result" copyable>{{ result }}</a-typography-paragraph>
    <a-space>
      <AButton type="primary" @click="handleOk">测试</AButton>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import http from '../../src';
import { ref } from 'vue';
import {HttpClientOptions} from "../../src/config";

const result = ref();

function handleOk() {
  http.post('/api/auths/login', {
    // factory: 'f',
    // headers: {
    //   'Content-Type': 'application/json2',
    // },
    params: { a: 1, b: 2 },
    alias: 'base',
    // prefix: '',
    data: { username: 'coffee377', password: '123456' },
  } as HttpClientOptions).then(res =>  result.value = res);

  // document.getElementById('data').innerText = JSON.stringify(res);
  // await http.post('/api/{a}/{b}/c', {
  //   paths: { a: 1, b: 2 },
  //   microAlias: 'auth',
  //   prefix: '/real',
  //   env: undefined,
  //   mock: false,
  // });
  // await http.put('/api/{a}/{b}/{c}/222', { paths: { a: 1, b: 2 } });
}
</script>

<style scoped></style>
