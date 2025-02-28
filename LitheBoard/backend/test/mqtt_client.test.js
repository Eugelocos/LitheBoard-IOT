const mqtt = require('mqtt');

// Configuración
const userId = '4'; // ID del usuario
const entityId = '228'; // ID de la entidad
const brokerUrl = 'mqtt://tongavla.mooo.com:47851'; // Reemplázalo con tu broker MQTT
const deviceState = {
  status: 'on', // Estado inicial del dispositivo
  brightness: 80, // Ejemplo de propiedad
};

// Conexión al broker MQTT
const client = mqtt.connect(brokerUrl, {
  username: "litheboard_admin",
  password: "pepelithe",
});

// Tópicos
const topics = {
  dataDevice: `users/${userId}/device/${entityId}/data/device`,
  requestsPlatform: `users/${userId}/device/${entityId}/requests/platform`,
  heartbeat: `users/${userId}/device/${entityId}/heartbeat/device`,
  dataPlatform: `users/${userId}/device/${entityId}/data/platform`,
  requestsDevice: `users/${userId}/device/${entityId}/requests/device`,
};

// Función para publicar el estado del dispositivo
function publishDeviceState() {
  const payload = JSON.stringify({
    status: deviceState.status,
    brightness: deviceState.brightness,
    timestamp: Date.now(),
  });
  client.publish(topics.dataDevice, payload, { qos: 1 }, (err) => {
    if (err) console.error('Error al publicar el estado:', err);
    else console.log('Estado publicado:', payload);
  });
}

// Al conectar al broker
client.on('connect', () => {
  console.log('Conectado al broker MQTT');

  // Suscribirse a los tópicos relevantes
  client.subscribe([topics.requestsPlatform, topics.dataPlatform], (err) => {
    if (err) console.error('Error al suscribirse a los tópicos:', err);
    else console.log('Suscrito a los tópicos:', [topics.requestsPlatform, topics.dataPlatform]);
  });

  //--- SOT : Disp ---
  //publishDeviceState()
  //--- SOT : Platform ---
  requestSyncFromPlatform();
});

client.on('reconnect', () => {
  console.log('Reconectado al broker MQTT');

  // Suscribirse a los tópicos relevantes
  client.subscribe([topics.requestsPlatform, topics.dataPlatform], (err) => {
    if (err) console.error('Error al suscribirse a los tópicos:', err);
    else console.log('Suscrito a los tópicos:', [topics.requestsPlatform, topics.dataPlatform]);
  });

  //--- SOT : Disp ---
  //publishDeviceState()
  //--- SOT : Platform ---
  requestSyncFromPlatform();
})

// Al recibir mensajes de la plataforma
client.on('message', (topic, message) => {
  const payload = JSON.parse(message.toString());
  console.log(`Mensaje recibido en ${topic}:`, payload);

      // Verificar si el payload tiene un campo `data`
      const data = payload.data;

      if (data) {
        console.log('Datos extraídos del payload:', data);
      } else {
        console.warn('El mensaje no contiene datos.');
      }
  if (topic === topics.requestsPlatform) {
    if (payload.action === 'requestSync') {
      console.log('Solicitud de sincronización recibida. Publicando estado...');
      publishDeviceState();
    } else if (payload.type === 'command') {
      console.log('Comando recibido:', payload.command);
      // Procesar el comando (por ejemplo, encender o apagar el dispositivo)
      if (payload.command === 'turn_on') deviceState.status = 'on';
      else if (payload.command === 'turn_off') deviceState.status = 'off';
      else if (payload.command === 'set_brightness') deviceState.brightness = payload.value;

      console.log('Nuevo estado del dispositivo:', deviceState);
    }
  } else 
  if (topic === topics.dataPlatform) 
  {
    console.log('Datos sincronizados desde la plataforma:', data);

    if (typeof data.status === 'string') deviceState.status = data.status;
    if (typeof data.brightness === 'number') deviceState.brightness = data.brightness;

    console.log('Estado actualizado desde la plataforma:', deviceState);
  }
});

// Publicar heartbeats periódicamente
setInterval(() => {
  client.publish(
    topics.heartbeat,
    JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }),
    { qos: 1 },
    (err) => {
      if (err) console.error('Error al publicar heartbeat:', err);
      else console.log('Heartbeat enviado');
    }
  );
}, 4000); // Cada 5 segundos



// Manejo de errores
client.on('error', (err) => {
  console.error('Error en el cliente MQTT:', err);
});

// Desconectar al cerrar el programa
process.on('SIGINT', () => {
  console.log('Desconectando del broker...');
  client.end();
  process.exit();
});

function requestSyncFromPlatform() {
  console.log('Solicitando sincronización desde la plataforma...');
  try {
    const payload = JSON.stringify({ action: 'syncRequest' }); // Validar JSON
    client.publish(topics.requestsDevice, payload, { qos: 1 }, (err) => {
      if (err) console.error('Error al publicar solicitud de sincronización:', err);
      else console.log('Solicitud de sincronización enviada:', payload);
    });
  } catch (error) {
    console.error('Error al convertir el payload a JSON:', error);
  }
}

