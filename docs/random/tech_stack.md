# Stack Tecnológico - Gym Tracker App

Este documento define las tecnologías seleccionadas para el desarrollo de la aplicación, basándose en la propuesta del usuario y añadiendo recomendaciones técnicas.

## 1. Tabla Resumen

| Capa | Tecnología | Función Principal | Justificación |
| :--- | :--- | :--- | :--- |
| **Core** | **React Native (Expo)** | Framework base | Expo gestiona la complejidad nativa, facilita actualizaciones OTA y manejo de assets. |
| **Base de Datos** | **SQLite + Drizzle ORM** | Almacenamiento Local | **Cambio importante:** Se pasa de ficheros JSON planos a una DB Relacional local. Drizzle ofrece tipado seguro (TypeScript) y queries rápidas para estadísticas complejas. |
| **Estado** | **Zustand** | Gestión de Estado Global | Minimalista y sin boilerplate. Ideal para manejar la sesión activa, cronómetros volátiles y configuración de UI. |
| **Navegación** | **React Navigation** | Routing | El estándar de la industria. Permite navegación en stack (historial) y tabs (dashboard). |
| **UI / Estilos** | **NativeWind + RN Paper** | Interfaz de Usuario | **NativeWind:** Rapidez de desarrollo (Tailwind). <br> **RN Paper:** Componentes Material Design listos (Modales, Inputs, FABs). |
| **Gráficas** | **Victory Native XL** | Visualización de Datos | Necesario para el Req 4.3 (Progreso histórico). Permite gráficas de alto rendimiento e interactivas. |
| **Utils** | **RN Background Timer** | Cronómetro en 2º plano | Crítico para el Req 6.1. El temporizador de descanso debe sonar aunque se bloquee el móvil. |
| **i18n** | **i18next** | Internacionalización | Cumple el RNF 1. Estándar robusto para traducciones. |

---

## 2. Análisis y Recomendaciones

### ¿Qué me parece esta elección?
Es un stack **muy sólido y moderno**. Combina la facilidad de desarrollo de Expo con herramientas de alto rendimiento.

### Críticas y Puntos de Atención

1.  **SQLite vs Modelo JSON (Definido anteriormente):**
    *   *Observación:* En el paso anterior definimos un modelo de datos basado en documentos JSON (`exercises.json`, `history.json`). Al pasar a **SQLite**, ganamos potencia (SQL queries para filtrar historial por fechas o ejercicios son mucho más rápidas que parsear un JSON gigante), pero perdemos la "editabilidad manual" de los ficheros si el usuario quisiera abrirlos en un editor de texto en Drive.
    *   *Veredicto:* **SQLite es mejor** para una app que va a crecer. Para la sincronización con Drive, simplemente subiremos el archivo `.db` completo o generaremos un export JSON bajo demanda.

2.  **NativeWind + React Native Paper:**
    *   *Atención:* Ambos sistemas de estilos son excelentes, pero pueden chocar si no se configuran bien.
    *   *Recomendación:* Usar `React Native Paper` para los componentes complejos (Inputs, Dialogs) y `NativeWind` para el layout (márgenes, flexbox, colores de fondo).

3.  **Victory Native XL:**
    *   *Atención:* Es una librería muy potente pero puede ser pesada.
    *   *Alternativa:* Si solo necesitamos líneas simples de progreso, `react-native-gifted-charts` es más ligera. Si queremos interacciones complejas (zoom, tooltips), mantengamos Victory.

### Recomendaciones Adicionales (Añadir al stack)

*   **Formularios:** Recomiendo añadir **`react-hook-form`**. La creación de ejercicios y edición de rutinas tiene muchos campos y validaciones; gestionarlo a mano con `useState` será doloroso.
*   **Listas Largas:** Para el historial (que puede tener cientos de entradas), usar **`FlashList`** (de Shopify) en lugar del `FlatList` por defecto de React Native para un rendimiento 5x-10x mejor.
*   **Fechas:** Añadir **`date-fns`**. Es ligera y modular para manejar los formatos de fecha del historial.

---

## 3. Siguientes Pasos Sugeridos

1.  Inicializar proyecto Expo.
2.  Configurar Drizzle con SQLite.
3.  Crear el esquema de base de datos (traduciendo el modelo JSON a Tablas SQL).
