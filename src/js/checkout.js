// ===== CHECKOUT FLOW =====
// Pasos:
//   0 = Multi calculator (solo si multi sin calc previa)
//   1 = Datos personales
//   2 = Vehículo(s)
//   3 = Resumen / Cart (NUEVO)
//   4 = Pago (iframe Billcentrix — mockup)
//   5 = Resultado (éxito o fallo)
let currentStep = 1;
let selectedPlan = 'supreme';
let selectedPrice = 34;
let checkoutMode = 'personal'; // 'personal' or 'multi'
let multiCarCount = 2;
let multiCalcDone = false; // came from home calc → skip step 0
let coCalcCount = 2;

window.currentStep = currentStep;
window.selectedPlan = selectedPlan;
window.selectedPrice = selectedPrice;
window.checkoutMode = checkoutMode;
window.multiCarCount = multiCarCount;
window.multiCalcDone = multiCalcDone;
window.coCalcCount = coCalcCount;

const planColors = {
  ultimate: 'var(--gold)', supreme: 'var(--orange)',
  deluxe: 'var(--gray-700)', basic: 'var(--blue)'
};
const planPrices = { ultimate:39, supreme:34, deluxe:30, basic:25 };
const planNames = { ultimate:'Ultimate', supreme:'Supreme', deluxe:'Deluxe', basic:'Basic' };

// Descripciones incrementales para el plan picker (Issue #25).
// Fuente de verdad: brief v5 sección "Servicios por Plan" + decisión visual 29 Abr 2026.
const planDescriptions = {
  ultimate: 'Todo lo de Supreme + Ultimate Shine y 2 limpiezas interiores/mes.',
  supreme:  'Todo lo de Deluxe + lavado de chasis y Supreme Wax.',
  deluxe:   'Todo lo de Basic + lavado de ruedas y espuma activa.',
  basic:    'Lavado y secado esencial.'
};

window.planColors = planColors;
window.planPrices = planPrices;
window.planNames = planNames;
window.planDescriptions = planDescriptions;

// ITBMS Panamá 7% (Ley 8 de 2010, Código Fiscal art. 1057-V)
const ITBMS_RATE = 0.07;

// ⚠️⚠️⚠️ DEVELOPMENT MOCK ONLY ⚠️⚠️⚠️
// NUNCA poner códigos reales aquí. En producción esto vive en Odoo
// y la validación se hace vía POST /api/validate-discount-code (Netlify Function)
// que consulta Odoo. Cualquier código en este archivo es VISIBLE para cualquier
// usuario que abra DevTools → cualquiera puede usarlo gratis.
// Remover este mock cuando se integre Odoo.
const MOCK_VALID_CODES = {
  'SENZA10':   { type: 'percent', value: 0.10, label: '10% de descuento' },
  'WELCOME5':  { type: 'fixed',   value: 5,    label: '$5 de descuento' },
  'FAMILIA20': { type: 'percent', value: 0.20, label: '20% de descuento' }
};

let appliedCode = null; // {code, type, value, label}
window.appliedCode = appliedCode;

// ===== Step sequences & progress mapping =====
function getStepSequence() {
  if (checkoutMode === 'personal') return [1, 2, 3, 4];
  if (multiCalcDone) return [1, 2, 3, 4];
  return [0, 1, 2, 3, 4];
}
// Always 4 progress segments — independiente del flow.
function getStepLabels() {
  return ['Plan', 'Datos', 'Resumen', 'Pago'];
}
// Map a panel-step (0..4) → progress segment index (0..3).
function getStepSegment(step) {
  if (step === 0) return 0;
  if (step === 1 || step === 2) return 1;
  if (step === 3) return 2;
  if (step === 4) return 3;
  return -1;
}

// ===== sessionStorage persistence =====
const SS_KEY = 'senza_checkout_data';

function collectVehicles() {
  var count = checkoutMode === 'multi' ? multiCarCount : 1;
  var vehicles = [];
  for (var i = 0; i < count; i++) {
    var placaEl = document.getElementById('coPlaca' + i);
    var marcaEl = document.getElementById('coMarca' + i);
    var modeloEl = document.getElementById('coModelo' + i);
    var colorEl = document.getElementById('coColor' + i);
    vehicles.push({
      plate: placaEl ? placaEl.value.trim().toUpperCase() : '',
      brand: marcaEl ? marcaEl.value.trim() : '',
      model: modeloEl ? modeloEl.value.trim() : '',
      color: colorEl ? colorEl.value.trim() : ''
    });
  }
  return vehicles;
}

