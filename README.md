# 🍄 Mario Grita y Se Hace Rico - PRD Sintético

![Boceto](boceto.jpg)

## 📋 Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | Mario Grita y Se Hace Rico |
| **Versión** | 1.0.0 |
| **Estado** | Prototipo Funcional |
| **Plataforma** | Web + Arduino Esplora |

---

## 🎯 Concepto del Juego

**Descripción:** Juego interactivo que combina Arduino Esplora con aplicación web p5.js, donde el jugador controla a Mario usando únicamente su voz.

**Mecánica Principal:**
- Mario salta con la voz del jugador
- Intensidad de voz → Altura del salto
- Recolectar monedas (+100 puntos)
- Esquivar obstáculos en nubes

---

## ⚙️ Especificaciones Técnicas

### Hardware Requerido
- **Arduino Esplora** (ya programado, enviando datos)
- **Puerto USB** disponible (COM12 por defecto)
- **Computadora** con navegador moderno

### Control del Juego
- **Entrada:** Micrófono Arduino Esplora (posición 5)
- **Umbral mínimo:** 100 (evita saltos accidentales)
- **Rango intensidad:** 100-1024 → Fuerza de salto variable
- **Cooldown:** 300ms entre saltos

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Arduino Esplora conectado y programado
- Navegador web moderno (Chrome recomendado)

### Instalación Local
```bash
# 1. Instalar p5.serialcontrol (bridge requerido)
# Descargar: https://github.com/p5-serial/p5.serialcontrol/releases
# Ejecutar: p5.serialcontrol.exe

# 2. Clonar proyecto
git clone [repositorio]
cd mario-gritaysehacerico

# 3. Servir archivos localmente
python -m http.server 8000
# O usar cualquier servidor web local

# 4. Abrir navegador
http://localhost:8000
```

### Ejecución
1. **Ejecutar p5.serialcontrol** (mantener abierto)
2. **Abrir juego** en navegador local
3. **Clic "Conectar Arduino"**
4. **¡Jugar!** - Grita para saltar

---

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos
```
mario-gritaysehacerico/
├── README.md                 # 📖 Documentación del proyecto
├── index.html               # 🎯 Página principal del juego
├── game.js                  # 🕹️ Lógica del juego con p5.js
├── style.css                # 🎨 Estilos del juego
└── boceto.jpg               # 🖼️ Concepto visual
```

### Stack Tecnológico
- **HTML5** - Estructura de la aplicación
- **CSS3** - Estilos y diseño
- **JavaScript ES6** - Lógica del juego
- **p5.js** - Framework de gráficos y animación
- **p5.serialport** - Comunicación con Arduino
- **p5.serialcontrol** - Bridge para puerto serial

---

## 🎮 Manual de Usuario

### Pasos para Jugar
1. **Conectar:** Arduino Esplora al USB (COM12)
2. **Ejecutar:** p5.serialcontrol
3. **Abrir:** Navegador en http://localhost:8000
4. **Conectar:** Clic en "🔌 Conectar Arduino"
5. **Jugar:** ¡Grita para hacer saltar a Mario!

### Controles
- **🎤 Voz baja:** Salto pequeño
- **🎤 Voz media:** Salto medio  
- **🎤 Voz fuerte:** Salto alto
- **Silencio:** Mario en el suelo

### Elementos del Juego
- **Mario:** Rectángulo rojo (40x50px)
- **Monedas:** Elipses doradas (+100 puntos)
- **Nubes:** Decorativas blancas
- **Fondo:** Gradiente cielo azul + suelo verde

---

## 🔧 Configuración de Puertos

| Sistema | Puerto Típico | Verificación |
|---------|--------------|-------------|
| Windows | COM12, COM3 | `mode` en CMD |
| Linux | /dev/ttyACM0 | `ls /dev/tty*` |
| macOS | /dev/cu.usbmodem* | `ls /dev/cu.*` |

### Configurar Puerto en Código
```javascript
// game.js
let portName = 'COM12'; // Cambiar según tu sistema
```

