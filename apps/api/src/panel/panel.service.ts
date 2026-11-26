import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { PedidosService } from '../pedidos/pedidos.service.js';
import { CotizadorService } from '../cotizador/cotizador.service.js';
import { CotizacionesService } from '../cotizaciones/cotizaciones.service.js';
import { ChatService } from '../chat/chat.service.js';
import { BlogService } from '../blog/blog.service.js';
import { ProductosService } from '../productos/productos.service.js';
import { BoletinService } from '../boletin/boletin.service.js';
import { ContactoWebService } from '../contacto-web/contacto-web.service.js';
import { RolesService } from '../roles/roles.service.js';
import { VisitasService } from '../visitas/visitas.service.js';

/**
 * Roles que ve cada módulo: los mismos `@Roles` de su controlador (null = cualquier rol de la marca).
 * Si cambias los roles de un controlador, cámbialos aquí también.
 */
export const ROLES_PANEL = {
  pedidos: ['admin', 'ventas', 'logistica', 'finanzas'],
  leads: ['admin', 'comercial', 'jefe_comercial'],
  cotizaciones: ['admin', 'comercial', 'ventas'],
  chat: ['admin', 'asesores'],
  blog: ['admin', 'marketing'],
  productos: null,
  boletin: ['admin', 'marketing'],
  contactos: ['admin', 'comercial', 'jefe_comercial'],
  equipo: null,
  visitas: ['admin', 'marketing', 'comercial', 'ventas'],
} as const satisfies Record<string, readonly string[] | null>;

type Modulo = keyof typeof ROLES_PANEL;
const DIAS = [7, 30, 90];

/**
 * Panel general del dashboard: junta en una sola respuesta lo que antes eran ~10 peticiones por marca.
 * Solo recorre las marcas del usuario (las del JWT, como `MarcaRolGuard`) y en cada una solo los módulos que su
 * rol puede ver; el resto queda en `null`, igual que un 403 en la ruta propia del módulo.
 */
@Injectable()
export class PanelService {
  constructor(
    private readonly pedidos: PedidosService,
    private readonly cotizador: CotizadorService,
    private readonly cotizaciones: CotizacionesService,
    private readonly chat: ChatService,
    private readonly blog: BlogService,
    private readonly productos: ProductosService,
    private readonly boletin: BoletinService,
    private readonly contactos: ContactoWebService,
    private readonly roles: RolesService,
    private readonly visitas: VisitasService,
  ) {}

  /** Marcas pedidas que el usuario tiene asignadas (sin `marcaIds`, todas las suyas). */
  private asignaciones(user: AuthenticatedUser, marcaIds?: string[]) {
    return user.marcas.filter((m) => !marcaIds?.length || marcaIds.includes(m.marcaId));
  }

  private cargar<T>(rol: string, modulo: Modulo, fn: () => Promise<T>): Promise<T | null> {
    const permitidos: readonly string[] | null = ROLES_PANEL[modulo];
    if (permitidos && !permitidos.includes(rol)) return Promise.resolve(null);
    return fn().catch(() => null);
  }

  async resumen(user: AuthenticatedUser, marcaIds?: string[]) {
    const filas = await Promise.all(
      this.asignaciones(user, marcaIds).map(async ({ marcaId, rol }) => {
        const [pedidos, leads, cotizaciones, chat, blog, productos, boletin, contactos, equipo] = await Promise.all([
          this.cargar(rol, 'pedidos', () => this.pedidos.findAll(marcaId)),
          this.cargar(rol, 'leads', () => this.cotizador.list(marcaId)),
          this.cargar(rol, 'cotizaciones', () => this.cotizaciones.findAll(marcaId)),
          this.cargar(rol, 'chat', () => this.chat.listConversaciones(marcaId)),
          this.cargar(rol, 'blog', () => this.blog.list(marcaId)),
          this.cargar(rol, 'productos', () => this.productos.findAll(marcaId)),
          this.cargar(rol, 'boletin', () => this.boletin.list(marcaId)),
          this.cargar(rol, 'contactos', () => this.contactos.list(marcaId)),
          this.cargar(rol, 'equipo', () => this.roles.equipoDeMarca(marcaId)),
        ]);
        return { marcaId, pedidos, leads, cotizaciones, chat, blog, productos, boletin, contactos, equipo };
      }),
    );
    return filas;
  }

  async visitasResumen(user: AuthenticatedUser, dias: number, marcaIds?: string[]) {
    const n = DIAS.includes(dias) ? dias : 30;
    const filas = await Promise.all(
      this.asignaciones(user, marcaIds).map(async ({ marcaId, rol }) => ({
        marcaId,
        resumen: await this.cargar(rol, 'visitas', () => this.visitas.resumen(marcaId, n)),
      })),
    );
    // Sin permiso en una marca = no aparece (como el 403 que antes se descartaba en el cliente).
    return filas.filter((f) => f.resumen !== null);
  }
}
