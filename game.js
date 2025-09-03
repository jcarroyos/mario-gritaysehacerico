// 🍄 Mario Grita y Se Hace Rico - MVP
// Control por voz usando Arduino Esplora + p5.js

// Variables del juego
let mario;
let coins = [];
let clouds = [];
let score = 0;
let gameState = 'waiting'; // 'waiting', 'playing', 'gameOver'

// Variables de comunicación serial
let serial;
let portName = 'COM12'; // Puerto configurado específicamente
let baudRate = 9600; // Velocidad en baudios
let isConnected = false;
let micValue = 0;
let lastJumpTime = 0;
const JUMP_COOLDOWN = 300; // 300ms entre saltos
const MIC_THRESHOLD = 100; // Umbral mínimo para saltar

// Variables de canvas
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Configuración de Mario
const MARIO_WIDTH = 40;
const MARIO_HEIGHT = 50;
const MARIO_GROUND_Y = CANVAS_HEIGHT - 100; // Altura del suelo
const GRAVITY = 0.8;
const MAX_JUMP_FORCE = 20;

// Configuración de monedas
const COIN_SIZE = 20;
const COIN_SPAWN_RATE = 0.02; // Probabilidad por frame

// Configuración de nubes
const CLOUD_COUNT = 5;

function setup() {
    // Crear canvas dentro del div game-canvas
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent('game-canvas');
    
    // Inicializar Mario
    mario = {
        x: 100,
        y: MARIO_GROUND_Y,
        velocityY: 0,
        onGround: true,
        color: color(255, 0, 0) // Rojo
    };
    
    // Crear nubes decorativas
    initializeClouds();
    
    // Configurar eventos de botones
    setupUI();
    
    // Configurar comunicación serial después de que todo esté listo
    setTimeout(setupSerial, 500);
    
    console.log('🍄 Mario Grita y Se Hace Rico - Inicializado');
}

function draw() {
    // Fondo degradado (cielo azul a verde)
    drawBackground();
    
    // Dibujar nubes
    drawClouds();
    
    // Actualizar y dibujar Mario
    updateMario();
    drawMario();
    
    // Gestionar monedas
    manageCoins();
    
    // Actualizar UI
    updateUI();
    
    // Estado de espera
    if (gameState === 'waiting' && !isConnected) {
        drawWaitingMessage();
    }
}

function drawBackground() {
    // Degradado de cielo azul a verde
    for (let i = 0; i <= height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(135, 206, 235), color(144, 238, 144), inter);
        stroke(c);
        line(0, i, width, i);
    }
    
    // Suelo verde
    fill(34, 139, 34);
    noStroke();
    rect(0, MARIO_GROUND_Y + MARIO_HEIGHT, width, height - (MARIO_GROUND_Y + MARIO_HEIGHT));
}

function initializeClouds() {
    clouds = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
        clouds.push({
            x: random(width),
            y: random(50, 200),
            size: random(40, 80),
            speed: random(0.2, 0.8)
        });
    }
}

function drawClouds() {
    fill(255, 255, 255, 200);
    noStroke();
    
    for (let cloud of clouds) {
        // Dibujar nube simple con círculos
        ellipse(cloud.x, cloud.y, cloud.size);
        ellipse(cloud.x + cloud.size * 0.3, cloud.y, cloud.size * 0.8);
        ellipse(cloud.x - cloud.size * 0.3, cloud.y, cloud.size * 0.8);
        
        // Mover nube
        cloud.x -= cloud.speed;
        
        // Reposicionar si sale de pantalla
        if (cloud.x < -cloud.size) {
            cloud.x = width + cloud.size;
            cloud.y = random(50, 200);
        }
    }
}

