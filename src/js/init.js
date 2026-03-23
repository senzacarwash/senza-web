// ===== INIT — DOMContentLoaded listeners, event delegation, initial state =====

// Vehicle counter buttons (multi calculator)
document.getElementById('vc-minus').addEventListener('click', function() {
  if (window.carCount > 2) { window.carCount--; window.updateMultiPrices(); }
});
document.getElementById('vc-plus').addEventListener('click', function() {
  if (window.carCount < 5) { window.carCount++; window.updateMultiPrices(); }
});

// Initial multi prices render
window.updateMultiPrices();

// Live card preview (checkout)
document.getElementById('coCardNum').addEventListener('input', function() {
  var v = this.value.replace(/\D/g,'');
  var formatted = v.replace(/(.{4})/g,'$1 ').trim();
  this.value = formatted;
  var prev = document.getElementById('bcCardPreview');
  if(prev) prev.textContent = formatted || '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022';
});
document.getElementById('coCardName').addEventListener('input', function() {
  var prev = document.getElementById('bcNamePreview');
  if(prev) prev.textContent = this.value.toUpperCase() || 'NOMBRE';
});
document.getElementById('coCardExp').addEventListener('input', function() {
  var v = this.value.replace(/\D/g,'');
  if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2);
  this.value = v;
  var prev = document.getElementById('bcExpPreview');
  if(prev) prev.textContent = v || 'MM/AA';
});

// Clear error on input for checkout fields
['coName','coLastName','coEmail','coPhone','coCardNum','coCardName','coCardExp','coCardCvv'].forEach(function(id){
  var el = document.getElementById(id);
  if(el) el.addEventListener('input', function() { this.classList.remove('error'); });
});

// Update character count for cancel reason textarea (event delegation)
document.addEventListener('input', function(e) {
  if (e.target.id === 'cancelOtherText') {
    var len = e.target.value.length;
    var countEl = document.getElementById('cancelOtherCount');
    countEl.textContent = len + '/20 caracteres mínimo';
    countEl.style.color = len >= 20 ? 'var(--green)' : 'var(--gray-400)';
  }
});
