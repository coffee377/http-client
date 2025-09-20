<template>
  <div class="p-8">
    <a-collapse accordion v-model:active-key="activeKey">
      <a-collapse-panel key="http-client" header="Http Client">
        <template #extra>
          <a-button type="primary" @click="">查询</a-button>
        </template>
        <GitHubUser />
        <!--        <img v-if="result?.avatar_url" class="size-12 rounded-full" :src="result?.avatar_url" alt="" />-->
        <!--        <a-typography-paragraph v-if="!!result" copyable>{{ result }}</a-typography-paragraph>-->
        <!--        <a-space>-->
        <!--          <AButton :loading="loading" type="primary" @click="handleOk">获取GitHub用户信息</AButton>-->
        <!--        </a-space>-->
      </a-collapse-panel>
      <a-collapse-panel key="socket.io" header="Socket IO">
        <a-space>
          <!--          <a-switch v-model:checked="netty" checked-children="Netty" un-checked-children="Node" @change="handleNetty" />-->
          <!--          <AButton :loading="loading" type="primary" @click="() => socket.connect()">建立连接</AButton>-->
          <!--          <AButton-->
          <!--            :loading="loading"-->
          <!--            type="primary"-->
          <!--            danger-->
          <!--            @click="-->
          <!--              () => {-->
          <!--                socket.close();-->
          <!--              }-->
          <!--            "-->
          <!--            >断开连接-->
          <!--          </AButton>-->
          <!--          <AButton :loading="loading" type="primary" @click="handelSocket">rxjs 数据订阅</AButton>-->
        </a-space>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import GitHubUser from "@@/demo/components/GitHubUser.vue";
import { ref } from "vue";

const activeKey = ref<string[]>(["http-client"]);
</script>

<style scoped></style>
