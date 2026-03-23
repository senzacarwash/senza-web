// ===== SUPPORT CHAT =====
function findSupportResponse(query) {
  var q = query.toLowerCase();
  var patterns = [
    { keys: ["precio", "costo", "cuanto", "cuánto", "pago"], resp: "Tu plan Supreme actual cuesta $34/mes e incluye lavados ilimitados. Tu próximo cobro es el 15 de Marzo 2026 a tu Visa terminada en 4832." },
    { keys: ["cambiar", "upgrade", "plan", "mejorar"], resp: "¡Claro! Puedes cambiar tu plan desde la sección 'Mi Membresía'. Tienes estas opciones: Basic ($25), Deluxe ($30), Supreme ($34 — tu plan actual), o Ultimate ($39). El cambio se aplica en tu próximo ciclo." },
    { keys: ["cancelar", "cancela"], resp: "Para cancelar tu membresía, ve a 'Mi Membresía' > 'Administrar' > 'Cancelar Membresía'. Tu plan seguirá activo hasta el final de tu período actual. Sin contrato ni penalidad." },
    { keys: ["pausar", "pausa", "congelar"], resp: "Actualmente no ofrecemos la opción de pausar membresías. Si necesitas un descanso, puedes cancelar sin penalidad y reactivar cuando quieras." },
    { keys: ["horario", "hora", "abierto", "abre", "cierra"], resp: "Senza Car Wash está abierto de Lunes a Sábado de 7:00 AM a 7:00 PM, y Domingos de 8:00 AM a 5:00 PM. ¡Puedes venir cuando gustes!" },
    { keys: ["lavado", "servicio", "incluye", "supreme"], resp: "Tu plan Supreme incluye: Lavado, Secado, Lavado de Ruedas, Espuma Activa, Lavado de Chasis y Supreme Wax. Todo ilimitado. La limpieza interior está disponible como servicio adicional por $5 por visita." },
    { keys: ["interior", "aspirar", "adentro"], resp: "La limpieza y aspirado interior viene incluida solo en el plan Ultimate (2 por vehículo al mes, no acumulables). En los demás planes está disponible como servicio adicional por $5 por visita. También contamos con 8 bahías de aspirado." },
    { keys: ["tarjeta", "pago", "cobro", "factura"], resp: "Tu método de pago es una Visa terminada en 4832 (vence 09/28). Puedes cambiar tu tarjeta en 'Método de Pago'. Todas tus facturas están disponibles en 'Historial'." },
    { keys: ["ubicacion", "ubicación", "donde", "dónde", "dirección"], resp: "Estamos ubicados en Llano Bonito, Ciudad de Panamá, justo al lado de la estación Puma. Contamos con sala de espera con aire acondicionado, café y agua de cortesía." },
    { keys: ["auto", "vehiculo", "vehículo", "agregar", "multi"], resp: "¡Buena pregunta! Puedes agregar otro vehículo y convertir tu membresía en Multi-Vehículo. Los autos adicionales tienen un descuento de $6 en tu plan Supreme (pagan $28 en lugar de $34)." },
    { keys: ["hola", "hi", "hey", "buenos", "buenas"], resp: "¡Hola Carlos! Estoy aquí para ayudarte con tu membresía. ¿En qué puedo asistirte hoy?" },
    { keys: ["gracias", "thanks", "genial", "perfecto"], resp: "¡Con gusto! Si necesitas algo más, no dudes en preguntar. Estamos aquí para ayudarte." }
  ];

  for (var i = 0; i < patterns.length; i++) {
    if (patterns[i].keys.some(function(k) { return q.includes(k); })) return patterns[i].resp;
  }

  return "¡Buena pregunta! Puedo ayudarte con información sobre tu membresía Supreme, pagos, facturación, servicios incluidos, horarios, agregar vehículos, o cualquier duda general. ¿Qué te gustaría saber?";
}

function sendSupportChat() {
  var input = document.getElementById('supportChatInput');
  var container = document.getElementById('supportChatMessages');
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
    botMsg.textContent = findSupportResponse(text);
    container.appendChild(botMsg);
    container.scrollTop = container.scrollHeight;
  }, 700 + Math.random() * 500);
}

// Expose globally
window.findSupportResponse = findSupportResponse;
window.sendSupportChat = sendSupportChat;
