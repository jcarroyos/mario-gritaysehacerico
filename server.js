const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
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
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del puerto serial
const SERIAL_PORT = process.env.SERIAL_PORT || 'COM12'; // Puerto por defecto
const BAUD_RATE = 9600;

let serialPort = null;
let parser = null;

// Función para inicializar el puerto serial
function initializeSerial() {
  try {
    serialPort = new SerialPort({
      path: SERIAL_PORT,
      baudRate: BAUD_RATE
    });

    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.on('open', () => {
      console.log(`✅ Puerto serial ${SERIAL_PORT} abierto a ${BAUD_RATE} baud`);
    });

    parser.on('data', (data) => {
      try {
        // Parsear los datos del Arduino Esplora
        // Formato esperado: 90,112,1023,30,1023,0,77,72,195,1,1,1,1
        const values = data.trim().split(',').map(val => parseInt(val, 10));
        
        if (values.length >= 6) {
          const arduinoData = {
            timestamp: Date.now(),
            microphone: values[5], // Sexta posición (índice 5)
            rawData: values,
            // Normalizar el valor del micrófono a un rango 0-1
            microphoneNormalized: values[5] / 1024
          };
          
          // Enviar datos a todos los clientes conectados
          io.emit('arduinoData', arduinoData);
          
          console.log(`🎤 Micrófono: ${arduinoData.microphone} (${(arduinoData.microphoneNormalized * 100).toFixed(1)}%)`);
        }
      } catch (error) {
        console.error('❌ Error parseando datos del Arduino:', error);
      }
    });

    serialPort.on('error', (error) => {
      console.error('❌ Error en puerto serial:', error.message);
    });

    serialPort.on('close', () => {
      console.log('⚠️ Puerto serial cerrado');
    });

  } catch (error) {
    console.error('❌ Error inicializando puerto serial:', error.message);
    console.log('💡 Asegúrate de que el Arduino Esplora esté conectado al puerto', SERIAL_PORT);
  }
}

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
  
  // Enviar estado del puerto serial al cliente
  socket.emit('serialStatus', {
    connected: serialPort && serialPort.isOpen,
    port: SERIAL_PORT
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para obtener el estado del sistema
app.get('/api/status', (req, res) => {
  res.json({
    serialPort: {
      connected: serialPort && serialPort.isOpen,
      port: SERIAL_PORT,
      baudRate: BAUD_RATE
    },
    connectedClients: io.engine.clientsCount
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Esperando conexión del Arduino Esplora en puerto ${SERIAL_PORT}`);
  
  // Intentar conectar al puerto serial después de un breve delay
  setTimeout(initializeSerial, 1000);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n⏹️ Cerrando servidor...');
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  process.exit(0);
});
