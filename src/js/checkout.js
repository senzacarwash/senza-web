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

window.planColors = planColors;
window.planPrices = planPrices;
window.planNames = planNames;

// ITBMS Panamá 7% (Ley 8 de 2010, Código Fiscal art. 1057-V)
const ITBMS_RATE = 0.07;

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
    discountCode: null
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
  var subtotal = 0;
  if (carCount === 1) {
    html += '<div class="cart-plan-line">'
      + '<span class="label">Plan ' + planNames[selectedPlan].toLowerCase() + ' · 1 vehículo</span>'
      + '<span class="val">$' + p.full.toFixed(2) + '</span></div>';
    subtotal = p.full;
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
    subtotal = p.full + p.discounted * (carCount - 1);
  }
  var itbms = +(subtotal * ITBMS_RATE).toFixed(2);
  var total = +(subtotal + itbms).toFixed(2);
  selectedPrice = total;
  window.selectedPrice = selectedPrice;

  html += '<div class="cart-plan-divider"></div>';
  html += '<div class="cart-plan-line subtotal">'
    + '<span class="label">Subtotal</span>'
    + '<span class="val">$' + subtotal.toFixed(2) + '</span></div>';
  html += '<div class="cart-plan-line tax">'
    + '<span class="label">ITBMS (7%)</span>'
    + '<span class="val">$' + itbms.toFixed(2) + '</span></div>';
  html += '<div class="cart-plan-divider"></div>';
  html += '<div class="cart-plan-total">'
    + '<span class="label">Total mensual</span>'
    + '<span class="val">$' + total.toFixed(2) + '<span>/mes</span></span></div>';
  html += '<div class="cart-plan-tax-note">Incluye ITBMS 7% según Ley fiscal de Panamá</div>';
  document.getElementById('cartBreakdown').innerHTML = html;

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
window.editVehicles = editVehicles;
window.editCustomer = editCustomer;
window.goToPayment = goToPayment;
window.showResultSuccess = showResultSuccess;
window.showResultFailure = showResultFailure;
window.retryPayment = retryPayment;
