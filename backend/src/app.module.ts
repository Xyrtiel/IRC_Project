import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module'; // ✅ Ajout de AuthModule

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/irc'),
    ChatModule,
    AuthModule, // ✅ On ajoute AuthModule ici
  ],
})
export class AppModule {}
