// ===== CHECKOUT FLOW =====
let currentStep = 1;
let selectedPlan = 'supreme';
let selectedPrice = 34;
let termsAccepted = false;
let checkoutMode = 'personal'; // 'personal' or 'multi'
let multiCarCount = 2;
let multiCalcDone = false; // did user already use calculator on main page?
let coCalcCount = 2; // checkout calculator count

window.currentStep = currentStep;
window.selectedPlan = selectedPlan;
window.selectedPrice = selectedPrice;
window.termsAccepted = termsAccepted;
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

// Step sequence: personal = [1,2,3,4(success)], multi-no-calc = [0,1,2,3,4], multi-with-calc = [1,2,3,4]
function getStepSequence() {
  if (checkoutMode === 'personal') return [2,1,3];
  if (multiCalcDone) return [2,1,3];
  return [0,2,1,3];
}
function getStepLabels() {
  if (checkoutMode === 'personal') return ['Vehículo','Tus datos','Pago'];
  if (multiCalcDone) return ['Vehículos','Tus datos','Pago'];
  return ['Plan','Vehículos','Tus datos','Pago'];
}

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
    '<div class="co-row"><div class="co-field"><label>Año</label><input type="text" id="coYear' + index + '" placeholder="Ej: 2024" inputmode="numeric" maxlength="4"></div>' +
    '<div class="co-field"><label>Color</label><input type="text" id="coColor' + index + '" placeholder="Ej: Blanco"></div></div>' +
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
  var total = 0;
  for (var i = 0; i < multiCarCount; i++) {
    var price = i === 0 ? p.full : p.discounted;
    total += price;
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
    document.getElementById('coSummaryPrice').innerHTML = '$' + p.full + '<span>/mes</span>';
    document.getElementById('coSummaryDetail').textContent = 'Membresía Personal · Lavados ilimitados · Cancela cuando quieras';
    document.getElementById('coSummaryDetail').style.display = '';
    document.getElementById('coSummaryVehicles').style.display = 'none';
    document.getElementById('coSummaryTotalRow').style.display = 'none';
    document.getElementById('coTermsPrice').textContent = '$' + p.full + '/mes';
    selectedPrice = p.full;
  } else {
    document.getElementById('coSummaryPrice').innerHTML = '';
    document.getElementById('coSummaryDetail').textContent = 'Membresía Multi-Vehículo · ' + multiCarCount + ' autos · Lavados ilimitados';
    document.getElementById('coSummaryDetail').style.display = '';
    document.getElementById('coSummaryVehicles').style.display = 'none';
    var total = p.full + (multiCarCount - 1) * p.discounted;
    document.getElementById('coSummaryTotal').textContent = '$' + total;
    document.getElementById('coSummaryTotalRow').style.display = '';
    document.getElementById('coTermsPrice').textContent = '$' + total + '/mes';
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
  document.getElementById('coCalcTotal').textContent = '$' + total;
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
  var seq = getStepSequence();
  var labels = getStepLabels();
  var progHtml = '';
  var labelsHtml = '';
  for (var i = 0; i < seq.length; i++) {
    var stepNum = seq[i];
    var displayNum = i + 1;
    if (i === 0) {
      progHtml += '<div class="co-step" data-step="' + stepNum + '"><div class="co-step-dot">' + displayNum + '</div></div>';
    } else {
      progHtml += '<div class="co-step" data-step="' + stepNum + '"><div class="co-step-line"></div><div class="co-step-dot">' + displayNum + '</div></div>';
    }
    labelsHtml += '<div class="co-step-label" data-forstep="' + stepNum + '">' + labels[i] + '</div>';
  }
  document.getElementById('coProgress').innerHTML = progHtml;
  document.getElementById('coLabels').innerHTML = labelsHtml;
  // Adjust label widths
  var labelEls = document.getElementById('coLabels').children;
  var w = Math.floor(100 / labels.length);
  for (var j = 0; j < labelEls.length; j++) labelEls[j].style.width = w + '%';
}