function guardarDatosCheckout() {
  var nameEl = document.getElementById('coName');
  var lastEl = document.getElementById('coLastName');
  var emailEl = document.getElementById('coEmail');
  var phoneEl = document.getElementById('coPhone');
  var data = {
    plan: selectedPlan,
    mode: checkoutMode,
    carCount: checkoutMode === 'multi' ? multiCarCount : 1,
    customer: {
      firstName: nameEl ? nameEl.value : '',
      lastName: lastEl ? lastEl.value : '',
      email: emailEl ? emailEl.value : '',
      phone: phoneEl ? phoneEl.value : ''
    },
    vehicles: collectVehicles(),
    discountCode: appliedCode ? {
      code: appliedCode.code,
      type: appliedCode.type,
      value: appliedCode.value,
      label: appliedCode.label
    } : null
  };
  try { sessionStorage.setItem(SS_KEY, JSON.stringify(data)); } catch(e) {}
  return data;
}

function cargarDatosCheckout() {
  try {
    var raw = sessionStorage.getItem(SS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) { return null; }
}

function limpiarDatosCheckout() {
  try { sessionStorage.removeItem(SS_KEY); } catch(e) {}
}

window.guardarDatosCheckout = guardarDatosCheckout;
window.cargarDatosCheckout = cargarDatosCheckout;
window.limpiarDatosCheckout = limpiarDatosCheckout;

// ===== Vehicle form rendering =====
function buildVehicleForm(index, total) {
  var isFirst = index === 0;
  var numClass = isFirst ? 'first' : 'additional';
  var label = total > 1 ? 'Vehículo ' + (index+1) : 'Datos del vehículo';
  var discountText = '';
  if (!isFirst && total > 1) {
    var p = window.plans[selectedPlan];
    var pct = Math.round((p.discount / p.full) * 100);
    discountText = '<span class="co-vehicle-discount">-' + pct + '% desc.</span>';
  }
  return '<div class="co-section">' +
    '<div class="co-section-title"><div class="co-vehicle-num ' + numClass + '">' + (index+1) + '</div>' + label + discountText + '</div>' +
    '<div class="co-field"><label>Placa del vehículo</label><input type="text" id="coPlaca' + index + '" placeholder="Ej: ABC-1234" style="text-transform:uppercase" oninput="this.classList.remove(\'error\');updateSummaryPlacas()"><div class="field-error">Ingresa la placa</div></div>' +
    '<div class="co-row"><div class="co-field"><label>Marca</label><input type="text" id="coMarca' + index + '" placeholder="Ej: Toyota" oninput="this.classList.remove(\'error\');updateSummaryPlacas()"></div>' +
    '<div class="co-field"><label>Modelo</label><input type="text" id="coModelo' + index + '" placeholder="Ej: Corolla"></div></div>' +
    '<div class="co-field"><label>Color</label><input type="text" id="coColor' + index + '" placeholder="Ej: Blanco"></div>' +
    '</div>';
}

function renderVehicleForms() {
  var count = checkoutMode === 'multi' ? multiCarCount : 1;
  var html = '';
  for (var i = 0; i < count; i++) html += buildVehicleForm(i, count);
  document.getElementById('vehicleFormsContainer').innerHTML = html;
}

// Update summary vehicle labels with plate numbers when available
function updateSummaryPlacas() {
  if (checkoutMode !== 'multi') return;
  var p = window.plans[selectedPlan];
  var vhtml = '';
  for (var i = 0; i < multiCarCount; i++) {
    var price = i === 0 ? p.full : p.discounted;
    var placaEl = document.getElementById('coPlaca' + i);
    var marcaEl = document.getElementById('coMarca' + i);
    var placa = placaEl ? placaEl.value.trim().toUpperCase() : '';
    var marca = marcaEl ? marcaEl.value : '';
    var label = placa ? (marca ? marca + ' · ' + placa : placa) : ('Auto ' + (i+1));
    var disc = i > 0 ? ' <span class="sv-discount">(-$' + p.discount + ')</span>' : '';
    vhtml += '<div class="co-summary-vline"><span class="sv-label">' + label + disc + '</span><span class="sv-price">$' + price + '/mes</span></div>';
  }
  document.getElementById('coSummaryVehicles').innerHTML = vhtml;
}

function updateSummary() {
  var p = window.plans[selectedPlan];
  document.getElementById('coSummaryPlan').textContent = planNames[selectedPlan].toUpperCase();
  document.getElementById('coSummaryPlan').style.color = planColors[selectedPlan];

  if (checkoutMode === 'personal') {
    document.getElementById('coSummaryPrice').innerHTML = '$' + p.full + '<span>/mes</span><span class="wr-tax-inline">+ ITBMS</span>';
    document.getElementById('coSummaryDetail').textContent = 'Membresía Personal · Lavados ilimitados · Cancela cuando quieras';
    document.getElementById('coSummaryDetail').style.display = '';
    document.getElementById('coSummaryVehicles').style.display = 'none';
    document.getElementById('coSummaryTotalRow').style.display = 'none';
    selectedPrice = p.full;
  } else {
    document.getElementById('coSummaryPrice').innerHTML = '';
    document.getElementById('coSummaryDetail').textContent = 'Membresía Multi-Vehículo · ' + multiCarCount + ' autos · Lavados ilimitados';
    document.getElementById('coSummaryDetail').style.display = '';
    document.getElementById('coSummaryVehicles').style.display = 'none';
    var total = p.full + (multiCarCount - 1) * p.discounted;
    document.getElementById('coSummaryTotal').innerHTML = '$' + total + ' <span class="wr-tax-inline">+ ITBMS</span>';
    document.getElementById('coSummaryTotalRow').style.display = '';
    selectedPrice = total;
  }
}

// === Checkout calculator (step 0) ===
function updateCoCalc() {
  var planKey = document.getElementById('coCalcPlan').value;
  var p = window.plans[planKey];
  var count = coCalcCount;
  document.getElementById('coCalcIcons').textContent = '\u{1F697}' + '\u{1F699}'.repeat(Math.max(0, count - 1));
  var html = '';
  var total = 0;
  for (var i = 0; i < count; i++) {
    var price = i === 0 ? p.full : p.discounted;
    total += price;
    var lbl = 'Auto ' + (i+1);
    var extra = i > 0 ? ' <span style="color:var(--green);font-size:10px;font-weight:600">(-$' + p.discount + ')</span>' : '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:12px"><span style="color:var(--gray-600)">' + lbl + extra + '</span><span style="font-weight:700;color:var(--gray-900)">$' + price + '/mes</span></div>';
  }
  document.getElementById('coCalcLines').innerHTML = html;
  document.getElementById('coCalcTotal').innerHTML = '$' + total + ' <span class="wr-tax-inline">+ ITBMS</span>';
  var savings = (count * p.full) - total;
  document.getElementById('coCalcSavings').textContent = '$' + savings + '/mes';
  document.getElementById('coCalcPlanName').textContent = p.name.toUpperCase();
  document.getElementById('coCalcPlanName').style.color = planColors[planKey];
}

function coCalcAdjust(delta) {
  coCalcCount = Math.max(2, Math.min(5, coCalcCount + delta));
  document.getElementById('coCalcCount').textContent = coCalcCount;
  updateCoCalc();
}

function confirmCoCalc() {
  selectedPlan = document.getElementById('coCalcPlan').value;
  multiCarCount = coCalcCount;
  updateSummary();
  renderVehicleForms();
  goToNextStep();
}

// === Progress bar rendering ===
function renderProgress() {
  var labels = getStepLabels();
  var progHtml = '';
  var labelsHtml = '';
  for (var i = 0; i < labels.length; i++) {
    if (i === 0) {
      progHtml += '<div class="co-step" data-seg="' + i + '"><div class="co-step-dot">' + (i+1) + '</div></div>';
    } else {
      progHtml += '<div class="co-step" data-seg="' + i + '"><div class="co-step-line"></div><div class="co-step-dot">' + (i+1) + '</div></div>';
    }
    labelsHtml += '<div class="co-step-label" data-seg="' + i + '">' + labels[i] + '</div>';
  }
  document.getElementById('coProgress').innerHTML = progHtml;
  document.getElementById('coLabels').innerHTML = labelsHtml;
  var labelEls = document.getElementById('coLabels').children;
  var w = Math.floor(100 / labels.length);
  for (var j = 0; j < labelEls.length; j++) labelEls[j].style.width = w + '%';
}

function updateProgressUI() {
  var currentSeg = getStepSegment(currentStep);
  // "Plan" segment is already done if user pre-chose plan from card or via home calc
  var planAlreadyDone = checkoutMode === 'personal' || multiCalcDone;
  document.querySelectorAll('#coProgress .co-step').forEach(function(s) {
    var seg = parseInt(s.dataset.seg);
    s.classList.remove('active','done');
    if (seg === currentSeg) s.classList.add('active');
    else if (seg < currentSeg) s.classList.add('done');
    else if (seg === 0 && planAlreadyDone) s.classList.add('done');
  });
  document.querySelectorAll('#coLabels .co-step-label').forEach(function(l) {
    var seg = parseInt(l.dataset.seg);
    l.classList.remove('active','done');
    if (seg === currentSeg) l.classList.add('active');
    else if (seg < currentSeg) l.classList.add('done');
    else if (seg === 0 && planAlreadyDone) l.classList.add('done');
  });
}

// ===== Resumen / Cart rendering =====
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
  });
}

