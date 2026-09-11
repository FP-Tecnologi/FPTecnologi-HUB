export interface AuthenticatedUserMarca {
  marcaId: string;
  rol: string;
}

/** Shape attached to `request.user` by JwtStrategy once the access token is verified. */
export interface AuthenticatedUser {
  sub: string; // usuarioId
  email: string;
  marcas: AuthenticatedUserMarca[];
}
