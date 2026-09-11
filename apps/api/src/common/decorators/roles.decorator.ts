import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Restricts a route to users whose role (in the active marca) matches one of these names. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
