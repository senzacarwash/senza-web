# CLAUDE.md — Contexto para Claude Code

## Qué es este proyecto
Senza Car Wash — sitio web SPA (Single Page Application) para un car wash de túnel en Panamá que vende membresías mensuales de lavado ilimitado. El sitio está en español.

## Stack técnico
- **Framework:** Vite (vanilla JS, sin React ni frameworks)
- **Hosting:** Netlify (auto-deploy desde rama `main`)
- **Repo:** github.com/senzacarwash/senza-web
- **Pasarela de pagos:** Billcentrix (iframe con URL encriptada para primer pago, Odoo gestiona recurrentes)
- **ERP:** Odoo (implementador: Javier Sánchez — schema final esperado 30 Abr 2026)
- **Wallet passes:** PassKit (vía Odoo)
- **Serverless:** Netlify Functions (BC webhook + Odoo proxy — pendientes desarrollo)

## Estructura del proyecto
```
index.html              → HTML estructura (sin CSS/JS inline)
vite.config.js          → Config de Vite
netlify.toml            → Config de Netlify (build: npm run build, publish: dist)
public/images/          → Imágenes (McLaren, iconos de servicios)
src/
  main.js               → Entry point, importa todos los módulos
  styles/               → 12 archivos CSS por componente
    base.css            → Variables, reset, tipografía
    nav.css             → Nav, promo banner, mobile menu
    hero.css            → Hero, tabs
    plans.css           → Plan cards, badges
    multi.css           → Multi-vehículo, calculadora
    checkout.css        → Checkout overlay, Billcentrix
    chatbot.css         → Chatbot, FAB, FAQ
    pages.css           → Nosotros, Ubicación, Loyalty, Trabaja
    member.css          → Mi Membresía
    footer.css          → Footer
    utilities.css       → Fixes ≤340px, ≤380px
    desktop.css         → Media queries 768px+, 1024px+
  js/                   → 9 módulos JS por funcionalidad
    navigation.js       → showPageView, goHome, mobile menu
    tabs.js             → switchTab
    plans.js            → toggleCard, FAQ
    multi.js            → Precios multi, calculadora
    checkout.js         → Checkout flow (4 pasos — en rediseño)
    chatbot.js          → Chat del home + FAB
    member.js           → Mi Membresía, overlays, cancelación
    support.js          → Chat de soporte en Mi Membresía
    init.js             → DOMContentLoaded, event listeners
netlify/functions/      → 🆕 Serverless (a implementar)
  billcentrix-webhook.js → Recibe notificación de BC, reenvía paquete a Odoo
  odoo-proxy.js          → Proxy para inbound requests desde la web hacia Odoo
```

## Regla crítica: window exports
Todas las funciones que se llaman desde `onclick` en el HTML DEBEN estar en `window`. Si creas una función nueva que se usa en un onclick, agrega `window.functionName = functionName;` al final del módulo.

## Flujo de trabajo Git
1. Siempre crear un branch nuevo para cambios (`git checkout -b feature/nombre-descriptivo`)
2. Hacer commit con mensaje descriptivo
3. Push al branch y crear PR
4. Netlify genera preview automático en el PR
5. Merge a `main` solo después de verificar el preview
6. NUNCA hacer push directo a `main`

## Brand
- **Nombre:** SENZA CAR WASH
- **Tagline:** "Impecable, Siempre"
- **Tipografía:** Exo 2 (pesos 300-900)
- **Colores primarios:** Blue #0077FF · Orange #FF3B00 · Cyan #00CFFF
- **Colores de tiers:** Basic=gris #374151 · Deluxe=azul #0077FF · Supreme=naranja #FF3B00 · Ultimate=dorado #D4A843
- **Idioma:** Todo en español

## Pricing — Fuente de verdad

### Membresía Personal
| Plan | Mensual | Single Wash |
|------|---------|-------------|
| Basic | $25 | $9 |
| Deluxe | $30 | $13 |
| Supreme | $34 | $20 |
| Ultimate | $39 | $25 |

### Multi-Vehículo (descuento fijo)
| Plan | Auto 1 | Auto 2+ | Descuento |
|------|--------|---------|-----------|
| Basic | $25 | $22 | -$3 |
| Deluxe | $30 | $26 | -$4 |
| Supreme | $34 | $28 | -$6 |
| Ultimate | $39 | $30 | -$9 |

### Servicios por Plan
| Servicio | Basic | Deluxe | Supreme | Ultimate |
|----------|-------|--------|---------|----------|
| Lavado | ✓ | ✓ | ✓ | ✓ |
| Secado | ✓ | ✓ | ✓ | ✓ |
| Lavado de Ruedas | — | ✓ | ✓ | ✓ |
| Espuma Activa | — | ✓ | ✓ | ✓ |
| Lavado de Chasis | — | — | ✓ | ✓ |
| Supreme Wax | — | — | ✓ | ✓ |
| Ultimate Shine Protection | — | — | — | ✓ |
| Limpieza Interior incluida | — | — | — | 2/mes por vehículo |
| Limpieza Interior adicional | $5 | $5 | $5 | $5 |

## Reglas de contenido público
- NO mencionar nombres de socios (Jean, Alberto)
- NO mencionar Istobal, T'WASH PRO, ni specs técnicas — usar "tecnología de última generación"
- NO mencionar que equipos son de España
- NO mencionar "equipo de 7 personas"
- Plan destacado: Supreme (badge "Más Popular")
- "Protection" es lenguaje exclusivo del tier Ultimate

