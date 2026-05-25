// ══════════════════════════════════════════════════════════════════════
// INIT & SUPABASE
// ══════════════════════════════════════════════════════════════════════
let SB = null;
let USE_SB = false;
let CFG_SISTEMA = {};

async function initSupabase() {
  try {
    const { url, anonKey } = MACHY_CONFIG.supabase;
    SB = supabase.createClient(url, anonKey);
    const { error } = await SB.from('productos').select('id').limit(1);
    if (error) throw error;
    USE_SB = true;
    setDbStatus('ok', 'Supabase conectado');
    await loadConfigFromDB();
  } catch (e) {
    USE_SB = false;
    setDbStatus('err', 'BD no disponible — modo demo');
    toast('Supabase no disponible. Usando datos demo locales.', 'warning', '⚠️');
  }
}

function setDbStatus(state, msg) {
  ['db-chip','cfg-db-chip'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'db-chip ' + state;
  });
  ['db-chip-txt','cfg-db-txt'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  });
  const badge = document.getElementById('cfg-mode-badge');
  if (badge) {
    badge.textContent = state === 'ok' ? 'Supabase' : 'Demo';
    badge.className = 'badge ' + (state === 'ok' ? 'b-green' : 'b-amber');
  }
}

async function testConnection() {
  setDbStatus('loading', 'Probando…');
  await initSupabase();
}

async function loadConfigFromDB() {
  // Siempre cargar desde localStorage primero
  try {
    const saved = localStorage.getItem('machy_cfg');
    if (saved) { Object.assign(CFG_SISTEMA, JSON.parse(saved)); }
  } catch(e) {}
  if (!USE_SB) { await loadConfigIntoForm(); return; }
  const { data, error } = await SB.from('configuracion').select('clave,valor');
  if (error) return;
  data.forEach(c => { CFG_SISTEMA[c.clave] = c.valor; });
  try { localStorage.setItem('machy_cfg', JSON.stringify(CFG_SISTEMA)); } catch(e) {}
  await loadConfigIntoForm();
}

// ── LOGGING (RNF-14) ────────────────────────────────────────────
async function registrarLog(nivel, modulo, mensaje, ctx) {
  if (!USE_SB) return;
  try {
    await SB.rpc('registrar_log', {
      p_nivel: nivel, p_modulo: modulo,
      p_mensaje: mensaje, p_usuario_id: CU?.id || null,
      p_contexto: ctx || null
    });
  } catch(e) { console.warn('Log error:', e); }
}

// ── VERIFICAR CONTRASEÑA (RNF-04) ───────────────────────────────
async function verificarPassword(password, hash) {
  if (!USE_SB) return false;
  const { data, error } = await SB.rpc('verificar_password', {
    p_password: password, p_hash: hash
  });
  return data === true;
}

// ══════════════════════════════════════════════════════════════════════
// MOCK DATA (fallback demo)
// ══════════════════════════════════════════════════════════════════════
const CFG = MACHY_CONFIG;

const TURNOS = CFG.turnos;

let PRODS = [
  {id:'p1',codigo:'7501234567890',nombre:'Cuaderno Espiral A4 100h',descripcion:'Cuaderno universitario tapa dura',categoria:'Útiles escolares',unidad:'unidad',precio_compra:4.50,precio_venta:7.90,stock:45,stock_minimo:10,proveedor_nombre:'Distribuidora Escolar SAC',estado:'activo'},
  {id:'p2',codigo:'7501234567891',nombre:'Lapicero BIC Cristal Azul x12',descripcion:'Caja 12 lapiceros punta media',categoria:'Útiles escolares',unidad:'caja',precio_compra:8.00,precio_venta:13.50,stock:3,stock_minimo:8,proveedor_nombre:'BIC Perú',estado:'activo'},
  {id:'p3',codigo:'7501234567892',nombre:'Resma Papel Bond A4 75g',descripcion:'500 hojas papel bond',categoria:'Papelería',unidad:'paquete',precio_compra:18.00,precio_venta:26.90,stock:22,stock_minimo:5,proveedor_nombre:'Paperworld',estado:'activo'},
  {id:'p4',codigo:'7501234567893',nombre:'Témperas Faber-Castell x12',descripcion:'Set 12 colores no tóxico',categoria:'Manualidades',unidad:'unidad',precio_compra:6.50,precio_venta:11.90,stock:2,stock_minimo:5,proveedor_nombre:'Faber-Castell Perú',estado:'activo'},
  {id:'p5',codigo:'7501234567894',nombre:'Harry Potter T.1',descripcion:'La Piedra Filosofal tapa blanda',categoria:'Libros',unidad:'unidad',precio_compra:22.00,precio_venta:39.90,stock:8,stock_minimo:3,proveedor_nombre:'Salamandra',estado:'activo'},
  {id:'p6',codigo:'7501234567895',nombre:'Tijeras Maped 17cm',descripcion:'Punta roma de seguridad',categoria:'Útiles escolares',unidad:'unidad',precio_compra:3.20,precio_venta:5.50,stock:18,stock_minimo:6,proveedor_nombre:'Maped Perú',estado:'activo'},
  {id:'p7',codigo:'7501234567896',nombre:'Rompecabezas 500 piezas',descripcion:'Juguete educativo naturaleza',categoria:'Juguetes',unidad:'unidad',precio_compra:15.00,precio_venta:29.90,stock:0,stock_minimo:3,proveedor_nombre:'Ravensburger',estado:'activo'},
  {id:'p8',codigo:'7501234567897',nombre:'Regla 30cm Maped Clear',descripcion:'Transparente doble escala',categoria:'Útiles escolares',unidad:'unidad',precio_compra:1.50,precio_venta:2.90,stock:35,stock_minimo:10,proveedor_nombre:'Maped Perú',estado:'activo'},
  {id:'p9',codigo:'7501234567898',nombre:'Marcadores Plumones x24',descripcion:'Set 24 colores lavables',categoria:'Manualidades',unidad:'unidad',precio_compra:9.00,precio_venta:16.90,stock:12,stock_minimo:4,proveedor_nombre:'Artesco Perú',estado:'activo'},
  {id:'p10',codigo:'7501234567899',nombre:'Globo Terráqueo 20cm',descripcion:'Base giratoria escolar',categoria:'Útiles escolares',unidad:'unidad',precio_compra:28.00,precio_venta:49.90,stock:4,stock_minimo:2,proveedor_nombre:'Ediciones SM',estado:'descontinuado'},
  {id:'p11',codigo:'7501234567900',nombre:'Plastilina Faber 12 colores',descripcion:'No tóxica blanda',categoria:'Manualidades',unidad:'unidad',precio_compra:4.00,precio_venta:7.50,stock:25,stock_minimo:8,proveedor_nombre:'Faber-Castell Perú',estado:'activo'},
  {id:'p12',codigo:'7501234567901',nombre:'Calculadora Casio FX-82LA',descripcion:'240 funciones científica',categoria:'Útiles escolares',unidad:'unidad',precio_compra:35.00,precio_venta:58.90,stock:1,stock_minimo:3,proveedor_nombre:'Casio Perú',estado:'activo'},
  {id:'p13',codigo:'7501234567902',nombre:'Goma en Barra Pritt 43g',descripcion:'Sin disolventes',categoria:'Útiles escolares',unidad:'unidad',precio_compra:3.50,precio_venta:6.20,stock:30,stock_minimo:8,proveedor_nombre:'Distribuidora Escolar SAC',estado:'activo'},
  {id:'p14',codigo:'7501234567903',nombre:'Cartulina Iris A2 x10',descripcion:'Colores surtidos',categoria:'Papelería',unidad:'paquete',precio_compra:5.00,precio_venta:9.50,stock:14,stock_minimo:4,proveedor_nombre:'Paperworld',estado:'activo'},
  {id:'p15',codigo:'7501234567904',nombre:'Compás Maped Study',descripcion:'Con lápiz incluido',categoria:'Útiles escolares',unidad:'unidad',precio_compra:5.50,precio_venta:9.90,stock:7,stock_minimo:3,proveedor_nombre:'Maped Perú',estado:'activo'},
  {id:'p16',codigo:'7501234567905',nombre:'Pintura Acuarela 24 Colores',descripcion:'Pastillas lavables',categoria:'Manualidades',unidad:'unidad',precio_compra:8.00,precio_venta:14.90,stock:0,stock_minimo:5,proveedor_nombre:'Faber-Castell Perú',estado:'activo'},
  {id:'p17',codigo:'7501234567906',nombre:'Folder Manila A4 x50',descripcion:'Apertura lateral',categoria:'Papelería',unidad:'paquete',precio_compra:6.00,precio_venta:10.90,stock:20,stock_minimo:5,proveedor_nombre:'Paperworld',estado:'activo'},
  {id:'p18',codigo:'7501234567907',nombre:'Lápiz HB Faber x12',descripcion:'Grafito hexagonales',categoria:'Útiles escolares',unidad:'caja',precio_compra:4.00,precio_venta:7.20,stock:40,stock_minimo:10,proveedor_nombre:'Faber-Castell Perú',estado:'activo'},
  {id:'p19',codigo:'7501234567908',nombre:'Bloques Lego 200pzs',descripcion:'Construcción 6+ años',categoria:'Juguetes',unidad:'unidad',precio_compra:45.00,precio_venta:79.90,stock:3,stock_minimo:2,proveedor_nombre:'Ravensburger',estado:'activo'},
  {id:'p20',codigo:'7501234567909',nombre:'Libro Colorear Mandalas',descripcion:'60 páginas bond 90g',categoria:'Libros',unidad:'unidad',precio_compra:7.00,precio_venta:12.90,stock:9,stock_minimo:3,proveedor_nombre:'Ediciones SM',estado:'activo'},
];

let USERS = [
  {id:'u-admin',nombre:'Jhon',apellidos:'Taipe',username:'admin',correo:'jhon@machy.com',dni:'12345678',tel:'999001001',rol:'admin',turno:'completo',activo:true},
  {id:'u-ana',  nombre:'Ana',   apellidos:'Flores', username:'vendedor',correo:'ana@machy.com', dni:'87654321',tel:'999001002',rol:'vendedor',turno:'manana', activo:true},
  {id:'u-mig',  nombre:'Miguel',apellidos:'Torres', username:'miguel',  correo:'miguel@machy.com',dni:'11223344',tel:'999001003',rol:'vendedor',turno:'tarde',  activo:true},
];

let VENTAS = [];
let ASISTENCIA = [
  {id:'a1',usuario_id:'u-ana', nombre:'Ana Flores',  fecha:'2025-05-12',hora_entrada:'08:05',hora_salida:'13:30',turno:'manana', horas:5.4, tardanza_min:5,  cumple_turno:true, estado_asistencia:'puntual'},
  {id:'a2',usuario_id:'u-mig', nombre:'Miguel Torres',fecha:'2025-05-12',hora_entrada:'14:22',hora_salida:'19:00',turno:'tarde',  horas:4.6, tardanza_min:22, cumple_turno:true, estado_asistencia:'tardanza'},
  {id:'a3',usuario_id:'u-ana', nombre:'Ana Flores',  fecha:'2025-05-13',hora_entrada:'08:00',hora_salida:'13:30',turno:'manana', horas:5.5, tardanza_min:0,  cumple_turno:true, estado_asistencia:'puntual'},
  {id:'a4',usuario_id:'u-mig', nombre:'Miguel Torres',fecha:'2025-05-13',hora_entrada:'14:02',hora_salida:'19:00',turno:'tarde',  horas:4.96,tardanza_min:2,  cumple_turno:true, estado_asistencia:'puntual'},
  {id:'a5',usuario_id:'u-ana', nombre:'Ana Flores',  fecha:'2025-05-14',hora_entrada:'08:18',hora_salida:'13:15',turno:'manana', horas:4.95,tardanza_min:18, cumple_turno:false,estado_asistencia:'tardanza'},
];

// Generar ventas demo
(function(){
  const dias=['2025-05-12','2025-05-13','2025-05-14','2025-05-15','2025-05-16','2025-05-17','2025-05-18'];
  const vends=[USERS[0],USERS[1],USERS[2]];
  let n=1;
  dias.forEach(d=>{
    const qty=Math.floor(Math.random()*4)+2;
    for(let i=0;i<qty;i++){
      const prods=PRODS.filter(p=>p.estado==='activo').slice(0,Math.floor(Math.random()*3)+1);
      const items=prods.map(p=>({...p,cantidad:Math.floor(Math.random()*3)+1}));
      const sub=items.reduce((s,it)=>s+it.precio_venta*it.cantidad,0);
      const vend=vends[Math.floor(Math.random()*vends.length)];
      VENTAS.push({
        id:'v'+n, numero:n, num_comp:n,
        vendedor_id:vend.id,
        vendedor:vend.nombre+' '+vend.apellidos,
        items, subtotal:sub, descuento:0, total:parseFloat(sub.toFixed(2)),
        estado:'confirmada', boleta:sub>=CFG.ventas.montoMinimoBoleta,
        fecha:d+'T0'+Math.floor(Math.random()*9+8)+':'+String(Math.floor(Math.random()*59)).padStart(2,'0')+':00',
      });
      n++;
    }
  });
  VENTAS[2].estado='anulada';
})();

// ══════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════
const DEMO_USERS = {
  admin:   {id:'u-admin',nombre:'Jhon',apellidos:'Taipe',username:'admin',   rol:'admin',   turno:'completo',av:'JT'},
  vendedor:{id:'u-ana',  nombre:'Ana',   apellidos:'Flores', username:'vendedor',rol:'vendedor',turno:'manana',  av:'AF'},
  miguel:  {id:'u-mig',  nombre:'Miguel',apellidos:'Torres', username:'miguel',  rol:'vendedor',turno:'tarde',   av:'MT'},
};