function updateProgressUI() {
  var seq = getStepSequence();
  document.querySelectorAll('#coProgress .co-step').forEach(function(s) {
    var n = parseInt(s.dataset.step);
    var idx = seq.indexOf(n);
    var curIdx = seq.indexOf(currentStep);
    s.classList.remove('active','done');
    if (idx === curIdx) s.classList.add('active');
    else if (idx < curIdx) s.classList.add('done');
  });
  document.querySelectorAll('#coLabels .co-step-label').forEach(function(l) {
    var n = parseInt(l.dataset.forstep);
    var idx = seq.indexOf(n);
    var curIdx = seq.indexOf(currentStep);
    l.classList.remove('active','done');
    if (idx === curIdx) l.classList.add('active');
    else if (idx < curIdx) l.classList.add('done');
  });
}

function openCheckout(btn, mode) {
  if (mode === 'multi') {
    checkoutMode = 'multi';
    multiCalcDone = true; // came from calculator
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

  // Set checkout calc defaults
  if (checkoutMode === 'multi' && !multiCalcDone) {
    coCalcCount = 2;
    document.getElementById('coCalcCount').textContent = '2';
    document.getElementById('coCalcPlan').value = selectedPlan;
    updateCoCalc();
  }

  updateSummary();
  renderVehicleForms();
  renderProgress();

  var seq = getStepSequence();
  currentStep = seq[0]; // start at first step in sequence
  termsAccepted = false;
  document.getElementById('coCheck').classList.remove('checked');
  document.getElementById('coCheck').innerHTML = '';
  document.getElementById('coPayBtn').disabled = true;
  ['coName','coLastName','coEmail','coPhone','coCardNum','coCardName','coCardExp','coCardCvv'].forEach(function(id){
    var el = document.getElementById(id);
    if(el){el.value='';el.classList.remove('error');}
  });
  var bcCard = document.getElementById('bcCardPreview');
  var bcName = document.getElementById('bcNamePreview');
  var bcExp = document.getElementById('bcExpPreview');
  if(bcCard) bcCard.textContent = '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022';
  if(bcName) bcName.textContent = 'NOMBRE';
  if(bcExp) bcExp.textContent = 'MM/AA';
  updateStepUI();

  document.getElementById('checkoutOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function checkoutBack() {
  var seq = getStepSequence();
  var curIdx = seq.indexOf(currentStep);
  if (curIdx > 0) { currentStep = seq[curIdx - 1]; updateStepUI(); document.getElementById('checkoutOverlay').scrollTop = 0; }
  else closeCheckout();
}

function goToNextStep() {
  var seq = getStepSequence();
  var curIdx = seq.indexOf(currentStep);
  if (!validateStep(currentStep)) return;
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
  [0,1,2,3,4].forEach(function(i) {
    var panel = document.getElementById('step' + i);
    if (panel) panel.classList.toggle('active', i === currentStep);
  });
  updateProgressUI();
  var isSuccess = currentStep === 4;
  var hideTopSummary = isSuccess || (checkoutMode === 'multi' && currentStep === 0);
  document.getElementById('coSummary').style.display = hideTopSummary ? 'none' : '';
  document.getElementById('coProgress').style.display = isSuccess ? 'none' : '';
  document.getElementById('coLabels').style.display = isSuccess ? 'none' : '';
  document.getElementById('coTitle').textContent = isSuccess ? '\u00a1Listo!' : 'Suscripción';
  document.getElementById('coSubtitle').textContent = isSuccess ? 'Tu membresía está activa' : 'Completa tus datos para activar tu membresía';
  document.getElementById('coBackBtn').style.display = isSuccess ? 'none' : '';
  if (checkoutMode === 'multi' && currentStep !== 0 && !isSuccess) {
    var p = window.plans[selectedPlan];
    var vhtml = '';
    for (var i = 0; i < multiCarCount; i++) {
      var price = i === 0 ? p.full : p.discounted;
      var disc = i > 0 ? ' <span class="sv-discount">(-$' + p.discount + ')</span>' : '';
      vhtml += '<div class="co-summary-vline"><span class="sv-label">Auto ' + (i+1) + disc + '</span><span class="sv-price">$' + price + '/mes</span></div>';
    }
    document.getElementById('coSummaryVehicles').innerHTML = vhtml;
    document.getElementById('coSummaryVehicles').style.display = '';
    document.getElementById('coSummaryPlan').style.display = '';
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
  function checkSelect(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!el.value) { el.style.borderColor = '#EF4444'; valid = false; }
    else { el.style.borderColor = ''; }
  }
  if (step === 0) {
    // Calc step — always valid (has defaults)
  } else if (step === 1) {
    check('coName'); check('coLastName'); check('coEmail'); check('coPhone');
  } else if (step === 2) {
    var count = checkoutMode === 'multi' ? multiCarCount : 1;
    for (var i = 0; i < count; i++) {
      check('coPlaca' + i);
      check('coMarca' + i);
    }
  } else if (step === 3) {
    check('coCardNum'); check('coCardName'); check('coCardExp'); check('coCardCvv');
    if (!termsAccepted) { valid = false; document.getElementById('coTerms').style.boxShadow = '0 0 0 2px #EF4444'; }
  }
  return valid;
}

function toggleTerms() {
  termsAccepted = !termsAccepted;
  document.getElementById('coCheck').classList.toggle('checked', termsAccepted);
  document.getElementById('coCheck').innerHTML = termsAccepted ? '\u2713' : '';
  document.getElementById('coPayBtn').disabled = !termsAccepted;
  document.getElementById('coTerms').style.boxShadow = '';
}

function processPayment() {
  if (!validateStep(3)) return;
  document.getElementById('successPlan').textContent = planNames[selectedPlan] + (checkoutMode === 'multi' ? ' \u00b7 Multi-Vehículo' : '');
  document.getElementById('successName').textContent = document.getElementById('coName').value + ' ' + document.getElementById('coLastName').value;

  if (checkoutMode === 'personal') {
    document.getElementById('successSingleCar').style.display = '';
    document.getElementById('successMultiCars').style.display = 'none';
    var marca = document.getElementById('coMarca0').value;
    var modelo = document.getElementById('coModelo0').value;
    document.getElementById('successCar').textContent = marca + (modelo ? ' ' + modelo : '');
    document.getElementById('successPlaca').textContent = document.getElementById('coPlaca0').value.toUpperCase();
  } else {
    document.getElementById('successSingleCar').style.display = 'none';
    document.getElementById('successMultiCars').style.display = '';
    var carsHtml = '';
    for (var i = 0; i < multiCarCount; i++) {
      var m = document.getElementById('coMarca' + i).value;
      var mod = document.getElementById('coModelo' + i).value;
      var pl = document.getElementById('coPlaca' + i).value.toUpperCase();
      carsHtml += '<div class="co-success-car-row"><span class="scr-label">' + pl + '</span><span class="scr-value">' + m + (mod ? ' ' + mod : '') + '</span></div>';
    }
    document.getElementById('successMultiCars').innerHTML = carsHtml;
  }

  document.getElementById('successPrice').textContent = '$' + selectedPrice + '/mes';
  currentStep = 4;
  updateStepUI();
  document.getElementById('checkoutOverlay').scrollTop = 0;
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
window.toggleTerms = toggleTerms;
window.processPayment = processPayment;
window.getStepSequence = getStepSequence;
window.getStepLabels = getStepLabels;
window.buildVehicleForm = buildVehicleForm;
window.renderVehicleForms = renderVehicleForms;
window.updateSummaryPlacas = updateSummaryPlacas;
window.updateSummary = updateSummary;
window.updateCoCalc = updateCoCalc;
window.coCalcAdjust = coCalcAdjust;
window.confirmCoCalc = confirmCoCalc;
window.renderProgress = renderProgress;
window.updateProgressUI = updateProgressUI;
