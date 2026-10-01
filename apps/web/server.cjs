// Arranque para cPanel → "Setup Node.js App" (Phusion Passenger): Passenger exige un archivo que escuche en
// process.env.PORT y Next no lo expone directo en modo servidor, así que se envuelve acá.
// Requiere haber corrido `npm run build` antes. Ver docs/DESPLIEGUE-CPANEL.md.
const { createServer } = require('node:http');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => console.log(`Dashboard escuchando en el puerto ${port}`));
});
