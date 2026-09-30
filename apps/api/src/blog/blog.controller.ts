import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service.js';
import { CreateArticuloDto, UpdateArticuloDto } from './blog.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** Dashboard: CMS de artículos del blog (admin y marketing de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'marketing')
@Controller('blog')
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.blog.list(marcaId);
  }

  @Get(':id')
  get(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.blog.get(marcaId, id);
  }

  @Post()
  create(@MarcaActual() marcaId: string, @Body() dto: CreateArticuloDto, @CurrentUser() user: AuthenticatedUser) {
    return this.blog.create(marcaId, dto, user.email);
  }

  @Patch(':id')
  update(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: UpdateArticuloDto) {
    return this.blog.update(marcaId, id, dto);
  }

  @Delete(':id')
  remove(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.blog.remove(marcaId, id);
  }
}

/** Web pública: solo artículos PUBLICADOS. */
@Public()
@Controller('public/blog')
export class PublicBlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  list(@Query('marcaId') marcaId: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.blog.publicados(marcaId);
  }

  @Get(':slug')
  get(@Query('marcaId') marcaId: string, @Param('slug') slug: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.blog.publicado(marcaId, slug);
  }
}
