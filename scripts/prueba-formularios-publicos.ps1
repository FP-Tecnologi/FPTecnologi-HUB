# Pruebas de extremo a extremo de los formularios de la web publica.
#
# Cada formulario se envia REALMENTE al proxy de la web (:3002), que a su vez
# llama a la API central (:3001) igual que lo haria el navegador. Asi se
# comprueba la cadena completa web -> API -> Postgres -> dashboard.
#
# Cada peticion lleva un x-forwarded-for distinto: es la IP que la web usa para
# el tope anti-spam de la API (5 envios por IP cada 10 minutos), asi que simular
# visitantes distintos es lo correcto para no chocar con el limite.
#
# Uso (PowerShell):  ./scripts/prueba-formularios-publicos.ps1

$ErrorActionPreference = 'Stop'
$Web = 'http://localhost:3002'
$Api = 'http://localhost:3001'
$marcaId = '88ad7cfe-7756-457b-963f-22c6c352feb8'
$script:n = 0

function Ip {
  $script:n++
  # IP publica de prueba distinta por peticion (documentacion RFC 5737).
  return "203.0.113.$script:n"
}

function Post($ruta, $cuerpo, $etiqueta) {
  $json = $cuerpo | ConvertTo-Json -Depth 6 -Compress
  try {
    $r = Invoke-WebRequest -Uri "$Web$ruta" -Method POST -Body $json `
      -ContentType 'application/json' -Headers @{ 'x-forwarded-for' = (Ip) } `
      -UseBasicParsing -TimeoutSec 60
    "{0,-22} {1}  {2}" -f $etiqueta, $r.StatusCode, $r.Content
  } catch {
    $cuerpo = $_.Exception.Response
    $txt = try { (New-Object IO.StreamReader($cuerpo.GetResponseStream())).ReadToEnd() } catch { '' }
    if (-not $txt) { $txt = $_.Exception.Message }
    "{0,-22} ERROR {1}" -f $etiqueta, $txt
  }
}

Write-Host "`n== Productos del catalogo (para el checkout) ==" -ForegroundColor Cyan
$r = Invoke-RestMethod "$Api/public/productos?marcaId=$marcaId&limit=6" -TimeoutSec 60
$prod = $r.data.data
$prod | Select-Object sku, @{n = 'precio'; e = { $_.precio } } | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "== 1. Cotizador: lead persona natural (DNI) ==" -ForegroundColor Cyan
Post '/api/hub/cotizador' @{
  nombres           = 'Ana'
  apellidos         = 'Quispe Mamani'
  tipoPersona       = 'NATURAL'
  tipoDocumento     = 'DNI'
  nroDocumento      = '48219936'
  email             = 'ana.quispe.prueba@example.com'
  celular           = '987654321'
  interes           = 'Ciberseguridad para banco'
  mensaje           = 'Necesitamos un pentest y monitoreo 24/7 para nuestra sede de Lima.'
  origen            = '/cotizador'
} 'lead natural'

Write-Host "== 2. Cotizador: lead persona juridica (RUC) ==" -ForegroundColor Cyan
Post '/api/hub/cotizador' @{
  nombres           = 'Carlos'
  apellidos         = 'Rojas Vega'
  tipoPersona       = 'JURIDICA'
  tipoDocumento     = 'RUC'
  nroDocumento      = '20601234567'
  empresa           = 'Comercial del Sur S.A.C.'
  email             = 'compras@comercialdelsur-prueba.example.com'
  celular           = '+51 912 345 678'
  interes           = 'Servidores para empresas'
  mensaje           = 'Cotizar 4 servidores rack para nuestro centro de datos en Arequipa.'
  origen            = '/cotizador'
} 'lead juridica'

Write-Host "== 3. Cotizador: el honeypot website NO debe guardar nada ==" -ForegroundColor Cyan
Post '/api/hub/cotizador' @{
  nombres       = 'Bot'
  apellidos     = 'Spam'
  tipoPersona   = 'NATURAL'
  tipoDocumento = 'DNI'
  nroDocumento  = '11111111'
  email         = 'spam@example.com'
  celular       = '900000000'
  interes       = 'Spam'
  website       = 'http://spam.example.com'
} 'honeypot (ok)'

