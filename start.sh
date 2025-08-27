#!/bin/bash

echo "🚀 Iniciando Mario Grita y Se Hace Rico..."
echo ""
echo "📋 Verificando requisitos:"

# Verificar Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js no encontrado. Por favor instala Node.js"
    exit 1
fi

# Verificar npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm no encontrado"
    exit 1
fi

echo ""
echo "🔧 Configuración:"
echo "📡 Puerto serial: ${SERIAL_PORT:-COM12}"
echo "🌐 Puerto web: ${PORT:-3000}"
echo ""

echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "⬇️ Instalando dependencias..."
    npm install
fi

echo ""
echo "🎮 Iniciando servidor..."
echo "📝 Accede al juego en: http://localhost:${PORT:-3000}"
echo "🔌 Conecta tu Arduino Esplora al puerto ${SERIAL_PORT:-COM12}"
echo ""
echo "⏹️ Presiona Ctrl+C para detener el servidor"
echo ""

node server.js