let CU  = null;   // current user
let IAT = null;   // inactivity timer
let WAT = null;   // warning timer

function loginDemo(role) {
  if (USE_SB) {
    const usr = role === 'admin' ? 'admin' : role === 'vendedor' ? 'vendedor' : 'miguel';
    const pwd = role === 'admin' ? 'admin123' : role === 'vendedor' ? 'vend123' : 'vend456';
    document.getElementById('l-usr').value = usr;
    document.getElementById('l-pas').value = pwd;
    doLogin();
    return;
  }
  document.getElementById('btn-login').disabled = true;
  setTimeout(() => { CU = { ...DEMO_USERS[role] }; enterApp(); }, 350);
}

function showLoginErr(msg) {
  const el = document.getElementById('login-err');
  document.getElementById('login-err-msg').textContent = msg;
  el.style.display = 'block';
}
function hideLoginErr() { document.getElementById('login-err').style.display = 'none'; }

function enterApp() {
  if (!CU) return;
  applyRoleUI();
  updateSidebar();
  showPage('app-layout');
  goSec('dashboard');
  loadAll();
  resetInact();
  toast(`Bienvenido/a, ${CU.nombre} ${CU.apellidos} 👋`, 'success');
}

function sbRpc(nombre, params) {
  try {
    const p = SB.rpc(nombre, params);
    if (p && typeof p.then === 'function') return Promise.resolve(p);
  } catch(_) {}
  return Promise.resolve();
}

function logout() {
  if (CU?.id && USE_SB) {
    sbRpc('registrar_salida', { p_usuario_id: CU.id }).catch(() => {});
    registrarLog('info', 'auth', `Logout: ${CU.nombre} ${CU.apellidos}`).catch(() => {});
  }
  CU = null;
  cart = [];
  clearTimeout(IAT); clearTimeout(WAT);
  document.getElementById('blocker').style.display = 'none';
  document.getElementById('btn-login').disabled = false;
  document.getElementById('btn-login-txt').textContent = 'Ingresar al sistema';
  hideLoginErr();
  showPage('page-login');
  toast('Sesión cerrada correctamente · RF-03', 'info', '👋');
}

// ── RECUPERAR CONTRASEÑA (RF-05) ─────────────────────────────
function abrirRecuperarPassword() {
  document.getElementById('rec-result').style.display = 'none';
  document.getElementById('rec-usr').value = '';
  document.getElementById('rec-txt').textContent = 'Recuperar';
  openM('m-recuperar');
}

async function recuperarPassword() {
  const usr = document.getElementById('rec-usr').value.trim();
  const res = document.getElementById('rec-result');
  if (!usr) { toast('Ingresa tu correo o usuario','warning'); return; }
  document.getElementById('rec-txt').textContent = 'Buscando…';

  try {
    if (USE_SB) {
      const { data, error } = await SB.from('usuarios')
        .select('username, correo, nombre, apellidos')
        .or(`username.eq.${usr},correo.eq.${usr}`)
        .limit(1);

      if (error || !data || !data.length) {
        res.style.display = 'block';
        res.style.background = '#FEE2E2';
        res.style.color = '#DC2626';
        res.textContent = '⚠️ No encontramos una cuenta con ese dato. Contacta al administrador.';
        document.getElementById('rec-txt').textContent = 'Recuperar';
        return;
      }

      const u = data[0];
      res.style.display = 'block';
      res.style.background = '#DCFCE7';
      res.style.color = '#16A34A';
      res.innerHTML = `✅ Se ha enviado un enlace de recuperación a <strong>${u.correo}</strong> (${u.nombre} ${u.apellidos}).<br><small style="color:#666">En modo demo, contacta al administrador para restablecerla.</small>`;
      await registrarLog('info', 'auth', `Solicitud recuperación password: ${usr}`, { username: usr });
    } else {
      const map = { admin:'admin123', carlos:'admin123', vendedor:'vend123', ana:'vend123', miguel:'vend456' };
      const pwd = map[usr.toLowerCase()];
      if (pwd) {
        res.style.display = 'block';
        res.style.background = '#DCFCE7';
        res.style.color = '#16A34A';
        res.textContent = `🔑 Tu contraseña es: ${pwd} (modo demo)`;
      } else {
        res.style.display = 'block';
        res.style.background = '#FEE2E2';
        res.style.color = '#DC2626';
        res.textContent = '⚠️ Usuario no encontrado. Prueba: admin, vendedor o miguel';
      }
    }
  } catch(e) {
    res.style.display = 'block';
    res.style.background = '#FEE2E2';
    res.style.color = '#DC2626';
    res.textContent = 'Error de conexión. Intenta de nuevo.';
  }
  document.getElementById('rec-txt').textContent = 'Recuperar';
}

function applyRoleUI() {
  const isAdmin = CU.rol === 'admin';
  document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', !isAdmin));
}

function updateSidebar() {
  const t = TURNOS[CU.turno];
  document.getElementById('sb-av').textContent      = CU.av;
  document.getElementById('sb-uname').textContent   = CU.nombre + ' ' + CU.apellidos;
  document.getElementById('sb-urole').textContent   = CU.rol === 'admin' ? '👑 Administrador' : '🏷️ Vendedor';
  document.getElementById('turno-lbl').textContent  = `${t.label} · ${t.inicio}–${t.fin}`;
  document.getElementById('w-name').textContent     = CU.nombre;
  document.getElementById('w-date').textContent     = new Date().toLocaleDateString('es-PE', {weekday:'long',day:'numeric',month:'long'});
  document.getElementById('w-turno').textContent    = `⏰ ${t.label}: ${t.inicio} – ${t.fin}`;
}

// ══════════════════════════════════════════════════════════════════════
// INACTIVIDAD (RF-04)
// ══════════════════════════════════════════════════════════════════════
function resetInact() {
  clearTimeout(IAT); clearTimeout(WAT);
  if (!CU) return;
  const cfg = CFG.sesion;
  WAT = setTimeout(() => toast(`Sesión cerrará en ${cfg.inactividadMinutos - cfg.avisoMinutos} minutos por inactividad · RF-04`, 'warning', '⏰'), cfg.avisoMinutos * 60000);
  IAT = setTimeout(() => { toast('Sesión cerrada automáticamente por inactividad · RF-04', 'info', '🔒'); logout(); }, cfg.inactividadMinutos * 60000);
}
['mousemove','keydown','click','touchstart','scroll'].forEach(e => document.addEventListener(e, () => { if (CU) resetInact(); }));

// ══════════════════════════════════════════════════════════════════════
// CONTROL HORARIO (RF-09, RF-11)
// ══════════════════════════════════════════════════════════════════════
function checkHorario() {
  if (!CU || CU.rol === 'admin') return;
  const t = TURNOS[CU.turno];
  const now = new Date();
  const nm  = now.getHours() * 60 + now.getMinutes();
  const [hi, mi] = t.inicio.split(':').map(Number);
  const [hf, mf] = t.fin.split(':').map(Number);
  if (nm < hi*60+mi || nm > hf*60+mf) {
    document.getElementById('blocker-msg').textContent =
      `Tu ${t.label} es de ${t.inicio} a ${t.fin}. El acceso fuera de este horario está bloqueado. · RF-09, RF-11`;
    document.getElementById('blocker-sch').innerHTML = `
      <div class="bsch-r"><span>${t.label}</span><span>${t.inicio} – ${t.fin}</span></div>
      <div class="bsch-r"><span>Hora actual</span><span>${now.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}</span></div>`;
    document.getElementById('blocker').style.display = 'flex';
  }
}

// ══════════════════════════════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

const SEC_META = {
  dashboard: {title:'Dashboard',bc:'Inicio'},
  ventas:    {title:'Nueva Venta',bc:'Ventas'},
  historial: {title:'Historial de Ventas',bc:'Historial'},
  inventario:{title:'Inventario',bc:'Inventario'},
  catalogo:  {title:'Catálogo de Productos',bc:'Catálogo'},
  usuarios:  {title:'Gestión de Usuarios',bc:'Usuarios'},
  reportes:  {title:'Reportes',bc:'Reportes'},
  config:    {title:'Configuración del Sistema',bc:'Configuración'},
};

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sb-overlay').classList.toggle('show');
}

function goSec(name) {
  document.querySelectorAll('.sec').forEach(s  => s.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n   => n.classList.remove('active'));
  const sec = document.getElementById('sec-' + name);
  if (sec) sec.classList.add('active');
  const ni  = document.getElementById('ni-'  + name);
  if (ni)  ni.classList.add('active');
  const m = SEC_META[name] || {title:name, bc:name};
  document.getElementById('tb-title').textContent = m.title;
  document.getElementById('tb-sec').textContent   = m.bc;
  // Trigger renders
  if (name === 'ventas')    renderVentaGrid();
  if (name === 'historial') renderHistorial(VENTAS);
  if (name === 'inventario')renderInv(PRODS);
  if (name === 'catalogo')  renderCat(PRODS);
  if (name === 'usuarios')  renderUsers();
  if (name === 'reportes')  renderReports();
  if (name === 'config')   { renderCategorias(); renderProveedores(); loadConfigIntoForm(); }
  // Cerrar sidebar en móvil
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sb-overlay').classList.remove('show');
  checkHorario();
}

// ══════════════════════════════════════════════════════════════════════
// DATA LOAD (Supabase ➜ fallback mock)
// ══════════════════════════════════════════════════════════════════════
async function loadAll() {
  if (USE_SB) {
    await Promise.all([loadProds(), loadVentas(), loadUsersFromDB(), loadAsistenciaFromDB()]);
  }
  renderDash();
  renderInv(PRODS);
  renderCat(PRODS);
  renderHistorial(VENTAS);
  renderVentaGrid();
  renderUsers();
  renderReports();
  buildQA();
}

async function loadProds() {
  try {
    const { data, error } = await SB.from('productos').select('*').order('nombre');
    if (error) throw error;
    if (data && data.length) {
      PRODS = data.map(p => ({
        ...p,
        proveedor_nombre: p.proveedor_nombre || p.proveedor || '',
      }));
    }
  } catch(e) { console.warn('loadProds fallback:', e.message); }
}

async function loadVentas() {
  try {
    const { data, error } = await SB.from('ventas').select('*').order('created_at', {ascending:false}).limit(200);
    if (error) throw error;
    if (data && data.length) VENTAS = data.map(v=>({
      ...v, vendedor: v.vendedor || 'Empleado',
      items: (typeof v.items === 'string' ? JSON.parse(v.items) : v.items) || [],
      total: parseFloat(v.total)||0,
      subtotal: parseFloat(v.subtotal)||0,
      descuento: parseFloat(v.descuento)||0,
      cliente: v.cliente || 'VENTA AL CONTADO',
      num_comp: v.num_comp || v.numero,
    }));
  } catch(e) { console.warn('loadVentas fallback:', e.message); }
}

async function loadUsersFromDB() {
  try {
    const { data, error } = await SB.from('usuarios').select('*').order('nombre');
    if (error) throw error;
    if (data && data.length) {
      USERS = data.map(u => ({
        id: u.id, nombre: u.nombre, apellidos: u.apellidos,
        username: u.username, correo: u.correo, dni: u.dni || '',
        tel: u.telefono || '', rol: u.rol, turno: u.turno || 'completo',
        activo: u.activo !== false, av: (u.nombre[0]||'')+(u.apellidos[0]||'')
      }));
    }
  } catch(e) { console.warn('loadUsers fallback:', e.message); }
}

async function loadAsistenciaFromDB() {
  try {
    const { data, error } = await SB.from('asistencia').select('*').order('fecha', {ascending:false}).limit(100);
    if (error) throw error;
    if (data && data.length) ASISTENCIA = data;
  } catch(e) { console.warn('loadAsistencia fallback:', e.message); }
}

async function loadCategoriasFromDB() {
  try {
    const { data, error } = await SB.from('categorias').select('*').eq('activo', true).order('nombre');
    if (error) throw error;
    return data || [];
  } catch(e) { return []; }
}

async function loadProveedoresFromDB() {
  try {
    const { data, error } = await SB.from('proveedores').select('*').eq('activo', true).order('nombre');
    if (error) throw error;
    return data || [];
  } catch(e) { return []; }
}

