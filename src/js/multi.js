// ===== CALCULATOR =====
const plans = {
  basic:    { name:'Basic',    full:25, discounted:22, discount:3 },
  deluxe:   { name:'Deluxe',   full:30, discounted:26, discount:4 },
  supreme:  { name:'Supreme',  full:34, discounted:28, discount:6 },
  ultimate: { name:'Ultimate', full:39, discounted:30, discount:9 }
};

// Shared mutable state — exposed on window for cross-module access
window.plans = plans;
window.carCount = 2;
window.selectedCalcPlan = null;

function updateMultiPrices() {
  var count = window.carCount;
  var keys = ['basic','deluxe','supreme','ultimate'];
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    var p = plans[key];
    var totalForPlan = p.full + (count - 1) * p.discounted;
    var avgPerCar = Math.round((totalForPlan / count) * 100) / 100;
    var displayPrice = avgPerCar.toFixed(2);
    var priceEl = document.getElementById('mp-price-' + key);
    var origEl = document.getElementById('mp-orig-' + key);
    var labelEl = document.getElementById('mp-label-' + key);
    var perEl = document.getElementById('mp-per-' + key);
    if (priceEl) priceEl.textContent = displayPrice;
    if (count > 1) {
      origEl.style.display = 'flex';
      perEl.textContent = '/mes por auto';
      labelEl.textContent = 'Lavados ilimitados';
    } else {
      origEl.style.display = 'none';
      perEl.textContent = '/mes';
      labelEl.textContent = 'Lavados ilimitados';
    }
    // Update desktop pricing on cards
    var mdpEl = document.getElementById('mdp-' + key);
    if (mdpEl) {
      var mdpPrice = mdpEl.querySelector('.mdp-price');
      if (mdpPrice) mdpPrice.textContent = '$' + displayPrice;
    }
    // Render inline desglose
    renderDesglose(key);
  }
  // Update counter display
  document.getElementById('vc-count').textContent = count;
  // Sync desktop calculator vehicle count
  window.dcalcVehicles = count;
  var dcalcVcountEl = document.getElementById('dcalc-vcount');
  if (dcalcVcountEl) dcalcVcountEl.textContent = count;
  updateDesktopCalc();
}

function renderDesglose(planKey) {
  var p = plans[planKey];
  var count = window.carCount;
  var container = document.getElementById('desglose-' + planKey);
  if (!container) return;

  var totalRegular = count * p.full;
  var totalDiscount = p.full + (count - 1) * p.discounted;
  var savingsMonth = totalRegular - totalDiscount;
  var savingsYear = savingsMonth * 12;
  var avgPerCar = (totalDiscount / count).toFixed(2);

  var html = '<div class="calc-results-title">Desglose mensual</div>';
  html += '<div class="calc-line"><div class="calc-line-left"><div class="calc-dot first"></div>Auto 1 — ' + p.name + ' (regular)</div><div class="calc-line-price">$' + p.full + '</div></div>';
  for (var i = 1; i < count; i++) {
    var pct = Math.round((p.discount / p.full) * 100);
    html += '<div class="calc-line"><div class="calc-line-left"><div class="calc-dot add"></div>Auto ' + (i+1) + ' <small style="color:#6B7280;font-size:10px">(' + pct + '% off)</small></div><span class="calc-tag">-$' + p.discount + '</span><div class="calc-line-price">$' + p.discounted + '</div></div>';
  }

  html += '<div class="calc-totals">';
  html += '<div class="calc-total-box regular"><div class="ct-label">Sin Multi-Vehículo</div><div class="ct-value">$' + totalRegular + '</div><div class="ct-per">/mes</div></div>';
  html += '<div class="calc-total-box discounted"><div class="ct-label">Con Multi-Vehículo</div><div class="ct-value">$' + totalDiscount + '</div><div class="ct-per">/mes</div></div>';
  html += '</div>';

  html += '<div class="calc-metrics">';
  html += '<div class="cm-box sav"><div class="cm-label">Ahorras/mes<br>(' + count + ' autos)</div><div class="cm-value">$' + savingsMonth + '</div></div>';
  html += '<div class="cm-box sav"><div class="cm-label">Ahorras/año<br>(' + count + ' autos)</div><div class="cm-value">$' + savingsYear + '</div></div>';
  html += '<div class="cm-box avg"><div class="cm-label">Promedio<br>por auto</div><div class="cm-value">$' + avgPerCar + '</div><div class="cm-sub">/mes</div></div>';
  html += '</div>';

  container.innerHTML = html;
}

