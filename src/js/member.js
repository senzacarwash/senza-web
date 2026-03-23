// ===== MEMBER AREA TOGGLE =====
function toggleMemberArea() {
  closeMobileMenu();
  var body = document.body;
  var navUser = document.getElementById('navUser');
  var navMenu = document.getElementById('navMenu');
  var navHam = document.getElementById('navHamburger');
  // Close any page views
  if (body.classList.contains('page-mode')) {
    body.classList.remove('page-mode');
    document.querySelectorAll('.page-view').forEach(function(v){v.classList.remove('active');});
  }
  if (body.classList.contains('member-mode')) {
    body.classList.remove('member-mode');
    // Restore promo banner
    var pb = document.querySelector('.promo-banner'); if(pb) pb.style.cssText = '';
    // Restore avatar, keep menu visible
    navUser.innerHTML = '<div class="nav-avatar" id="navAvatar" onclick="toggleMemberArea()"><svg width="18" height="18" viewBox="0 0 24 24" fill="#0077FF" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/></svg></div>';
    window.scrollTo({top:0, behavior:'smooth'});
  } else {
    body.classList.add('member-mode');
    // Hide promo banner completely
    var pb = document.querySelector('.promo-banner'); if(pb) pb.style.cssText = 'display:none !important;height:0 !important;padding:0 !important;margin:0 !important;overflow:hidden !important;line-height:0 !important;font-size:0 !important;border:none !important;';
    // Show back button but keep menu
    navUser.innerHTML = '<div class="nav-back-btn" onclick="goHome()">←</div>';
    window.scrollTo({top:0, behavior:'smooth'});
  }
}

