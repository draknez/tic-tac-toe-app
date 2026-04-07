# Estándares de Desarrollo - Tic-Tac-Toe App

Este proyecto es un entorno de desarrollo portable en Termux diseñado para ser extendido mediante lenguaje natural.

## 🛠️ Tecnologías Core
- **Framework:** React 18+ (Vite)
- **Estilos:** TailwindCSS
- **Rutas:** React Router Dom v6
- **Estado:** Context API para Auth, Theme y Toasts.

## 📐 Arquitectura de Componentes
- **Componentes UI (Atómicos):** Deben vivir en `src/components/ui`. 
  - Deben ser funcionales y usar Tailwind.
  - Deben aceptar `className` como prop para extensibilidad (usar `cn` utility de `src/utils/cn.js`).
- **Layouts:** `src/layouts`. Definen la estructura global.
- **Páginas:** `src/pages`. Organizadas por visibilidad (public, private, auth).

## 🚀 Flujo de Trabajo
1. **Sandbox Primero:** Todo componente nuevo debe probarse primero en `src/pages/public/SandboxPage.jsx` antes de integrarse en la app final.
2. **Iconos:** Preferir `lucide-react` (si está instalado) o SVGs limpios en archivos separados dentro de `src/components/icons`.
3. **Manejo de Errores:** Usar el `ToastContext` para feedback al usuario.

## 🤖 Reglas para la IA
- **No Refactorizar sin Permiso:** Si se pide un nuevo componente, no cambies la estructura de los existentes a menos que sea estrictamente necesario.
- **Consistencia:** Copia el estilo de botones y sombras de `src/components/ui/Button.jsx` y `src/components/ui/Card.jsx`.
