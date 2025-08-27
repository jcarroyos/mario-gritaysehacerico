const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Simulador de datos del Arduino
let simulatorInterval;
let isSimulating = false;

function startArduinoSimulator() {
  if (isSimulating) return;
  
  isSimulating = true;
  console.log('🎮 Iniciando simulador de Arduino Esplora...');
  
  simulatorInterval = setInterval(() => {
    // Simular datos del Arduino con valores aleatorios
    // El micrófono (posición 5) variará entre 0 y 1024
    const microphoneValue = Math.floor(Math.random() * 1024);
    
    const simulatedData = [
      Math.floor(Math.random() * 1023), // Joystick X
      Math.floor(Math.random() * 1023), // Joystick Y
      Math.floor(Math.random() * 1023), // Slider
      Math.floor(Math.random() * 1023), // Luz
      Math.floor(Math.random() * 1023), // Temperatura
      microphoneValue,                   // Micrófono (sexta posición)
      Math.floor(Math.random() * 100),  // Otros sensores...
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 2),    // Botones (0 o 1)
      Math.floor(Math.random() * 2),
      Math.floor(Math.random() * 2),
      Math.floor(Math.random() * 2)
    ];
    
    const arduinoData = {
      timestamp: Date.now(),
      microphone: microphoneValue,
      rawData: simulatedData,
      microphoneNormalized: microphoneValue / 1024
    };
    
    // Enviar datos simulados a todos los clientes
    io.emit('arduinoData', arduinoData);
    
    // Log ocasional para verificar funcionamiento
    if (Math.random() < 0.1) { // 10% de probabilidad
      console.log(`🎤 Simulado - Micrófono: ${microphoneValue} (${(arduinoData.microphoneNormalized * 100).toFixed(1)}%)`);
    }
  }, 100); // Enviar datos cada 100ms
}

function stopArduinoSimulator() {
  if (!isSimulating) return;
  
  isSimulating = false;
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
  }
  console.log('⏹️ Simulador de Arduino detenido');
}

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);
  
  // Enviar estado simulado al cliente
  socket.emit('serialStatus', {
    connected: true,
    port: 'SIMULADOR'
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
  
  socket.on('startSimulator', () => {
    startArduinoSimulator();
    socket.emit('simulatorStatus', { running: true });
  });
  
  socket.on('stopSimulator', () => {
    stopArduinoSimulator();
    socket.emit('simulatorStatus', { running: false });
  });
});

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
  res.json({
    mode: 'simulator',
    simulator: {
      running: isSimulating
    },
    connectedClients: io.engine.clientsCount
  });
});

// Ruta especial para modo simulador
app.get('/simulator', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'simulator.html'));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🎮 Servidor SIMULADOR corriendo en http://localhost:${PORT}`);
  console.log(`🤖 Modo de desarrollo - Arduino Esplora simulado`);
  console.log(`📝 Accede al simulador en: http://localhost:${PORT}/simulator`);
  
  // Iniciar simulador automáticamente después de 2 segundos
  setTimeout(() => {
    startArduinoSimulator();
  }, 2000);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n⏹️ Cerrando servidor simulador...');
  stopArduinoSimulator();
  process.exit(0);
});