function renderResumen() {
  var p = window.plans[selectedPlan];
  var carCount = checkoutMode === 'multi' ? multiCarCount : 1;

  // Plan name + color class
  var planNameEl = document.getElementById('cartPlanName');
  planNameEl.textContent = planNames[selectedPlan].toUpperCase();
  planNameEl.className = 'cart-plan-name ' + selectedPlan;

  // Plan detail line
  var detailEl = document.getElementById('cartPlanDetail');
  detailEl.textContent = carCount === 1
    ? 'Membresía Personal · Lavados ilimitados · Cancela cuando quieras'
    : 'Membresía Multi-Vehículo (' + carCount + ' autos) · Lavados ilimitados · Cancela cuando quieras';

  // Breakdown with ITBMS
  var html = '';
  var subtotalBruto = 0;
  if (carCount === 1) {
    html += '<div class="cart-plan-line">'
      + '<span class="label">Plan ' + planNames[selectedPlan].toLowerCase() + ' · 1 vehículo</span>'
      + '<span class="val">$' + p.full.toFixed(2) + '</span></div>';
    subtotalBruto = p.full;
  } else {
    html += '<div class="cart-plan-line">'
      + '<span class="label">Auto 1 (precio base)</span>'
      + '<span class="val">$' + p.full.toFixed(2) + '</span></div>';
    html += '<div class="cart-plan-line">'
      + '<span class="label">Auto 2 al ' + carCount + ' (c/u)</span>'
      + '<span class="val">$' + p.discounted.toFixed(2) + '</span></div>';
    var savings = (p.full - p.discounted) * (carCount - 1);
    html += '<div class="cart-plan-line discount">'
      + '<span class="label">Ahorro vs. individual</span>'
      + '<span class="val">−$' + savings.toFixed(2) + '</span></div>';
    subtotalBruto = p.full + p.discounted * (carCount - 1);
  }

  // Aplicar código de descuento sobre subtotal bruto.
  // ITBMS DGI Panamá: se calcula sobre el precio neto post-descuento (no permite cascada).
  var discount = 0;
  var discountLineHTML = '';
  if (appliedCode) {
    if (appliedCode.type === 'percent') {
      discount = subtotalBruto * appliedCode.value;
      discountLineHTML = '<div class="cart-plan-line discount-code">'
        + '<span class="label">Código ' + escapeHtml(appliedCode.code)
        + ' (−' + Math.round(appliedCode.value * 100) + '%)</span>'
        + '<span class="val">−$' + discount.toFixed(2) + '</span></div>';
    } else {
      discount = Math.min(appliedCode.value, subtotalBruto);
      discountLineHTML = '<div class="cart-plan-line discount-code">'
        + '<span class="label">Código ' + escapeHtml(appliedCode.code)
        + ' (−$' + appliedCode.value + ')</span>'
        + '<span class="val">−$' + discount.toFixed(2) + '</span></div>';
    }
  }
  var subtotalNeto = subtotalBruto - discount;
  var itbms = +(subtotalNeto * ITBMS_RATE).toFixed(2);
  var total = +(subtotalNeto + itbms).toFixed(2);
  selectedPrice = total;
  window.selectedPrice = selectedPrice;

  html += '<div class="cart-plan-divider"></div>';
  html += '<div class="cart-plan-line subtotal">'
    + '<span class="label">Subtotal</span>'
    + '<span class="val">$' + subtotalBruto.toFixed(2) + '</span></div>';
  html += discountLineHTML;
  html += '<div class="cart-plan-line tax">'
    + '<span class="label">ITBMS (7%)</span>'
    + '<span class="val">$' + itbms.toFixed(2) + '</span></div>';
  html += '<div class="cart-plan-divider"></div>';
  html += '<div class="cart-plan-total">'
    + '<span class="label">Total mensual</span>'
    + '<span class="val">$' + total.toFixed(2) + '<span>/mes</span></span></div>';
  html += '<div class="cart-plan-tax-note">Incluye ITBMS 7% según Ley fiscal de Panamá</div>';
  document.getElementById('cartBreakdown').innerHTML = html;

  // Sincronizar el componente de promo con el estado actual
  restorePromoUI();

  // Vehicles
  document.getElementById('cartVehiclesTitle').textContent = carCount === 1 ? 'Tu vehículo' : 'Tus ' + carCount + ' vehículos';
  var vehicles = collectVehicles();
  var vhtml = '';
  for (var i = 0; i < vehicles.length; i++) {
    var v = vehicles[i];
    var name = (v.brand + ' ' + v.model).trim() || ('Vehículo ' + (i+1));
    var color = v.color || '—';
    var plate = v.plate || '—';
    vhtml += '<div class="cart-vehicle">'
      + '<div class="cart-vehicle-plate">' + escapeHtml(plate) + '</div>'
      + '<div class="cart-vehicle-info">'
      + '<div class="cart-vehicle-name">' + escapeHtml(name) + '</div>'
      + '<div class="cart-vehicle-color">' + escapeHtml(color) + '</div>'
      + '</div></div>';
  }
  document.getElementById('cartVehicles').innerHTML = vhtml;

  // Customer
  var nameEl = document.getElementById('coName');
  var lastEl = document.getElementById('coLastName');
  var emailEl = document.getElementById('coEmail');
  var phoneEl = document.getElementById('coPhone');
  var fullName = ((nameEl ? nameEl.value : '') + ' ' + (lastEl ? lastEl.value : '')).trim();
  document.getElementById('cartCustomerName').textContent = fullName || '—';
  document.getElementById('cartCustomerEmail').textContent = (emailEl ? emailEl.value : '') || '—';
  document.getElementById('cartCustomerPhone').textContent = (phoneEl ? phoneEl.value : '') || '—';
}

