# RESUMEN DE CAMBIOS — Librería Machy SVM v3.0

## Novedades v3.0

### Escáner remoto vía Supabase Realtime
- **Nueva feature**: Escanea códigos de barras usando la cámara de tu celular desde la PC
- **Cómo funciona**: La PC genera un código QR con una sesión única, el celular lo escanea, abre una página web que usa la cámara trasera, y al detectar un código lo envía automáticamente a la PC vía Supabase Realtime
- **Tecnología**: Supabase Realtime (postgres_changes) + WebRTC (html5-qrcode) + QR Code API
- **Archivos**:
  - `remote-scan.html` (NUEVO) — Página standalone para el celular
  - `supabase/migration_v3.sql` (NUEVO) — Migración con tabla `scan_sessions`
  - `index.html` — Tabs "Cámara local" / "Celular remoto" en el modal del escáner
  - `app.js` — Funciones `startRemoteScan()`, `cancelRemoteScan()`, `useRemoteCode()`, `switchScanTab()`
  - `styles.css` — Estilos para el panel de escaneo remoto
  - `machy-config.js` — Versión actualizada a 3.0.0

### Cámara trasera corregida
- El escáner local ahora prioriza la cámara trasera (environment/back) sobre la frontal

## Problemas resueltos (v2.0)

### 1. UUID en Supabase
- **Síntoma**: Error `invalid input syntax for type uuid: "u-admin"` y `"p1"` al guardar
- **Causa**: IDs locales mock (`"u-admin"`, `"p1"`) se enviaban a columnas UUID de Supabase
- **Solución**: En `saveToSB()` se filtra cualquier campo que termine en `_id` o sea `id` si no es un UUID válido
- **Archivo**: `app.js` — función `saveToSB()`

### 2. Login demo con Supabase conectado
- **Síntoma**: Al usar login demo teniendo Supabase conectado, `CU.id` quedaba como `"u-admin"`
- **Solución**: `loginDemo()` ahora redirige a `doLogin()` con credenciales reales cuando `USE_SB = true`
- **Archivo**: `app.js` — función `loginDemo()`

### 3. Datos del negocio no se guardaban
- **Síntoma**: Formulario de configuración perdía datos al recargar
- **Causa**: Solo se guardaba en memoria `CFG_SISTEMA`, sin persistencia local
- **Solución**: Se agregó `localStorage` como respaldo
- **Archivos**: `app.js` — funciones `saveCfg()`, `loadConfigFromDB()`

### 4. Ventas no aparecían en Dashboard/Historial
- **Solución**: Columnas `paga_con` y `vuelto` agregadas, `await` en `saveToSB()`
- **Archivos**: `app.js`, `supabase/setup.sql`

### 5-9. Varios (placeholder, pagó con, ticket térmico, menú hamburguesa, z-index escáner)
- Ver v2.0 para detalles completos

## Archivos modificados (v3.0)

| Archivo | Cambios |
|---|---|
| `app.js` | Remote scan functions, switchScanTab, openM/closeM updated |
| `index.html` | Tabs scanner local/remoto, panel remoto con QR y sesión |
| `styles.css` | Estilos .scan-tabs, .rs-*, .rs-session-box, .rs-qr-wrap |
| `machy-config.js` | Versión 2.0.0 → 3.0.0 |

## Archivos creados (v3.0)

| Archivo | Propósito |
|---|---|
| `remote-scan.html` | Página para el celular: escanea códigos y los envía a la PC |
| `supabase/migration_v3.sql` | Tabla `scan_sessions` + RLS + instrucciones para habilitar Realtime |

## Pendiente / Notas

- **IMPORTANTE**: Después de ejecutar `migration_v3.sql`, hay que ir a Supabase Dashboard → Database → Replication y habilitar Realtime para la tabla `scan_sessions` (evento INSERT)
- El escáner remoto requiere que ambos dispositivos tengan acceso a Internet y a Supabase
- El QR se genera con la API pública `qrserver.com` (sin cargo)
- La página `remote-scan.html` tiene las credenciales de Supabase embebidas (debe actualizarse si cambian)