async function doLogin() {
  const u = document.getElementById('l-usr').value.trim();
  const p = document.getElementById('l-pas').value.trim();
  if (!u || !p) { showLoginErr('Completa usuario y contraseña.'); return; }
  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  document.getElementById('btn-login-txt').innerHTML = '<span class="spin"></span> Verificando…';
  
  try {
    if (USE_SB) {
      // Buscar usuario en Supabase
      const { data: users, error } = await SB.from('usuarios')
        .select('*')
        .eq('username', u.toLowerCase())
        .limit(1);
      
      if (error || !users || !users.length) {
        showLoginErr('Usuario o contraseña incorrectos · RF-01');
        btn.disabled = false;
        document.getElementById('btn-login-txt').textContent = 'Ingresar al sistema';
        return;
      }
      
      const user = users[0];
      
      if (!user.activo) {
        showLoginErr('Cuenta desactivada. Contacta al administrador.');
        btn.disabled = false;
        document.getElementById('btn-login-txt').textContent = 'Ingresar al sistema';
        return;
      }
      
      // Verificar bloqueo por intentos
      if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
        const mins = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 60000);
        showLoginErr(`Cuenta bloqueada. Intenta de nuevo en ${mins} min · RF-01`);
        btn.disabled = false;
        document.getElementById('btn-login-txt').textContent = 'Ingresar al sistema';
        return;
      }
      
      // Verificar contraseña via RPC de Supabase (pgcrypto)
      const { data: valido, error: pwdErr } = await SB.rpc('verificar_password', {
        p_password: p, p_hash: user.password_hash
      });
      
      if (pwdErr || !valido) {
        await sbRpc('incrementar_intentos_fallidos', { p_username: u.toLowerCase() }).catch(() => {});
        showLoginErr('Usuario o contraseña incorrectos · RF-01');
        await registrarLog('warning', 'auth', `Intento fallido de login: ${u}`, { username: u });
        btn.disabled = false;
        document.getElementById('btn-login-txt').textContent = 'Ingresar al sistema';
        return;
      }
      
      await sbRpc('reset_intentos_fallidos', { p_usuario_id: user.id }).catch(() => {});
      await registrarLog('info', 'auth', `Login exitoso: ${user.nombre} ${user.apellidos}`, { user_id: user.id });
      
      CU = {
        id: user.id, nombre: user.nombre, apellidos: user.apellidos,
        username: user.username, rol: user.rol, turno: user.turno || 'completo',
        av: (user.nombre[0]||'')+(user.apellidos[0]||'')
      };
      
      await sbRpc('registrar_entrada', {
        p_usuario_id: user.id, p_turno: user.turno || 'completo',
        p_nombre: user.nombre + ' ' + user.apellidos
      }).catch(() => {});
      
      enterApp();
    } else {
      // Fallback demo login
      setTimeout(() => {
        hideLoginErr();
        const map = { admin:'admin', carlos:'admin', vendedor:'vendedor', ana:'vendedor', miguel:'miguel' };
        const role = map[u.toLowerCase()];
        const validPass = ['admin123','vend123','vend456','1234'].includes(p);
        if (role && validPass) { loginDemo(role); }
        else {
          showLoginErr('Credenciales incorrectas. Prueba las cuentas demo. · RF-01');
          btn.disabled = false;
          document.getElementById('btn-login-txt').textContent = 'Ingresar al sistema';
        }
      }, 700);
    }
  } catch (e) {
    showLoginErr('Error de conexión. Intenta de nuevo.');
    btn.disabled = false;
    document.getElementById('btn-login-txt').textContent = 'Ingresar al sistema';
    console.error(e);
  }
}

function isUUID(val) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

function isUUID(val) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

async function saveToSB(table, data, id) {
  if (!USE_SB) return true;
  if (id && !isUUID(id)) return true;
  const cleanData = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== null && v !== undefined) {
      if ((k.endsWith('_id') || k === 'id') && typeof v === 'string' && !isUUID(v)) continue;
      cleanData[k] = v;
    }
  }
  if (Object.keys(cleanData).length === 0) return true;
  try {
    if (id) {
      const { error } = await SB.from(table).update({...cleanData, updated_at: new Date().toISOString()}).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await SB.from(table).insert([cleanData]);
      if (error) throw error;
    }
    return true;
  } catch (e) {
    console.warn('⚠️ saveToSB error ('+table+'):', e.message);
    toast('Aviso: No se pudo guardar en la nube · ' + e.message, 'warning', '☁️');
    return true;
  }
}

// ══════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════
function renderDash() {
  const active  = PRODS.filter(p => p.estado === 'activo');
  const alerts  = active.filter(p => p.stock <= p.stock_minimo);
  const valor   = active.reduce((s, p) => s + p.precio_venta * p.stock, 0);
  const conf    = VENTAS.filter(v => v.estado === 'confirmada');
  const hoy     = new Date().toISOString().slice(0, 10);
  const vtHoy   = VENTAS.filter(v => (v.fecha||v.created_at||'').startsWith(hoy) && v.estado==='confirmada').length;

  setText('k-prods',   active.length);
  setText('k-prods-n', PRODS.filter(p=>p.estado==='descontinuado').length + ' descontinuados');
  setText('k-valor',   'S/'+fmt(valor));
  setText('k-alerts',  alerts.length);
  setText('k-ventas',  conf.length);
  setText('k-ventas-n','S/'+fmt(conf.reduce((s,v)=>s+v.total,0))+' en ingresos');
  setText('wk-p',      active.length);
  setText('wk-a',      alerts.length);
  setText('wk-v',      vtHoy);

  // Alerts panel
  const el = document.getElementById('dash-alerts');
  if (!alerts.length) {
    el.innerHTML = '<div class="ai ok"><span class="ai-ico">✅</span><div class="ai-c"><strong>Sin alertas</strong><span>Todos los productos tienen stock suficiente.</span></div></div>';
  } else {
    el.innerHTML = alerts.slice(0, 6).map(p =>
      `<div class="ai ${p.stock===0?'dang':'warn'}"><span class="ai-ico">${p.stock===0?'🚨':'⚠️'}</span><div class="ai-c"><strong>${p.nombre}</strong><span>Stock: <strong>${p.stock}</strong> uds | Mínimo: ${p.stock_minimo} | ${p.categoria}</span></div></div>`
    ).join('') + (alerts.length > 6 ? `<div style="text-align:center;font-size:.76rem;color:var(--slate-2);padding:6px">…y ${alerts.length-6} más</div>` : '');
  }

  // Notif badge
  const dot = document.getElementById('notif-dot');
  const badge = document.getElementById('badge-alert');
  if (alerts.length) { dot.classList.remove('hidden'); badge.classList.remove('hidden'); badge.textContent = alerts.length; }
  else               { dot.classList.add('hidden');    badge.classList.add('hidden'); }
}

function buildQA() {
  const isAdmin = CU?.rol === 'admin';
  const actions = [
    ...(isAdmin ? [{ico:'📦',cls:'n',bg:'var(--navy-xl)',color:'var(--navy-2)',label:'Nuevo producto',sub:'Escanear o ingresar · RF-16',fn:"openM('m-producto');resetProdForm()"}] : []),
    {ico:'🧾',cls:'g',bg:'var(--gold-l)',color:'var(--gold-2)',label:'Nueva venta',sub:'Carrito + escaneo · RF-21',fn:"goSec('ventas')"},
    {ico:'📷',cls:'g',bg:'var(--gold-l)',color:'var(--gold-2)',label:'Escanear código',sub:'Cámara del dispositivo · RF-13',fn:"openM('m-scanner')"},
    ...(isAdmin ? [{ico:'📥',cls:'gr',bg:'var(--green-l)',color:'var(--green)',label:'Exportar inventario',sub:'CSV / Excel / PDF · RF-29',fn:"exportInvCSV()"}] : []),
  ];
  document.getElementById('qa-list').innerHTML = actions.map(a =>
    `<div class="qai" onclick="${a.fn}"><div class="qa-ico" style="background:${a.bg};color:${a.color}">${a.ico}</div><div class="qa-txt"><strong>${a.label}</strong><span>${a.sub}</span></div><span class="qa-arr">→</span></div>`
  ).join('');
}

// ══════════════════════════════════════════════════════════════════════
// INVENTARIO
// ══════════════════════════════════════════════════════════════════════
function renderInv(data) {
  const active = data.filter(p => p.estado === 'activo');
  const alerts = active.filter(p => p.stock <= p.stock_minimo);
  const valor  = active.reduce((s, p) => s + p.precio_venta * p.stock, 0);
  setText('is1', active.length);
  setText('is2', alerts.length);
  setText('is3', 'S/' + fmt(valor));
  setText('is4', data.filter(p => p.estado === 'descontinuado').length);
  const isAdmin = CU?.rol === 'admin';
  document.getElementById('inv-tbody').innerHTML = data.length
    ? data.map(p => {
        const pct = p.stock_minimo > 0 ? Math.min(100, Math.round(p.stock / p.stock_minimo * 100)) : (p.stock > 0 ? 100 : 0);
        const sc  = p.stock === 0 ? '#ef4444' : p.stock <= p.stock_minimo ? '#f59e0b' : '#16a34a';
        const sb  = stockBadge(p);
        const acts = isAdmin
          ? `<div class="acts"><button class="abt" onclick="editProd('${p.id}')" title="Editar">✏️</button><button class="abt ${p.estado==='descontinuado'?'grn':'red'}" onclick="confirmToggle('${p.id}')" title="${p.estado==='descontinuado'?'Reactivar':'Descontinuar'}">${p.estado==='descontinuado'?'✅':'🚫'}</button></div>`
          : '<span style="font-size:.71rem;color:var(--slate-3)">Solo lectura</span>';
        return `<tr>
          <td><div class="pn">${p.nombre}</div><div class="ps">${p.codigo}</div></td>
          <td><span class="badge b-navy">${p.categoria}</span></td>
          <td class="price">S/${fmt(p.precio_venta)}</td>
          <td class="price" style="color:var(--slate-2)">S/${fmt(p.precio_compra)}</td>
          <td><div class="stock-wrap"><div class="stock-track"><div class="stock-fill" style="width:${Math.min(100,pct)}%;background:${sc}"></div></div><span style="font-size:.76rem;font-weight:700;color:${sc}">${p.stock} uds</span></div></td>
          <td>${sb}</td><td>${acts}</td></tr>`;
      }).join('')
    : `<tr><td colspan="7"><div class="empty-state"><span class="ei">📭</span><p>Sin productos</p></div></td></tr>`;
  document.getElementById('inv-cnt').textContent = `${data.length} producto${data.length!==1?'s':''}`;
}

function filterInv() {
  const q  = document.getElementById('inv-q').value.toLowerCase();
  const ct = document.getElementById('inv-cat').value;
  const es = document.getElementById('inv-est').value;
  renderInv(PRODS.filter(p => {
    const mq = !q  || p.nombre.toLowerCase().includes(q) || p.codigo.includes(q);
    const mc = !ct || p.categoria === ct;
    const me = !es
      || (es==='ok'     && p.stock > p.stock_minimo && p.estado==='activo')
      || (es==='bajo'   && p.stock <= p.stock_minimo && p.stock > 0 && p.estado==='activo')
      || (es==='critico'&& p.stock === 0 && p.estado==='activo')
      || (es==='desc'   && p.estado === 'descontinuado');
    return mq && mc && me;
  }));
}

// ══════════════════════════════════════════════════════════════════════
// CATÁLOGO
// ══════════════════════════════════════════════════════════════════════
function renderCat(data) {
  const isAdmin = CU?.rol === 'admin';
  document.getElementById('cat-tbody').innerHTML = data.length
    ? data.map(p => {
        const sb = stockBadge(p);
        const acts = isAdmin
          ? `<div class="acts"><button class="abt" onclick="editProd('${p.id}')">✏️</button><button class="abt red" onclick="confirmToggle('${p.id}')">🚫</button></div>`
          : `<div class="acts"><button class="abt" onclick="toast('${p.nombre} · S/${fmt(p.precio_venta)} · Stock: ${p.stock}','info','📦')">👁️</button></div>`;
        return `<tr>
          <td><code style="font-family:var(--fm);font-size:.71rem;color:var(--slate-2)">${p.codigo}</code></td>
          <td><div class="pn">${p.nombre}</div><div class="ps">${p.descripcion||'—'}</div></td>
          <td><span class="badge b-navy">${p.categoria}</span></td>
          <td class="price">S/${fmt(p.precio_venta)}</td>
          <td style="font-weight:700;font-size:.84rem;color:${p.stock===0?'var(--red)':p.stock<=p.stock_minimo?'var(--amber)':'var(--green)'}">${p.stock}</td>
          <td>${sb}</td>
          <td style="font-size:.78rem;color:var(--slate-2)">${p.proveedor_nombre||'—'}</td>
          <td>${acts}</td></tr>`;
      }).join('')
    : `<tr><td colspan="8"><div class="empty-state"><span class="ei">🛍️</span><p>Sin productos</p></div></td></tr>`;
  const n = data.length;
  setText('cat-cnt', `${n} producto${n!==1?'s':''}`);
  setText('cat-ft',  `${n} producto${n!==1?'s':''} en catálogo`);
}

function filterCat() {
  const q = document.getElementById('cat-q').value.toLowerCase();
  const c = document.getElementById('cat-cat').value;
  const e = document.getElementById('cat-est').value;
  renderCat(PRODS.filter(p =>
    (!q || p.nombre.toLowerCase().includes(q) || p.codigo.includes(q)) &&
    (!c || p.categoria === c) &&
    (!e || p.estado === e)
  ));
}

function globalSearch(v) {
  if (!v) return;
  goSec('catalogo');
  document.getElementById('cat-q').value = v;
  filterCat();
}

function stockBadge(p) {
  if (p.estado === 'descontinuado') return '<span class="badge b-gray">Descontinuado</span>';
  if (p.stock === 0)               return '<span class="badge b-red">Sin stock</span>';
  if (p.stock <= p.stock_minimo)   return '<span class="badge b-amber">Stock bajo</span>';
  return '<span class="badge b-green">Disponible</span>';
}

// ══════════════════════════════════════════════════════════════════════
// CRUD PRODUCTOS
// ══════════════════════════════════════════════════════════════════════
async function resetProdForm() {
  ['p-id','p-cod','p-nom','p-prov','p-desc','p-cat-id'].forEach(id => setVal(id,''));
  setVal('p-cat',''); setVal('p-uni','unidad');
  ['p-pc','p-pv','p-stock'].forEach(id => setVal(id,''));
  setVal('p-smin','5');
  setText('mp-t','Registrar producto');
  setText('sp-txt','Registrar producto');
  await renderCategorias(); // refresh dropdown
}

async function editProd(id) {
  await renderCategorias();
  const p = PRODS.find(x => x.id === id); if (!p) return;
  setVal('p-id',    p.id);
  setVal('p-cod',   p.codigo);
  setVal('p-nom',   p.nombre);
  setVal('p-cat',   p.categoria);
  setVal('p-cat-id', p.categoria_id || '');
  setVal('p-uni',   p.unidad);
  setVal('p-pc',    p.precio_compra);
  setVal('p-pv',    p.precio_venta);
  setVal('p-stock', p.stock);
  setVal('p-smin',  p.stock_minimo);
  setVal('p-prov',  p.proveedor_nombre || p.proveedor || '');
  setVal('p-desc',  p.descripcion||'');
  setText('mp-t',   'Editar producto · RF-17');
  setText('sp-txt', 'Guardar cambios');
  // Sincronizar p-cat-id con la opción seleccionada
  const sel = document.getElementById('p-cat');
  if (sel) {
    const opt = sel.options[sel.selectedIndex];
    if (opt?.getAttribute('data-id')) {
      document.getElementById('p-cat-id').value = opt.getAttribute('data-id');
    }
  }
  openM('m-producto');
}

