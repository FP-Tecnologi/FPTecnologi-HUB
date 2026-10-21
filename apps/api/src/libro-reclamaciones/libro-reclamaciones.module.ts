import { Module } from '@nestjs/common';
import { LibroReclamacionesService } from './libro-reclamaciones.service.js';
import { LibroReclamacionesController, PublicLibroReclamacionesController } from './libro-reclamaciones.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [LibroReclamacionesController, PublicLibroReclamacionesController],
  providers: [LibroReclamacionesService],
})
export class LibroReclamacionesModule {}
