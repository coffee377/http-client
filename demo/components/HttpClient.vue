<template>
  <div class="p-8 border border-red-500 border-dashed">
    <a-collapse accordion v-model:active-key="activeKey">
      <a-collapse-panel key="http-client" header="http-client">
        <img v-if="result?.avatar_url" class="size-12 rounded-full" :src="result?.avatar_url" alt="" />
        <a-typography-paragraph v-if="!!result" copyable>{{ result }}</a-typography-paragraph>
        <a-space>
          <AButton :loading="loading" type="primary" @click="handleOk">获取GitHub用户信息</AButton>
        </a-space>
      </a-collapse-panel>
      <a-collapse-panel key="socket.io" header="socket.io">
        <a-space>
          <a-switch v-model:checked="netty" checked-children="Netty" un-checked-children="Node" @change="handleNetty" />
          <AButton :loading="loading" type="primary" @click="() => socket.connect()">建立连接</AButton>
          <AButton
            :loading="loading"
            type="primary"
            danger
            @click="
              () => {
                socket.close();
              }
            "
            >断开连接
          </AButton>
          <AButton :loading="loading" type="primary" @click="handelSocket">rxjs 数据订阅</AButton>
        </a-space>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import http from '../../src';
import { onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import { io, Manager, Socket } from 'socket.io-client';
import { message } from 'ant-design-vue';

const result = ref();
const loading = ref(false);
const activeKey = ref<string[]>(['http-client']);
const netty = ref(true);

async function handleOk() {
  loading.value = true;
  const res = await http.get('/api/users/{username}', {
    // factory: 'xhr',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      // 'Accept-Encoding': 'gzip',
    },
    alias: 'oneself',
    paths: { username: 'coffee377' },
    // timeout: 1,
    // data: { username: 'coffee377', password: '123456' },
  });
  // await fetch('https://api.github.com/users/coffee377');
  loading.value = false;
  result.value = res;
  // await http.post('/api/{a}/{b}/c', {
  //   paths: { a: 1, b: 2 },
  //   alias: 'auth',
  //   prefix: '/real',
  //   env: 'default',
  //   // mock: false,
  // });
  // await http.put('/api/{a}/{b}/{c}/222', { paths: { a: 1, b: 2 } });
}

// function fromSocketIO<T = any>(socket: Socket, event: string) {
//   return new Observable<T>((subscriber) => {
//     subscriber.next();
//     socket.on(event, (data) => {
//       subscriber.next(data);
//     });
//     return new Subscription(() => {
//       socket.close();
//     });
//   });
// }
// const m: Manager = new Manager();
let socket: Socket;

class Sock {
  static of(nsp: string, {}): Socket {
    return null;
  }
}

interface Server {
  url: string;
  opts?: any;
}

const servers = [{ url: 'localhost:9092' }, { url: 'localhost:9093' }].map((item) => {
  return {
    ...item,
    opts: {
      // upgrade: false,
      rememberUpgrade: true,
      // transports: ['polling'],
      auth: (cb) => {
        cb({
          token: localStorage.getItem('token') || 'test',
        });
      },
      path: '',
      addTrailingSlash: true,
      // query: {
      //   uid: '1',
      // },
      extraHeaders: {
        // io: 'coffee377',
      },
    },
  };
});

const handleNetty = (checked) => {
  console.log(checked);
  let s;
  socket.close();
  if (checked) {
    s = servers[0];
  } else {
    s = servers[1];
  }
  const { url, opts } = s;
  socket = io(url, opts);
};

// new Manager();
onBeforeMount(() => {
  // const { url, opts } = servers[0];
  // socket = io(url, opts);
  // // client-side
  // socket.on('connect', () => {
  //   console.log('上线', socket.id);
  // });
  //
  // socket.on('connect_error', (err) => {
  //   // console.log(err);
  //   // console.log('连接失败', err);
  //   // if (err.message === 'invalid credentials') {
  //   //   socket.auth.token = 'efgh';
  //   //   socket.connect();
  //   // }
  // });
  //
  // socket.on('disconnect', (reason, description) => {
  //   console.log('用户离线', reason, description); // undefined
  // });
});

onBeforeUnmount(() => {
  socket.close();
});

function handelSocket() {
  if (!socket.connected) {
    socket.connect();
  }
  // message.success(socket.connected);
  // console.log(socket);
  let data: any = new Blob([JSON.stringify([6, 7, 8])]);
  const encoder = new TextEncoder();
  data = encoder.encode(JSON.stringify([6, 7, 8]));
  data = encoder.encode('测试二进制数据');

  socket.emit('message-event', 1, '2', { 3: '4', 5: data });
  socket.on('message-event', (msg, ...d) => {
    console.log(msg, d);
  });
}
</script>

<style scoped></style>
