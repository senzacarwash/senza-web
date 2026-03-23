// ===== AI CHATBOT =====
const senzaKnowledge = {
  membresías: "Ofrecemos 4 niveles de membresía: Basic ($25/mes), Deluxe ($30/mes), Supreme ($34/mes, la más popular) y Ultimate ($39/mes). Todas incluyen lavados ilimitados.",
  basic: "El plan Basic ($25/mes) incluye lavado y secado. Es ideal para mantener tu auto limpio de forma económica.",
  deluxe: "El plan Deluxe ($30/mes) incluye todo lo del Basic más: lavado de ruedas y espuma activa. Excelente relación precio-valor.",
  supreme: "El plan Supreme ($34/mes) es nuestro más popular. Incluye todo lo del Deluxe más lavado de chasis y Supreme Wax. La limpieza interior es un servicio adicional de $5 por visita.",
  ultimate: "El plan Ultimate ($39/mes) es el lavado más completo. Incluye todo lo del Supreme más Ultimate Shine Protection y 2 limpiezas y aspirado interior incluidos al mes por vehículo. Adicionales a $5.",
  multi: "Con Multi-Vehículo, tu primer auto paga precio regular y cada auto adicional recibe un descuento fijo según su plan. Puedes registrar varios vehículos con un solo cargo mensual.",
  descuento: "El descuento es fijo para cada auto adicional: Auto 1 paga precio regular, y todos los autos del 2 en adelante pagan un precio con descuento. Por ejemplo con Supreme: Auto 1 $34, Auto 2+ $28 cada uno (ahorras $6 por auto adicional).",
  ubicación: "Estamos ubicados en Llano Bonito, Ciudad de Panamá, junto a la estación Puma. Contamos con sala de espera con aire acondicionado, café y agua de cortesía.",
  horario: "Nuestro horario es: Lunes a Sábado de 7am a 7pm, y Domingos de 8am a 5pm. Estamos en Llano Bonito, junto a la estación Puma.",
  lavado: "Nuestro túnel automático de última generación (TWASH30 PRO) realiza el lavado en aproximadamente 3 minutos. Además contamos con 8 bahías de aspirado para que limpies el interior.",
  cancelar: "Puedes cancelar en cualquier momento sin contrato ni penalidad. Disfrutas el servicio hasta el final de tu ciclo de facturación.",
  cambiar: "Puedes subir o bajar de plan cuando quieras. El cambio se aplica en tu siguiente ciclo de facturación.",
  interior: "La limpieza y aspirado interior viene incluida solo en Ultimate (2/mes por vehículo, no acumulables). En Basic, Deluxe y Supreme, está disponible como servicio adicional por $5 por visita. También tenemos 8 bahías de aspirado de autoservicio.",
  pago: "Aceptamos tarjetas de crédito y débito. El cobro es mensual y automático, procesado de forma segura por Billcentrix.",
  vehículo: "Cada membresía está vinculada a un vehículo específico mediante la placa. Si tienes más de un auto, la Membresía Multi-Vehículo te da descuentos en cada auto adicional.",
  familiar: "¡Sí! Los autos no necesitan estar a tu nombre. Puedes registrar autos de familiares, amigos o del trabajo bajo un solo titular y una sola factura.",
  loyalty: "Si no eres miembro, puedes obtener una Loyalty Card digital gratuita. Se agrega a tu Apple Wallet o Google Wallet. Cada vez que pagas un lavado individual, se registra automáticamente. ¡Al completar 8 lavados, el 9no es gratis!",
  apertura: "Estamos en fase de pre-apertura. ¡Muy pronto estaremos listos para recibirte!"
};

window.senzaKnowledge = senzaKnowledge;

