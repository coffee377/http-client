<template>
  <div class="flex h-screen flex-col items-center border border-dashed border-red-500">
    <h1 class="mt-12 py-4">Deep Chat</h1>
    <deep-chat
      :remarkable="remarkable"
      :directconnection="{ openAI: { chat: true, key: 'abc123' } }"
      :responseInterceptor="responseInterceptor"
      :connect="connect"
      :textInput="{ placeholder: { text: 'Welcome to the demo!' } }"
      :history="history"
      style="width: 800px; height: 400px"
      :messageStyles="messageStyles"
    />
  </div>
</template>

<script setup lang="ts">
import { MessageContent, MessageStyles } from "deep-chat/dist/types/messages";
import { RemarkableOptions } from "deep-chat/dist/types/remarkable";
import { Connect } from "deep-chat/dist/types/connect";
import { ref, unref } from "vue";
import "deep-chat";

const connect: Connect = {
  url: "http://10.1.150.105:8601/v1/chat/completions",
  method: "post",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer abc123",
  },
  additionalBodyProps: {
    model: "default",
  },
  stream: true,
};

const remarkable: RemarkableOptions = {
  html: true,
  typographer: true,
};

const history = ref<MessageContent[]>([
  { text: "What is the meaning of life?", role: "user" },
  {
    text: "This ultimately depends on the person, but it could be the pursuit of happiness or fulfillment.",
    role: "ai",
  },
  {
    text: "We dont laugh because we feel good, we feel good because we laugh.",
    role: "bob",
  },
]);

const responseInterceptor = (res) => {
  // return res?.choices?.map((r) => {
  //   return { html: r.delta?.content } as Response;
  // });
  return res;
};

const messageStyles: MessageStyles = {
  default: {
    shared: {
      bubble: { maxWidth: "100%", backgroundColor: "transparent" },
      // outerContainer: {
      //   border: "1px red dashed",
      // },
      // innerContainer: {
      //   border: "1px blue dashed",
      // },
    },
    // ai: { bubble: { backgroundColor: "#3cbe3c" } },
    // user: { bubble: { backgroundColor: "#6767ff" } },
    // bob: { bubble: { backgroundColor: "#ffa500" } },
  },
};
</script>

<style scoped></style>
