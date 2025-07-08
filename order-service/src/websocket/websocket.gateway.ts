import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/order',
})
export class WebsocketGateway {
  constructor() {}
  @WebSocketServer()
  server: Server;

  notifyData() {
    this.server.emit('notify change');
  }
}
