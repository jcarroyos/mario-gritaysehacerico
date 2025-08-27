// Variables del juego
let mario;
let coins = [];
let clouds = [];
let socket;
let microphoneLevel = 0;
let lastJumpTime = 0;
let score = 0;

// Configuración del juego
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GROUND_HEIGHT = 100;
const JUMP_COOLDOWN = 300; // milisegundos entre saltos
const MIN_JUMP_THRESHOLD = 100; // nivel mínimo del micrófono para saltar

// Configuración de elementos
const COIN_COUNT = 5;
const CLOUD_COUNT = 3;

function setup() {
    // Crear canvas y adjuntarlo al contenedor
    let canvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    canvas.parent('game-container');
    
    // Inicializar conexión Socket.IO
    initializeSocket();
    
    // Inicializar Mario
    mario = new Mario(100, GAME_HEIGHT - GROUND_HEIGHT - 50);
    
    // Generar monedas
    generateCoins();
    
    // Generar nubes
    generateClouds();
    
    console.log('🎮 Juego inicializado');
}

function draw() {
    // Fondo del cielo
    drawBackground();
    
    // Dibujar nubes
    drawClouds();
    
    // Dibujar suelo
    drawGround();
    
    // Actualizar y dibujar Mario
    mario.update();
    mario.draw();
    
    // Dibujar y manejar monedas
    drawCoins();
    
    // Mostrar información del juego
    drawUI();
}

function drawBackground() {
    // Gradiente de cielo
    for (let i = 0; i <= height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(135, 206, 235), color(255, 255, 255), inter);
        stroke(c);
        line(0, i, width, i);
    }
}

function drawGround() {
    // Suelo verde
    fill(34, 139, 34);
    noStroke();
    rect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);
    
    // Línea del suelo
    stroke(0);
    strokeWeight(3);
    line(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT);
}

function drawClouds() {
    fill(255, 255, 255, 200);
    noStroke();
    for (let cloud of clouds) {
        ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.6);
        ellipse(cloud.x - cloud.size * 0.3, cloud.y, cloud.size * 0.8, cloud.size * 0.5);
        ellipse(cloud.x + cloud.size * 0.3, cloud.y, cloud.size * 0.8, cloud.size * 0.5);
    }
}

function drawCoins() {
    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        
        // Animar rotación
        coin.rotation += 0.1;
        
        // Dibujar moneda
        push();
        translate(coin.x, coin.y);
        rotate(coin.rotation);
        fill(255, 215, 0);
        stroke(255, 165, 0);
        strokeWeight(2);
        ellipse(0, 0, 30, 30);
        
        // Símbolo de moneda
        fill(255, 165, 0);
        textAlign(CENTER, CENTER);
        textSize(16);
        textStyle(BOLD);
        text('$', 0, 0);
        pop();
        
        // Verificar colisión con Mario
        if (mario.checkCoinCollision(coin)) {
            coins.splice(i, 1);
            score += 100;
            console.log('🪙 ¡Moneda recogida! Puntuación:', score);
            
            // Generar nueva moneda
            generateCoin();
        }
    }
}

function drawUI() {
    // Puntuación
    fill(0);
    textAlign(LEFT, TOP);
    textSize(24);
    textStyle(BOLD);
    text(`Puntuación: ${score}`, 20, 20);
    
    // Nivel del micrófono
    fill(0);
    textSize(16);
    text(`Micrófono: ${microphoneLevel}`, 20, 50);
    
    // Indicador visual del nivel del micrófono
    let barWidth = map(microphoneLevel, 0, 1024, 0, 200);
    fill(255, 0, 0, 100);
    noStroke();
    rect(20, 70, 200, 10);
    fill(255, 0, 0);
    rect(20, 70, barWidth, 10);
}

function generateCoins() {
    coins = [];
    for (let i = 0; i < COIN_COUNT; i++) {
        generateCoin();
    }
}

function generateCoin() {
    coins.push({
        x: random(50, GAME_WIDTH - 50),
        y: random(50, GAME_HEIGHT - GROUND_HEIGHT - 50),
        rotation: 0
    });
}

function generateClouds() {
    clouds = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
        clouds.push({
            x: random(100, GAME_WIDTH - 100),
            y: random(50, 200),
            size: random(60, 120)
        });
    }
}