Write-Host "== 4. Cotizador: validacion debe RECHAZAR un celular malo ==" -ForegroundColor Cyan
Post '/api/hub/cotizador' @{
  nombres       = 'Prueba'
  apellidos     = 'Invalida'
  tipoPersona   = 'NATURAL'
  tipoDocumento = 'DNI'
  nroDocumento  = '48219936'
  email         = 'invalido@example.com'
  celular       = '123'
  interes       = 'Prueba de validacion'
} 'celular malo'

Write-Host "== 5. Cotizacion de servicio (formulario del detalle de cada servicio) ==" -ForegroundColor Cyan
Post '/api/hub/cotizaciones' @{
  servicioSlug    = 'ciberseguridad'
  clienteNombre   = 'Lucia Fernandez'
  clienteEmail    = 'lucia.fernandez.prueba@example.com'
  clienteTelefono = '955 111 222'
  clienteEmpresa  = 'Clínica San Rafael'
  mensaje         = 'Queremos un análisis de seguridad y un firewall para la clínica.'
  origen          = '/servicios/ciberseguridad'
} 'cotizacion'

Write-Host "== 6. Cotizacion de otro servicio (por id) ==" -ForegroundColor Cyan
$serv = Invoke-RestMethod "$Api/public/servicios?marcaId=$marcaId" -TimeoutSec 60
$out = $serv.data | Where-Object { $_.slug -eq 'soluciones-cloud' } | Select-Object -First 1
Post '/api/hub/cotizaciones' @{
  servicioId      = $out.id
  clienteNombre   = 'Miguel Torres'
  clienteEmail    = 'miguel.torres.prueba@example.com'
  clienteTelefono = '933222111'
  clienteEmpresa  = 'Distribuidora Andina E.I.R.L.'
  mensaje         = 'Migramos nuestros servidores a la nube, necesitamos apoyo para el plan de migracion.'
  origen          = '/servicios/soluciones-cloud'
} 'cotizacion 2'

Write-Host "== 7. Formulario de contacto ==" -ForegroundColor Cyan
Post '/api/contacto' @{
  name    = 'Patricia Ramos'
  email   = 'patricia.ramos.prueba@example.com'
  phone   = '944777888'
  company = 'Constructora Norte'
  message = 'Recibimos una laptop danada en la garantia. Que pasos debemos seguir?'
  origen  = '/contacto'
} 'contacto'

Write-Host "== 8. Libro de Reclamaciones ==" -ForegroundColor Cyan
Post '/api/contacto' @{
  name    = 'Jorge Salinas'
  email   = 'jorge.salinas.prueba@example.com'
  phone   = '911222333'
  message = 'El servicio tecnico se realizo con dos dias de atraso sin avisar.'
  tipo    = 'RECLAMO'
  origen  = '/contacto'
} 'reclamo'

Write-Host "== 9. Suscripcion al boletin (pie de pagina) ==" -ForegroundColor Cyan
Post '/api/hub/boletin' @{
  email  = 'suscriptor.prueba@example.com'
  origen = '/'
} 'boletin'

Write-Host "== 10. Boletin: el mismo correo 2 veces es idempotente ==" -ForegroundColor Cyan
Post '/api/hub/boletin' @{
  email  = 'suscriptor.prueba@example.com'
  origen = '/servicios'
} 'boletin repetido'

Write-Host "== 11. Checkout de la tienda (recogio en tienda) ==" -ForegroundColor Cyan
$sku1 = $prod[0].sku
$sku2 = $prod[1].sku
Post '/api/hub/pedidos' @{
  nombre       = 'Rosa Medina'
  email        = 'rosa.medina.prueba@example.com'
  celular      = '966333444'
  documento    = '40119988'
  comprobante  = 'BOLETA'
  entrega      = 'RECOJO'
  metodoPago   = 'YAPE'
  notas        = 'Entregar en mostrador en horario de oficina.'
  items        = @(@{ sku = $sku1; cantidad = 2 }, @{ sku = $sku2; cantidad = 1 })
} 'pedido'

Write-Host "== 12. Checkout con articulo inexistente debe FALLAR (409) ==" -ForegroundColor Cyan
Post '/api/hub/pedidos' @{
  nombre     = 'Rosa Medina'
  email      = 'rosa.medina.prueba@example.com'
  celular    = '966333444'
  entrega    = 'RECOJO'
  items      = @(@{ sku = 'SKU-NO-EXISTE'; cantidad = 1 })
} 'pedido malo'

Write-Host "`n== Resumen en la base de datos ==" -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot '..\apps\api')
try { npx tsx ..\..\scripts\conteo-datos-prueba.ts $marcaId } finally { Pop-Location }