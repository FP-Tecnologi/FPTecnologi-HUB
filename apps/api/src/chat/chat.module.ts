import { Module } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { ChatController, PublicChatController } from './chat.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [ChatController, PublicChatController],
  providers: [ChatService],
})
export class ChatModule {}
