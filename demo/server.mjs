import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer({});
const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: '*',
    allowedHeaders: '*',
  },
});

io.on('connection', (socket) => {
  // ...
  console.log(socket.id);
  console.log(socket.handshake.auth);
  // socket
  // 监听到客户端发送的消息
  socket.on('message-event', (message) => {
    console.log(message);
    // 向客户端发送消息
    socket.emit('message-event', {
      message: '你好我是服务端，让我们来聊天呀',
    });
  });
});

httpServer.listen(9093);