function scrollToCalc(planKey) {
  // Legacy — no longer used but keep for safety
}

// ===== DESKTOP CALCULATOR =====
window.dcalcVehicles = 2;

function dcalcChangeVehicles(delta) {
  window.dcalcVehicles = Math.max(2, Math.min(5, window.dcalcVehicles + delta));
  document.getElementById('dcalc-vcount').textContent = window.dcalcVehicles;
  // Sync main vehicle counter
  window.carCount = window.dcalcVehicles;
  document.getElementById('vc-count').textContent = window.carCount;
  updateMultiPrices();
}

function desktopCalcFromCard(planKey) {
  if (window.innerWidth < 768) {
    openCheckout(document.querySelector('#multiPlans .plan-card[data-tier="' + planKey + '"] .btn-subscribe'));
    return;
  }
  var planSelect = document.getElementById('dcalc-plan');
  if (planSelect) planSelect.value = planKey;
  updateDesktopCalc();
  var section = document.getElementById('desktopCalcSection');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateDesktopCalc() {
  var planEl = document.getElementById('dcalc-plan');
  var resultEl = document.getElementById('dcalc-result');
  if (!planEl || !resultEl) return;
  var count = window.dcalcVehicles;
  var planKey = planEl.value;
  if (!planKey) {
    resultEl.classList.remove('visible');
    resultEl.innerHTML = '';
    return;
  }
  var p = plans[planKey];
  var totalRegular = count * p.full;
  var totalDiscount = p.full + (count - 1) * p.discounted;
  var savingsMonth = totalRegular - totalDiscount;
  var savingsYear = savingsMonth * 12;
  var avgPerCar = (totalDiscount / count).toFixed(2);
  var html = '<div class="plan-desglose" style="display:block!important;margin-top:0;border-radius:10px;">';
  html += '<div class="calc-results-title">Desglose mensual — ' + p.name + ' × ' + count + ' vehículos</div>';
  html += '<div class="calc-line"><div class="calc-line-left"><div class="calc-dot first"></div>Auto 1 — ' + p.name + ' (regular)</div><div class="calc-line-price">$' + p.full + '</div></div>';
  for (var i = 1; i < count; i++) {
    var pct = Math.round((p.discount / p.full) * 100);
    html += '<div class="calc-line"><div class="calc-line-left"><div class="calc-dot add"></div>Auto ' + (i+1) + ' <small style="color:#6B7280;font-size:10px">(' + pct + '% off)</small></div><span class="calc-tag">-$' + p.discount + '</span><div class="calc-line-price">$' + p.discounted + '</div></div>';
  }
  html += '<div class="calc-totals">';
  html += '<div class="calc-total-box regular"><div class="ct-label">Sin Multi-Vehículo</div><div class="ct-value">$' + totalRegular + '</div><div class="ct-per">/mes</div></div>';
  html += '<div class="calc-total-box discounted"><div class="ct-label">Con Multi-Vehículo</div><div class="ct-value">$' + totalDiscount + '</div><div class="ct-per">/mes</div></div>';
  html += '</div>';
  html += '<div class="calc-metrics">';
  html += '<div class="cm-box sav"><div class="cm-label">Ahorras/mes<br>(' + count + ' autos)</div><div class="cm-value">$' + savingsMonth + '</div></div>';
  html += '<div class="cm-box sav"><div class="cm-label">Ahorras/año<br>(' + count + ' autos)</div><div class="cm-value">$' + savingsYear + '</div></div>';
  html += '<div class="cm-box avg"><div class="cm-label">Promedio<br>por auto</div><div class="cm-value">$' + avgPerCar + '</div><div class="cm-sub">/mes</div></div>';
  html += '</div></div>';
  resultEl.innerHTML = html;
  resultEl.classList.add('visible');
}

// Expose globally
window.updateMultiPrices = updateMultiPrices;
window.renderDesglose = renderDesglose;
window.scrollToCalc = scrollToCalc;
window.dcalcChangeVehicles = dcalcChangeVehicles;
window.desktopCalcFromCard = desktopCalcFromCard;
window.updateDesktopCalc = updateDesktopCalc;
