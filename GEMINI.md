# Estándares de Desarrollo - Tic-Tac-Toe App (BaLog)

Este documento es la **Fuente de Verdad** para cualquier IA que trabaje en este proyecto. Debe ser consultado antes de cada tarea.

## 🛠️ Tecnologías Core
- **Frontend:** React 18+ (Vite) + TailwindCSS v4.
- **Backend:** Node.js (Express) + SQLite.
- **Estado:** Context API (Auth, Theme, Toast).
- **Rutas:** React Router Dom v6.

## 📐 Arquitectura de Componentes
- **UI (Atómicos):** `src/components/ui`. Deben usar `cn` de `src/utils/cn.js`.
- **Organigrama:** `src/components/ui/OrgChart.jsx` y `MasterBox.jsx` son los componentes más complejos actualmente.
- **Layouts:** `src/layouts`.
- **Páginas:** `src/pages` (dividido por visibilidad).

## 🚀 Flujo de Trabajo (Mandatorio)
1. **Sandbox:** Todo componente nuevo **DEBE** probarse en `src/pages/public/SandboxPage.jsx` antes de su integración final.
2. **Consistencia:** Mantener estilos (sombras, bordes, tipografía) definidos en `src/components/ui/Button.jsx` y `Card.jsx`.
3. **Persistencia:** Las configuraciones del Sandbox se guardan en `localStorage` (ej. `sandbox-org-tree-v3`).

## 🤖 Reglas para la IA
- **No Refactorizar sin Permiso:** No alterar estructuras existentes a menos que sea estrictamente necesario para la funcionalidad solicitada.
- **Contexto de Sesión:** Antes de empezar, siempre revisa el `git log` y los últimos cambios en `src/components/ui` para entender la evolución del código.
- **Estilo de Commit:** Usar prefijos `feat:`, `fix:`, `refactor:`, `style:` (estilo Angular/Conventional Commits).

## 📍 Estado Actual (Abril 2026)
- Se implementó un sistema de Organigrama avanzado con:
  - Drag & Drop de nodos.
  - Gestión de Jerarquías (Padre/Hijo).
  - Campos de **Cargo** y **Tipo de Unidad**.
  - Conexiones dinámicas (Bezier/Step/Straight).
  - Sistema de física omnidireccional opcional.
- La aplicación base (BaLog) está lista para escalar a un sistema de gestión organizacional completo.