function updateMario() {
    // Aplicar gravedad
    if (!mario.onGround) {
        mario.velocityY += GRAVITY;
    }
    
    // Actualizar posición
    mario.y += mario.velocityY;
    
    // Verificar colisión con el suelo
    if (mario.y >= MARIO_GROUND_Y) {
        mario.y = MARIO_GROUND_Y;
        mario.velocityY = 0;
        mario.onGround = true;
    } else {
        mario.onGround = false;
    }
    
    // Procesar salto por voz
    if (isConnected && micValue > MIC_THRESHOLD) {
        let currentTime = millis();
        if (currentTime - lastJumpTime > JUMP_COOLDOWN && mario.onGround) {
            jump();
            lastJumpTime = currentTime;
        }
    }
}

function jump() {
    if (mario.onGround) {
        // Calcular fuerza del salto basada en el nivel del micrófono
        let jumpForce = map(micValue, MIC_THRESHOLD, 1024, 8, MAX_JUMP_FORCE);
        jumpForce = constrain(jumpForce, 8, MAX_JUMP_FORCE);
        
        mario.velocityY = -jumpForce;
        mario.onGround = false;
        
        console.log(`🎤 Salto! Nivel: ${micValue}, Fuerza: ${jumpForce.toFixed(1)}`);
    }
}

function drawMario() {
    fill(mario.color);
    stroke(0);
    strokeWeight(2);
    
    // Dibujar Mario como rectángulo simple
    rect(mario.x, mario.y, MARIO_WIDTH, MARIO_HEIGHT);
    
    // Añadir detalles simples
    fill(255);
    // Ojos
    ellipse(mario.x + 10, mario.y + 15, 8);
    ellipse(mario.x + 30, mario.y + 15, 8);
    
    // Bigote
    fill(0);
    rect(mario.x + 12, mario.y + 25, 16, 4);
}

function manageCoins() {
    // Generar nuevas monedas
    if (random() < COIN_SPAWN_RATE && gameState === 'playing') {
        coins.push({
            x: width,
            y: random(MARIO_GROUND_Y - 200, MARIO_GROUND_Y),
            collected: false,
            speed: 3
        });
    }
    
    // Actualizar y dibujar monedas
    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        
        if (!coin.collected) {
            // Mover moneda
            coin.x -= coin.speed;
            
            // Dibujar moneda
            fill(255, 215, 0); // Dorado
            stroke(255, 140, 0);
            strokeWeight(2);
            ellipse(coin.x, coin.y, COIN_SIZE);
            
            // Verificar colisión con Mario
            if (coin.x < mario.x + MARIO_WIDTH && 
                coin.x + COIN_SIZE > mario.x &&
                coin.y < mario.y + MARIO_HEIGHT &&
                coin.y + COIN_SIZE > mario.y) {
                
                coin.collected = true;
                score += 100;
                console.log(`💰 ¡Moneda recolectada! Puntuación: ${score}`);
            }
            
            // Remover monedas que salen de pantalla
            if (coin.x < -COIN_SIZE) {
                coins.splice(i, 1);
            }
        } else {
            coins.splice(i, 1);
        }
    }
}

function updateUI() {
    // Actualizar puntuación
    document.getElementById('score').textContent = score;
    
    // Actualizar nivel del micrófono
    document.getElementById('mic-level').textContent = micValue;
}

function drawWaitingMessage() {
    if (typeof p5.SerialPort === 'undefined') {
        // Modo prueba - no mostrar mensaje de espera
        return;
    }
    
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('🔌 Conecta el Arduino para empezar', width/2, height/2);
    textSize(16);
    text('Haz clic en "Conectar Arduino" arriba', width/2, height/2 + 40);
}

// === COMUNICACIÓN SERIAL ===