async function saveProd() {
  if (CU?.rol !== 'admin') { toast('Solo el administrador puede gestionar productos · RF-02','error'); return; }
  const nombre = getVal('p-nom').trim();
  const codigo = getVal('p-cod').trim();
  const cat = getVal('p-cat');
  const catId = document.getElementById('p-cat-id')?.value || '';
  const pv = parseFloat(getVal('p-pv'));
  const pc = parseFloat(getVal('p-pc'));
  const stock = parseInt(getVal('p-stock'));
  if (!nombre || !codigo || !cat || isNaN(pv) || isNaN(pc) || isNaN(stock)) { toast('Completa los campos obligatorios','warning'); return; }
  if (pv < pc) { toast('El precio de venta no puede ser menor al de compra','warning'); return; }

  const prov = getVal('p-prov').trim();
  const data = {
    codigo, nombre, descripcion:getVal('p-desc').trim(),
    categoria: cat, categoria_id: catId || null,
    unidad:getVal('p-uni'), precio_compra:pc, precio_venta:pv,
    stock, stock_minimo:parseInt(getVal('p-smin'))||5,
    proveedor: prov, proveedor_nombre: prov, estado:'activo',
  };

  const eid = getVal('p-id');

  // Save to Supabase (si conectado) y siempre a local
  if (eid) {
    if (USE_SB) await saveToSB('productos', data, eid);
    const idx = PRODS.findIndex(p => p.id === eid);
    if (idx >= 0) PRODS[idx] = { ...PRODS[idx], ...data };
    toast('Producto actualizado · RF-17','success','✅');
    closeM('m-producto');
    loadAll();
  } else {
    if (PRODS.find(p => p.codigo === codigo)) { toast('Código de barras ya registrado · RF-16','error'); return; }
    const newId = 'p' + Date.now();
    if (USE_SB) await saveToSB('productos', data);
    PRODS.unshift({ id: newId, ...data });
    toast('Producto registrado · RF-16','success','✅');
    closeM('m-producto');
    loadAll();
  }
}

function confirmToggle(id) {
  const p = PRODS.find(x => x.id === id); if (!p) return;
  const isDes = p.estado === 'descontinuado';
  setText('conf-t', isDes ? 'Reactivar producto' : 'Descontinuar producto');
  setText('conf-msg', isDes
    ? `¿Reactivar "${p.nombre}"? Volverá a aparecer en el catálogo activo.`
    : `¿Descontinuar "${p.nombre}"? No aparecerá en nuevas ventas pero se conserva el historial. · RF-18`);
  document.getElementById('conf-extra').innerHTML = '';
  document.getElementById('conf-btn').textContent = isDes ? 'Reactivar' : 'Descontinuar';
  document.getElementById('conf-btn').onclick = () => { toggleEstado(id); closeM('m-confirm'); };
  openM('m-confirm');
}

async function toggleEstado(id) {
  if (CU?.rol !== 'admin') { toast('Solo administrador puede realizar esta acción','error'); return; }
  const p = PRODS.find(x => x.id === id); if (!p) return;
  const nE = p.estado === 'descontinuado' ? 'activo' : 'descontinuado';
  await saveToSB('productos', { estado: nE }, id);
  p.estado = nE;
  toast(`Producto ${nE === 'descontinuado' ? 'descontinuado':'reactivado'} · RF-18`, 'success', nE === 'descontinuado' ? '🚫':'✅');
  loadAll();
}

// ══════════════════════════════════════════════════════════════════════
// CARRITO DE VENTAS
// ══════════════════════════════════════════════════════════════════════
let cart = [];
let scanCtx = 'search';

function renderVentaGrid() {
  const q   = document.getElementById('v-q')?.value.toLowerCase() || '';
  const cat = document.getElementById('v-cat')?.value || '';
  const ps  = PRODS.filter(p => p.estado === 'activo' && (!q || p.nombre.toLowerCase().includes(q) || p.codigo.includes(q)) && (!cat || p.categoria === cat));
  document.getElementById('venta-grid').innerHTML = ps.length
    ? ps.map(p => `
      <div class="pg${p.stock===0?' nostock':''}" onclick="${p.stock>0?`addCart('${p.id}')`:''}" title="${p.stock===0?'Sin stock':p.nombre}">
        <div class="pg-cat">${p.categoria}</div>
        <div class="pg-nm">${p.nombre}</div>
        <div class="pg-price">S/${fmt(p.precio_venta)}</div>
        <div class="pg-stock" style="color:${p.stock===0?'var(--red)':p.stock<=p.stock_minimo?'var(--amber)':'var(--slate-2)'}">Stock: ${p.stock}</div>
        ${p.stock > 0 ? '<button class="pg-add">+</button>' : ''}
        ${p.stock === 0 ? '<span class="pg-badge badge b-red">Sin stock</span>' : p.stock <= p.stock_minimo ? '<span class="pg-badge badge b-amber">Bajo</span>' : ''}
      </div>`).join('')
    : '<div style="text-align:center;padding:28px;color:var(--slate-2);font-size:.84rem">Sin productos disponibles</div>';
}

function addCart(id) {
  const p = PRODS.find(x => x.id === id);
  if (!p || p.stock === 0) return;
  const ex = cart.find(c => c.id === id);
  if (ex) {
    if (ex.qty >= p.stock) { toast('Stock máximo alcanzado','warning'); return; }
    ex.qty++;
  } else {
    cart.push({ ...p, qty: 1 });
  }
  renderCart();
  toast(`${p.nombre} agregado`, 'success', '🛒');
}

function removeCart(id) { cart = cart.filter(c => c.id !== id); renderCart(); }
function changeQty(id, d) {
  const it = cart.find(c => c.id === id); if (!it) return;
  it.qty += d;
  if (it.qty <= 0) removeCart(id); else renderCart();
}
function clearCart() { cart = []; renderCart(); }

function renderCart() {
  const body = document.getElementById('cart-body');
  const cnt  = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cart-cnt').textContent = `(${cnt})`;
  if (!cart.length) {
    body.innerHTML = '<div class="cart-empty"><div>🛒</div>Agrega productos al carrito</div>';
    recalc(); return;
  }
  body.innerHTML = cart.map(it => `
    <div class="ci">
      <div class="ci-info"><div class="ci-nm">${it.nombre}</div><div class="ci-cat">${it.categoria}</div></div>
      <div class="ci-ctrl">
        <button class="cq" onclick="changeQty('${it.id}',-1)">−</button>
        <span class="cn">${it.qty}</span>
        <button class="cq" onclick="changeQty('${it.id}',1)">+</button>
      </div>
      <div class="ci-price">S/${fmt(it.precio_venta * it.qty)}</div>
      <button class="ci-del" onclick="removeCart('${it.id}')">✕</button>
    </div>`).join('');
  recalc();
  document.getElementById('v-vuelto-wrap').style.display = 'none';
  document.getElementById('v-paga').value = '';
}

function recalc() {
  const sub  = cart.reduce((s, c) => s + c.precio_venta * c.qty, 0);
  const dv   = parseFloat(document.getElementById('dcto-v')?.value) || 0;
  const dt   = document.getElementById('dcto-t')?.value || 'pct';
  const dcto = dt === 'pct' ? sub * dv / 100 : Math.min(dv, sub);
  const net  = sub - dcto;
  const igv  = net * 18 / 118;
  const maxDcto = parseFloat(CFG_SISTEMA.descuento_max_vendedor) || MACHY_CONFIG.ventas.descuentoMaxVendedor || 10;
  const maxDctoVal = sub * maxDcto / 100;
  const exceso = CU?.rol === 'vendedor' && dcto > maxDctoVal;
  const dctoPct = sub > 0 ? Math.round(dcto / sub * 100) : 0;
  setText('c-sub',   'S/' + fmt(sub));
  setText('c-dcto',  '- S/' + fmt(dcto) + (CU?.rol === 'vendedor' ? ` (${dctoPct}% / máx ${maxDcto}%)` : ''));
  if (exceso && document.getElementById('c-dcto')) document.getElementById('c-dcto').style.color = 'var(--red)';
  setText('c-igv',   'S/' + fmt(igv));
  setText('c-total', 'S/' + fmt(net));
  const btn = document.getElementById('btn-confirmar');
  if (btn) btn.disabled = cart.length === 0 || exceso;
  return { sub, dcto, net };
}


