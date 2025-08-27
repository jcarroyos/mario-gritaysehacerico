# Configuración del Arduino Esplora

## Puerto Serial
- **Puerto por defecto:** COM12
- **Velocidad:** 9600 baud
- **Formato de datos:** `90,112,1023,30,1023,0,77,72,195,1,1,1,1`

## Posiciones de los datos
1. **Posición 0:** Joystick X
2. **Posición 1:** Joystick Y  
3. **Posición 2:** Slider
4. **Posición 3:** Sensor de luz
5. **Posición 4:** Sensor de temperatura
6. **Posición 5:** **Micrófono** (rango: 0-1024) ⭐
7. **Posición 6-12:** Otros sensores y botones

## Control del Juego
- **Micrófono (posición 5):** Controla el salto de Mario
- **Umbral mínimo:** 100 (para evitar saltos accidentales)
- **Rango de salto:** 100-1024 → Fuerza de salto variable

## Configuración del Servidor
Para cambiar el puerto serial, usa la variable de entorno:
```bash
SERIAL_PORT=COM3 npm start
```

## Estados del Juego
- **Mario:** Rectángulo rojo (40x50px)
- **Monedas:** Elipses doradas (30px diámetro)
- **Nubes:** Elipses blancas (tamaño variable)
- **Puntuación:** +100 puntos por moneda recogida