function setupSerial() {
    console.log('🔧 Intentando configurar comunicación serial...');
    
    // Verificar que p5 esté disponible
    if (typeof p5 === 'undefined') {
        console.error('❌ p5.js no está disponible');
        return;
    }
    
    // Verificar que p5.SerialPort esté disponible
    if (typeof p5.SerialPort === 'undefined') {
        console.warn('⚠️ p5.SerialPort no está disponible');
        console.log('💡 Modo prueba: Usa ESPACIO para saltar');
        gameState = 'playing'; // Permitir modo prueba
        return;
    }
    
    try {
        serial = new p5.SerialPort();
        
        // Callbacks de conexión
        serial.on('connected', serverConnected);
        serial.on('list', gotList);
        serial.on('data', gotData);
        serial.on('error', gotError);
        serial.on('open', gotOpen);
        serial.on('close', gotClose);
        
        // Listar puertos disponibles
        serial.list();
        
        console.log('✅ p5.SerialPort configurado correctamente');
    } catch (error) {
        console.error('❌ Error configurando p5.SerialPort:', error);
        console.log('💡 Modo prueba: Usa ESPACIO para saltar');
        gameState = 'playing'; // Permitir modo prueba si hay error
    }
}

function serverConnected() {
    console.log('📡 Conectado a p5.serialcontrol en localhost:8081');
    updateConnectionStatus('Servidor conectado', 'connected');
    hideError(); // Ocultar errores previos
}

function gotList(thelist) {
    console.log('📋 Puertos seriales disponibles:', thelist);
    
    // Verificar si COM12 está disponible
    if (thelist.includes(portName)) {
        console.log('✅ Puerto', portName, 'encontrado');
    } else {
        console.warn('⚠️ Puerto', portName, 'no encontrado');
        
        // Sugerir puertos COM comunes en Windows
        const commonPorts = thelist.filter(port => port.includes('COM'));
        if (commonPorts.length > 0) {
            console.log('💡 Puertos COM disponibles:', commonPorts);
            showError('Puerto COM12 no encontrado. Puertos disponibles: ' + commonPorts.join(', ') + 
                     '\n\nPuedes cambiar el puerto en el código (variable portName) o verificar la conexión del Arduino.');
        }
    }
}

function gotData() {
    let currentString = serial.readLine();
    if (currentString && currentString.length > 0) {
        try {
            // Limpiar datos y procesar CSV del Arduino
            currentString = currentString.trim();
            let sensorData = currentString.split(',');
            
            if (sensorData.length >= 6) {
                let newMicValue = parseInt(sensorData[5]); // Posición 5 = micrófono
                
                // Verificar que el valor del micrófono sea válido
                if (!isNaN(newMicValue) && newMicValue >= 0 && newMicValue <= 1024) {
                    micValue = newMicValue;
                    
                    // Iniciar juego si no está jugando
                    if (gameState === 'waiting') {
                        gameState = 'playing';
                        console.log('🎮 ¡Juego iniciado! Datos recibidos del Arduino');
                        console.log('📊 Primer valor de micrófono:', micValue);
                    }
                } else {
                    console.warn('⚠️ Valor de micrófono inválido:', newMicValue);
                }
            } else {
                console.warn('⚠️ Datos incompletos recibidos:', currentString);
            }
        } catch (error) {
            console.error('❌ Error procesando datos:', error, 'Datos:', currentString);
        }
    }
}

function gotError(theerror) {
    console.error('❌ Error serial:', theerror);
    
    // Mensaje específico para error de conexión a p5.serialcontrol
    if (!theerror || theerror === undefined) {
        updateConnectionStatus('p5.serialcontrol no disponible', 'error');
        showError('Error: p5.serialcontrol no está ejecutándose en Windows.\n\nPasos para solucionarlo:\n\n1. Descarga "p5.serialcontrol-win32-x64.zip" desde:\n   https://github.com/p5-serial/p5.serialcontrol/releases\n\n2. Extrae el archivo y ejecuta "p5.serialcontrol.exe"\n\n3. Si Windows bloquea la ejecución:\n   - Click derecho → Propiedades → Desbloquear\n   - O ejecutar como Administrador\n\n4. Verifica que el Arduino esté en COM12\n\n5. Asegúrate de que el Firewall de Windows permita la conexión en puerto 8081');
    } else {
        updateConnectionStatus('Error de conexión', 'error');
        showError('Error de conexión con Arduino: ' + theerror);
    }
}