// ══════════════════════════════════════════════════════════════════════
// HISTORIAL VENTAS
// ══════════════════════════════════════════════════════════════════════
function renderHistorial(data) {
  const isAdmin = CU?.rol === 'admin';
  const list = isAdmin ? data : data.filter(v => v.vendedor_id === CU.id);
  const tbody = document.getElementById('h-tbody');
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><span class="ei">📋</span><p>Sin ventas registradas</p></div></td></tr>`;
  } else {
    tbody.innerHTML = list.map(v => {
      const sb  = v.estado==='confirmada' ? '<span class="badge b-green">Confirmada</span>'
                : v.estado==='anulada'    ? '<span class="badge b-red">Anulada</span>'
                : '<span class="badge b-amber">Pendiente</span>';
      const comp = (v.boleta||v.boleta_generada) ? '<span class="badge b-navy">Boleta</span>' : '<span class="badge b-gray">Ticket</span>';
      const fecha = new Date(v.fecha||v.created_at||Date.now()).toLocaleString('es-PE');
      const anulBtn = isAdmin && v.estado==='confirmada'
        ? `<button class="abt red" onclick="anularVenta('${v.id}')" title="Anular · RF-26">🚫</button>`
        : '';
      const detBtn = `<button class="abt" onclick="verVenta('${v.id}')" title="Ver detalle">👁️</button>`;
      return `<tr>
        <td style="font-family:var(--fm);font-weight:700;color:var(--navy-2)">#${v.num_comp||v.numero||'—'}</td>
        <td style="font-size:.79rem">${fecha}</td>
        <td style="font-size:.81rem">${v.vendedor||'—'}</td>
        <td style="font-size:.79rem">${v.items?.length||0} ítem(s)</td>
        <td class="price">S/${fmt(v.total)}</td>
        <td>${comp}</td><td>${sb}</td>
        <td><div class="acts">${detBtn}${anulBtn}</div></td></tr>`;
    }).join('');
  }
  const n = list.length;
  setText('h-cnt', `${n} venta${n!==1?'s':''}`);
  setText('h-ft',  `${n} venta${n!==1?'s':''}`);
}

function filterHist() {
  const q = document.getElementById('h-q').value.toLowerCase();
  const e = document.getElementById('h-est').value;
  renderHistorial(VENTAS.filter(v =>
    (!q || String(v.num_comp||v.numero||'').includes(q) || (v.vendedor||'').toLowerCase().includes(q)) &&
    (!e || v.estado === e)
  ));
}

function verVenta(id) {
  const v = VENTAS.find(x => x.id === id); if (!v) return;
  const fecha = new Date(v.fecha||v.created_at||Date.now()).toLocaleString('es-PE');
  document.getElementById('vd-t').textContent = `Venta #${v.num_comp||v.numero}`;
  document.getElementById('vd-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;margin-bottom:16px;font-size:.84rem">
      <div><span style="color:var(--slate-2)">Fecha:</span> <strong>${fecha}</strong></div>
      <div><span style="color:var(--slate-2)">Vendedor:</span> <strong>${v.vendedor||'—'}</strong></div>
      <div><span style="color:var(--slate-2)">Estado:</span> <strong>${v.estado}</strong></div>
      <div><span style="color:var(--slate-2)">Comprobante:</span> <strong>${(v.boleta||v.boleta_generada)?'Boleta':'Ticket'}</strong></div>
    </div>
    <div style="background:var(--slate-5);border-radius:var(--r3);padding:12px;margin-bottom:14px">
      <table style="width:100%;font-size:.82rem;border-collapse:collapse">
        <thead><tr style="border-bottom:1px solid var(--slate-3)">${['Producto','Cant.','P.Unit.','Subtotal'].map(h=>`<th style="padding:5px 8px;text-align:left;font-size:.7rem;font-weight:700;color:var(--slate-2);text-transform:uppercase">${h}</th>`).join('')}</tr></thead>
        <tbody>${(v.items||[]).map(it=>`<tr><td style="padding:5px 8px">${it.nombre||it.nombre_producto}</td><td style="padding:5px 8px;font-weight:700">${it.cantidad||it.qty}</td><td style="padding:5px 8px;font-family:var(--fm)">S/${fmt(it.precio_venta||it.precio_unitario)}</td><td style="padding:5px 8px;font-family:var(--fm);font-weight:700">S/${fmt((it.precio_venta||it.precio_unitario)*(it.cantidad||it.qty))}</td></tr>`).join('')||'<tr><td colspan="4" style="padding:8px;color:var(--slate-2);text-align:center">Sin detalle</td></tr>'}</tbody>
      </table>
    </div>
    <div style="text-align:right;font-size:.84rem">
      <div style="color:var(--slate-2);margin-bottom:3px">Descuento: <strong style="color:var(--red)">-S/${fmt(v.descuento||0)}</strong></div>
      <div style="font-size:1.1rem;font-weight:700;color:var(--navy)">Total: <span style="font-family:var(--fm)">S/${fmt(v.total)}</span></div>
    </div>`;
  openM('m-venta-det');
}

function anularVenta(id) {
  if (CU?.rol !== 'admin') { toast('Solo el administrador puede anular ventas · RF-26','error'); return; }
  const v = VENTAS.find(x => x.id === id); if (!v) return;
  setText('conf-t', 'Anular venta · RF-26');
  setText('conf-msg', `¿Anular venta #${v.num_comp||v.numero} (S/${fmt(v.total)})? El stock será restituido automáticamente.`);
  document.getElementById('conf-extra').innerHTML = `
    <div class="fg" style="margin-bottom:14px"><label class="fl">Motivo de anulación <span class="req">*</span></label>
    <input type="text" id="mot-anu" class="fi" placeholder="Describe el motivo…"/></div>`;
  document.getElementById('conf-btn').textContent = 'Anular venta';
  document.getElementById('conf-btn').onclick = () => {
    const mot = document.getElementById('mot-anu')?.value.trim();
    if (!mot) { toast('Ingresa el motivo de anulación','warning'); return; }
    v.estado = 'anulada'; v.motivo = mot;
    v.items?.forEach(it => {
      const p = PRODS.find(x => x.id === it.id); if (p) p.stock += it.cantidad || it.qty || 0;
    });
    saveToSB('ventas', { estado:'anulada', motivo_anulacion: mot }, id);
    closeM('m-confirm');
    renderHistorial(VENTAS);
    loadAll();
    toast(`Venta #${v.num_comp||v.numero} anulada · stock restituido · RF-26`, 'success', '↩️');
  };
  openM('m-confirm');
}

// ══════════════════════════════════════════════════════════════════════
// CONTROL DE ASISTENCIA MANUAL (RF-12, RF-30)
// ══════════════════════════════════════════════════════════════════════
function renderAsistenciaHoy() {
  const el = document.getElementById('asist-status');
  if (!el || !CU) return;
  const hoy = new Date().toISOString().slice(0, 10);
  const reg = ASISTENCIA.find(a => a.usuario_id === CU.id && a.fecha === hoy);
  const entradaBtn = document.getElementById('btn-marcar-entrada');
  const salidaBtn = document.getElementById('btn-marcar-salida');
  if (reg) {
    const tl = TURNOS[CU.turno || 'completo'];
    const tard = reg.tardanza_min ? ` · Tardanza: ${reg.tardanza_min}min` : '';
    el.innerHTML = `<strong style="color:var(--green)">✅ Registrado hoy</strong><br>
      Entrada: <strong>${reg.hora_entrada || '—'}</strong> |
      Salida: <strong>${reg.hora_salida || '—'}</strong> |
      Turno: ${tl.label}${tard}`;
    el.style.background = 'var(--green-l)';
    el.style.color = 'var(--green)';
    if (entradaBtn) entradaBtn.disabled = true;
    if (salidaBtn) salidaBtn.disabled = !!reg.hora_salida;
  } else {
    el.innerHTML = '<strong style="color:var(--amber)">⏳ Sin registro hoy</strong><br>Marca tu entrada para iniciar el turno';
    el.style.background = 'var(--amber-l)';
    el.style.color = 'var(--amber)';
    if (entradaBtn) entradaBtn.disabled = false;
    if (salidaBtn) salidaBtn.disabled = true;
  }
}

async function marcarEntrada() {
  if (!CU) { toast('Inicia sesión primero','warning'); return; }
  const hoy = new Date().toISOString().slice(0, 10);
  if (ASISTENCIA.find(a => a.usuario_id === CU.id && a.fecha === hoy)) {
    toast('Ya tienes un registro de entrada hoy','info'); return;
  }
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const hora = `${hh}:${mm}`;
  const tl = TURNOS[CU.turno || 'completo'];
  const [hi, mi] = tl.inicio.split(':').map(Number);
  const mins = hh * 60 + mm;
  const inicioMins = hi * 60 + mi;
  const tardanza = Math.max(0, mins - inicioMins - 15);
  const esTardanza = tardanza > 0;

  const reg = {
    id: 'a' + Date.now(), usuario_id: CU.id,
    nombre: CU.nombre + ' ' + CU.apellidos,
    fecha: hoy, hora_entrada: hora, hora_salida: null,
    turno: CU.turno || 'completo',
    horas: 0, tardanza_min: tardanza,
    cumple_turno: false, estado_asistencia: esTardanza ? 'tardanza' : 'puntual',
  };

  if (USE_SB) {
    await SB.from('asistencia').insert([{
      usuario_id: CU.id, nombre: reg.nombre, fecha: hoy,
      hora_entrada: hora, turno: CU.turno || 'completo',
      tardanza_min: tardanza,
      estado_asistencia: esTardanza ? 'tardanza' : 'puntual',
    }]);
  }
  ASISTENCIA.unshift(reg);
  renderAsistenciaHoy();
  renderUsers();
  toast(esTardanza ? `Entrada marcada con ${tardanza}min de tardanza` : 'Entrada marcada correctamente', esTardanza ? 'warning' : 'success', '✅');
  await registrarLog('info', 'asistencia', `Entrada manual: ${CU.nombre} ${CU.apellidos}`, CU.id);
}

async function marcarSalida() {
  if (!CU) { toast('Inicia sesión primero','warning'); return; }
  const hoy = new Date().toISOString().slice(0, 10);
  const reg = ASISTENCIA.find(a => a.usuario_id === CU.id && a.fecha === hoy);
  if (!reg) { toast('No hay registro de entrada hoy','warning'); return; }
  if (reg.hora_salida) { toast('Ya registraste salida hoy','info'); return; }

  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const hora = `${hh}:${mm}`;
  const horasTrab = ((hh*60+mm) - (parseInt(reg.hora_entrada.split(':')[0])*60 + parseInt(reg.hora_entrada.split(':')[1]))) / 60;
  const cumple = horasTrab >= 5;

  reg.hora_salida = hora;
  reg.horas = parseFloat(horasTrab.toFixed(2));
  reg.cumple_turno = cumple;

  if (USE_SB) {
    await SB.from('asistencia').update({
      hora_salida: hora, horas: reg.horas, cumple_turno: cumple,
    }).eq('id', reg.id);
  }
  renderAsistenciaHoy();
  renderUsers();
  toast(`Salida marcada · ${reg.horas.toFixed(1)}h trabajadas`, 'success', '🔴');
  await registrarLog('info', 'asistencia', `Salida manual: ${CU.nombre} ${CU.apellidos}`, CU.id);
}

function cargarSelectAsistencia() {
  const sel = document.getElementById('asist-usuario');
  if (!sel) return;
  sel.innerHTML = '<option value="">Seleccionar empleado…</option>' +
    USERS.filter(u => u.rol === 'vendedor' && u.activo)
      .map(u => `<option value="${u.id}" data-nom="${u.nombre} ${u.apellidos}">${u.nombre} ${u.apellidos}</option>`).join('');
}

async function registrarAsistenciaAdmin() {
  if (CU?.rol !== 'admin') { toast('Solo administradores','error'); return; }
  const sel = document.getElementById('asist-usuario');
  const uid = sel?.value;
  const tipo = document.getElementById('asist-tipo')?.value;
  if (!uid) { toast('Selecciona un empleado','warning'); return; }
  const u = USERS.find(x => x.id === uid);
  if (!u) return;
  const hoy = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const hora = `${hh}:${mm}`;

  let reg = ASISTENCIA.find(a => a.usuario_id === uid && a.fecha === hoy);

  if (tipo === 'entrada') {
    if (reg && reg.hora_entrada) { toast(`${u.nombre} ya tiene entrada hoy`,'info'); return; }
    if (!reg) {
      reg = { id: 'a' + Date.now(), usuario_id: uid, nombre: u.nombre + ' ' + u.apellidos,
        fecha: hoy, hora_entrada: hora, hora_salida: null, turno: u.turno || 'completo',
        horas: 0, tardanza_min: 0, cumple_turno: false, estado_asistencia: 'puntual' };
      ASISTENCIA.unshift(reg);
    } else {
      reg.hora_entrada = hora;
    }
    if (USE_SB) await SB.from('asistencia').upsert({
      usuario_id: uid, nombre: reg.nombre, fecha: hoy,
      hora_entrada: hora, turno: u.turno || 'completo',
      estado_asistencia: 'puntual',
    }, { onConflict: 'id' });
    toast(`Entrada registrada para ${u.nombre} ${u.apellidos}`,`success`,`✅`);
  } else {
    if (!reg || !reg.hora_entrada) { toast(`${u.nombre} no tiene entrada hoy`,'warning'); return; }
    if (reg.hora_salida) { toast(`${u.nombre} ya tiene salida hoy`,'info'); return; }
    const minEnt = parseInt(reg.hora_entrada.split(':')[0])*60 + parseInt(reg.hora_entrada.split(':')[1]);
    const horasTrab = ((hh*60+mm) - minEnt) / 60;
    reg.hora_salida = hora;
    reg.horas = parseFloat(horasTrab.toFixed(2));
    reg.cumple_turno = horasTrab >= 5;
    if (USE_SB) await SB.from('asistencia').update({
      hora_salida: hora, horas: reg.horas, cumple_turno: reg.cumple_turno,
    }).eq('id', reg.id);
    toast(`Salida registrada para ${u.nombre} ${u.apellidos} · ${reg.horas.toFixed(1)}h`,'success','🔴');
  }
  renderAsistenciaHoy();
  renderUsers();
}

// ══════════════════════════════════════════════════════════════════════
// USUARIOS
// ══════════════════════════════════════════════════════════════════════
function resetUserForm() {
  setVal('u-id','');
  ['u-nom','u-ape','u-dni','u-tel','u-cor','u-usr','u-pas'].forEach(id => setVal(id,''));
  setVal('u-rol','vendedor'); setVal('u-tur','completo');
  setText('mu-t','Registrar usuario');
  setText('su-txt','Registrar usuario');
  onRolChange();
}

function onRolChange() {
  const rol = document.getElementById('u-rol').value;
  document.getElementById('turno-wrap').style.display = rol === 'vendedor' ? 'block' : 'none';
}

function renderUsers() {
  renderAsistenciaHoy();
  cargarSelectAsistencia();
  document.getElementById('user-cards').innerHTML = USERS.map(u => {
    const tl = TURNOS[u.turno || 'completo'];
    return `<div class="uc${!u.activo?' inactive':''}">
      <div class="uc-top">
        <div class="uc-av ${u.rol}">${u.nombre[0]}${u.apellidos[0]}</div>
        <div class="uc-inf"><div class="uc-nm">${u.nombre} ${u.apellidos}</div><div class="uc-us">@${u.username}</div></div>
        <span class="badge ${u.rol==='admin'?'b-navy':'b-gold'}">${u.rol==='admin'?'Admin':'Vendedor'}</span>
      </div>
      <div class="uc-rows">
        <div class="uc-row"><span class="uc-rl">Correo</span><span class="uc-rv" style="font-size:.74rem">${u.correo}</span></div>
        <div class="uc-row"><span class="uc-rl">DNI</span><span class="uc-rv">${u.dni||'—'}</span></div>
        <div class="uc-row"><span class="uc-rl">Turno</span><span class="uc-rv" style="font-size:.76rem">${tl.label} (${tl.inicio}–${tl.fin})</span></div>
        <div class="uc-row"><span class="uc-rl">Estado</span><span class="badge ${u.activo?'b-green':'b-red'}">${u.activo?'Activo':'Inactivo'}</span></div>
      </div>
      <div class="uc-acts">
        <button class="btn btn-outline btn-sm" onclick="editUser('${u.id}')">✏️ Editar</button>
        <button class="btn btn-sm ${u.activo?'btn-ghost':'btn-green'}" onclick="toggleUser('${u.id}')">${u.activo?'🚫 Desactivar':'✅ Activar'}</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('asist-tbody').innerHTML = ASISTENCIA.map(a => {
    const tl = TURNOS[a.turno||'completo'];
    const sb = a.estado_asistencia==='puntual'?'<span class="badge b-green">Puntual</span>':a.estado_asistencia==='tardanza'?'<span class="badge b-amber">Tardanza</span>':'<span class="badge b-gray">Incompleto</span>';
    return `<tr>
      <td class="pn">${a.nombre}</td>
      <td style="font-size:.8rem">${a.fecha}</td>
      <td style="font-family:var(--fm);font-size:.8rem">${a.hora_entrada}</td>
      <td style="font-family:var(--fm);font-size:.8rem">${a.hora_salida||'—'}</td>
      <td style="font-size:.8rem">${tl.label}</td>
      <td style="font-weight:700;color:var(--navy-2)">${a.horas?a.horas.toFixed(1)+'h':'—'}</td>
      <td style="font-size:.8rem">${a.tardanza_min?a.tardanza_min+'min':'—'}</td>
      <td>${sb}</td></tr>`;
  }).join('');
}

function editUser(id) {
  const u = USERS.find(x => x.id === id); if (!u) return;
  setVal('u-id',  u.id);     setVal('u-nom', u.nombre);  setVal('u-ape', u.apellidos);
  setVal('u-dni', u.dni||''); setVal('u-tel', u.tel||'');
  setVal('u-cor', u.correo);  setVal('u-usr', u.username);
  setVal('u-pas', ''); setVal('u-rol', u.rol); setVal('u-tur', u.turno||'completo');
  setText('mu-t','Editar usuario · RF-07');
  setText('su-txt','Guardar cambios');
  document.getElementById('lbl-pass').innerHTML = 'Contraseña <span style="color:var(--slate-2);font-weight:400">(dejar vacío para no cambiar)</span>';
  onRolChange();
  openM('m-usuario');
}

async function saveUser() {
  const nom = getVal('u-nom').trim();
  const ape = getVal('u-ape').trim();
  const cor = getVal('u-cor').trim();
  const usr = getVal('u-usr').trim();
  if (!nom||!ape||!cor||!usr) { toast('Completa los campos obligatorios','warning'); return; }
  const eid = getVal('u-id');
  const data = {
    nombre:nom, apellidos:ape, correo:cor, username:usr,
    dni:getVal('u-dni').trim(), tel:getVal('u-tel').trim(),
    rol:getVal('u-rol'), turno:getVal('u-tur'), activo:true,
  };
  if (eid) {
    const idx = USERS.findIndex(u => u.id === eid);
    if (idx >= 0) USERS[idx] = { ...USERS[idx], ...data };
    if (USE_SB) saveToSB('usuarios', {
      nombre:nom, apellidos:ape, correo:cor, username:usr,
      dni: getVal('u-dni').trim(), telefono: getVal('u-tel').trim(),
      rol: getVal('u-rol'), turno: getVal('u-tur')
    }, eid);
    toast('Usuario actualizado · RF-07','success','✅');
  } else {
    if (USERS.find(u => u.username === usr)) { toast('Nombre de usuario ya existe','error'); return; }
    USERS.push({ id:'u'+Date.now(), ...data });
    toast('Usuario registrado · RF-06','success','✅');
  }
  closeM('m-usuario');
  renderUsers();
}

function toggleUser(id) {
  const u = USERS.find(x => x.id === id); if (!u) return;
  if (u.id === CU?.id) { toast('No puedes desactivar tu propia cuenta','warning'); return; }
  u.activo = !u.activo;
  toast(`Usuario ${u.activo?'activado':'desactivado'} · RF-08`,'success', u.activo?'✅':'🚫');
  renderUsers();
}

// ══════════════════════════════════════════════════════════════════════
// REPORTES
// ══════════════════════════════════════════════════════════════════════
function showRepTab(id) {
  document.querySelectorAll('.rep-tab').forEach((t,i)=>t.classList.toggle('active',['ventas','inventario','personal'][i]===id));
  document.querySelectorAll('.rep-panel').forEach(p=>p.classList.toggle('active',p.id==='rp-'+id));
  if (id==='personal') { const sw=document.getElementById('sem-sel'); if(sw&&!sw.value){const d=new Date();sw.value=`${d.getFullYear()}-W${String(getWk(d)).padStart(2,'0')}`;} renderPersonalRep(); }
}

function getWk(d){const t=new Date(d);t.setHours(0,0,0,0);t.setDate(t.getDate()+3-(t.getDay()+6)%7);const w=new Date(t.getFullYear(),0,4);return 1+Math.round(((t-w)/86400000-3+(w.getDay()+6)%7)/7);}

function renderReports() {
  const conf  = VENTAS.filter(v=>v.estado==='confirmada');
  const ing   = conf.reduce((s,v)=>s+v.total,0);
  const ticket= conf.length?ing/conf.length:0;
  const bol   = conf.filter(v=>v.boleta||v.boleta_generada).length;
  setText('rv-total', conf.length);
  setText('rv-ing',   'S/'+fmt(ing));
  setText('rv-tick',  'S/'+fmt(ticket));
  setText('rv-bol',   bol);
  renderBarVentas();
  renderTopProds();
  // inventario
  const active=PRODS.filter(p=>p.estado==='activo');
  const valor=active.reduce((s,p)=>s+p.precio_venta*p.stock,0);
  setText('ri-total', PRODS.length);
  setText('ri-valor', 'S/'+fmt(valor));
  setText('ri-alts',  active.filter(p=>p.stock<=p.stock_minimo).length);
  setText('ri-cats',  [...new Set(active.map(p=>p.categoria))].length);
  renderBarCats();
  renderCatRepTable();
  // personal
  const vends=USERS.filter(u=>u.rol==='vendedor'&&u.activo);
  setText('rp-emp',  vends.length);
  setText('rp-reg',  ASISTENCIA.length);
  setText('rp-cum',  ASISTENCIA.filter(a=>a.cumple_turno).length+'/'+ASISTENCIA.length);
  setText('rp-tar',  ASISTENCIA.filter(a=>a.estado_asistencia==='tardanza').length);
}

function renderBarVentas() {
  const dias=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const hoy=new Date();
  const data=[];
  for(let i=6;i>=0;i--){
    const d=new Date(hoy); d.setDate(d.getDate()-i);
    const ds=d.toISOString().slice(0,10);
    const tot=VENTAS.filter(v=>v.fecha?.startsWith(ds)&&v.estado==='confirmada').reduce((s,v)=>s+v.total,0);
    data.push({l:dias[(d.getDay()+6)%7],v:tot});
  }
  const mx=Math.max(...data.map(d=>d.v),1);
  document.getElementById('bar-ventas').innerHTML = data.map(d=>`<div class="bw"><div class="bar-vl">${d.v>0?'S/'+fmt(d.v):''}</div><div class="bar" style="height:${Math.round(d.v/mx*100)}%" title="S/${fmt(d.v)}"></div><div class="bar-lb">${d.l}</div></div>`).join('');
}

function renderBarCats() {
  const cats=[...new Set(PRODS.map(p=>p.categoria))];
  const data=cats.map(c=>({l:c.split(' ')[0],v:PRODS.filter(p=>p.categoria===c&&p.estado==='activo').reduce((s,p)=>s+p.stock,0)}));
  const mx=Math.max(...data.map(d=>d.v),1);
  document.getElementById('bar-cats').innerHTML = data.map(d=>`<div class="bw"><div class="bar-vl">${d.v}</div><div class="bar" style="height:${Math.round(d.v/mx*100)}%;background:linear-gradient(180deg,var(--gold-3),var(--gold-2))"></div><div class="bar-lb">${d.l}</div></div>`).join('');
}

function renderTopProds() {
  const map={};
  VENTAS.filter(v=>v.estado==='confirmada').forEach(v=>{
    (v.items||[]).forEach(it=>{
      if(!map[it.id])map[it.id]={nm:it.nombre||it.nombre_producto||'—',cat:it.categoria||'—',u:0,i:0};
      map[it.id].u+=it.cantidad||it.qty||0;
      map[it.id].i+=(it.precio_venta||it.precio_unitario||0)*(it.cantidad||it.qty||0);
    });
  });
  const top=Object.values(map).sort((a,b)=>b.u-a.u).slice(0,8);
  document.getElementById('top-tbody').innerHTML=top.length
    ?top.map(p=>`<tr><td class="pn">${p.nm}</td><td><span class="badge b-navy">${p.cat}</span></td><td style="font-weight:700;color:var(--navy-2)">${p.u}</td><td class="price">S/${fmt(p.i)}</td></tr>`).join('')
    :'<tr><td colspan="4"><div class="empty-state"><span class="ei">📊</span><p>Sin ventas aún</p></div></td></tr>';
}

function renderCatRepTable() {
  const cats=[...new Set(PRODS.map(p=>p.categoria))];
  document.getElementById('cat-rep-tbody').innerHTML=cats.map(c=>{
    const ps=PRODS.filter(p=>p.categoria===c);
    const act=ps.filter(p=>p.estado==='activo');
    const al=act.filter(p=>p.stock<=p.stock_minimo).length;
    return`<tr><td><span class="badge b-navy">${c}</span></td><td style="font-weight:600">${ps.length}</td><td style="font-weight:600">${act.reduce((s,p)=>s+p.stock,0)}</td><td class="price">S/${fmt(act.reduce((s,p)=>s+p.precio_venta*p.stock,0))}</td><td>${al>0?`<span class="badge b-red">${al}</span>`:'<span class="badge b-green">0</span>'}</td></tr>`;
  }).join('');
}

function renderPersonalRep() {
  const vends=USERS.filter(u=>u.rol==='vendedor'&&u.activo);
  document.getElementById('pers-tbody').innerHTML=vends.map(u=>{
    const as=ASISTENCIA.filter(a=>a.usuario_id===u.id);
    const dias=as.length;
    const hrs=as.reduce((s,a)=>s+(a.horas||0),0);
    const tard=as.filter(a=>a.estado_asistencia==='tardanza').length;
    const cum=as.filter(a=>a.cumple_turno).length;
    const pct=dias>0?Math.round(cum/dias*100):0;
    const tl=TURNOS[u.turno||'completo'];
    return`<tr><td class="pn">${u.nombre} ${u.apellidos}</td><td style="font-size:.8rem">${tl.label}</td><td style="font-weight:600">${dias}</td><td style="font-weight:600">${hrs.toFixed(1)}h</td><td>${tard>0?`<span class="badge b-amber">${tard}</span>`:'<span class="badge b-green">0</span>'}</td><td><span class="badge ${pct>=80?'b-green':pct>=50?'b-amber':'b-red'}">${pct}%</span></td><td>${pct>=80?'<span class="badge b-green">Cumple</span>':pct>=50?'<span class="badge b-amber">Parcial</span>':'<span class="badge b-red">No cumple</span>'}</td></tr>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════════════
// CATEGORÍAS Y PROVEEDORES (RF-33, RF-34)
// ══════════════════════════════════════════════════════════════════════
async function renderCategorias() {
  const cont = document.getElementById('categorias-list');
  if (!cont) return;
  const cats = USE_SB ? (await loadCategoriasFromDB()) : [];
  if (!cats.length) {
    cats.push({id:'1',nombre:'Útiles escolares',activo:true},{id:'2',nombre:'Papelería',activo:true},{id:'3',nombre:'Libros',activo:true},{id:'4',nombre:'Manualidades',activo:true},{id:'5',nombre:'Juguetes',activo:true},{id:'6',nombre:'Otros',activo:true});
  }
  cont.innerHTML = cats.map(c =>
    `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:var(--navy-xl);border-radius:var(--r2);font-size:.78rem;color:var(--navy-2)">
      ${c.nombre}
      <button onclick="eliminarCategoria('${c.id}')" style="border:none;background:none;cursor:pointer;color:var(--red);font-size:.7rem;padding:0">✕</button>
    </span>`
  ).join('');
  // Actualizar select del formulario de producto
  const sel = document.getElementById('p-cat');
  if (sel) {
    sel.innerHTML = '<option value="">Seleccionar…</option>' +
      cats.filter(c=>c.activo!==false).map(c => `<option value="${c.nombre}" data-id="${c.id}">${c.nombre}</option>`).join('');
    sel.onchange = function() {
      const opt = sel.options[sel.selectedIndex];
      document.getElementById('p-cat-id').value = opt?.getAttribute('data-id') || '';
    };
  }
}

async function guardarCategoria() {
  const inp = document.getElementById('cat-nueva');
  const nom = inp?.value.trim();
  if (!nom) { toast('Ingresa un nombre','warning'); return; }
  if (USE_SB) {
    const { error } = await SB.from('categorias').insert([{ nombre: nom, descripcion: '' }]);
    if (error) { toast('Error: ' + error.message,'error'); return; }
  }
  inp.value = '';
  toast(`Categoría "${nom}" creada · RF-33`,'success','✅');
  await renderCategorias();
}

async function eliminarCategoria(id) {
  if (USE_SB) {
    await SB.from('categorias').update({ activo: false }).eq('id', id);
  }
  toast('Categoría desactivada','info');
  await renderCategorias();
}

async function renderProveedores() {
  const cont = document.getElementById('proveedores-list');
  if (!cont) return;
  const provs = USE_SB ? (await loadProveedoresFromDB()) : [];
  cont.innerHTML = provs.length ? provs.map(p =>
    `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:var(--slate-5);border-radius:var(--r2);font-size:.8rem">
      <span><strong>${p.nombre}</strong> ${p.ruc ? '· RUC: '+p.ruc : ''} ${p.contacto ? '· '+p.contacto : ''}</span>
      <button onclick="eliminarProveedor('${p.id}')" style="border:none;background:none;cursor:pointer;color:var(--red);font-size:.75rem">✕</button>
    </div>`
  ).join('') : '<span style="font-size:.78rem;color:var(--slate-2)">Sin proveedores registrados</span>';
}

async function guardarProveedor() {
  const nom = document.getElementById('prov-nombre')?.value.trim();
  const ruc = document.getElementById('prov-ruc')?.value.trim();
  const contacto = document.getElementById('prov-contacto')?.value.trim();
  const tel = document.getElementById('prov-tel')?.value.trim();
  if (!nom) { toast('Ingresa el nombre del proveedor','warning'); return; }
  if (USE_SB) {
    const { error } = await SB.from('proveedores').insert([{ nombre: nom, ruc, contacto, telefono: tel }]);
    if (error) { toast('Error: ' + error.message,'error'); return; }
  }
  ['prov-nombre','prov-ruc','prov-contacto','prov-tel'].forEach(id => document.getElementById(id).value = '');
  toast(`Proveedor "${nom}" registrado · RF-34`,'success','✅');
  await renderProveedores();
}

async function eliminarProveedor(id) {
  if (USE_SB) {
    await SB.from('proveedores').update({ activo: false }).eq('id', id);
  }
  toast('Proveedor desactivado','info');
  await renderProveedores();
}

// CONFIGURACIÓN
// ══════════════════════════════════════════════════════════════════════
async function saveCfg() {
  const configs = [
    { clave:'nombre_negocio',      valor:getVal('cfg-nom'), tipo:'text' },
    { clave:'ruc',                 valor:getVal('cfg-ruc'), tipo:'text' },
    { clave:'direccion',           valor:getVal('cfg-dir'), tipo:'text' },
    { clave:'telefono',            valor:getVal('cfg-tel'), tipo:'text' },
    { clave:'correo',              valor:getVal('cfg-mail'), tipo:'text' },
    { clave:'logo_url',            valor:getVal('cfg-logo'), tipo:'text' },
    { clave:'monto_minimo_boleta', valor:getVal('cfg-boleta'), tipo:'number' },
    { clave:'stock_minimo_global', valor:getVal('cfg-smin'), tipo:'number' },
    { clave:'descuento_max_vendedor',valor:getVal('cfg-dcto'), tipo:'number' },
  ];

  // Siempre actualizar CFG_SISTEMA y localStorage
  configs.forEach(c => { CFG_SISTEMA[c.clave] = c.valor; });
  try { localStorage.setItem('machy_cfg', JSON.stringify(CFG_SISTEMA)); } catch(e) {}

  if (USE_SB) {
    const { error } = await SB.from('configuracion').upsert(configs, { onConflict: 'clave' });
    if (error) { toast('Error Supabase: ' + error.message, 'warning', '⚠️'); }
  }
  toast('Configuración guardada correctamente · RF-32','success','💾');
}

async function loadConfigIntoForm() {
  const map = {
    nombre_negocio:'cfg-nom', ruc:'cfg-ruc', direccion:'cfg-dir',
    telefono:'cfg-tel', correo:'cfg-mail', logo_url:'cfg-logo',
    monto_minimo_boleta:'cfg-boleta', stock_minimo_global:'cfg-smin',
    descuento_max_vendedor:'cfg-dcto'
  };
  Object.entries(map).forEach(([clave, id]) => {
    if (CFG_SISTEMA[clave]) setVal(id, CFG_SISTEMA[clave]);
  });
}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.toggle').forEach(t=>t.addEventListener('click',()=>t.classList.toggle('on')));
});

// ══════════════════════════════════════════════════════════════════════
// SCANNER (RF-13, RF-14)
// ══════════════════════════════════════════════════════════════════════
let html5QR = null;
let scannedCode = '';

function openScanFor(ctx) { scanCtx = ctx; openM('m-scanner'); }
function openM(id) {
  document.getElementById(id).classList.remove('hidden');
  if (id === 'm-scanner') {
    switchScanTab('local');
    setTimeout(startScan, 350);
  }
}
function closeM(id) {
  document.getElementById(id).classList.add('hidden');
  if (id === 'm-scanner') { stopScan(); cancelRemoteScan(); }
}
function startScan() {
  setText('scan-st','Solicitando acceso a la cámara…');
  document.getElementById('scan-res').classList.add('hidden');
  document.getElementById('btn-use-scan').disabled = true;
  scannedCode = '';
  if (html5QR) { try{ html5QR.stop(); }catch(e){} html5QR = null; }
  html5QR = new Html5Qrcode('reader');
  Html5Qrcode.getCameras()
    .then(cams => {
      if (!cams.length) { setText('scan-st','No se encontraron cámaras. Usa ingreso manual.'); return; }
      const cam = (cams.find(c => /environment|back|trasera|rear/i.test(c.label)) || cams[cams.length - 1] || cams[0]).id;
      html5QR.start(cam, { fps:15, qrbox:{width:170,height:170}, aspectRatio:1.0 },
        code => {
          scannedCode = code;
          setVal('scan-val', code);
          document.getElementById('scan-res').classList.remove('hidden');
          setText('scan-st', '✅ Código detectado en < 2 seg · RF-14');
          document.getElementById('btn-use-scan').disabled = false;
          try{ html5QR.stop(); }catch(e){}
        }, () => {}
      ).then(() => setText('scan-st','Cámara activa. Apunta al código de barras.'))
       .catch(e => setText('scan-st','Error al acceder: '+e+' — Usa ingreso manual.'));
    })
    .catch(e => setText('scan-st','Error: '+e));
}

function stopScan() { if(html5QR){ try{html5QR.stop();}catch(e){} html5QR=null; } }
function useScanned() { if(scannedCode) processCode(scannedCode); }
function useManual()  { const c=getVal('manual-code').trim(); if(!c){toast('Ingresa un código','warning');return;} processCode(c); }

// ══════════════════════════════════════════════════════════════════════
// REMOTE SCANNER (v3.0 — Escáner remoto vía Supabase Realtime)
// ══════════════════════════════════════════════════════════════════════
let REMOTE_SESSION_CHANNEL = null;
let REMOTE_SESSION_ID = null;
let REMOTE_SCANNED_CODE = null;

function genSessionId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function switchScanTab(tab) {
  document.getElementById('st-local').classList.toggle('active', tab === 'local');
  document.getElementById('st-remote').classList.toggle('active', tab === 'remote');
  document.getElementById('scan-panel-local').classList.toggle('hidden', tab !== 'local');
  document.getElementById('scan-panel-remote').classList.toggle('hidden', tab !== 'remote');
  if (tab === 'local') {
    cancelRemoteScan();
    setTimeout(startScan, 350);
  } else {
    stopScan();
  }
}

async function startRemoteScan() {
  if (!USE_SB) {
    toast('El escáner remoto requiere conexión a Supabase', 'warning', '⚠️');
    return;
  }

  REMOTE_SESSION_ID = genSessionId();
  REMOTE_SCANNED_CODE = null;

  const btn = document.getElementById('btn-start-remote');
  btn.disabled = true;
  btn.textContent = '⏳ Iniciando…';

  document.getElementById('remote-scan-status').classList.add('hidden');
  document.getElementById('rs-active').classList.remove('hidden');
  document.getElementById('rs-waiting').classList.remove('hidden');
  document.getElementById('rs-received').classList.add('hidden');
  document.getElementById('btn-use-remote').classList.add('hidden');

  document.getElementById('rs-session-code').textContent = REMOTE_SESSION_ID;

  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '/remote-scan.html';
  const scanUrl = baseUrl + '?session=' + REMOTE_SESSION_ID;
  document.getElementById('rs-url-display').textContent = scanUrl;

  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(scanUrl);
  document.getElementById('rs-qr-img').src = qrUrl;
  document.getElementById('rs-qr-img').onerror = () => {
    document.getElementById('rs-qr-img').style.display = 'none';
  };

  document.getElementById('rs-hint').classList.remove('hidden');

  // Crear sesión en Supabase
  try {
    await SB.from('scan_sessions').insert([{
      session_id: REMOTE_SESSION_ID,
      code: null,
      usuario_id: CU?.id || 'unknown',
    }]);
  } catch (e) {
    console.warn('No se pudo crear sesión remota:', e);
  }

  // Suscribirse a cambios Realtime
  if (REMOTE_SESSION_CHANNEL) {
    SB.removeChannel(REMOTE_SESSION_CHANNEL);
  }

  REMOTE_SESSION_CHANNEL = SB.channel('scan-' + REMOTE_SESSION_ID);
  REMOTE_SESSION_CHANNEL.on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'scan_sessions', filter: 'session_id=eq.' + REMOTE_SESSION_ID },
    payload => {
      const code = payload.new?.code;
      if (code && !REMOTE_SCANNED_CODE) {
        REMOTE_SCANNED_CODE = code;
        document.getElementById('rs-waiting').classList.add('hidden');
        document.getElementById('rs-received').classList.remove('hidden');
        document.getElementById('rs-received-code').textContent = code;
        document.getElementById('btn-use-remote').classList.remove('hidden');
        document.getElementById('btn-use-remote').disabled = false;
        document.getElementById('rs-hint').classList.add('hidden');
        toast('📱 Código recibido del celular: ' + code, 'success', '📲');
        // Auto-usar después de 1.5s
        setTimeout(() => { if (REMOTE_SCANNED_CODE) useRemoteCode(); }, 1500);
      }
    }
  ).subscribe();

  btn.textContent = '✅ Sesión activa';
  toast('Sesión remota iniciada: ' + REMOTE_SESSION_ID, 'success', '📲');
}