// ===== MI MEMBRESÍA FUNCTIONS =====
// ===== SECTION SWITCHING =====
function switchSection(section) {
  // Update tabs
  document.querySelectorAll('.dash-tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.section === section);
  });
  // Update sections
  document.querySelectorAll('.section').forEach(function(s) {
    s.classList.toggle('active', s.id === 'sec-' + section);
  });
  // Scroll tab into view
  var activeTab = document.querySelector('.dash-tab[data-section="' + section + '"]');
  if (activeTab) {
    activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
  // Scroll content to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== OVERLAYS =====
function openOverlay(name) {
  document.getElementById('overlay-' + name).classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeOverlay(name) {
  document.getElementById('overlay-' + name).classList.remove('active');
  document.body.style.overflow = '';
}

// ===== MODALS =====
function showModal(name) {
  document.getElementById('modal-' + name).classList.add('show');
}
function closeModal(name) {
  document.getElementById('modal-' + name).classList.remove('show');
}

// ===== TOAST =====
function showToast(text) {
  var toast = document.getElementById('toast');
  document.getElementById('toastText').textContent = '✓  ' + text;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

// ===== CHANGE PLAN =====
var selectedNewPlan = null;
window.selectedNewPlan = selectedNewPlan;

function selectPlan(el, tier) {
  document.querySelectorAll('.plan-option').forEach(function(p) { p.classList.remove('selected'); });
  el.classList.add('selected');
  selectedNewPlan = tier;
  document.getElementById('btnConfirmPlan').disabled = false;
}
function confirmPlanChange() {
  if (!selectedNewPlan) return;
  var names = { basic:'Basic', deluxe:'Deluxe', supreme:'Supreme', ultimate:'Ultimate' };
  closeOverlay('changePlan');
  showToast('Plan cambiado a ' + names[selectedNewPlan]);
  // Reset selection
  document.querySelectorAll('.plan-option.selected').forEach(function(p) { p.classList.remove('selected'); });
  document.getElementById('btnConfirmPlan').disabled = true;
  selectedNewPlan = null;
}

// ===== CARD FORMATTING =====
function formatCardNumber(input) {
  var v = input.value.replace(/\D/g, '').substring(0, 16);
  var formatted = v.replace(/(.{4})/g, '$1 ').trim();
  input.value = formatted;
}
function formatExpiry(input) {
  var v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
  input.value = v;
}
function updateNewCardPreview() {
  var num = document.getElementById('newCardNumberInput').value || '';
  var name = document.getElementById('newCardNameInput').value || '';
  var exp = document.getElementById('newCardExpiryInput').value || '';

  var display = num ? num.replace(/\d(?=.{4})/g, function(m, i) { return i < num.length - 4 ? '•' : m; }) : '•••• •••• •••• ••••';
  if (num.length < 5) display = num.padEnd(19, ' •').replace(/ /g, ' ');
  var lastFour = num.replace(/\s/g, '').slice(-4);
  if (num.length >= 4) {
    display = '•••• •••• •••• ' + lastFour;
  } else {
    display = '•••• •••• •••• ••••';
  }

  document.getElementById('newCardPreview').textContent = display;
  document.getElementById('newCardHolder').textContent = name ? name.toUpperCase() : 'TU NOMBRE';
  document.getElementById('newCardExpiry').textContent = exp || 'MM/AA';
}

// ===== STATUS UPDATES =====
function updateStatusCancelled() {
  var dot = document.querySelector('.member-status-dot');
  var text = document.querySelector('.member-status-text');
  var status = document.querySelector('.member-status');
  dot.style.background = 'var(--red)';
  dot.style.animation = 'none';
  text.textContent = 'Cancelada · Activa hasta 15 Mar';
  text.style.color = 'var(--red)';
  status.style.background = 'rgba(220,38,38,.1)';
  status.style.borderColor = 'rgba(220,38,38,.3)';

  showToast('Membresía cancelada');
}

// ===== CANCEL REASON =====
var selectedCancelReason = null;
var isOtherReason = false;
window.selectedCancelReason = selectedCancelReason;
window.isOtherReason = isOtherReason;

function selectCancelReason(el) {
  document.querySelectorAll('.cancel-reason-option').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  selectedCancelReason = el.querySelector('span').textContent;
  isOtherReason = el.hasAttribute('data-other');
  document.getElementById('cancelReasonError').style.display = 'none';
  // Show/hide textarea for "Otro motivo"
  var otherWrap = document.getElementById('cancelOtherWrap');
  if (isOtherReason) {
    otherWrap.style.display = 'block';
    document.getElementById('cancelOtherText').focus();
  } else {
    otherWrap.style.display = 'none';
  }
}

function confirmCancelWithReason() {
  if (!selectedCancelReason) {
    document.getElementById('cancelReasonError').style.display = 'block';
    document.getElementById('cancelReasonError').textContent = 'Selecciona una razón para continuar';
    return;
  }
  if (isOtherReason) {
    var otherText = document.getElementById('cancelOtherText').value.trim();
    if (otherText.length < 20) {
      document.getElementById('cancelReasonError').style.display = 'block';
      document.getElementById('cancelReasonError').textContent = 'Por favor escribe al menos 20 caracteres explicando tu motivo';
      return;
    }
  }
  closeModal('cancelReason');
  updateStatusCancelled();
  // Reset for next time
  selectedCancelReason = null;
  isOtherReason = false;
  document.querySelectorAll('.cancel-reason-option').forEach(function(o) { o.classList.remove('selected'); });
  document.getElementById('cancelOtherWrap').style.display = 'none';
  document.getElementById('cancelOtherText').value = '';
}

// Expose globally
window.toggleMemberArea = toggleMemberArea;
window.switchSection = switchSection;
window.openOverlay = openOverlay;
window.closeOverlay = closeOverlay;
window.showModal = showModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.selectPlan = selectPlan;
window.confirmPlanChange = confirmPlanChange;
window.formatCardNumber = formatCardNumber;
window.formatExpiry = formatExpiry;
window.updateNewCardPreview = updateNewCardPreview;
window.updateStatusCancelled = updateStatusCancelled;
window.selectCancelReason = selectCancelReason;
window.confirmCancelWithReason = confirmCancelWithReason;
