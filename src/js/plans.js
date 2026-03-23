// ===== CARD TOGGLE (accordion — only one open at a time) =====
function toggleCard(card) {
  var panel = card.closest('.plans');
  var wasExpanded = card.classList.contains('expanded');
  panel.querySelectorAll('.plan-card.expanded').forEach(function(c) { c.classList.remove('expanded'); });
  if (!wasExpanded) card.classList.add('expanded');
}

// ===== FAQ TOGGLE =====
function toggleFaq(el) { el.classList.toggle('open'); }

function toggleFaqAccordion(el, event) {
  if (event.target.closest('.faq-item')) return;
  var wasOpen = el.classList.contains('faq-acc-open');
  el.classList.toggle('faq-acc-open');
  if (!wasOpen) {
    var firstItem = el.querySelector('.faq-item');
    if (firstItem && !firstItem.classList.contains('open')) {
      setTimeout(function(){ firstItem.classList.add('open'); }, 200);
    }
  }
}

// Expose globally
window.toggleCard = toggleCard;
window.toggleFaq = toggleFaq;
window.toggleFaqAccordion = toggleFaqAccordion;