function cancelRemoteScan() {
  if (REMOTE_SESSION_CHANNEL) {
    SB.removeChannel(REMOTE_SESSION_CHANNEL);
    REMOTE_SESSION_CHANNEL = null;
  }
  REMOTE_SESSION_ID = null;
  REMOTE_SCANNED_CODE = null;
  const btn = document.getElementById('btn-start-remote');
  if (btn) { btn.disabled = false; btn.textContent = '📲 Iniciar escaneo remoto'; }
}

function useRemoteCode() {
  if (REMOTE_SCANNED_CODE) {
    const code = REMOTE_SCANNED_CODE;
    cancelRemoteScan();
    closeM('m-scanner');
    processCode(code);
  }
}

function processCode(code) {
  stopScan(); closeM('m-scanner');
  if (scanCtx === 'form') {
    setVal('p-cod', code);
    toast(`Código ${code} cargado · RF-14`, 'success', '✅');
    return;
  }
  if (scanCtx === 'venta') {
    const p = PRODS.find(x => x.codigo === code && x.estado === 'activo');
    if (p) addCart(p.id);
    else toast(`Código ${code} no encontrado · RF-15`, 'warning', '⚠️');
    return;
  }
  // search context
  const p = PRODS.find(x => x.codigo === code);
  if (p) {
    toast(`✅ ${p.nombre} · Stock: ${p.stock} · S/${fmt(p.precio_venta)} · RF-14`, 'success', '📦');
    goSec('catalogo');
    setVal('cat-q', p.nombre);
    filterCat();
  } else {
    if (CU?.rol === 'admin') {
      toast(`Código ${code} no registrado · RF-15`, 'warning', '⚠️');
      resetProdForm(); setVal('p-cod', code); openM('m-producto');
    } else {
      toast(`Código ${code} no encontrado. Notifica al administrador · RF-15`, 'warning', '⚠️');
    }
  }
}

