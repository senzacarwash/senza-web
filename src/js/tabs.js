// ===== TAB SWITCHING =====
function switchTab(tab) {
  // Tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  // Panels
  document.getElementById('panel-personal').classList.toggle('active', tab === 'personal');
  document.getElementById('panel-multi').classList.toggle('active', tab === 'multi');
  // Heroes
  document.getElementById('hero-personal').style.display = tab === 'personal' ? '' : 'none';
  document.getElementById('hero-multi').style.display = tab === 'multi' ? '' : 'none';
  // Collapse all cards
  document.querySelectorAll('.plan-card.expanded').forEach(c => c.classList.remove('expanded'));
  // Scroll to top
  window.scrollTo({top: 0, behavior: 'smooth'});
}

// Expose globally
window.switchTab = switchTab;
