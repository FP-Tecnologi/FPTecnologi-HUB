// Archivo de arranque para cPanel → "Setup Node.js App" (Phusion Passenger).
// Passenger necesita un archivo CommonJS que escuche en process.env.PORT; la API es ESM (dist/main.js) y arranca
// sola con NestFactory.listen(process.env.PORT), así que basta importarla. Ver docs/DESPLIEGUE-CPANEL.md.
import('./dist/main.js').catch((error) => {
  console.error('No se pudo iniciar la API:', error);
  process.exit(1);
});