function gotOpen() {
    console.log('✅ Puerto serial abierto:', portName);
    console.log('🎤 Esperando datos del micrófono...');
    updateConnectionStatus('Arduino conectado', 'connected');
    isConnected = true;
    hideError();
}

function gotClose() {
    console.log('🔌 Puerto serial cerrado');
    updateConnectionStatus('Desconectado', 'disconnected');
    isConnected = false;
    gameState = 'waiting';
}

// === INTERFAZ DE USUARIO ===

function setupUI() {
    // Botón de conexión
    document.getElementById('connect-btn').addEventListener('click', function() {
        if (!isConnected) {
            connectArduino();
        } else {
            disconnectArduino();
        }
    });
    
    // Botón de reintentar
    document.getElementById('retry-btn').addEventListener('click', function() {
        hideError();
        connectArduino();
    });
}

function connectArduino() {
    if (!serial) {
        showError('Error: Comunicación serial no inicializada. Recarga la página.');
        return;
    }
    
    console.log('🔌 Conectando a:', portName, 'a', baudRate, 'baudios');
    updateConnectionStatus('Conectando...', 'connecting');
    
    try {
        // Abrir puerto con la sintaxis correcta de p5.serialport
        serial.openPort(portName);
        document.getElementById('connect-btn').disabled = true;
    } catch (error) {
        console.error('❌ Error al conectar:', error);
        showError('No se pudo conectar al Arduino en ' + portName + '. Verifica que esté conectado y que p5.serialcontrol esté ejecutándose.');
        document.getElementById('connect-btn').disabled = false;
    }
}

function disconnectArduino() {
    if (!serial) {
        console.log('⚠️ Serial no inicializado');
        return;
    }
    
    console.log('🔌 Desconectando Arduino');
    try {
        serial.closePort();
    } catch (error) {
        console.error('❌ Error al desconectar:', error);
    }
    
    document.getElementById('connect-btn').disabled = false;
    document.getElementById('connect-btn').textContent = '🔌 Conectar Arduino';
}

function updateConnectionStatus(message, status) {
    const statusElement = document.getElementById('status-text');
    const connectBtn = document.getElementById('connect-btn');
    
    statusElement.textContent = message;
    statusElement.className = status;
    
    if (status === 'connected') {
        connectBtn.textContent = '🔌 Desconectar';
        connectBtn.disabled = false;
    } else if (status === 'disconnected' || status === 'error') {
        connectBtn.textContent = '🔌 Conectar Arduino';
        connectBtn.disabled = false;
    }
}

function showError(message) {
    document.getElementById('error-text').textContent = message;
    document.getElementById('error-message').classList.remove('hidden');
}

function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}

// === UTILIDADES ===

// Detectar teclas para pruebas sin Arduino
function keyPressed() {
    // Tecla ESPACIO para simular salto
    if (key === ' ') {
        if (!isConnected) {
            console.log('🧪 Modo prueba: Salto con ESPACIO');
        }
        micValue = 500; // Simular nivel de micrófono
        if (mario.onGround) {
            jump();
        }
        // Resetear después de un momento
        setTimeout(() => {
            if (!isConnected) micValue = 0;
        }, 100);
    }
    
    // Tecla R para reiniciar
    if (key === 'r' || key === 'R') {
        restartGame();
    }
}

function restartGame() {
    console.log('🔄 Reiniciando juego');
    score = 0;
    coins = [];
    mario.y = MARIO_GROUND_Y;
    mario.velocityY = 0;
    mario.onGround = true;
    gameState = isConnected ? 'playing' : 'waiting';
}

// Información de depuración
function mousePressed() {
    console.log('🐛 Debug Info:');
    console.log('- Conectado:', isConnected);
    console.log('- Nivel micrófono:', micValue);
    console.log('- Mario Y:', mario.y.toFixed(1));
    console.log('- En suelo:', mario.onGround);
    console.log('- Estado:', gameState);
    console.log('- Monedas:', coins.length);
}
