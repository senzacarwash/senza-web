// ===== NAVIGATION WITH ACTIVE STATE =====
var currentNav = 'home';
window.currentNav = currentNav;

function updateActiveNav(navId) {
  currentNav = navId;
  window.currentNav = navId;
  document.querySelectorAll('[data-nav]').forEach(function(el) {
    el.classList.toggle('nav-active', el.getAttribute('data-nav') === navId);
  });
}

function navigateTo(target) {
  if (target === currentNav) return; // Already on this page — do nothing
  if (target === 'home') {
    goHome();
  } else if (target === 'member') {
    if (!document.body.classList.contains('member-mode')) {
      toggleMemberArea();
    }
  } else {
    showPageView(target);
  }
  updateActiveNav(target);
}

function goHome() {
  closeMobileMenu();
  var body = document.body;
  // Exit member mode if active
  if (body.classList.contains('member-mode')) {
    toggleMemberArea();
  }
  // Exit page mode if active
  if (body.classList.contains('page-mode')) {
    body.classList.remove('page-mode');
    document.querySelectorAll('.page-view').forEach(function(v){v.classList.remove('active');});
  }
  var pb = document.querySelector('.promo-banner'); if(pb) pb.style.cssText = '';
  updateActiveNav('home');
  switchTab('personal');
  window.scrollTo({top:0, behavior:'smooth'});
}

// ===== PAGE VIEW NAVIGATION =====
function showPageView(viewId) {
  closeMobileMenu();
  var body = document.body;
  // Exit member mode if active
  if (body.classList.contains('member-mode')) {
    body.classList.remove('member-mode');
    var navUser = document.getElementById('navUser');
    navUser.innerHTML = '<div class="nav-avatar" id="navAvatar" onclick="toggleMemberArea()"><svg width="18" height="18" viewBox="0 0 24 24" fill="#0077FF" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/></svg></div>';
  }
  // Deactivate all page views
  document.querySelectorAll('.page-view').forEach(function(v){v.classList.remove('active');});
  // Activate target
  var target = document.getElementById(viewId);
  if (target) {
    body.classList.add('page-mode');
    var pb = document.querySelector('.promo-banner'); if(pb) pb.style.cssText = 'display:none !important;height:0 !important;padding:0 !important;margin:0 !important;overflow:hidden !important;line-height:0 !important;font-size:0 !important;border:none !important;';
    target.classList.add('active');
  }
  window.scrollTo({top:0, behavior:'smooth'});
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  var btn = document.getElementById('navHamburger');
  menu.classList.toggle('open');
  btn.classList.toggle('open');
}
function closeMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  var btn = document.getElementById('navHamburger');
  menu.classList.remove('open');
  btn.classList.remove('open');
}
function mobileMenuAction(fn) {
  closeMobileMenu();
  fn();
}
function toggleMobileSub(el) {
  var sub = el.nextElementSibling;
  if (sub) sub.classList.toggle('open');
  var arrow = el.querySelector('span');
  if (arrow) arrow.textContent = sub.classList.contains('open') ? '▲' : '▼';
}

// ===== LOYALTY FORM =====
function submitLoyaltyForm(e) {
  e.preventDefault();
  var form = document.getElementById('loyaltyForm');
  var toast = document.createElement('div');
  toast.textContent = '¡Listo! Te enviaremos tu Loyalty Card por email.';
  toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:var(--gray-900);color:white;padding:14px 24px;border-radius:10px;font-family:Exo 2,sans-serif;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.25);text-align:center;max-width:90vw';
  document.body.appendChild(toast);
  form.reset();
  setTimeout(function(){ toast.remove(); }, 4000);
}

// Expose globally
window.showPageView = showPageView;
window.goHome = goHome;
window.updateActiveNav = updateActiveNav;
window.navigateTo = navigateTo;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.mobileMenuAction = mobileMenuAction;
window.toggleMobileSub = toggleMobileSub;
window.submitLoyaltyForm = submitLoyaltyForm;