// ══════════════════════════════════════════════════════════════════════
// COMPROBANTES (RF-25) — Boleta A4 / Ticket térmico 80mm
// ══════════════════════════════════════════════════════════════════════
function imprimirComprobante(venta, tipo) {
  const neg = { ...CFG_SISTEMA };
  const W = 40;
  const center2 = t => { const p = Math.max(0, W - t.length); return ' '.repeat(Math.floor(p/2)) + t + ' '.repeat(Math.ceil(p/2)); };
  const right2 = t => ' '.repeat(Math.max(0, W - t.length)) + t;
  const left2 = t => t + ' '.repeat(Math.max(0, W - t.length));
  const fecha = new Date(venta.fecha || venta.created_at || Date.now());
  const opts = { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' };
  const items = venta.items || venta.detalle || [];
  const num = String(venta.num_comp||venta.numero||'').padStart(6,'0');
  const cliente = venta.cliente || 'VENTA AL CONTADO';

  const itemsRows = items.map(it => {
    const nom = it.nombre || it.nombre_producto || 'Producto';
    const cant = it.cantidad || it.qty || 1;
    const pu = it.precio_venta || it.precio_unitario || 0;
    const st = pu * cant;
    if (tipo === 'ticket') {
      const qtyLine = nom + ' x' + cant;
      const priceLine = 'S/ ' + fmt(pu) + ' c/u → S/ ' + fmt(st);
      return left2(qtyLine) + '\n' + right2(priceLine);
    }
    return `<tr><td style="padding:6px 8px;text-align:left">${nom}</td>
      <td style="padding:6px 8px;text-align:center">${cant}</td>
      <td style="padding:6px 8px;text-align:right">S/ ${fmt(pu)}</td>
      <td style="padding:6px 8px;text-align:right">S/ ${fmt(st)}</td></tr>`;
  }).join(tipo === 'ticket' ? '\n' : '');

  const totalV = parseFloat(venta.total || 0);
  const subV = parseFloat(venta.subtotal || 0);
  const dctoV = parseFloat(venta.descuento || 0);
  const pagaConV = parseFloat(venta.paga_con || 0);
  const vueltoV = parseFloat(venta.vuelto || 0);

  if (tipo === 'ticket') {
    const line = '━'.repeat(W);
    const igv = totalV * 0.18 / 1.18;

    const txt = [
      center2(neg.nombre_negocio || 'Librería Machy'),
      center2('RUC: ' + (neg.ruc || '20XXXXXXXXXX')),
      center2(neg.direccion || 'Av. Principal 123, Lima'),
      center2('Tel: ' + (neg.telefono || '01-XXXXXXX')),
      line,
      center2('TICKET DE VENTA #' + num),
      center2(fecha.toLocaleDateString('es-PE', opts)),
      left2('Vendedor: ' + (venta.vendedor || '—')),
      left2('Cliente: ' + cliente),
      line,
      itemsRows,
      line,
      left2('Subtotal:' + right2('S/ ' + fmt(subV)).slice(10)),
      dctoV > 0 ? left2('Descuento:' + right2('-S/ ' + fmt(dctoV)).slice(10)) : '',
      left2('IGV (18%):' + right2('S/ ' + fmt(igv)).slice(10)),
      left2('TOTAL:' + right2('S/ ' + fmt(totalV)).slice(10)),
      pagaConV > 0 ? left2('Pagó con:' + right2('S/ ' + fmt(pagaConV)).slice(10)) : '',
      vueltoV > 0 ? left2('Vuelto:' + right2('S/ ' + fmt(vueltoV)).slice(10)) : '',
      line,
      center2('¡Gracias por su compra!'),
      center2(neg.nombre_negocio || 'Librería Machy'),
      center2(new Date().toLocaleString('es-PE')),
      line,
      '',
    ].filter(Boolean).join('\n');

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:0;width:1px;height:1px;border:none;opacity:0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Ticket #${num}</title>
<style>
  @page { size: 80mm 297mm; margin: 2mm; }
  body { font-family: 'Courier New','Lucida Console',monospace; font-size: 10px; color: #000; margin: 0; padding: 4px; white-space: pre; line-height: 1.25; }
  @media print { body { padding: 0; } }
</style></head><body>${txt}</body></html>`);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 3000);
    return;
  }

  // Boleta A4
  const logoHtml = neg.logo_url
    ? `<img src="${neg.logo_url}" style="max-height:64px;margin-bottom:8px" alt="Logo"/>`
    : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Boleta #${num}</title>
<style>
  @page { margin: 10mm; }
  body { font-family: 'Courier New', monospace; font-size: 12px; color: #222; margin: 0; padding: 16px; }
  .header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px dashed #333; }
  .header .brand { font-size: 20px; font-weight: bold; letter-spacing: 1px; }
  .header p { margin: 2px 0; font-size: 11px; color: #555; }
  .info { margin-bottom: 12px; font-size: 11px; }
  .info div { display: flex; justify-content: space-between; padding: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #eee; padding: 6px 8px; font-size: 10px; text-align: left; text-transform: uppercase; }
  td { padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
  .totals { text-align: right; margin-top: 8px; padding-top: 8px; border-top: 2px dashed #333; }
  .totals div { margin: 3px 0; font-size: 12px; }
  .totals .grand { font-size: 16px; font-weight: bold; }
  .totals .payment { margin-top: 12px; padding-top: 8px; border-top: 1px solid #ccc; font-size: 12px; }
  .footer { text-align: center; margin-top: 20px; padding-top: 12px; border-top: 1px dashed #999; font-size: 10px; color: #888; }
  @media print { body { padding: 0; } }
</style></head><body>
  <div class="header">
    ${logoHtml}
    <div class="brand">${neg.nombre_negocio || 'Librería Machy'}</div>
    <p>RUC: ${neg.ruc || '20XXXXXXXXXX'}</p>
    <p>${neg.direccion || 'Av. Principal 123, Lima, Perú'}</p>
    <p>Tel: ${neg.telefono || '01-XXXXXXX'} · ${neg.correo || ''}</p>
  </div>
  <div class="info">
    <div><span>BOLETA DE VENTA</span><span>#${num}</span></div>
    <div><span>Fecha:</span><span>${fecha.toLocaleDateString('es-PE', opts)}</span></div>
    <div><span>Vendedor:</span><span>${venta.vendedor || '—'}</span></div>
    <div><span>Cliente:</span><span>${cliente}</span></div>
  </div>
  <table><thead><tr><th>Producto</th><th>Cant.</th><th>P.Unit</th><th>Subtotal</th></tr></thead>
  <tbody>${itemsRows}</tbody></table>
  <div class="totals">
    <div>Subtotal: S/ ${fmt(parseFloat(venta.subtotal || 0))}</div>
    ${parseFloat(venta.descuento||0) > 0 ? `<div>Descuento: -S/ ${fmt(venta.descuento)}</div>` : ''}
    <div>IGV (18%): S/ ${fmt(totalV ? totalV * 0.18 / 1.18 : 0)}</div>
    <div class="grand">TOTAL: S/ ${fmt(totalV)}</div>
    ${pagaConV > 0 ? `<div class="payment"><div>Pagó con: S/ ${fmt(pagaConV)}</div>${vueltoV > 0 ? `<div style="font-weight:700;color:#2563eb">Vuelto: S/ ${fmt(vueltoV)}</div>` : ''}</div>` : ''}
  </div>
  <div class="footer">
    <p>¡Gracias por su compra!</p>
    <p>${neg.nombre_negocio || 'Librería Machy'} · ${neg.ruc || ''}</p>
    <p>Documento generado el ${new Date().toLocaleString('es-PE')}</p>
  </div>
</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:0;width:1px;height:1px;border:none;opacity:0';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(() => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 3000);
}

function generarBoletaPDF(venta) { imprimirComprobante(venta, 'boleta'); }
function generarTicketPDF(venta)  { imprimirComprobante(venta, 'ticket'); }

function calcVuelto() {
  const paga = parseFloat(document.getElementById('v-paga')?.value) || 0;
  const total = parseFloat(document.getElementById('c-total')?.textContent?.replace('S/ ', '')) || 0;
  const wrap = document.getElementById('v-vuelto-wrap');
  if (paga >= total && total > 0) {
    document.getElementById('c-vuelto').textContent = 'S/ ' + fmt(paga - total);
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
}

async function confirmarVentaConBoleta() {
  try {
    if (!cart.length) { toast('El carrito está vacío','warning'); return; }
    const { sub, dcto, net } = recalc();
    const maxDcto = parseFloat(CFG_SISTEMA.descuento_max_vendedor) || MACHY_CONFIG.ventas.descuentoMaxVendedor || 10;
    if (CU?.rol === 'vendedor' && dcto > sub * maxDcto / 100) {
      toast(`Descuento excede el máximo permitido (${maxDcto}%) · RF-23`, 'warning', '⚠️');
      return;
    }
    const nomCliente = document.getElementById('v-cliente')?.value?.trim() || '';
    const pagaCon = parseFloat(document.getElementById('v-paga')?.value) || 0;
    const vuelto = pagaCon >= net ? parseFloat((pagaCon - net).toFixed(2)) : 0;
    const emiteBoleta = net >= (parseFloat(CFG_SISTEMA.monto_minimo_boleta) || 5);
    const num = VENTAS.length + 1;
    const venta = {
      id: 'v' + Date.now(), numero: num, num_comp: num,
      vendedor_id: CU.id, vendedor: CU.nombre + ' ' + CU.apellidos,
      items: [...cart.map(c => ({ ...c, cantidad: c.qty }))],
      cliente: nomCliente || 'VENTA AL CONTADO',
      subtotal: sub, descuento: dcto, total: parseFloat(net.toFixed(2)),
      paga_con: pagaCon, vuelto: vuelto,
      estado: 'confirmada', boleta: emiteBoleta, boleta_generada: emiteBoleta,
      fecha: new Date().toISOString(),
    };

    await Promise.all(cart.map(ci => {
      const p = PRODS.find(x => x.id === ci.id);
      if (!p) return;
      p.stock = Math.max(0, p.stock - ci.qty);
      return saveToSB('productos', { stock: p.stock }, p.id);
    }));

    await saveToSB('ventas', {
      vendedor_id: CU.id, vendedor: venta.vendedor, cliente: venta.cliente,
      subtotal: sub, descuento: dcto, total: parseFloat(net.toFixed(2)),
      paga_con: pagaCon, vuelto: vuelto,
      igv: parseFloat((net * 0.18 / 1.18).toFixed(2)),
      num_comp: num, numero: num,
      estado: 'confirmada', boleta: emiteBoleta, boleta_generada: emiteBoleta,
      items: venta.items,
    });

    VENTAS.unshift(venta);
    cart = [];
    renderCart();
    renderDash();
    toast(`Venta #${num} confirmada · RF-24`, 'success', '✅');
    if (emiteBoleta) {
      const tipoComp = document.getElementById('v-comprobante')?.value || 'ticket';
      setTimeout(() => imprimirComprobante(venta, tipoComp), 500);
      toast(tipoComp === 'ticket' ? 'Ticket térmico generado · RF-25' : 'Boleta A4 generada · RF-25', 'info', '🧾');
      document.getElementById('v-cliente').value = '';
    }
    goSec('historial');
  } catch(e) {
    console.error('Error al confirmar venta:', e);
    toast('Error inesperado al confirmar venta: ' + e.message, 'error', '❌');
  }
}

// ══════════════════════════════════════════════════════════════════════
// EXPORT CSV
// ══════════════════════════════════════════════════════════════════════
function exportInvCSV() {
  const rows = PRODS.map(p => [p.codigo, `"${p.nombre}"`, p.categoria, p.unidad, p.precio_compra, p.precio_venta, p.stock, p.stock_minimo, `"${p.proveedor_nombre||''}"`, p.estado].join(','));
  dlCSV(['Código,Nombre,Categoría,Unidad,P.Compra,P.Venta,Stock,Stock Mín,Proveedor,Estado', ...rows].join('\n'), 'inventario-machy');
  toast('Inventario exportado (CSV) · RF-29', 'success', '📥');
}

function exportInvExcel() {
  if (typeof XLSX === 'undefined') { toast('La librería SheetJS no está disponible','error'); return; }
  const wb = XLSX.utils.book_new();
  const data = PRODS.map(p => ({
    Código: p.codigo, Nombre: p.nombre, Categoría: p.categoria, Unidad: p.unidad,
    'P. Compra': p.precio_compra, 'P. Venta': p.precio_venta,
    Stock: p.stock, 'Stock Mín': p.stock_minimo,
    Proveedor: p.proveedor_nombre||'', Estado: p.estado
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
  XLSX.writeFile(wb, `inventario-machy-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('Inventario exportado (Excel .xlsx) · RF-29', 'success', '📥');
}

function exportInvPDF() {
  if (typeof jspdf === 'undefined') { toast('La librería jsPDF no está disponible','error'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const neg = { ...CFG_SISTEMA };
  doc.setFontSize(16);
  doc.text(neg.nombre_negocio || 'Librería Machy', 105, 20, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Reporte de Inventario · ${new Date().toLocaleDateString('es-PE')}`, 105, 27, { align: 'center' });
  doc.setFontSize(7);
  doc.text(`RUC: ${neg.ruc||'—'} · ${neg.direccion||''}`, 105, 32, { align: 'center' });
  const body = PRODS.map(p => [p.codigo, p.nombre, p.categoria, 'S/'+fmt(p.precio_venta), String(p.stock), p.estado]);
  doc.autoTable({
    head: [['Código', 'Producto', 'Categoría', 'P. Venta', 'Stock', 'Estado']],
    body, startY: 38, styles: { fontSize: 7 }, headStyles: { fillColor: [27, 58, 92] }
  });
  doc.save(`inventario-machy-${new Date().toISOString().slice(0,10)}.pdf`);
  toast('Inventario exportado (PDF) · RF-29', 'success', '📥');
}

function exportVentasCSV() {
  const isAdmin = CU?.rol === 'admin';
  const list = isAdmin ? VENTAS : VENTAS.filter(v => v.vendedor_id === CU.id);
  const rows = list.map(v => [v.num_comp||v.numero, v.fecha||v.created_at, `"${v.vendedor}"`, v.total, v.estado, (v.boleta||v.boleta_generada)?'Boleta':'Ticket'].join(','));
  dlCSV(['#,Fecha,Vendedor,Total,Estado,Comprobante', ...rows].join('\n'), 'ventas-machy');
  toast('Historial exportado (CSV) · RF-27', 'success', '📥');
}

function exportVentasExcel() {
  if (typeof XLSX === 'undefined') { toast('La librería SheetJS no está disponible','error'); return; }
  const isAdmin = CU?.rol === 'admin';
  const list = isAdmin ? VENTAS : VENTAS.filter(v => v.vendedor_id === CU.id);
  const wb = XLSX.utils.book_new();
  const data = list.map(v => ({
    '#': v.num_comp||v.numero, Fecha: v.fecha||v.created_at,
    Vendedor: v.vendedor, Total: v.total,
    Estado: v.estado, Comprobante: (v.boleta||v.boleta_generada)?'Boleta':'Ticket'
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
  XLSX.writeFile(wb, `ventas-machy-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('Historial exportado (Excel .xlsx) · RF-27', 'success', '📥');
}

function exportVentasPDF() {
  if (typeof jspdf === 'undefined') { toast('La librería jsPDF no está disponible','error'); return; }
  const isAdmin = CU?.rol === 'admin';
  const list = isAdmin ? VENTAS : VENTAS.filter(v => v.vendedor_id === CU.id);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const neg = { ...CFG_SISTEMA };
  doc.setFontSize(16);
  doc.text(neg.nombre_negocio || 'Librería Machy', 105, 20, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Historial de Ventas · ${new Date().toLocaleDateString('es-PE')}`, 105, 27, { align: 'center' });
  const body = list.map(v => [String(v.num_comp||v.numero), v.fecha||'', v.vendedor||'', 'S/'+fmt(v.total), v.estado, (v.boleta||v.boleta_generada)?'Boleta':'Ticket']);
  doc.autoTable({
    head: [['#', 'Fecha', 'Vendedor', 'Total', 'Estado', 'Comp.']],
    body, startY: 33, styles: { fontSize: 7 }, headStyles: { fillColor: [27, 58, 92] }
  });
  doc.save(`ventas-machy-${new Date().toISOString().slice(0,10)}.pdf`);
  toast('Historial exportado (PDF) · RF-27', 'success', '📥');
}

function exportPersonalCSV() {
  const rows = USERS.filter(u=>u.rol==='vendedor'&&u.activo).map(u=>{
    const as=ASISTENCIA.filter(a=>a.usuario_id===u.id);
    return[`"${u.nombre} ${u.apellidos}"`,u.turno,as.length,as.reduce((s,a)=>s+(a.horas||0),0).toFixed(1),as.filter(a=>a.estado_asistencia==='tardanza').length].join(',');
  });
  dlCSV(['Empleado,Turno,Días,Horas,Tardanzas',...rows].join('\n'),'personal-machy');
  toast('Informe personal exportado · RF-30','success','📥');
}

function dlCSV(content, name) {
  const b = new Blob(['\uFEFF'+content],{type:'text/csv;charset=utf-8'});
  const u = URL.createObjectURL(b);
  const a = document.createElement('a'); a.href=u;
  a.download = `${name}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(u);
}

// ══════════════════════════════════════════════════════════════════════
// TOASTS
// ══════════════════════════════════════════════════════════════════════
function toast(msg, type='info', icon='ℹ️') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="t-ico">${icon}</span><span class="t-msg">${msg}</span><button class="t-x" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.style.animation='toastOut .28s ease forwards'; setTimeout(()=>el.remove(),300); }, 4200);
}

// ══════════════════════════════════════════════════════════════════════
// DOM UTILS
// ══════════════════════════════════════════════════════════════════════
const getText = id => document.getElementById(id)?.textContent || '';
const setText = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
const getVal  = id => document.getElementById(id)?.value || '';
const setVal  = (id, v) => { const el=document.getElementById(id); if(el) el.value=v; };
const fmt     = n => parseFloat(n||0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');

// ══════════════════════════════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  // Set current week on personal report
  const sw = document.getElementById('sem-sel');
  if (sw) {
    const d = new Date();
    sw.value = `${d.getFullYear()}-W${String(getWk(d)).padStart(2,'0')}`;
  }
  // Auto-connect Supabase from config.js
  await initSupabase();
});
