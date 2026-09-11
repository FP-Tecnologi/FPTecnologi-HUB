-- CreateIndex
CREATE INDEX "Categoria_marcaId_idx" ON "Categoria"("marcaId");

-- CreateIndex
CREATE INDEX "Cotizacion_marcaId_idx" ON "Cotizacion"("marcaId");

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_idx" ON "Notificacion"("usuarioId");

-- CreateIndex
CREATE INDEX "Notificacion_marcaId_idx" ON "Notificacion"("marcaId");

-- CreateIndex
CREATE INDEX "OtpCode_usuarioId_idx" ON "OtpCode"("usuarioId");

-- CreateIndex
CREATE INDEX "Pedido_marcaId_idx" ON "Pedido"("marcaId");

-- CreateIndex
CREATE INDEX "RefreshToken_usuarioId_idx" ON "RefreshToken"("usuarioId");

-- CreateIndex
CREATE INDEX "Servicio_marcaId_idx" ON "Servicio"("marcaId");

-- CreateIndex
CREATE INDEX "Sitio_marcaId_idx" ON "Sitio"("marcaId");

-- CreateIndex
CREATE INDEX "UsuarioMarcaRol_marcaId_idx" ON "UsuarioMarcaRol"("marcaId");
