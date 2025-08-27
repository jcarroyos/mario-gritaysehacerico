# 📄 Mario grita y se hace rico - Product Requirements Document (PRD)

## Visión General

![Boceto](boceto.jpg)

* Mario estará de pie en una pradera, ubicado en una posición central en pantalla.
* Nubes entrarán de derecha a izquierda portando monedas o elementos dañinos.
* El objetivo del jugador es recolectar monedas evitando los objetos dañinos.
* La interacción se realizará exclusivamente con el **micrófono integrado de la Arduino Esplora**.

---

## Controles y Entradas

* **Entrada principal:** micrófono de la Arduino Esplora.
* **Mapa de control:**

  * Intensidad de la voz → Altura del salto de Mario.

    * Voz baja: salto corto.
    * Voz media: salto medio.
    * Voz fuerte: salto alto.
* No se utilizarán otros sensores ni botones de la placa.

---

## Mecánica de Juego

* **Acción principal:** Mario salta para atrapar monedas o esquivar objetos dañinos.
* **Objetivo:** recolectar la mayor cantidad de monedas posibles.
* **Riesgo:** perder puntos/vida al chocar con un objeto dañino en una nube.
* **Progresión:** las nubes aparecen a diferentes alturas y con velocidad variable para aumentar la dificultad.

---

## Forma de Juego y Diagrama

### Descripción

* El jugador produce sonidos en el micrófono para controlar el salto.
* Las nubes se mueven automáticamente de derecha a izquierda.
* El juego se centra en la sincronización entre el momento del salto y la posición de las nubes.

### Esquema (simplificado)

```
Micrófono (voz) → Intensidad detectada → Altura de salto de Mario
       ↓
    Mario en pradera (posición fija)
       ↓
   Nubes con monedas → Recolectar
   Nubes con daño   → Evitar
```

---

## 5. Requerimientos del Prototipo

* **Hardware:** Arduino Esplora (solo micrófono).
* **Software:** entorno de visualización (ej. p5.js, Processing o motor gráfico ligero).
* **Alcance:**

  * Incluye: mecánica básica de salto con voz, aparición de nubes con monedas y objetos dañinos.
  * Excluye: niveles múltiples, animaciones avanzadas, control con otros sensores.
* **Criterios de éxito:**

  * El jugador puede controlar con claridad la altura del salto mediante su voz.
  * Se logra al menos un ciclo completo de juego (recolectar monedas y esquivar objetos dañinos).