## UX
- Mobile-first
- SPA sin recargas de página
- No emojis en UI (excepto banners promocionales)
- Texto centrado
- Botones descriptivos/action-oriented
- Stripe-like aesthetic
- Overlays cierran con ✕ (no ←)
- Nav: link activo dimmed y no clickeable
- Logo SENZA clickeable → regresa al home

---

## 🎯 FLUJO DE SIGNUP — DEFINITIVO (post 28 + 29 Abr 2026)

El checkout de membresía sigue este flujo de 4 pasos en la web + paso externo (iframe BC):

### PASO 1 · Datos del cliente y vehículo(s)
- Campos: nombre, apellido, email, teléfono
- Plan ya seleccionado (heredado del card de Plans)
- Vehículo(s): placa, marca, modelo, color (NO pedir año — decisión de negocio)
- Persistencia: **sessionStorage** (`senza_checkout_data`)
- NO pedir contraseña aquí (deprecated 17 Abr)

### PASO 2 · Resumen / Carrito (estilo Stripe) 🆕
- Resumen visual organizado en bloques:
  - Plan seleccionado + precio mensual total (multi-vehículo si aplica)
  - Datos del/los auto(s)
  - Datos del cliente
- Botón "Editar" en cada bloque (regresa al paso 1 con sus datos preservados)
- **Checkbox 1 — OBLIGATORIO:** Acepto Términos y Condiciones + autorizo cobro recurrente mensual
- **Checkbox 2 — OPCIONAL (default desmarcado):** Soy el titular de la tarjeta
  - Si marcado → datos del cliente van en payload encriptado a BC para autocompletar iframe
  - Si NO marcado → iframe BC aparece vacío
- Botón "Continuar al pago" deshabilitado hasta que checkbox 1 esté marcado

### PASO 3 · Iframe Billcentrix
- URL encriptada construida según ejemplo Python de Marwin (ETA ~lunes 4 May 2026)
- Form BC tiene 2 sub-pasos internos (datos titular → tarjeta) — recomendación Marwin
- Cliente paga (tokenización + cobro simultáneo en primer pago)
- Cliente NUNCA edita datos de plan/auto en el iframe BC

### PASO 4 · Confirmación / "Revisa tu email"
- BC notifica resultado a `/api/billcentrix-webhook` (Netlify Function)
- Web envía paquete consolidado a Odoo: `{cliente, autos, plan, status_bc, token}`
- Si status BC = éxito:
  - Odoo crea cliente + activa membresía
  - Odoo envía email con wallet pass + link "crear contraseña"
  - Web muestra: "Revisa tu email para activar tu cuenta"
- Si status BC = fallo:
  - Odoo guarda en BD paralela (carritos abandonados — NO crea cliente)
  - Web muestra mensaje de error + botón "Intentar de nuevo"
  - Datos en sessionStorage se conservan para reintento

### Páginas adicionales (nuevas, fuera del checkout)
- **Crear contraseña** — Landing con token desde email de bienvenida
- **Olvidé mi contraseña** — Link desde el login

---

## ARQUITECTURA DE PAGOS (post reunión Billcentrix 28 Abr 2026)

### Primer pago (web orquesta)
1. Web genera URL encriptada con payload (datos cliente para autocompletar iframe BC)
2. Cliente paga en iframe BC
3. BC notifica resultado vía POST a la Netlify Function `/api/billcentrix-webhook`
4. La Function envía paquete consolidado a Odoo
5. Odoo decide qué hacer (crear cliente o guardar en BD de carritos abandonados)

### Cobros recurrentes (Odoo orquesta — la web NO participa)
- Odoo invoca BC directamente
- Si falla, BC maneja retries automáticos
- BC consulta a Odoo si la factura sigue pendiente antes de reintentar (anti-doble-cobro)

### Reglas de seguridad/privacidad
- La web NUNCA maneja datos de tarjeta — solo pasa por el iframe BC
- La web NO almacena tokens de pago — los maneja Odoo
- Datos del cliente (nombre, email, teléfono) sí pueden ir en payload encriptado a BC

---

## ⚠️ APRENDIZAJES CRÍTICOS (no romper)

- **NUNCA descargar HTML desde Netlify para reeditar** — Cloudflare inyecta scripts que rompen el JS. Trabajar siempre desde GitHub.
- **Verificar `git push`** después del commit — Claude Code a veces commit pero no push. Confirmar con `git push origin <branch>`.
- **Imágenes en `public/images/` deben commitearse** — si solo están localmente, Netlify no las despliega (404).
- **PSD sin Adobe:** usar Photopea.com, exportar WebP al 80-85%.
- **CSV preferido sobre XLSX** para uploads a proyectos Claude (merged cells de XLSX rompen parsing).
- **Inline `style="display:none"` sobreescribe CSS** — usar `!important` en media queries o controlar visibilidad solo desde CSS.
- **Anti-patrón: `transform` en padre rompe `position: fixed` en hijos.** Cualquier elemento con `position: fixed` dentro de un padre con `transform` (ej. `.checkout-overlay` que tiene `transform: translateX()` para deslizar) se relativiza al padre, no al viewport. **Para overlays nuevos en el checkout (plan picker, futuros modales):** alojarlos al mismo nivel del DOM que `.checkout-overlay`, NO adentro. Usar z-index 1000+ para superponer al checkout (que es z-index 200). Documentado en sesión 30 Abr al integrar plan picker overlay (PR #15).
- **Validar previews de Netlify con hard refresh + browser incógnito.** Cache del browser engaña: un preview ya regenerado puede verse viejo. Protocolo obligatorio antes de reportar "no se ve el cambio": `Cmd+Shift+R` y/o ventana incógnito.