function findBestResponse(question) {
  const q = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const patterns = [
    { keys: ["basic", "basico", "25"], resp: senzaKnowledge.basic },
    { keys: ["deluxe", "30"], resp: senzaKnowledge.deluxe },
    { keys: ["supreme", "popular", "34"], resp: senzaKnowledge.supreme },
    { keys: ["ultimate", "completo", "39"], resp: senzaKnowledge.ultimate },
    { keys: ["multi", "varios", "mas de un", "descuento", "familia", "amigo"], resp: senzaKnowledge.multi + " " + senzaKnowledge.descuento },
    { keys: ["donde", "ubicacion", "direccion", "llano", "puma"], resp: senzaKnowledge.ubicación },
    { keys: ["horario", "hora", "abren", "cierran", "abierto"], resp: senzaKnowledge.horario },
    { keys: ["cuanto tarda", "cuanto dura", "minuto", "rapido", "tiempo", "tunel"], resp: senzaKnowledge.lavado },
    { keys: ["cancelar", "cancelo", "penalidad", "contrato"], resp: senzaKnowledge.cancelar },
    { keys: ["cambiar", "cambio", "subir", "bajar", "upgrade"], resp: senzaKnowledge.cambiar },
    { keys: ["interior", "aspirado", "aspirar", "adentro", "por dentro"], resp: senzaKnowledge.interior },
    { keys: ["pago", "tarjeta", "cobr", "factur"], resp: senzaKnowledge.pago },
    { keys: ["placa", "vincula", "vehiculo", "auto", "carro"], resp: senzaKnowledge.vehículo },
    { keys: ["nombre", "familiar", "trabajo", "companero", "amigo"], resp: senzaKnowledge.familiar },
    { keys: ["apertura", "abrir", "cuando abren", "pronto", "nuevo"], resp: senzaKnowledge.apertura },
    { keys: ["loyalty", "lealtad", "gratis", "acumul", "stamp", "wallet", "no miembro", "sin membresia"], resp: senzaKnowledge.loyalty },
    { keys: ["plan", "membresia", "nivel", "tier", "opcion", "precio"], resp: senzaKnowledge.membresías },
    { keys: ["ilimitado", "cuantas veces", "limite", "sin limite"], resp: "¡Todas las que quieras! Todas nuestras membresías incluyen lavados ilimitados. Puedes venir todos los días si lo deseas." },
    { keys: ["diferencia", "comparar", "mejor", "recomienda", "cual"], resp: "Cada plan sube en nivel de protección y brillo. Basic incluye lavado y secado, Deluxe agrega lavado de ruedas y espuma activa, Supreme suma lavado de chasis y Supreme Wax (nuestro más popular), y Ultimate incluye Ultimate Shine Protection y 2 interiores incluidos/mes. ¿Cuál te interesa?" },
    { keys: ["hola", "hi", "hey", "buenos", "buenas", "saludos"], resp: "¡Hola! 👋 Estoy aquí para ayudarte. Puedes preguntarme sobre nuestras membresías, precios, servicios, ubicación o cualquier otra duda que tengas sobre Senza Car Wash." },
    { keys: ["gracias", "thanks", "genial", "perfecto", "excelente"], resp: "¡Con gusto! Si tienes alguna otra pregunta, no dudes en preguntar. Estamos aquí para ayudarte. 😊" }
  ];

  for (const pattern of patterns) {
    if (pattern.keys.some(k => q.includes(k))) return pattern.resp;
  }

  return "¡Buena pregunta! Aunque no tengo la respuesta exacta en este momento, te puedo ayudar con información sobre nuestras membresías (Basic, Deluxe, Supreme, Ultimate), precios, Multi-Vehículo, ubicación, proceso de lavado, o servicios adicionales. ¿Qué te gustaría saber?";
}

function sendChat(panel) {
  const input = document.getElementById('chatInput-' + panel);
  const container = document.getElementById('chatMessages-' + panel);
  const text = input.value.trim();
  if (!text) return;

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.textContent = text;
  container.appendChild(userMsg);
  input.value = '';
  container.scrollTop = container.scrollHeight;

  // Show typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-msg typing';
  typing.textContent = 'Escribiendo...';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  // Simulate AI response delay
  setTimeout(function() {
    container.removeChild(typing);
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-msg bot';
    botMsg.textContent = findBestResponse(text);
    container.appendChild(botMsg);
    container.scrollTop = container.scrollHeight;
  }, 800 + Math.random() * 600);
}

// ===== FLOATING CHAT BUBBLE =====
function toggleFabChat() {
  document.getElementById('chatFab').classList.toggle('open');
  var input = document.getElementById('chatFabInput');
  if(document.getElementById('chatFab').classList.contains('open')) {
    setTimeout(function(){ input.focus(); }, 350);
  }
}

function sendFabChat() {
  var input = document.getElementById('chatFabInput');
  var container = document.getElementById('chatFabMessages');
  var text = input.value.trim();
  if (!text) return;

  var userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.textContent = text;
  container.appendChild(userMsg);
  input.value = '';
  container.scrollTop = container.scrollHeight;

  var typing = document.createElement('div');
  typing.className = 'chat-msg typing';
  typing.textContent = 'Escribiendo...';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  setTimeout(function() {
    container.removeChild(typing);
    var botMsg = document.createElement('div');
    botMsg.className = 'chat-msg bot';
    botMsg.textContent = findBestResponse(text);
    container.appendChild(botMsg);
    container.scrollTop = container.scrollHeight;
  }, 800 + Math.random() * 600);
}

// Expose globally
window.findBestResponse = findBestResponse;
window.sendChat = sendChat;
window.toggleFabChat = toggleFabChat;
window.sendFabChat = sendFabChat;