// ===== Cart CTA logic =====
function updateCartCTA() {
  var chk = document.getElementById('chkTerms');
  var btn = document.getElementById('btnContinueToPayment');
  var tooltip = document.getElementById('cartCtaTooltip');
  var checked = !!(chk && chk.checked);
  if (btn) btn.disabled = !checked;
  if (tooltip) {
    if (checked) tooltip.classList.remove('show');
    else tooltip.classList.add('show');
  }
}

// ===== Edit handlers from Resumen blocks =====
// TEMPORAL — editPlan removido. Pendiente: overlay con plan picker (issue #25, decisión 29 Abr).
function editVehicles() { goToStep(2); }
function editCustomer() { goToStep(1); }

// ===== Transition: Resumen → Pago =====
function goToPayment() {
  var chk = document.getElementById('chkTerms');
  if (!chk || !chk.checked) return;
  guardarDatosCheckout();
  goToStep(4);
}

// ===== Open / close =====
function openCheckout(btn, mode) {
  if (mode === 'multi') {
    checkoutMode = 'multi';
    multiCalcDone = true;
    selectedPlan = window.selectedCalcPlan || 'supreme';
    multiCarCount = window.carCount;
  } else {
    var card = btn.closest('.plan-card');
    selectedPlan = card ? card.dataset.tier : 'supreme';
    var panel = btn.closest('.panel');
    if (panel && panel.id === 'panel-multi') {
      checkoutMode = 'multi';
      multiCalcDone = true;
      multiCarCount = window.carCount;
    } else {
      checkoutMode = 'personal';
      multiCalcDone = false;
    }
  }

  // Multi sin calc previa: setear defaults del calc
  if (checkoutMode === 'multi' && !multiCalcDone) {
    coCalcCount = 2;
    document.getElementById('coCalcCount').textContent = '2';
    document.getElementById('coCalcPlan').value = selectedPlan;
    updateCoCalc();
  }

  updateSummary();
  renderVehicleForms();
  renderProgress();

  // Reset state — start fresh
  limpiarDatosCheckout();
  appliedCode = null;
  window.appliedCode = null;
  ['coName','coLastName','coEmail','coPhone'].forEach(function(id){
    var el = document.getElementById(id);
    if(el){ el.value=''; el.classList.remove('error'); }
  });
  var chkT = document.getElementById('chkTerms');
  var chkH = document.getElementById('chkHolder');
  var bcDemo = document.getElementById('bcDemoFailure');
  if (chkT) chkT.checked = false;
  if (chkH) chkH.checked = false;
  if (bcDemo) bcDemo.checked = false;

  // Reset BC mockup card preview
  var bcCard = document.getElementById('bcCardPreview');
  var bcName = document.getElementById('bcNamePreview');
  var bcExp = document.getElementById('bcExpPreview');
  if(bcCard) bcCard.textContent = '•••• •••• •••• ••••';
  if(bcName) bcName.textContent = 'NOMBRE';
  if(bcExp) bcExp.textContent = 'MM/AA';
  ['coCardNum','coCardName','coCardExp','coCardCvv'].forEach(function(id){
    var el = document.getElementById(id);
    if(el){ el.value=''; el.classList.remove('error'); }
  });

  // Result panel: default to success state hidden
  var rs = document.getElementById('resultSuccess');
  var rf = document.getElementById('resultFailure');
  if (rs) rs.style.display = '';
  if (rf) rf.style.display = 'none';

  // Set initial step
  var seq = getStepSequence();
  currentStep = seq[0];
  updateStepUI();

  document.getElementById('checkoutOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// Top-right ✕ button: navigate back through sequence; if at first step, close.
function checkoutBack() {
  var seq = getStepSequence();
  var curIdx = seq.indexOf(currentStep);
  if (curIdx > 0) {
    currentStep = seq[curIdx - 1];
    updateStepUI();
    document.getElementById('checkoutOverlay').scrollTop = 0;
  } else {
    closeCheckout();
  }
}

function goToNextStep() {
  var seq = getStepSequence();
  var curIdx = seq.indexOf(currentStep);
  if (!validateStep(currentStep)) return;
  guardarDatosCheckout();
  if (curIdx < seq.length - 1) {
    currentStep = seq[curIdx + 1];
    updateStepUI();
    document.getElementById('checkoutOverlay').scrollTop = 0;
  }
}

function goToPrevStep() {
  var seq = getStepSequence();
  var curIdx = seq.indexOf(currentStep);
  if (curIdx > 0) {
    currentStep = seq[curIdx - 1];
    updateStepUI();
    document.getElementById('checkoutOverlay').scrollTop = 0;
  }
}

function goToStep(step) {
  currentStep = step;
  updateStepUI();
  document.getElementById('checkoutOverlay').scrollTop = 0;
}

function updateStepUI() {
  [0,1,2,3,4,5].forEach(function(i) {
    var panel = document.getElementById('step' + i);
    if (panel) panel.classList.toggle('active', i === currentStep);
  });
  updateProgressUI();

  var isResult = currentStep === 5;
  var isResumen = currentStep === 3;
  var isPayment = currentStep === 4;
  var hideTopSummary = isResult || isResumen || (checkoutMode === 'multi' && currentStep === 0);

  document.getElementById('coSummary').style.display = hideTopSummary ? 'none' : '';
  document.getElementById('coProgress').style.display = isResult ? 'none' : '';
  document.getElementById('coLabels').style.display = isResult ? 'none' : '';

  // Title / subtitle per step
  var titleEl = document.getElementById('coTitle');
  var subEl = document.getElementById('coSubtitle');
  if (isResult) {
    titleEl.textContent = '¡Listo!';
    subEl.textContent = '';
  } else if (isResumen) {
    titleEl.textContent = 'Resumen del pedido';
    subEl.textContent = 'Revisa tu información antes de continuar al pago';
  } else if (isPayment) {
    titleEl.textContent = 'Pago seguro';
    subEl.textContent = 'Procesado por Billcentrix';
  } else {
    titleEl.textContent = 'Suscripción';
    subEl.textContent = 'Completa tus datos para activar tu membresía';
  }

  document.getElementById('coBackBtn').style.display = isResult ? 'none' : '';

  // Render Resumen content when entering it
  if (isResumen) {
    renderResumen();
    updateCartCTA();
  }

  // Top summary vehicles list (only relevant for multi, not on hidden states)
  if (checkoutMode === 'multi' && !hideTopSummary) {
    var p = window.plans[selectedPlan];
    var vhtml = '';
    for (var i = 0; i < multiCarCount; i++) {
      var price = i === 0 ? p.full : p.discounted;
      var disc = i > 0 ? ' <span class="sv-discount">(-$' + p.discount + ')</span>' : '';
      vhtml += '<div class="co-summary-vline"><span class="sv-label">Auto ' + (i+1) + disc + '</span><span class="sv-price">$' + price + '/mes</span></div>';
    }
    document.getElementById('coSummaryVehicles').innerHTML = vhtml;
    document.getElementById('coSummaryVehicles').style.display = '';
  }
}

function validateStep(step) {
  var valid = true;
  function check(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) { el.classList.add('error'); valid = false; }
    else { el.classList.remove('error'); }
  }
  if (step === 0) {
    // Calc step — defaults are valid
  } else if (step === 1) {
    check('coName'); check('coLastName'); check('coEmail'); check('coPhone');
  } else if (step === 2) {
    var count = checkoutMode === 'multi' ? multiCarCount : 1;
    for (var i = 0; i < count; i++) {
      check('coPlaca' + i);
      check('coMarca' + i);
    }
  }
  return valid;
}

// ===== Result screen =====
function showResultSuccess() {
  document.getElementById('resultSuccess').style.display = '';
  document.getElementById('resultFailure').style.display = 'none';
  var emailEl = document.getElementById('coEmail');
  var email = emailEl && emailEl.value ? emailEl.value : 'tu correo';
  document.getElementById('successEmailDisplay').textContent = email;
  goToStep(5);
}

function showResultFailure() {
  document.getElementById('resultSuccess').style.display = 'none';
  document.getElementById('resultFailure').style.display = '';
  goToStep(5);
}

function retryPayment() {
  // Datos de plan/vehículos/cliente persistidos en sessionStorage; DOM también preservado
  goToStep(4);
}

// ===== Process payment =====
// TEMPORAL: usa el toggle bcDemoFailure para simular éxito o fallo.
// Cuando se integre BC real, este flujo lo dispara el webhook → Netlify Function.
function processPayment() {
  var demo = document.getElementById('bcDemoFailure');
  guardarDatosCheckout();
  if (demo && demo.checked) {
    showResultFailure();
  } else {
    showResultSuccess();
  }
}

// ===== Promo code (discount) handlers =====
// Validación actual: contra MOCK_VALID_CODES local (solo dev).
// En producción esto debe llamar a /api/validate-discount-code (Netlify Function → Odoo).
function togglePromoInput() {
  var toggle = document.getElementById('promoToggle');
  var wrap = document.getElementById('promoInputWrap');
  var err = document.getElementById('promoError');
  var input = document.getElementById('promoInput');
  if (toggle) toggle.style.display = 'none';
  if (wrap) { wrap.classList.add('active'); wrap.classList.remove('error'); }
  if (err) err.classList.remove('active');
  if (input) input.focus();
}

function cancelPromoInput() {
  var toggle = document.getElementById('promoToggle');
  var wrap = document.getElementById('promoInputWrap');
  var err = document.getElementById('promoError');
  var input = document.getElementById('promoInput');
  var btn = document.getElementById('promoApply');
  if (wrap) { wrap.classList.remove('active'); wrap.classList.remove('error'); }
  if (err) err.classList.remove('active');
  if (input) input.value = '';
  if (btn) btn.disabled = true;
  if (toggle) toggle.style.display = '';
}

function onPromoInputChange() {
  var input = document.getElementById('promoInput');
  var btn = document.getElementById('promoApply');
  var wrap = document.getElementById('promoInputWrap');
  var err = document.getElementById('promoError');
  var val = input ? input.value.trim() : '';
  if (btn) btn.disabled = val.length === 0;
  if (wrap) wrap.classList.remove('error');
  if (err) err.classList.remove('active');
}

function onPromoKeyPress(e) {
  if (e.key === 'Enter') {
    var btn = document.getElementById('promoApply');
    if (btn && !btn.disabled) {
      e.preventDefault();
      applyPromoCode();
    }
  }
}

function applyPromoCode() {
  var input = document.getElementById('promoInput');
  if (!input) return;
  var code = input.value.trim().toUpperCase();
  if (!code) return;
  var data = MOCK_VALID_CODES[code];
  if (data) {
    appliedCode = { code: code, type: data.type, value: data.value, label: data.label };
    window.appliedCode = appliedCode;
    guardarDatosCheckout();
    renderResumen();
  } else {
    var wrap = document.getElementById('promoInputWrap');
    var err = document.getElementById('promoError');
    if (wrap) wrap.classList.add('error');
    if (err) err.classList.add('active');
  }
}

function removePromoCode() {
  appliedCode = null;
  window.appliedCode = null;
  var input = document.getElementById('promoInput');
  var btn = document.getElementById('promoApply');
  if (input) input.value = '';
  if (btn) btn.disabled = true;
  guardarDatosCheckout();
  renderResumen();
}

// Sincroniza el DOM del componente promo con el estado actual de appliedCode.
function restorePromoUI() {
  var toggle = document.getElementById('promoToggle');
  var wrap = document.getElementById('promoInputWrap');
  var err = document.getElementById('promoError');
  var applied = document.getElementById('promoApplied');
  var promo = document.querySelector('.cart-promo');
  var input = document.getElementById('promoInput');
  var btn = document.getElementById('promoApply');
  if (!toggle || !wrap || !applied || !promo) return;

  if (appliedCode) {
    wrap.classList.remove('active');
    wrap.classList.remove('error');
    if (err) err.classList.remove('active');
    applied.classList.add('active');
    promo.classList.add('has-applied');
    document.getElementById('promoAppliedCode').textContent = appliedCode.code;
    document.getElementById('promoAppliedLabel').textContent = appliedCode.label;
    toggle.style.display = 'none';
  } else {
    wrap.classList.remove('active');
    wrap.classList.remove('error');
    if (err) err.classList.remove('active');
    applied.classList.remove('active');
    promo.classList.remove('has-applied');
    if (input) input.value = '';
    if (btn) btn.disabled = true;
    toggle.style.display = '';
  }
}

// ====================================================================
// ===== PLAN PICKER OVERLAY (Issue #25) =====
// Permite cambiar de plan desde el paso Resumen sin perder datos.
// Se reusa updateSummary() y renderResumen() para refrescar UI:
//   - updateSummary(): refresca la card sticky .co-summary arriba
//   - renderResumen(): refresca el bloque "Tu plan" del cart + recalcula
//                       ITBMS, código de descuento aplicado, breakdown.
// El código de descuento aplicado y datos del cliente/vehículos se
// preservan automáticamente porque viven en otras funciones.
// ====================================================================

function openPlanPicker() {
  renderPlanPicker();
  var overlay = document.getElementById('planPickerOverlay');
  if (!overlay) return;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closePlanPicker() {
  var overlay = document.getElementById('planPickerOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function renderPlanPicker() {
  var list = document.getElementById('planPickerList');
  var sub  = document.getElementById('planPickerSub');
  if (!list || !sub) return;

  // Orden DESCENDENTE consistente con el home (Ultimate primero)
  var planOrder = ['ultimate', 'supreme', 'deluxe', 'basic'];
  var carCount = checkoutMode === 'multi' ? multiCarCount : 1;

  sub.textContent = checkoutMode === 'multi'
    ? 'Para ' + carCount + ' vehículos · sin perder tus datos.'
    : 'Cambia tu plan sin perder tus datos.';

  var html = '';
  for (var i = 0; i < planOrder.length; i++) {
    var planKey = planOrder[i];
    var p = window.plans[planKey];
    var isCurrent = planKey === selectedPlan;
    var total, breakdownHtml = '';

    if (checkoutMode === 'multi') {
      total = p.full + p.discounted * (carCount - 1);
      breakdownHtml = '<div class="pp-card-breakdown">'
        + carCount + ' autos · $' + p.full + ' + ' + (carCount - 1) + '× $' + p.discounted
        + '</div>';
    } else {
      total = p.full;
    }

    html += '<button type="button" class="pp-card pp-tier-' + planKey + (isCurrent ? ' is-current' : '') + '" '
      + 'onclick="selectPlanFromPicker(\'' + planKey + '\')">'
      + '<div class="pp-tier-bar"></div>'
      + '<div class="pp-card-body">'
      +   '<div class="pp-card-info">'
      +     '<div class="pp-card-name">' + planNames[planKey] + '</div>'
      +     '<p class="pp-card-desc">' + planDescriptions[planKey] + '</p>'
      +   '</div>'
      +   '<div class="pp-card-price-wrap">'
      +     '<div class="pp-card-price">$' + total + '<span class="per">/mes</span></div>'
      +     '<span class="pp-itbms">+ ITBMS</span>'
      +     breakdownHtml
      +   '</div>'
      + '</div>'
      + '<div class="pp-current-check" aria-hidden="true">'
      +   '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
      +     '<path d="M2 7L6 11L12 3"/>'
      +   '</svg>'
      + '</div>'
      + '</button>';
  }
  list.innerHTML = html;
}

function selectPlanFromPicker(planKey) {
  if (planKey === selectedPlan) {
    closePlanPicker();
    return;
  }
  selectedPlan = planKey;
  window.selectedPlan = selectedPlan;
  // Re-render del paso Resumen y de la card sticky de arriba.
  // Estas dos funciones recalculan ITBMS, descuento aplicado, y total.
  updateSummary();
  renderResumen();
  closePlanPicker();
  showPlanToast('Plan actualizado a ' + planNames[planKey]);
}

function showPlanToast(msg) {
  var t = document.getElementById('planPickerToast');
  var txt = document.getElementById('planPickerToastText');
  if (!t || !txt) return;
  txt.textContent = msg;
  t.classList.add('show');
  clearTimeout(showPlanToast._t);
  showPlanToast._t = setTimeout(function(){ t.classList.remove('show'); }, 2200);
}

// Listeners globales — ESC y click en backdrop cierran el picker.
// Verifican is-open antes de actuar para no interferir con otros overlays.
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  var overlay = document.getElementById('planPickerOverlay');
  if (overlay && overlay.classList.contains('is-open')) closePlanPicker();
});
document.addEventListener('click', function(e) {
  var overlay = document.getElementById('planPickerOverlay');
  if (!overlay || !overlay.classList.contains('is-open')) return;
  if (e.target === overlay) closePlanPicker();
});

// Expose globally
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.checkoutBack = checkoutBack;
window.goToNextStep = goToNextStep;
window.goToPrevStep = goToPrevStep;
window.goToStep = goToStep;
window.updateStepUI = updateStepUI;
window.validateStep = validateStep;
window.processPayment = processPayment;
window.getStepSequence = getStepSequence;
window.getStepLabels = getStepLabels;
window.getStepSegment = getStepSegment;
window.buildVehicleForm = buildVehicleForm;
window.renderVehicleForms = renderVehicleForms;
window.updateSummaryPlacas = updateSummaryPlacas;
window.updateSummary = updateSummary;
window.updateCoCalc = updateCoCalc;
window.coCalcAdjust = coCalcAdjust;
window.confirmCoCalc = confirmCoCalc;
window.renderProgress = renderProgress;
window.updateProgressUI = updateProgressUI;
window.renderResumen = renderResumen;
window.updateCartCTA = updateCartCTA;
window.openPlanPicker = openPlanPicker;
window.closePlanPicker = closePlanPicker;
window.selectPlanFromPicker = selectPlanFromPicker;
window.renderPlanPicker = renderPlanPicker;
window.editVehicles = editVehicles;
window.editCustomer = editCustomer;
window.goToPayment = goToPayment;
window.showResultSuccess = showResultSuccess;
window.showResultFailure = showResultFailure;
window.retryPayment = retryPayment;
window.togglePromoInput = togglePromoInput;
window.cancelPromoInput = cancelPromoInput;
window.onPromoInputChange = onPromoInputChange;
window.onPromoKeyPress = onPromoKeyPress;
window.applyPromoCode = applyPromoCode;
window.removePromoCode = removePromoCode;
window.restorePromoUI = restorePromoUI;
