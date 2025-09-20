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
import { io, Socket } from 'socket.io-client';
import { onBeforeMount, onBeforeUnmount } from 'vue';

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