---

## 🛠️ Resolución de Problemas

### Arduino no se detecta
- ✅ Verificar conexión USB del Arduino
- ✅ Comprobar puerto correcto en código (`game.js`)
- ✅ Cerrar IDE Arduino si está abierto
- ✅ Revisar que la placa esté enviando datos

### p5.serialcontrol no conecta
- ✅ Verificar que esté ejecutándose (http://localhost:8081)
- ✅ Revisar permisos de firewall/antivirus
- ✅ Reiniciar p5.serialcontrol
- ✅ Comprobar que el puerto USB esté disponible

### Micrófono no responde
- ✅ Verificar que Arduino esté enviando datos correctos
- ✅ Confirmar formato CSV con comas
- ✅ Ajustar umbral en código si es muy sensible
- ✅ Probar hablar más cerca del micrófono

### Juego no carga
- ✅ Verificar servidor web local funcionando
- ✅ Abrir consola del navegador para errores
- ✅ Comprobar que p5.js se carga correctamente
- ✅ Usar Chrome (Firefox puede tener problemas)

---

## 📡 Comunicación con Arduino

### p5.serialport
```javascript
// Configuración básica en game.js
let serial = new p5.SerialPort();
let portName = 'COM12'; // Configurar según sistema

// Callbacks principales
serial.on('connected', serverConnected);
serial.on('data', gotData);           // Recibe datos del Arduino
serial.on('error', gotError);
serial.on('open', gotOpen);
serial.on('close', gotClose);

// Procesar datos del micrófono
function gotData() {
    let currentString = serial.readLine();
    if (currentString.length > 0) {
        let sensorData = currentString.split(',');
        let micValue = int(sensorData[5]); // Posición 5 = micrófono
        // Controlar salto de Mario según micValue
    }
}
```

### Formato de Datos Arduino
- **Estructura:** CSV separado por comas
- **Ejemplo:** "90,112,1023,30,1023,0,77,72,195,1,1,1,1"
- **Posición 5:** Valor del micrófono (0-1024)
- **Terminador:** `\n` (nueva línea)

---

## ✅ Criterios de Éxito

- [x] **Control por voz funcional:** Mario responde a diferentes intensidades
- [x] **Comunicación serial estable:** Datos sin interrupciones
- [x] **Interfaz intuitiva:** Estados de conexión claros
- [x] **Gameplay básico:** Recolección de monedas
- [x] **Documentación completa:** Instrucciones de instalación

### Métricas Técnicas
- **Latencia:** < 100ms entre voz y salto
- **Framerate:** 60 FPS constante
- **Frecuencia serial:** 20 Hz (50ms entre lecturas)
- **Precisión micrófono:** 3 niveles distintos de salto

---

## 🔮 Próximas Mejoras

### Mejoras Visuales
- [ ] Sprites para Mario y monedas
- [ ] Animaciones de salto más fluidas
- [ ] Efectos de partículas al recoger monedas
- [ ] Fondos más detallados

### Mejoras de Gameplay
- [ ] Obstáculos simples para esquivar
- [ ] Sistema básico de vidas (3 vidas)
- [ ] Diferentes tipos de monedas (valores distintos)
- [ ] Pantalla de game over

### Mejoras Técnicas
- [ ] Calibración automática del micrófono
- [ ] Guardado de puntuación máxima local
- [ ] Ajustes de sensibilidad desde la interfaz
- [ ] Mejor feedback visual del nivel de micrófono

---

## 📞 Recursos y Referencias

- **p5.js:** https://p5js.org/reference/
- **p5.serialport:** https://github.com/p5-serial/p5.serialport.js
- **p5.serialcontrol:** https://github.com/p5-serial/p5.serialcontrol/releases

### Notas Importantes
- Usar Chrome para mejor compatibilidad
- El Arduino debe estar pre-programado enviando datos correctos
- Mantener p5.serialcontrol ejecutándose mientras juegas
- El juego funciona completamente offline una vez configurado

