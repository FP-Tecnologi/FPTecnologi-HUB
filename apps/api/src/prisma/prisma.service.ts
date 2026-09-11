import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { tenantGuardExtension } from './tenant-guard.extension.js';

/**
 * Injectable Prisma client. Registered globally by PrismaModule so any
 * feature module can inject it without re-importing Prisma per module.
 *
 * Wrapped in a Proxy instead of `class PrismaService extends PrismaClient`:
 * the tenant-guard extension (`$extends`) returns a *new* client object, it
 * doesn't mutate the instance in place, so subclassing would lose either
 * the extension or the onModuleInit/onModuleDestroy lifecycle hooks. The
 * Proxy keeps this class's own methods intact and forwards everything else
 * (`.producto`, `.pedido`, ...) to the extended client — every existing
 * `this.prisma.model.method(...)` call site keeps working unchanged.
 *
 * The `interface PrismaService extends PrismaClient` merge below is what
 * makes TypeScript accept `.producto`, `.pedido`, etc. on this class —
 * without it every consumer would fail to compile even though the Proxy
 * makes them work fine at runtime.
 */
export interface PrismaService extends PrismaClient {}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly raw = new PrismaClient();
  private readonly extended = this.raw.$extends(tenantGuardExtension);

  constructor() {
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) return Reflect.get(target, prop, receiver);
        return Reflect.get(target.extended, prop);
      },
    }) as this;
  }

  async onModuleInit(): Promise<void> {
    await this.raw.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.raw.$disconnect();
  }
}
