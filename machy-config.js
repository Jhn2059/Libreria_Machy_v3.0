// ╔══════════════════════════════════════════════════════════════════╗
// ║   LIBRERÍA MACHY — SVM v3.0 · Archivo de Configuración          ║
// ║   ⚠️  NO compartir este archivo públicamente (contiene API Key)  ║
// ║   Normativa: ERS IEEE Std 1016™-2009 · Metodología XP           ║
// ╚══════════════════════════════════════════════════════════════════╝

const MACHY_CONFIG = {

  // ── Supabase (RNF-05, RNF-11) ─────────────────────────────────────
  supabase: {
    url:    "https://drfmjgsrabpebbanisby.supabase.co",
    anonKey:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZm1qZ3NyYWJwZWJiYW5pc2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NTA3MjAsImV4cCI6MjA5NTIyNjcyMH0.uIk3hoFS2eKo0ot-h2Lpz13YCeshmyibiqDMU5_1avM",
  },

  // ── Datos del negocio (RF-32, HU-30) ─────────────────────────────
  negocio: {
    nombre:   "Librería Machy",
    ruc:      "20XXXXXXXXXX",
    direccion:"Av. Principal 123, Lima, Perú",
    telefono: "01-XXXXXXX",
    correo:   "contacto@libreriamachy.com",
    moneda:   "S/",
    zona:     "America/Lima",
  },

  // ── Parámetros de venta (RF-22, RF-25) ───────────────────────────
  ventas: {
    igv:                 18,       // % IGV Perú
    montoMinimoBoleta:   5.00,     // RF-25: emitir boleta si total >= este monto (S/)
    descuentoMaxVendedor:10,       // % máximo de descuento que puede dar un vendedor sin aprobación
    stockMinimoGlobal:   5,        // RF-20: stock mínimo por defecto
  },

  // ── Seguridad de sesión (RF-01, RF-04, RNF-06) ───────────────────
  sesion: {
    inactividadMinutos:  30,       // RF-04: cierre automático por inactividad
    avisoMinutos:        28,       // Aviso previo al cierre
    intentosMaxLogin:    5,        // RF-01: bloqueo tras N intentos
    bloqueoDuracionMin:  15,       // RF-01: duración del bloqueo
    tokenDuracionHoras:  8,        // RNF-06: expiración JWT
  },

  // ── Turnos laborales (RF-10, HU-08) ──────────────────────────────
  turnos: {
    manana:   { label: "Turno Mañana",   inicio: "08:00", fin: "13:30" },
    tarde:    { label: "Turno Tarde",    inicio: "14:00", fin: "19:00" },
    completo: { label: "Turno Completo", inicio: "08:00", fin: "19:00" },
  },

  // ── Versión del sistema ───────────────────────────────────────────
  version: "3.0.0",
  build:   "2025-05",
};