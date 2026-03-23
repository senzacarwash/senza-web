# CLAUDE.md — Contexto para Claude Code

## Qué es este proyecto
Senza Car Wash — sitio web SPA (Single Page Application) para un car wash de túnel en Panamá que vende membresías mensuales de lavado ilimitado. El sitio está en español.

## Stack técnico
- **Framework:** Vite (vanilla JS, sin React ni frameworks)
- **Hosting:** Netlify (auto-deploy desde rama `main`)
- **Repo:** github.com/senzacarwash/senza-web
- **Pasarela de pagos:** Billcentrix (pendiente integración real)
- **ERP:** Odoo (pendiente)
- **Wallet passes:** PassKit (pendiente)

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
    checkout.js         → Checkout flow (4 pasos)
    chatbot.js          → Chat del home + FAB
    member.js           → Mi Membresía, overlays, cancelación
    support.js          → Chat de soporte en Mi Membresía
    init.js             → DOMContentLoaded, event listeners
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