// Clase Mario
class Mario {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.velocityY = 0;
        this.width = 40;
        this.height = 50;
        this.isJumping = false;
        this.gravity = 0.8;
        this.jumpStrength = 0;
    }
    
    update() {
        // Aplicar gravedad
        if (this.isJumping) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            
            // Verificar si Mario ha aterrizado
            if (this.y >= this.baseY) {
                this.y = this.baseY;
                this.velocityY = 0;
                this.isJumping = false;
            }
        }
    }
    
    jump(intensity) {
        let currentTime = millis();
        
        // Verificar cooldown y umbral mínimo
        if (currentTime - lastJumpTime > JUMP_COOLDOWN && 
            intensity > MIN_JUMP_THRESHOLD && 
            !this.isJumping) {
            
            // Calcular fuerza del salto basada en la intensidad del micrófono
            this.jumpStrength = map(intensity, MIN_JUMP_THRESHOLD, 1024, -10, -20);
            this.jumpStrength = constrain(this.jumpStrength, -20, -10);
            
            this.velocityY = this.jumpStrength;
            this.isJumping = true;
            lastJumpTime = currentTime;
            
            console.log(`🦘 Mario salta con intensidad ${intensity} (fuerza: ${this.jumpStrength})`);
        }
    }
    
    draw() {
        // Cuerpo de Mario (rectángulo rojo)
        fill(255, 0, 0);
        stroke(139, 0, 0);
        strokeWeight(2);
        rect(this.x, this.y, this.width, this.height);
        
        // Detalles simples
        // Gorro
        fill(255, 0, 0);
        rect(this.x, this.y, this.width, 15);
        
        // Cara
        fill(255, 220, 177);
        rect(this.x + 5, this.y + 15, this.width - 10, 20);
        
        // Overol
        fill(0, 0, 255);
        rect(this.x + 8, this.y + 35, this.width - 16, 15);
        
        // Indicar si está saltando
        if (this.isJumping) {
            fill(255, 255, 0, 100);
            noStroke();
            ellipse(this.x + this.width/2, this.y + this.height/2, this.width + 20, this.height + 20);
        }
    }
    
    checkCoinCollision(coin) {
        let distance = dist(this.x + this.width/2, this.y + this.height/2, coin.x, coin.y);
        return distance < (this.width/2 + 15);
    }
}

// Configurar Socket.IO
function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('🔌 Conectado al servidor');
        updateConnectionStatus('socket', true);
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Desconectado del servidor');
        updateConnectionStatus('socket', false);
    });
    
    socket.on('serialStatus', (status) => {
        console.log('📡 Estado del puerto serial:', status);
        updateConnectionStatus('serial', status.connected);
        updateSerialInfo(status);
    });
    
    socket.on('arduinoData', (data) => {
        // Actualizar nivel del micrófono
        microphoneLevel = data.microphone;
        
        // Actualizar interfaz
        updateMicrophoneDisplay(data);
        
        // Hacer que Mario salte si el nivel es suficiente
        mario.jump(data.microphone);
    });
}

// Funciones de interfaz
function updateConnectionStatus(type, connected) {
    const statusElement = document.getElementById(type + 'Status');
    const textElement = document.getElementById(type + 'Text');
    
    if (statusElement && textElement) {
        if (connected) {
            statusElement.className = 'status-indicator connected';
            textElement.textContent = type === 'serial' ? 'Arduino Conectado' : 'Conectado';
        } else {
            statusElement.className = 'status-indicator disconnected';
            textElement.textContent = type === 'serial' ? 'Arduino Desconectado' : 'Desconectado';
        }
    }
}

function updateSerialInfo(status) {
    const serialText = document.getElementById('serialText');
    if (serialText) {
        if (status.connected) {
            serialText.textContent = `Arduino conectado en ${status.port}`;
        } else {
            serialText.textContent = `Esperando Arduino en ${status.port}`;
        }
    }
}

function updateMicrophoneDisplay(data) {
    const micValue = document.getElementById('micValue');
    const micPercent = document.getElementById('micPercent');
    const micBar = document.getElementById('micBar');
    
    if (micValue) micValue.textContent = data.microphone;
    if (micPercent) micPercent.textContent = Math.round(data.microphoneNormalized * 100);
    if (micBar) micBar.style.width = (data.microphoneNormalized * 100) + '%';
}
