import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'socket.io';
import { createServer } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialisation du serveur HTTP
  const httpServer = createServer(app.getHttpAdapter().getInstance());

  // Initialisation du serveur Socket.IO
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('a user connected');
    
    // Écoute des événements personnalisés, comme un message
    socket.on('chat message', (msg) => {
      console.log('Message received: ', msg);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  await app.listen(3000);
  console.log('Application is running on http://localhost:3000');
}

bootstrap();
