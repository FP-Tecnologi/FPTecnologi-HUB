# admin-desktop · instalador de Windows del dashboard

Contenedor [Tauri 2](https://tauri.app) que abre el dashboard online (`https://admin.fptecnologi.com`) en una ventana propia.
No duplica el código del admin: toda la app vive en `apps/admin`. El modo offline (CRM) es el de la PWA: el service worker
y la cola de cambios funcionan igual dentro de la ventana (WebView2).

## Cómo funciona

- `dist/index.html` es la pantalla de arranque: comprueba que el admin responda y redirige. Sin internet pero ya abierto antes,
  navega igual y el service worker sirve las pantallas guardadas. Primera vez sin internet: pide conectarse una vez.
- No hay lógica de negocio en Rust (`src-tauri/src/main.rs` solo abre la ventana).

## Compilar el instalador

Requisitos (una vez): Rust (`rustup`, toolchain MSVC), Visual Studio Build Tools con "Desarrollo para el escritorio con C++",
y WebView2 (viene con Windows 11).

```bash
cd apps/admin-desktop
npm install
npm run build
```

Sale en `src-tauri/target/release/bundle/nsis/FPTecnologi_<versión>_x64-setup.exe` (instalación por usuario, sin permisos de administrador).
Desarrollo: `npm run dev`. Para cambiar el ícono: reemplaza `../admin/public/pwa/icon-512.png` y corre `npm run icons` (luego borra `src-tauri/icons/android` y `ios`).

## Pendiente / notas

- El instalador no está firmado: Windows SmartScreen mostrará "editor desconocido" hasta tener un certificado de firma de código.
- Actualizaciones: al ser una ventana del sitio, el admin se actualiza solo con cada despliegue. El `.exe` solo cambia si se toca este contenedor.
- Subir la versión en `package.json`, `src-tauri/tauri.conf.json` y `src-tauri/Cargo.toml` al publicar un instalador nuevo.
